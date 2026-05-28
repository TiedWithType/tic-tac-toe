type ComponentConstructor = CustomElementConstructor & {
  html: string;
  css: string;
};

export class Component extends HTMLElement {
  static html = "";
  static css = "";
  private static reset = `
    :host {
      box-sizing: border-box;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
  `;

  readonly root = this.attachShadow({
    mode: "open",
  });

  connectedCallback() {
    if (this.root.childElementCount) return;

    const ctor = this.constructor as ComponentConstructor;

    Component.render(this.root, ctor.html, ctor.css, this);
  }

  static render(
    root: ShadowRoot,
    html: string,
    css: string,
    context: unknown = {},
  ) {
    const parsedHtml = Component.interpolateTemplate(html, context);

    root.innerHTML = `<style>${Component.reset}${css}</style>${parsedHtml}`;
  }

  private static interpolateTemplate(template: string, context: unknown) {
    return template.replace(
      /\{\{\s*([^}]+?)\s*\}\}/g,
      (_match, expression: string) => {
        try {
          return String(
            Component.resolveTemplateValue(context, expression) ?? "",
          );
        } catch {
          return "";
        }
      },
    );
  }

  private static resolveTemplateValue(context: unknown, expression: string) {
    return expression.split(".").reduce<unknown>((value, key) => {
      if (!Component.isRecord(value)) return undefined;

      return value[key.trim()];
    }, context);
  }

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }
}

type DefineComponentOptions = {
  selector: string;
  component: ComponentConstructor;
  html?: string;
  css?: string;
};

export const defineDynamicComponent = ({
  selector,
  component,
  html = "",
  css = "",
}: DefineComponentOptions) => {
  component.html = html;
  component.css = css;

  customElements.get(selector) || customElements.define(selector, component);
};
