// Stand-ins for the host widgets the config element mounts by tag. They render a
// control of the same height so the pane's vertical rhythm matches the real one.
const CSS = `
  :host { display: block; }
  .box {
    display: flex; align-items: center; gap: 8px;
    height: var(--kb-ctl, 34px); padding: 0 10px;
    border: 1px solid var(--p-content-border-color); border-radius: 8px;
    background: var(--p-content-background); color: var(--p-text-color);
    font: 400 13px/1 'Inter', system-ui, sans-serif;
    overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  }
`

class Picker extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' })
    const label = this.getAttribute('value') || this.getAttribute('placeholder') || 'Select…'
    root.innerHTML = `<style>${CSS}</style><div class="box">${label}</div>`
  }
}

customElements.define('wc-model-picker', Picker)
customElements.define('wc-agent-picker', class extends Picker {})
