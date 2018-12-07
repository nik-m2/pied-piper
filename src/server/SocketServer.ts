import http from 'http';
import IO from 'socket.io';

import autoBind from 'auto-bind';

import { makeDirAndWriteToFile } from '../helpers/FileHelper'
import Socket from './Socket'
import AbstractEndpoint from '../endpoints/AbstractEndpoint';

export default class SocketServer {
    public io:any;
    public endpoints:{ [s: string]: AbstractEndpoint };

    constructor(httpServer:http.Server, endpoints:{ [s: string]: AbstractEndpoint }) {
        autoBind(this);
        this.endpoints = endpoints;
        this.io = IO(httpServer);

        this.io.on('connection', this.onConnectionRecieved);
    }

    onConnectionRecieved(ioSocket:any) : Socket {
        const socket:Socket = new Socket(ioSocket, this);
        console.log("Connection recieved: " + socket.id);
        return socket;
    }

    handleEndpoint(endpointName:string, payload:string, socket:Socket) {
        if (!this.validatePayload(payload)) {
            socket.emitError("update", "Invalid request data");
            return;
        }

        const endpoint:AbstractEndpoint = this.endpoints[endpointName];
        if (!endpoint) {
            return;
        }  

        endpoint.handleEndpoint(payload, socket, this);
    }

        

    onDisconnect(socket:Socket) {

    }

    

    private validatePayload(payload):boolean {
        try {
            JSON.parse(payload);
            return true;
        } catch(e) {
            return false;
        }
    }

}