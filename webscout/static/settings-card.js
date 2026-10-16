import { api, loadByTagName } from "@wippy-fe/proxy";

// The WebScout settings card. It draws one thing of its own — the search
// provider picker, whose options come from the installed descriptors and so
// cannot be a static enum in the settings form — and then mounts the stock
// settings card underneath for everything else in the namespace.
//
// Host contract: the settings form hands this element its slice as a JSON
// `config` attribute and listens for `config-changed`. The handler takes no
// value, so writing the setting is this element's own job.
//
// Styling: the ap-*/pv-*/ks-tag classes below are the settings page's own, from
// the stylesheet it injects into the shadow tree this element is mounted in.
// They are borrowed rather than reinvented so the card matches its neighbours
// and follows the theme. If that stylesheet ever renames them the card loses
// its frame, which is a cosmetic regression, not a broken control.

const NESTED_TAG = "kickside-settings-provider";
const PROVIDERS_URL = "/api/v1/webscout/providers";
const SETTINGS_URL = "/api/v1/settings";
const SETTING_KEY = "search_provider";
const NAMESPACE = "kickside.webscout";

const ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="10" cy="10" r="7"></circle><path d="M21 21l-5.2-5.2"></path>' +
    '<path d="M3 10h14M10 3c2 2.5 2 11.5 0 14"></path></svg>';

function escapeText(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, (ch) => {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
    });
}

// A row the select shows but cannot save: the saved-but-uninstalled provider,
// and "nothing chosen". Both are states, not choices, so they are displayed as
// the current value and refuse to be picked.
function unselectableOption(text, value) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    option.selected = true;
    option.disabled = true;
    return option;
}

class WebscoutSettingsCard extends HTMLElement {
    static get observedAttributes() {
        return ["config"];
    }

    connectedCallback() {
        this.render();
        this.load();
        this.mountNested();
    }

    attributeChangedCallback() {
        if (this.isConnected) this.render();
    }

    get config() {
        try {
            return JSON.parse(this.getAttribute("config") || "null") || {};
        } catch (err) {
            return {};
        }
    }

    render() {
        if (this.querySelector("[data-card]")) return;
        this.innerHTML =
            '<div data-notice></div>' +
            '<div class="ap-cards">' +
            '  <section class="ap-card" data-card>' +
            '    <header class="ap-h">' + ICON + " Search provider</header>" +
            '    <p class="ap-sub">Which installed provider answers web research. ' +
            "Each provider keeps its own credentials.</p>" +
            '    <div class="pv-field">' +
            '      <div class="pv-field-head">' +
            '        <label class="ap-blabel" for="ws-provider">Provider</label>' +
            '        <span data-state></span>' +
            "      </div>" +
            '      <select id="ws-provider" class="ap-binput" data-select disabled></select>' +
            // The stock card below brings its own Save bar, and it lands between
            // the two cards. Nothing in our reach moves it, so the card says
            // plainly that the choice is not waiting on it.
            '      <p class="ap-hint">Saved as soon as you choose it. The Save button below belongs to the fields under it.</p>' +
            '      <p class="ap-hint" data-hint></p>' +
            "    </div>" +
            '    <div class="pv-field">' +
            '      <span class="ap-blabel">Installed providers</span>' +
            '      <div data-states class="ws-states"></div>' +
            "    </div>" +
            "  </section>" +
            "</div>" +
            '<div data-nested></div>' +
            "<style>" +
            ".ws-states{display:flex;flex-direction:column;gap:6px}" +
            ".ws-state{display:flex;align-items:center;gap:8px;font-size:12.5px}" +
            ".ws-state-name{color:var(--p-text-color)}" +
            ".ws-state-note{color:var(--p-text-muted-color);font-size:11.5px}" +
            "</style>";
        this.querySelector("[data-select]").addEventListener("change", (event) => {
            this.save(event.target.value);
        });
    }

    setHint(text) {
        const el = this.querySelector("[data-hint]");
        if (el) el.textContent = text || "";
    }

    // A short status beside the label: the picker's own state, not the page's.
    setState(text, good) {
        const el = this.querySelector("[data-state]");
        if (!el) return;
        el.textContent = text || "";
        el.className = text ? "ks-tag kx-tag-caps" + (good ? " ks-tag-on" : "") : "";
    }

    // The saved choice is not always the one that answers: a provider can be
    // uninstalled after it was chosen, and the tool then falls back to the
    // default. Saying that out loud is the whole point of this notice — without
    // it the fallback reads as the operator's own setting.
    setNotice(stored, selected, providers) {
        const host = this.querySelector("[data-notice]");
        if (!host) return;
        if (!stored || !selected || stored === selected) {
            host.innerHTML = "";
            return;
        }
        const effective = providers.find((p) => p.id === selected);
        const name = effective ? effective.label + " (" + effective.id + ")" : selected;
        host.innerHTML =
            '<div class="ap-msg ap-err">Saved provider &ldquo;' +
            escapeText(stored) +
            "&rdquo; is not installed, so web research is using " +
            escapeText(name) +
            ". The list below still shows the saved choice; pick an installed provider to replace it.</div>";
    }

    async load() {
        const select = this.querySelector("[data-select]");
        this.setState("loading", false);
        try {
            const res = await api.get(PROVIDERS_URL);
            const data = (res && res.data) || {};
            if (!data.success) {
                this.setState("unavailable", false);
                this.setHint(data.error || "Could not read the provider list.");
                return;
            }
            this.fill(data.providers || [], data.selected, data.stored);
        } catch (err) {
            this.setState("unavailable", false);
            this.setHint("Could not read the provider list: " + err);
        } finally {
            if (select) select.disabled = false;
        }
    }

    fill(providers, selected, stored) {
        const select = this.querySelector("[data-select]");
        const states = this.querySelector("[data-states]");
        if (!select || !states) return;

        this.setNotice(stored, selected, providers);

        select.innerHTML = "";
        states.innerHTML = "";
        if (!providers.length) {
            select.disabled = true;
            this.setState("none installed", false);
            this.setHint("No search provider is installed. Install one to enable web research.");
            states.innerHTML = '<div class="ws-state-note">None.</div>';
            return;
        }

        // The select shows what is SAVED, not what is answering. Those are the
        // same thing until the saved provider is uninstalled, and when they
        // differ the notice above explains why. Showing the effective one here
        // instead made the notice impossible to obey: it asked the operator to
        // choose the provider in use, that provider was already selected, so
        // picking it fired no `change`, no PUT went out, and the notice stayed
        // forever. A control that displays something other than the value it
        // writes cannot be operated.
        const savedInstalled = stored && providers.some((p) => p.id === stored);
        if (stored && !savedInstalled) {
            // The saved id has no descriptor. It is still what is stored, so it
            // is what the control shows -- disabled, because saving it back is
            // refused by the setting's own validator, and re-choosing it would
            // be a no-op anyway.
            select.appendChild(unselectableOption(stored + " — not installed", stored));
        } else if (!stored) {
            // Nothing saved: the tool follows whichever descriptor declares
            // itself the default, and that can move when another provider is
            // installed. Say so rather than showing today's default as if it
            // had been chosen -- otherwise pinning it is unsaveable for the
            // same reason the notice was unobeyable.
            select.appendChild(unselectableOption("Not chosen — using the default", ""));
        }

        for (const provider of providers) {
            const option = document.createElement("option");
            option.value = provider.id;
            // The state is also spelled out below, but an operator picking
            // from an open list should not have to remember it.
            option.textContent = provider.configured
                ? provider.label
                : provider.label + " — no credentials";
            if (savedInstalled && provider.id === stored) option.selected = true;
            select.appendChild(option);
        }

        // The same states, spelled out where they can be read without opening
        // the list: the tester could only see them by expanding it.
        states.innerHTML = providers
            .map((provider) => {
                const tag = provider.configured
                    ? '<span class="ks-tag kx-tag-caps ks-tag-on">configured</span>'
                    : '<span class="ks-tag kx-tag-caps">no credentials</span>';
                const inUse =
                    provider.id === selected
                        ? '<span class="ws-state-note">in use</span>'
                        : "";
                return (
                    '<div class="ws-state"><span class="ws-state-name">' +
                    escapeText(provider.label) +
                    "</span>" + tag + inUse + "</div>"
                );
            })
            .join("");

        const current = providers.find((p) => p.id === selected);
        if (!current) {
            this.setState("", false);
            this.setHint("");
            return;
        }
        this.setState(current.configured ? "searching" : "no credentials", current.configured);
        this.setHint(
            current.configured
                ? current.description || ""
                : current.label + " has no credentials yet, so web research returns nothing. " +
                      "Set them below, or choose a provider that is configured."
        );
    }

    async save(value) {
        this.setState("saving", false);
        try {
            const res = await api.put(SETTINGS_URL, {
                namespace: NAMESPACE,
                key: SETTING_KEY,
                value: value,
            });
            const data = (res && res.data) || {};
            if (!data.success) {
                // The server refuses an id no installed descriptor claims; show
                // its reason rather than a generic failure.
                this.setState("not saved", false);
                this.setHint(data.error || "Could not save the choice.");
                return;
            }
            this.dispatchEvent(new CustomEvent("config-changed", { bubbles: true }));
            this.load();
        } catch (err) {
            this.setState("not saved", false);
            this.setHint("Could not save the choice: " + err);
        }
    }

    // The rest of the namespace is drawn by the stock card, configured exactly
    // as the settings block used to configure it directly.
    async mountNested() {
        const host = this.querySelector("[data-nested]");
        if (!host || host.firstChild) return;
        try {
            await loadByTagName(NESTED_TAG, { timeoutMs: 8000 });
        } catch (err) {
            host.innerHTML =
                '<div class="ap-msg ap-err">The standard settings form (' +
                escapeText(NESTED_TAG) +
                ") could not be loaded.</div>";
            return;
        }
        const card = document.createElement(NESTED_TAG);
        const config = this.config;
        card.setAttribute(
            "config",
            JSON.stringify({
                namespace: config.namespace || NAMESPACE,
                title: config.title,
                icon: config.icon,
                help: config.help,
            })
        );
        host.appendChild(card);
    }
}

customElements.define("kickside-webscout-settings", WebscoutSettingsCard);
