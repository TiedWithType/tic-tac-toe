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

const componentShared = `
  button {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    font-size: var(--font-button);
    letter-spacing: var(--tracking-md);
    text-transform: lowercase;
    color: var(--text-muted);
    background: transparent;
    border: var(--border-width) solid var(--border);
    border-radius: var(--radius-sm);
    padding: var(--space-button-block) var(--space-button-inline);
    cursor: pointer;
    touch-action: manipulation;
    transition:
      color var(--duration-fast),
      border-color var(--duration-fast),
      background var(--duration-fast),
      visibility var(--duration-fast);
  }

  button:hover {
    color: var(--text);
    border-color: var(--border-hover);
    background: var(--surface);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.62;
  }

  button:has(.material-symbols-rounded) {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
  }

  button .material-symbols-rounded,
  #options_version .material-symbols-rounded {
    display: grid;
    place-items: center;
    inline-size: var(--font-xl);
    block-size: var(--font-xl);
    font-family: "Material Symbols Rounded";
    font-size: var(--font-xl);
    font-style: normal;
    font-weight: 500;
    line-height: 1;
    letter-spacing: 0;
    text-transform: none;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    font-feature-settings: "liga";
    -webkit-font-feature-settings: "liga";
    -webkit-font-smoothing: antialiased;
  }

  .button-ripple {
    position: absolute;
    border-radius: var(--radius-round);
    background: color-mix(in srgb, var(--text), transparent 72%);
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -50%) scale(0);
    transform-origin: center;
    animation: button-ripple var(--duration-ripple) var(--ease-status-color);
  }

  @keyframes button-ripple {
    0% {
      opacity: 0.36;
      transform: translate(-50%, -50%) scale(0);
    }

    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1);
    }
  }
`;

export const renderComponent = (root: ShadowRoot, html: string, css: string) => {
  root.innerHTML = `<style>${componentReset}${componentShared}${css}</style>${html}`;
};

export const defineComponent = (name: string, component: CustomElementConstructor) => {
  customElements.get(name) || customElements.define(name, component);
};
