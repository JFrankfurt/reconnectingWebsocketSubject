import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReconnectingWebsocketSubject} from "./reconnectingWebsocketSubject.service";

@NgModule({
    imports: [CommonModule],
    declarations: [
        ReconnectingWebsocketSubject
    ],
    providers: [],
    exports: [
        ReconnectingWebsocketSubject
    ]
})
export class ReconnectingWebsocketModule {
}