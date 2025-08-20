export interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
    "user:start": (data: EventsParams["hello"]) => void;
    "user:share": (data: EventsParams["share"]) => void;
    "user:mousemove": (data: EventsParams["mousemove"]) => void;
}

export interface EventsParams {
    hello: SocketData;
    share: {
        from: string;
        to: string;
    }
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
    username: string;
    avatar: string;
    collaborator_with?: string;
    token: string;
    socketId?: string;
}