import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {Subject} from "rxjs/Subject";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/share";
import "rxjs/add/observable/interval";
import "rxjs/add/operator/takeWhile";
import {WebSocketSubject, WebSocketSubjectConfig} from "rxjs/observable/dom/WebSocketSubject";

@Injectable()
export class ReconnectingWebsocketSubject<T> extends Subject<T> {
    public connectionStatus: Observable<boolean>;

    private reconnectionObservable: Observable<number>;
    private wsSubjectConfig: WebSocketSubjectConfig;
    private socket: WebSocketSubject<any>;
    private connectionObserver: Observer<boolean>;

    private defaultResultSelector = (e: MessageEvent) => JSON.parse(e.data);
    private defaultSerializer = (data: any): string => JSON.stringify(data);

    constructor(private url: string,
                private reconnectInterval = 12000,
                private reconnectAttempts = 0,
                private resultSelector?: (e: MessageEvent) => any,
                private serializer?: (data: any) => string) {
        super();

        this.connectionStatus = new Observable((observer) => {
            this.connectionObserver = observer;
        }).share().distinctUntilChanged();

        if (!resultSelector) {
            this.resultSelector = this.defaultResultSelector;
        }
        if (!this.serializer) {
            this.serializer = this.defaultSerializer;
        }

        this.wsSubjectConfig = {
            url: url,
            closeObserver: {
                next: () => {
                    this.socket = null;
                    this.connectionObserver.next(false);
                },
            },
            openObserver: {
                next: () => {
                    this.connectionObserver.next(true);
                },
            },
        };
        this.connect();
        this.connectionStatus.subscribe((isConnected) => {
            if (!this.reconnectionObservable && typeof(isConnected) === 'boolean' && !isConnected) {
                this.reconnect();
            }
        });
    }

    connect(): void {
        this.socket = new WebSocketSubject(this.wsSubjectConfig);
        this.socket.subscribe(
            (m) => {
                this.next(m);
            },
            () => {
                if (!this.socket) {
                    this.reconnect();
                }
            });
    }

    reconnect(): void {
        this.reconnectionObservable = Observable.interval(this.reconnectInterval)
            .takeWhile((v, index) => {
                return index < this.reconnectAttempts && !this.socket;
            });
        this.reconnectionObservable.subscribe(
            () => {
                this.connect();
            },
            null,
            () => {
                this.reconnectionObservable = null;
                if (!this.socket) {
                    this.complete();
                    this.connectionObserver.complete();
                }
            });
    }

    send(data: any): void {
        this.socket.next(this.serializer(data));
    }
}
