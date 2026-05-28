const componentReset = `
  :host {
    box-sizing: border-box;
    font-family: "Quicksand", sans-serif;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
  }
`;

export const renderComponent = (root: ShadowRoot, html: string, css: string) => {
  root.innerHTML = `<style>${componentReset}${css}</style>${html}`;
};

export const defineComponent = (name: string, component: CustomElementConstructor) => {
  customElements.get(name) || customElements.define(name, component);
};
