export interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
    hello: (data: EventsParams["hello"]) => void;
    mousemove: (data: EventsParams["mousemove"]) => void;
}

export interface EventsParams {
    hello: SocketData;
    mousemove: {
        pointer: {
            absolute: {
                x: number;
                y: number;
            },
            relative: {
                x: number;
                y: number;
            }
        },
        email: string;
    }
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    email: string;
    collaborators: string[];
    token: string;
    socketId?: string;
}