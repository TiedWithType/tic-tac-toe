import html from "./button-ripple.component.html?raw";
import css from "./button-ripple.component.css?raw";
import { Component, defineDynamicComponent } from "../component.utils";

export class ButtonRippleComponent extends Component {
  static get observedAttributes() {
    return ["disabled"];
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(isDisabled: boolean) {
    this.toggleAttribute("disabled", isDisabled);
  }

  connectedCallback() {
    super.connectedCallback();
    this.setDefaultAccessibility();
    this.slotElement.addEventListener("slotchange", this.handleSlotChange);
    this.addEventListener("click", this.handleClick, { capture: true });
    this.addEventListener("keydown", this.handleKeydown);
    this.addEventListener("pointerdown", this.handlePointerDown);
    this.syncIconState();
    this.syncDisabledState();
  }

  disconnectedCallback() {
    this.slotElement.removeEventListener("slotchange", this.handleSlotChange);
    this.removeEventListener("click", this.handleClick, { capture: true });
    this.removeEventListener("keydown", this.handleKeydown);
    this.removeEventListener("pointerdown", this.handlePointerDown);
  }

  attributeChangedCallback() {
    this.syncDisabledState();
  }

  private setDefaultAccessibility() {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "button");
    }

    if (!this.hasAttribute("tabindex")) {
      this.tabIndex = this.disabled ? -1 : 0;
    }
  }

  private syncDisabledState() {
    this.setAttribute("aria-disabled", String(this.disabled));

    if (this.disabled && this.tabIndex >= 0) {
      this.dataset.previousTabIndex = String(this.tabIndex);
      this.tabIndex = -1;
      return;
    }

    if (!this.disabled && this.tabIndex < 0) {
      const previousTabIndex = this.dataset.previousTabIndex;

      this.tabIndex = previousTabIndex ? Number(previousTabIndex) : 0;
      delete this.dataset.previousTabIndex;
    }
  }

  private handleSlotChange = () => {
    this.syncIconState();
  };

  private syncIconState() {
    this.toggleAttribute("has-icon", Boolean(this.querySelector("material-icon")));
  }

  private handleClick = (event: MouseEvent) => {
    if (!this.disabled) return;

    event.preventDefault();
    event.stopImmediatePropagation();
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (this.disabled) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    this.click();
  };

  private handlePointerDown = (event: PointerEvent) => {
    if (this.disabled) return;

    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const ripple = document.createElement("span");

    ripple.className = "ripple";
    ripple.style.inlineSize = `${size}px`;
    ripple.style.blockSize = `${size}px`;
    ripple.style.insetInlineStart = `${event.clientX - rect.left}px`;
    ripple.style.insetBlockStart = `${event.clientY - rect.top}px`;

    this.root.append(ripple);
    ripple
      .animate(
        [
          {
            opacity: 0.36,
            transform: "translate(-50%, -50%) scale(0)",
          },
          {
            opacity: 0,
            transform: "translate(-50%, -50%) scale(1)",
          },
        ],
        {
          duration: this.rippleDuration,
          easing: this.rippleEasing,
        },
      )
      .finished.finally(() => ripple.remove());
  };

  private get rippleDuration() {
    const duration = getComputedStyle(document.documentElement)
      .getPropertyValue("--duration-ripple")
      .trim();

    if (!duration) return 620;

    return duration.endsWith("ms")
      ? Number.parseFloat(duration)
      : Number.parseFloat(duration) * 1000;
  }

  private get rippleEasing() {
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue("--ease-status-color")
        .trim() || "cubic-bezier(0.22, 1, 0.36, 1)"
    );
  }

  private get slotElement() {
    return this.root.querySelector<HTMLSlotElement>("slot")!;
  }
}

defineDynamicComponent({
  selector: "button-ripple",
  component: ButtonRippleComponent,
  html,
  css,
});
