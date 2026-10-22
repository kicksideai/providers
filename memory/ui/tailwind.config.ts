import themePreset from '@wippy-fe/theme/tailwind.config'

/*
 * The theme's PrimeVue CSS is written with Tailwind `@apply` and assumes
 * preflight is present - `.p-tab`, for one, styles border, colour and hover but
 * never background, relying on preflight having cleared the UA's `buttonface`
 * from the `<button>` it renders.
 *
 * The host document loads a prebuilt Tailwind sheet, but nothing carries it into
 * a web component's shadow root, so a module builds its own base.
 *
 * See @wippy-fe/theme README, "Tailwind preset".
 */
export default {
  presets: [themePreset],
  content: ['./src/**/*.{vue,ts}'],
}
