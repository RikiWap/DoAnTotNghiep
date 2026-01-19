declare module 'bootstrap' {
  export class Tooltip {
    constructor(element: Element | string, options?: unknown);
    enable(): void;
    disable(): void;
    toggleEnabled(): void;
    toggle(): void;
    show(): void;
    hide(): void;
    dispose(): void;
  }

  export class Modal {
    constructor(element: Element | string, options?: unknown);
    show(): void;
    hide(): void;
    dispose(): void;
  }

  export class Dropdown {
    constructor(element: Element | string, options?: unknown);
    show(): void;
    hide(): void;
    dispose(): void;
  }

  export class Collapse {
    constructor(element: Element | string, options?: unknown);
    toggle(): void;
    show(): void;
    hide(): void;
    dispose(): void;
  }
}
