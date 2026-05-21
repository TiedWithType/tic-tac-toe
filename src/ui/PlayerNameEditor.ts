import { LONG_PRESS_DELAY, MAX_PLAYER_NAME_LENGTH } from "../core/constants";

type PlayerNameEditorOptions = {
  element: HTMLElement;
  getName: () => string;
  onCommit: (name: string) => void;
};

export class PlayerNameEditor {
  private longPressTimer: number | null = null;

  constructor(private options: PlayerNameEditorOptions) {}

  init() {
    const editTrigger = this.options.element.parentElement || this.options.element;

    editTrigger.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      this.clearLongPressTimer();
      this.startEdit();
    });

    editTrigger.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse") return;

      this.clearLongPressTimer();
      this.longPressTimer = window.setTimeout(() => {
        this.longPressTimer = null;
        this.startEdit();
      }, LONG_PRESS_DELAY);
    });

    editTrigger.addEventListener("pointerup", () => this.clearLongPressTimer());
    editTrigger.addEventListener("pointerleave", () => this.clearLongPressTimer());
    editTrigger.addEventListener("pointercancel", () => this.clearLongPressTimer());

    this.options.element.addEventListener("keydown", (event) => this.handleKeydown(event));
    this.options.element.addEventListener("input", () => this.limitInput());
    this.options.element.addEventListener("blur", () => this.commit());
  }

  private handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.options.element.blur();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.options.element.textContent = this.options.getName();
      this.options.element.blur();
      return;
    }

    const isSingleCharacter = event.key.length === 1;
    const hasSelection = this.getSelectionTextLength() > 0;
    const currentLength = this.options.element.textContent?.length || 0;

    if (isSingleCharacter && !hasSelection && currentLength >= MAX_PLAYER_NAME_LENGTH) {
      event.preventDefault();
    }
  }

  private clearLongPressTimer() {
    if (this.longPressTimer === null) return;

    window.clearTimeout(this.longPressTimer);
    this.longPressTimer = null;
  }

  private startEdit() {
    this.options.element.contentEditable = "true";
    this.options.element.classList.add("editing");
    this.options.element.focus();
    this.selectText();
  }

  private limitInput() {
    const currentName = this.options.element.textContent || "";

    if (currentName.length <= MAX_PLAYER_NAME_LENGTH) return;

    this.options.element.textContent = currentName.slice(0, MAX_PLAYER_NAME_LENGTH);
    this.moveCaretToEnd();
  }

  private commit() {
    const nextName = PlayerNameEditor.normalize(this.options.element.textContent || "");

    this.options.element.contentEditable = "false";
    this.options.element.classList.remove("editing");
    this.options.onCommit(nextName || this.options.getName());
  }

  private getSelectionTextLength() {
    return window.getSelection()?.toString().length || 0;
  }

  private selectText() {
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(this.options.element);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  private moveCaretToEnd() {
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(this.options.element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  static normalize(name: string) {
    return name.replace(/\s+/g, " ").trim().slice(0, MAX_PLAYER_NAME_LENGTH);
  }
}
