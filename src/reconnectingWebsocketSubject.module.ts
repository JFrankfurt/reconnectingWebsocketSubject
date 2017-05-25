import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {ReconnectingWebsocketSubject} from "./reconnectingWebsocketSubject.service";

@NgModule({
    declarations: [
        ReconnectingWebsocketSubject,
    ],
    exports: [
        ReconnectingWebsocketSubject,
    ],
    imports: [CommonModule],
    providers: [],
})
export class ReconnectingWebsocketModule {
}