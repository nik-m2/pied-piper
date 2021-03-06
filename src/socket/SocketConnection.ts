import autoBind from 'auto-bind';
import uuidv4 from 'uuid/v4';

import App from '@app/App';
import Connection from '@app/Connection';
import { REQUEST_METHODS } from '@app/Constants';
import SocketServer from '@socket/SocketServer';

export default class SocketConnection extends Connection {
    public readonly id: string;
    private server: SocketServer;
    private acknowledge: any;

    constructor(app: App, server: SocketServer, ioSocket: any) {
        super(app);
        autoBind(this);
        this.server = server;

        this.id = uuidv4();

        ioSocket.on('disconnect', this.onDisconnect);
        Object.keys(app.endpoints).forEach((endpoint) => {
            REQUEST_METHODS.forEach((method) => {
                ioSocket.on(`${endpoint}/${method.toLowerCase()}`, (payload, acknowledge) => {
                    this.acknowledge = acknowledge;
                    this.onRequest(endpoint, payload, method);
                });
            });
        });
    }

    public onSuccess(payload: string) {
        this.acknowledge(payload, false);
    }

    public onError(message: string) {
        this.acknowledge(null, message);
    }

    private onDisconnect() {
        this.server.onDisconnect(this.id);
    }
}
