# Rendering harness

`npm run harness` serves `KbCreateConfig.vue` — the create/edit config element —
at the widths the knowledge dialog's config pane actually has, so a layout is
looked at before it ships.

The pane is `min(880px, 100vw - 40px)` wide minus the dialog's 360px type
catalogue and 18px of body padding: 484px at the dialog's full size, and
`(100vw - 40) - 36` once the panes stack under the dialog's 720px breakpoint.
The two widths on the board are those, and `?s=<scenario>&w=<width>` renders one
of them alone.

The schemas come out of `src/_index.yaml` through `schemas.py`, so the board
shows the engines' declared fields rather than a copy of them. The host seams —
the props/events injection and the proxy api — are stubbed in `stub-host.ts`,
and the model/agent pickers by same-height stand-ins in `pickers.ts`.
