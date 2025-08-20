import { Socket, Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import chalk from "chalk";
import { ClientToServerEvents, EventsParams, InterServerEvents, ServerToClientEvents, SocketData } from "../types/socket";

export class SocketManager {
    public static instance: SocketManager;
    public io: SocketServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;

    private _sockets: Map<string, Socket> = new Map();
    private _clients: Map<string, SocketData> = new Map();
    private _rooms: Map<string, string[]> = new Map();

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

    private registerEvents() {
        this.io.on("connection", (socket) => {
            if (!this._sockets.has(socket.id)) {
                this._sockets.set(socket.id, socket);
            }
            console.log(chalk.green("a user connected") + ` [${this._sockets.size}]`);

            socket.on("user:start", (data: EventsParams["hello"]) => {
                if (this._clients.has(data.email)) {
                    return;
                }

                console.log(chalk.yellow("User started successfully"));
                const payload = {
                    ...data,
                    socketId: socket.id,
                }

                this._clients.set(data.email, payload);
                if (!this._rooms.has(data.email)) {
                    this._rooms.set(data.email, []);
                }

                console.log("this._rooms", this._rooms);
                console.log("this._clients", this._clients);
            })

            socket.on("user:share", (data: EventsParams["share"]) => {
                console.log(chalk.yellow("User shared successfully"));
                if (!this._rooms.has(data.to)) {
                    this._rooms.set(data.to, []);
                }

                const room = this._rooms.get(data.to);
                if (!room) {
                    return;
                }

                const client = this._clients.get(data.from);
                if (!client) {
                    return;
                }

                if(room.includes(data.from)) {
                    return;
                }

                room.push(data.from);
                client.collaborator_with = data.to;
                
                const collaborators = [...room.values()];
                collaborators.push(data.to);

                collaborators.forEach((collaborator) => {
                    const client = this._clients.get(collaborator);
                    if (!client || !client.socketId) {
                        return;
                    }

                    const socket = this._sockets.get(client.socketId);
                    if (socket) {
                        const payload = {
                            collaborators: [...collaborators].filter((col) => col !== collaborator),
                        }
                        socket.emit("user:collaborator", payload);
                    }
                });

                console.log("this._rooms", this._rooms);
                console.log("this._clients", this._clients);
            })

            socket.on("user:mousemove", (data: EventsParams["mousemove"]) => {
                // console.log(chalk.yellow("User moved successfully"));
                const client = this._clients.get(data.email);
                if (!client) {
                    return;
                }

                if (client.collaborator_with) {
                    const room = this._rooms.get(client.collaborator_with);
                    if (!room) {
                        return;
                    }

                    const collaborators = room.filter((collaborator) => collaborator !== client.email);
                    collaborators.push(client.collaborator_with);
                    collaborators.forEach((collaborator) => {
                        const client = this._clients.get(collaborator);
                        if (!client || !client.socketId) {
                            return;
                        }

                        const socket = this._sockets.get(client.socketId);
                        if (socket) {
                            socket.emit("user:mousemove", data);
                        }
                    });

                    return;
                }

                if (this._rooms.has(data.email)) {
                    const room = this._rooms.get(data.email);
                    if (!room) {
                        return;
                    }

                    const collaborators = room.filter((collaborator) => collaborator !== client.email);
                    collaborators.forEach((collaborator) => {
                        const client = this._clients.get(collaborator);
                        if (!client || !client.socketId) {
                            return;
                        }

                        const socket = this._sockets.get(client.socketId);
                        if (socket) {
                            socket.emit("user:mousemove", data);
                        }
                    });
                }

            })

            socket.on("disconnect", () => {
                console.log(chalk.yellow("User disconnected"));
                this._sockets.delete(socket.id);
                const client = [...this._clients.values()].find((client) => client.socketId === socket.id);
                if (!client) {
                    return;
                }

                const room = this._rooms.get(client.collaborator_with!);
                if (room) {
                    room.splice(room.indexOf(client.email), 1);
                }

                this._clients.delete(client.email);
                console.log(chalk.red("User disconnected") + ` [${this._sockets.size}]`);
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