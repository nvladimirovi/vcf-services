import { Component } from "@angular/core";

@Component({
    standalone: false,
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    assetUrl = '/assets';
}
