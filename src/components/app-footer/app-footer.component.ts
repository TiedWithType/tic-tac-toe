import html from "./app-footer.component.html?raw";
import css from "./app-footer.component.css?raw";
import { Component, defineDynamicComponent } from "../component.utils";

export class AppFooterComponent extends Component {
  readonly version = {
    major: 4,
    minor: 2,
    patch: 0,
    release: "beta",
    codename: "Lemon Tart",
    author: "TiedWithType",
  };
}

defineDynamicComponent({
  selector: "tic-app-footer",
  component: AppFooterComponent,
  html,
  css,
});
