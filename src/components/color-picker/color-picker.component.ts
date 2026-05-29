import html from "./color-picker.component.html?raw";
import css from "./color-picker.component.css?raw";
import { DEFAULT_MARKER_COLORS } from "../../core/constants";
import type { Player } from "../../core/types";
import { SettingsService } from "../../services/settings.service";
import { Component, defineDynamicComponent } from "../component.utils";

const PRESET_COLORS = [
  { value: "#4f46e5", name: "indigo" },
  { value: "#ec4899", name: "pink" },
  { value: "#06b6d4", name: "cyan" },
  { value: "#22c55e", name: "green" },
  { value: "#f59e0b", name: "amber" },
  { value: "#ef4444", name: "red" },
  { value: "#8b5cf6", name: "violet" },
  { value: "#14b8a6", name: "teal" },
  { value: "#f97316", name: "orange" },
  { value: "#eab308", name: "yellow" },
  { value: "#64748b", name: "slate" },
  { value: "#f8fafc", name: "white" },
];

type ColorPickerState = {
  value: string;
  draftValue: string;
  label: string;
  marker: Player;
  isOpen: boolean;
  error: string;
};

type ColorPickerAction =
  | { type: "set-external-value"; value: string }
  | { type: "set-label"; label: string }
  | { type: "set-marker"; marker: Player }
  | { type: "toggle" }
  | { type: "close" }
  | { type: "set-draft"; value: string }
  | { type: "commit" };

type ColorPickerListener = (
  state: ColorPickerState,
  previousState: ColorPickerState,
  action: ColorPickerAction,
) => void;

class ColorPickerStore {
  private listeners = new Set<ColorPickerListener>();

  constructor(private state: ColorPickerState) {}

  getState() {
    return this.state;
  }

  dispatch(action: ColorPickerAction) {
    const previousState = this.state;
    const nextState = colorPickerReducer(previousState, action);

    if (nextState === previousState) return;

    this.state = nextState;
    this.listeners.forEach((listener) => listener(this.state, previousState, action));
  }

  subscribe(listener: ColorPickerListener) {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }
}

type ColorPickerEventDetail = {
  player: Player;
  color: string;
};

export class ColorPickerComponent extends Component {
  static get observedAttributes() {
    return ["value", "label", "marker"];
  }

  private readonly store = new ColorPickerStore({
    value: DEFAULT_MARKER_COLORS.circle,
    draftValue: DEFAULT_MARKER_COLORS.circle,
    label: "Marker color",
    marker: "circle",
    isOpen: false,
    error: "",
  });
  private unsubscribe: (() => void) | null = null;
  private value = DEFAULT_MARKER_COLORS.circle;
  private draftValue = DEFAULT_MARKER_COLORS.circle;
  private label = "Marker color";
  private colorName = getColorName(DEFAULT_MARKER_COLORS.circle);
  private panelLabel = "Color picker";
  private presetLabel = "Preset colors";
  private hexLabel = "HEX";
  private marker: Player = "circle";
  private expanded = "false";
  private error = "";
  private handleDocumentPointerDown = (event: PointerEvent) => {
    if (
      event
        .composedPath()
        .some((target) => target instanceof Element && target.tagName === "TIC-COLOR-PICKER")
    ) {
      return;
    }

    this.store.dispatch({ type: "close" });
  };

  connectedCallback() {
    super.connectedCallback();

    if (this.unsubscribe) return;

    this.unsubscribe = this.store.subscribe((state, previousState, action) => {
      this.renderState(state);

      if (state.value !== previousState.value && action.type !== "set-external-value") {
        this.emitColorChange(state);
      }
    });
    this.syncAttributes();
    this.renderPresets();
    this.bindEvents();
    document.addEventListener("pointerdown", this.handleDocumentPointerDown);
    this.renderState(this.store.getState());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribe = null;
    document.removeEventListener("pointerdown", this.handleDocumentPointerDown);
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
    if (name === "value") {
      this.store.dispatch({
        type: "set-external-value",
        value: newValue || DEFAULT_MARKER_COLORS.circle,
      });
    }

    if (name === "label" && newValue) {
      this.store.dispatch({ type: "set-label", label: newValue });
    }

    if (name === "marker" && isPlayer(newValue)) {
      this.store.dispatch({ type: "set-marker", marker: newValue });
    }
  }

  private syncAttributes() {
    this.attributeChangedCallback("value", null, this.getAttribute("value"));
    this.attributeChangedCallback("label", null, this.getAttribute("label"));
    this.attributeChangedCallback("marker", null, this.getAttribute("marker"));
  }

  private bindEvents() {
    this.trigger.addEventListener("click", () => {
      this.store.dispatch({ type: "toggle" });
    });

    this.hexInput.addEventListener("input", () => {
      this.store.dispatch({ type: "set-draft", value: this.hexInput.value });
    });

    this.hexInput.addEventListener("change", () => {
      this.store.dispatch({ type: "commit" });
    });

    this.hexInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.store.dispatch({ type: "commit" });
      }

      if (event.key === "Escape") {
        event.preventDefault();
        this.store.dispatch({ type: "close" });
        this.trigger.focus();
      }
    });

    this.root.addEventListener("keydown", (event) => {
      if (!(event instanceof KeyboardEvent)) return;
      if (event.key !== "Escape") return;

      this.store.dispatch({ type: "close" });
      this.trigger.focus();
    });
  }

  private renderState(state: ColorPickerState) {
    this.setTemplateProperties({
      value: state.value,
      draftValue: state.draftValue,
      label: state.label,
      colorName: getColorName(state.value),
      marker: state.marker,
      expanded: String(state.isOpen),
      error: state.error,
    });
    this.style.setProperty("--picker-color", state.value);
    this.toggleAttribute("open", state.isOpen);
    this.panel.setAttribute("aria-hidden", String(!state.isOpen));

    if (document.activeElement !== this.hexInput && this.hexInput.value !== state.draftValue) {
      this.hexInput.value = state.draftValue;
    }

    this.updatePresetState(state.value);
  }

  private renderPresets() {
    this.presetGrid.replaceChildren(
      ...PRESET_COLORS.map(({ value, name }) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "preset";
        button.title = `${name} ${value}`;
        button.style.setProperty("--preset-color", value);
        button.dataset.color = value;
        button.setAttribute("aria-label", `${name} ${value}`);
        button.addEventListener("click", () => {
          this.store.dispatch({ type: "set-draft", value });
          this.store.dispatch({ type: "commit" });
          this.store.dispatch({ type: "close" });
        });

        return button;
      }),
    );
  }

  private updatePresetState(value: string) {
    this.presetButtons.forEach((button) => {
      const isActive = button.dataset.color?.toLowerCase() === value.toLowerCase();

      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  private emitColorChange(state: ColorPickerState) {
    this.dispatchEvent(
      new CustomEvent<ColorPickerEventDetail>("color-change", {
        detail: {
          player: state.marker,
          color: state.value,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private get trigger() {
    return this.root.querySelector<HTMLButtonElement>("#color_trigger")!;
  }

  private get panel() {
    return this.root.querySelector<HTMLElement>("#color_panel")!;
  }

  private get presetGrid() {
    return this.root.querySelector<HTMLElement>(".preset-grid")!;
  }

  private get presetButtons() {
    return [...this.root.querySelectorAll<HTMLButtonElement>(".preset")];
  }

  private get hexInput() {
    return this.root.querySelector<HTMLInputElement>("#hex_input")!;
  }
}

function colorPickerReducer(
  state: ColorPickerState,
  action: ColorPickerAction,
): ColorPickerState {
  switch (action.type) {
    case "set-external-value": {
      const value = normalizeHexColor(action.value);

      return value && value !== state.value
        ? { ...state, value, draftValue: value, error: "" }
        : state;
    }

    case "set-label":
      return action.label === state.label ? state : { ...state, label: action.label };

    case "set-marker":
      return action.marker === state.marker ? state : { ...state, marker: action.marker };

    case "toggle":
      return { ...state, isOpen: !state.isOpen, draftValue: state.value, error: "" };

    case "close":
      return state.isOpen ? { ...state, isOpen: false, draftValue: state.value, error: "" } : state;

    case "set-draft":
      return updateDraftColor(state, action.value);

    case "commit": {
      const value = normalizeHexColor(state.draftValue);

      if (!value) {
        return { ...state, draftValue: state.value, error: "Use #RRGGBB" };
      }

      return value === state.value
        ? { ...state, draftValue: value, error: "" }
        : { ...state, value, draftValue: value, error: "" };
    }
  }
}

function updateDraftColor(state: ColorPickerState, value: string): ColorPickerState {
  const draftValue = normalizeDraft(value);
  const nextValue = normalizeHexColor(draftValue);
  const nextState = {
    ...state,
    draftValue,
    error: "",
  };

  return nextValue && nextValue !== state.value
    ? { ...nextState, value: nextValue }
    : nextState;
}

function normalizeDraft(value: string) {
  const cleaned = value.replace(/[^\da-f#]/gi, "").slice(0, 7);
  const withoutHash = cleaned.replace(/#/g, "");

  return `#${withoutHash}`.slice(0, 7).toUpperCase();
}

function normalizeHexColor(value: string) {
  const normalized = normalizeDraft(value);

  return SettingsService.isHexColor(normalized) ? normalized.toUpperCase() : "";
}

function getColorName(value: string) {
  const preset = PRESET_COLORS.find(
    (color) => color.value.toLowerCase() === value.toLowerCase(),
  );

  return preset?.name ?? "custom";
}

function isPlayer(value: unknown): value is Player {
  return value === "circle" || value === "cross";
}

defineDynamicComponent({
  selector: "tic-color-picker",
  component: ColorPickerComponent,
  html,
  css,
});
