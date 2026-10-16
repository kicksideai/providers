import { WippyVueElement, define } from "@wippy-fe/webcomponent-vue";
import type {
  WippyElementConfig,
  WippyPropsSchema,
} from "@wippy-fe/webcomponent-vue";
import { PrimeVuePlugin } from "@wippy-fe/theme/primevue-plugin";
import Root from "./app/HubSpotPicker.vue";
import stylesText from "./styles.css?inline";
import pkg from "../package.json";

interface Config {
  connection_id?: string;
  object_type?: string;
}
interface P {
  config?: Config | null;
}
interface E {
  "config-changed": Config;
}

class HubSpotPickerElement extends WippyVueElement<P, E> {
  static get wippyConfig(): WippyElementConfig<P> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"] as const,
      inlineCss: stylesText,
    };
  }
  static get vueConfig() {
    return { rootComponent: Root, plugins: [PrimeVuePlugin] };
  }
}

export async function webComponent() {
  return HubSpotPickerElement;
}
define(import.meta.url, HubSpotPickerElement);
