import { io, Socket} from "socket.io-client";
import { Server } from "socket.io"
import { ChatRoomPanel } from '../panels/ChatRoomPanel';
import { IUser } from "../interfaces/IUser";
import { createServer, Server as httpServer } from "http";
import { AddressInfo } from 'net'

export class BackendSocket{
    private socket: Socket = io();

    constructor(socketUrl: string, socketPort: number){
        this.socket = io(`${socketUrl}:${socketPort}`, { autoConnect: false });
    }

    startSocketIO(username: string){
        this.socket.auth = { username };
        this.socket.connect();
        
        this.socket.on("connect_error", (err) => {
            if (err.message === "invalid username") {
              console.log("Bad SocketIo Connection");
              return;
            }
        });

        this.socket.on("get chat message", (chatRoomId, message) => {
            ChatRoomPanel.sendChatMessage(chatRoomId, message);
        });

        this.socket.on("join private voice", (roomid) => {
            this.socket.emit("join private voice", roomid)
        })
      
        this.socket.on("send voice chat", (roomid, data) => {
            this.socket.emit("send voice chat", roomid, data)
        })
        this.socket.on("get voice chat", (data) => {
            VoiceSocket.sendVoiceChat(data)
        });
    }

    getSocket(): Socket {
        return this.socket;
    }
    
}

export class VoiceSocket{
    private httpServer: httpServer;
    private static io: Server;
    private backendSocket: BackendSocket;

    constructor(backendSocket: BackendSocket){
        this.backendSocket = backendSocket;
        this.httpServer = createServer();
        VoiceSocket.io = new Server(this.httpServer, {});
        VoiceSocket.io.on("connection", (socket) => {
            socket.on("send voice chat", (roomid, data) => {
                backendSocket.getSocket().emit("send voice chat", roomid, data)
            })
            socket.on("disconnect", () => {
                console.log("Disconnected");
              });
          });
    }

    startVoiceChat(roomid: string){
        this.httpServer.listen(0);
        this.backendSocket.getSocket().emit("join private voice", roomid)
    }
    
    static sendVoiceChat(data: any){
        VoiceSocket.io.emit("get voice chat", data);
    }
    static muteVoiceChat(){
        VoiceSocket.io.emit("mute voice chat");
    }
    static endVoiceChat(){
        VoiceSocket.io.close();
        console.log("Closed");
    }

    getSocketInfo(): string{
        const { port } = this.httpServer.address() as AddressInfo
        return `http://[::1]:${port}`;
    }
}
