import "../app-footer/app-footer.component";
import "../button-ripple/button-ripple.component";
import "../start-menu/start-menu.component";
import html from "./app-root.component.html?raw";
import css from "./app-root.component.css?raw";
import { Component, defineDynamicComponent } from "../component.utils";

export class AppRootComponent extends Component {}

defineDynamicComponent({
  selector: "app-root",
  component: AppRootComponent,
  html,
  css,
});

