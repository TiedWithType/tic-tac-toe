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
