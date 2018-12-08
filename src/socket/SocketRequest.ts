import autoBind from 'auto-bind';
import uuidv4 from 'uuid/v4';

import App from '@app/App';
import Request from '@app/Request';

export default class SocketRequest extends Request {
    public readonly id: string;
    private ioSocket: any;
    private acknowledge: any;

    constructor(app: App, ioSocket: any) {
        super(app);
        autoBind(this);

        this.ioSocket = ioSocket;

        this.id = uuidv4();

        Object.keys(app.endpoints).forEach((endpoint) => {
            ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].forEach((method) => {
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
}
