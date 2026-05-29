type ComponentConstructor = CustomElementConstructor & {
  html: string;
  css: string;
};

type TemplatePart =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "expression";
      value: string;
    };

type TemplateBinding = {
  target: Text | HTMLElement;
  attributeName?: string;
  parts: TemplatePart[];
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
  private templateBindings: TemplateBinding[] = [];

  connectedCallback() {
    if (this.root.childElementCount) return;

    const ctor = this.constructor as ComponentConstructor;

    this.renderTemplate(ctor.html, ctor.css);
  }

  protected detectChanges() {
    this.templateBindings.forEach((binding) => {
      const value = Component.renderTemplateParts(binding.parts, this);

      if (binding.attributeName) {
        binding.target instanceof HTMLElement &&
          binding.target.setAttribute(binding.attributeName, value);
        return;
      }

      binding.target.textContent = value;
    });
  }

  protected setTemplateProperties(properties: Record<string, unknown>) {
    const context = this as unknown as Record<string, unknown>;
    let hasChanges = false;

    Object.entries(properties).forEach(([property, value]) => {
      if (Object.is(context[property], value)) return;

      context[property] = value;
      hasChanges = true;
    });

    if (hasChanges) {
      this.detectChanges();
    }
  }

  private renderTemplate(html: string, css: string) {
    this.root.innerHTML = `<style>${Component.reset}${css}</style>${html}`;
    this.bindInterpolations();
    this.detectChanges();
  }

  private bindInterpolations() {
    this.templateBindings = [];

    this.bindAttributeInterpolations();
    this.bindTextInterpolations();
  }

  private bindAttributeInterpolations() {
    this.root.querySelectorAll<HTMLElement>("*").forEach((element) => {
      element.getAttributeNames().forEach((attributeName) => {
        const value = element.getAttribute(attributeName);

        if (!value?.includes("{{")) return;

        this.templateBindings.push({
          target: element,
          attributeName,
          parts: Component.parseTemplateParts(value),
        });
      });
    });
  }

  private bindTextInterpolations() {
    const walker = document.createTreeWalker(this.root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();

    while (node) {
      const text = node.textContent || "";

      if (text.includes("{{")) {
        this.templateBindings.push({
          target: Component.getBindingTarget(node as Text),
          parts: Component.parseTemplateParts(text),
        });
      }

      node = walker.nextNode();
    }
  }

  private static getBindingTarget(node: Text) {
    const parent = node.parentElement;

    if (parent && parent.childNodes.length === 1 && !parent.closest("style, script")) {
      return parent;
    }

    return node;
  }

  private static parseTemplateParts(template: string) {
    const parts: TemplatePart[] = [];
    const expressionPattern = /\{\{\s*([^}]+?)\s*\}\}/g;
    let cursor = 0;

    for (const match of template.matchAll(expressionPattern)) {
      const index = match.index || 0;

      if (index > cursor) {
        parts.push({
          type: "text",
          value: template.slice(cursor, index),
        });
      }

      parts.push({
        type: "expression",
        value: match[1].trim(),
      });
      cursor = index + match[0].length;
    }

    if (cursor < template.length) {
      parts.push({
        type: "text",
        value: template.slice(cursor),
      });
    }

    return parts;
  }

  private static renderTemplateParts(parts: TemplatePart[], context: unknown) {
    return parts
      .map((part) => {
        if (part.type === "text") return part.value;

        try {
          return String(Component.resolveTemplateValue(context, part.value) ?? "");
        } catch {
          return "";
        }
      })
      .join("");
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
