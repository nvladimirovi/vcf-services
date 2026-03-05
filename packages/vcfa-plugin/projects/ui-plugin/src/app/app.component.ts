import { Component } from "@angular/core";
import { SubnavComponent } from "../plugin/subnav.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [SubnavComponent],
})
export class AppComponent {}