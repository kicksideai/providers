<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# KB10 frontend conventions

KB10 exports shadow-DOM web components through `WippyVueElement`. Its shared
stylesheet is injected into each component and consumes the host's theme tokens.
Do not redefine the host's `--p-*` tokens to compensate for a theme-owner problem.
The UI Kit artifact supplies the shared `kx-*` chrome; keep it a build input,
not a runtime module requirement.

## Documented overlay deviation

The existing `KbConfirm` and `KbDrawer` wrappers keep their masks, content and
styles inside the web component. A default document-body teleport escapes that
shadow root and loses its injected styles and component boundary. This is the
shadow-DOM exception described by frontend compliance rule 11.46b / section 12.
It does not apply to ordinary page applications or justify new duplicate controls.

Keep the existing public open/busy/cancel/confirm contracts when editing these
wrappers. Their Escape listeners must be removed on close and unmount. A future
standard-control migration must explicitly target the same shadow root and
verify busy cancellation, keyboard/focus behavior and light/dark appearance in
the actual host; replacing these wrappers incidentally during a CSS refactor
would change that contract without the needed acceptance coverage.
