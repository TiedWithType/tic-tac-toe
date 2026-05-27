export const $ = <T extends Element>(selector: string, root: ParentNode = document) => {
  const element = root.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Missing DOM element: ${selector}`);
  }

  return element;
};

export const $$ = <T extends Element>(selector: string, root: ParentNode = document) => [
  ...root.querySelectorAll<T>(selector),
];

export const appRoot = () => {
  const element = $<HTMLElement>("app-root");

  if (!element.shadowRoot) {
    throw new Error("Missing app root shadow root");
  }

  return element.shadowRoot;
};

export const shadowRootOf = (selector: string, root: ParentNode = appRoot()) => {
  const element = $<HTMLElement>(selector, root);

  if (!element.shadowRoot) {
    throw new Error(`Missing shadow root: ${selector}`);
  }

  return element.shadowRoot;
};
