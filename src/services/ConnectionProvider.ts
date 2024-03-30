import { io, Socket } from "socket.io-client";
import { IUser } from '../interfaces/IUser';

export class ConnectionProvider {
    private socket: Socket = io();
    private activeSession: boolean = false;
    private sessionID: string = "";
    private userID: string = "";
    private DatabaseURL = "http://[2605:fd00:4:1000:f816:3eff:fe7d:baf9]"
    private DatabasePort = 8000;

    private async postRequest(path: string, data: object): Promise<unknown> {
        console.log(path)
        try {
            const response = await fetch(`${this.DatabaseURL}:${this.DatabasePort}${path}`, {
                method: 'post',
                body: JSON.stringify(data),
                headers: {'Content-Type': 'application/json'}
            }).then(response=>response.json());

            return response;
        } catch (error) {
            console.error(error);
        }
    }

    async login(user: IUser): Promise<boolean>{
        const data = await this.postRequest("/login", {Username: user.name}) as {id: string};
        
        if(data.id){
            this.userID = data.id;
            return true;
        }

        return false;
    }
}
