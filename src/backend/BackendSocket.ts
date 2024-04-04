import { io, Socket} from "socket.io-client";
import { Server } from "socket.io"
import { ChatRoomPanel } from '../panels/ChatRoomPanel';
import { IUser } from "../interfaces/IUser";
import { createServer, Server as httpServer } from "http";
import { AddressInfo } from 'net'
import * as vscode from "vscode"

export class ChatSocket{
    private static socket: Socket | undefined;

    constructor(socketUrl: string, socketPort: number){
        ChatSocket.socket = io(`${socketUrl}:${socketPort}/chat`, { autoConnect: false });
    }

    startSocketIO(){
        if(ChatSocket.socket){
            ChatSocket.socket.connect();
            
            ChatSocket.socket.on("connect_error", (err) => {
                if (err.message === "invalid username") {
                    console.log("Bad SocketIo Connection");
                    return;
                }
            });

            ChatSocket.socket.on("get chat message", (chatRoom, message) => {
                vscode.commands.executeCommand('sdct.sendChatMessage', chatRoom, message);
            });

            ChatSocket.socket.on("get media message", (chatRoom, mediaURL) => {
                vscode.commands.executeCommand("sdct.sendMedia", chatRoom, mediaURL);
            });

        }else{
            console.log("No socket")
        }

    }

    static socketEmit(command: string, ...args: any[]){
        if(ChatSocket.socket){
            ChatSocket.socket.emit(command, ...args)
        } else{
            console.log("No socket")
        }
    }
}

export class VoiceSocket{
    private httpServer: httpServer;
    private io: Server;
    private socket: Socket

    constructor(socketUrl: string, socketPort: number){
        this.socket = io(`${socketUrl}:${socketPort}/voice`, { autoConnect: false });

        this.socket.on("connect_error", (err) => {
            if (err.message === "invalid username") {
                console.log("Bad SocketIo Connection");
                return;
            }
        });
        this.socket.on("get voice chat", (data) => {
            this.io.emit("get voice chat", data);
        });

        this.httpServer = createServer();
        this.io = new Server(this.httpServer, {});
        this.io.on("connection", (socket) => {
            socket.on("send voice chat", (roomid, data) => {
                this.socket.emit("send voice chat", roomid, data)
            })
            socket.on("disconnect", () => {
                console.log("Disconnected");
              });
          });
    }

    
    startVoiceChat(roomid: string){
        this.socket.connect();

        this.httpServer.listen(0);
        this.socket.emit("join private voice", roomid)
    }
    
    muteVoiceChat(){
        this.io.emit("mute voice chat");
    }
    endVoiceChat(){
        this.socket.close();
        this.io.close();
        console.log("Closed");
    }

    getSocketInfo(): string{
        const { port } = this.httpServer.address() as AddressInfo
        return `http://[::1]:${port}`;
    }
}
