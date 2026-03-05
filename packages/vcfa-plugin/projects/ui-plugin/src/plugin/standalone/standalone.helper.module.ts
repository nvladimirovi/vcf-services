import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ClarityModule } from "@clr/angular";

@NgModule({
    imports: [
        ClarityModule,
        CommonModule,
    ],
    exports: [
        ClarityModule,
        CommonModule,
    ]
})
export class StandaloneHelperModule { }
