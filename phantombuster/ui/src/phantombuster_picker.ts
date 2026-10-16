import { WippyVueElement, define } from "@wippy-fe/webcomponent-vue";
import type {
  WippyElementConfig,
  WippyPropsSchema,
} from "@wippy-fe/webcomponent-vue";
import Root from "./app/PhantomBusterPicker.vue";
import stylesText from "./styles.css?inline";
import pkg from "../package.json";

interface P {
  config?: { connection_id?: string } | null;
}
interface E {
  "config-changed": { connection_id?: string };
}

class PhantomBusterPickerElement extends WippyVueElement<P, E> {
  static get wippyConfig(): WippyElementConfig<P> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ["themeConfigUrl"] as const,
      inlineCss: stylesText,
    };
  }
  static get vueConfig() {
    return { rootComponent: Root };
  }
}

export async function webComponent() {
  return PhantomBusterPickerElement;
}
define(import.meta.url, PhantomBusterPickerElement);
