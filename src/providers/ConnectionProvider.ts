import { io, Socket } from "socket.io-client";
import { IUser } from '../interfaces/IUser';

export class ConnectionProvider {
    private socket: Socket = io();
    private activeSession: boolean = false;
    private sessionID: string = "";
    private userID: string = "";
    private DatabaseURL = "http://[2605:fd00:4:1000:f816:3eff:fe7d:baf9]"
    private DatabasePort = 8000;

    private async postRequest(path: string, data: object): Promise<Response | undefined> {
        console.log("Post", path)
        try {
            const response = await fetch(`${this.DatabaseURL}:${this.DatabasePort}${path}`, {
                method: 'post',
                body: JSON.stringify(data),
                headers: {'Content-Type': 'application/json'}
            })
            if(!response.ok){
                throw new Error(await response.text());
            }
     
            return response;
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    private async getRequest(path: string): Promise<Response | undefined> {
        console.log("Get", path)
        try {
            const response = await fetch( `${this.DatabaseURL}:${this.DatabasePort}${path}`)
            
            if(!response.ok){
                throw new Error(await response.text());
            }

            return response;
        } catch (error) {
            console.error(error);
        }
        return undefined;
    }

    async login(user: IUser): Promise<boolean>{
        const data = await this.postRequest("/login", {Username: user.name});

        if(data){
            const data_json = await data.json() as {id: string};
            if(data_json.id){
                this.userID = data_json.id;
                return true;
            }
        }

        return false;
    }
    async getChatFriends(){
        const data = await this.getRequest(`/list_chats_friends/${this.userID}`);
        
        console.log(data)

        return false;
    }

    async addFriend(friend: string): Promise<boolean>{
        const data = await this.postRequest(`/add_friend`, {UserId: this.userID, FriendId: friend});
        
        if(data){
            return true;
        }

        return false;
    }

    async getInvites(): Promise<string[]>{
        const inviteList: string[] = []
        const friend_invites = await this.getRequest(`/list_received_invitations_friends/${this.userID}`);
        const group_invites = await this.getRequest(`/list_received_invitations_groups/${this.userID}`);

        if(friend_invites){
            const data = await friend_invites.json() as {data: string[]};
            console.log(data)
            for(let invite of data.data ){
                inviteList.push(invite);
            }
        }

        if(group_invites){
            const data = await group_invites.json() as {data: string[]};
            console.log(data)
            for(let invite of data.data ){
                inviteList.push(invite);
            }
        }

        return inviteList;
    }
}
