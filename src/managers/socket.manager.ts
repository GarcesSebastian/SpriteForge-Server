import { Socket, Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import chalk from "chalk";
import { ClientToServerEvents, EventsParams, InterServerEvents, ServerToClientEvents, SocketData } from "../types/socket";

export class SocketManager {
    public static instance: SocketManager;
    public io: SocketServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;

    private _sockets: Map<string, Socket> = new Map();
    private _clients: Map<string, SocketData> = new Map();

    private constructor(server: HttpServer) {
        this.io = new SocketServer(server, {
          cors: {
            origin: process.env.CORS_ORIGINS?.split(",") || "*",
          },
          transports: ["websocket", "polling"],
        });
    }

    public static getInstance(server?: HttpServer): SocketManager {
        if (!SocketManager.instance) {
            if (!server) {
                throw new Error("Server instance is required to create SocketManager");
            }
            SocketManager.instance = new SocketManager(server);
        }

        return SocketManager.instance;
    }

    public updateCollaborator(email: string, collaborators: string[]) {
        const client = [...this._clients.values()].find((client) => client.email === email);
        if (!client) {
            return;
        }
        
        client.collaborators = collaborators;
    }

    private registerEvents() {
        this.io.on("connection", (socket) => {
            if (!this._sockets.has(socket.id)) {
                this._sockets.set(socket.id, socket);
            }
            console.log(chalk.green("a user connected") + ` [${this._sockets.size}]`);

            socket.on("hello", (data: EventsParams["hello"]) => {
                const payload = {
                    ...data,
                    socketId: socket.id,
                }
                this._clients.set(data.email, payload);
                console.log(this._clients);
            })

            socket.on("mousemove", (data: EventsParams["mousemove"]) => {
                const client = this._clients.get(data.email);
                if (!client) {
                    return;
                }

                console.log(client);
                const collaborators = JSON.parse(client.collaborators as unknown as string);
                collaborators.forEach((collaborator: string) => {
                    console.log(collaborator);
                    const client = this._clients.get(collaborator);
                    if (!client) {
                        return;
                    }
                    
                    console.log(client);
                    const socket = this._sockets.get(client.socketId!);
                    if (socket) {
                        socket.emit("mousemove", data);
                    }
                });
            })

            socket.on("disconnect", () => {
                this._sockets.delete(socket.id);
                console.log(chalk.red("user disconnected") + ` [${this._sockets.size}]`);
            });
        });
    }

    public start(): SocketManager {
        console.log(chalk.yellow("SocketManager started"));
        this.registerEvents();
        return this;
    }

    public getSocket(id: string): Socket | undefined {
        return this._sockets.get(id);
    }
}