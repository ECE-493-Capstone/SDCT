import { io, Socket} from "socket.io-client";
import { ChatRoomPanel } from '../panels/ChatRoomPanel';
import { IUser } from "../interfaces/IUser";

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
    }

    getSocket(): Socket {
        return this.socket;
    }
    
}

