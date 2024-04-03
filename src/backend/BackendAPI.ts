import { IUser } from '../interfaces/IUser';
import { IChat } from "../interfaces/IChat";
import { IApiFriendChatList, IApiGroupChatList } from "../interfaces/IBackendApi"

export class BackendAPI {
    private userID: string = "";
    private apiURL = "";
    private apiPort = 3000;

    constructor(apiUrl: string, apiPort: number){
        this.apiURL = apiUrl;
        this.apiPort = apiPort;
    }

    private async postRequest(path: string, data: object): Promise<Response | undefined> {
        console.log("Post", path)
        try {
            const response = await fetch(`${this.apiURL}:${this.apiPort}${path}`, {
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
            const response = await fetch( `${this.apiURL}:${this.apiPort}${path}`)
            
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
        const apiData = await this.postRequest("/login", {UserId: user.name, ImageURL: user.pictureUri});

        if(apiData){
            const data_json = await apiData.json() as {message: string};
            if(data_json.message === "success"){
                this.userID = user.name;
                return true;
            }
        }

        return false;
    }


    async getFriendNotifactionList(): Promise<IChat[]> {
        let data: IChat[] = [];
        const apiData = await this.getRequest(`/list_chats_friends/${this.userID}`);
        
        if(apiData){
            const data_json = await apiData.json() as {data: IApiFriendChatList[]};
            console.log(data_json);
            for(let chat of data_json.data){
                // Perform UTC Conversion
                const date =  new Date(0);
                date.setUTCSeconds(chat.MessageTime);

                data.push({
                    name: chat.Username,
                    lastMessage: chat.MessageText,
                    lastMessageTime: date,
                    pictureUri: `https://picsum.photos/seed/1/200/200`, //TODO: ADD
                    notificationCount: 100, //TODO: ADD
                    voiceChatActive: false, //TODO: ADD 
                    codeSessionActive: false,//TODO: ADD
                    friendId: chat.rowid.toString(),
                    groupId: undefined,
                  });
            }
        }

        return data;
    }

    // async getFriendChatList(): Promise<IChat[]> {
    //     let data: IChat[] = [];
    //     const apiData = await this.getRequest(`/list_chats_friends/${this.userID}`);
        
    //     if(apiData){
    //         const data_json = await apiData.json() as {data: IApiFriendChatList[]};
    //         console.log(data_json);
    //         for(let chat of data_json.data){
    //             // Perform UTC Conversion
    //             const date =  new Date(0);
    //             date.setUTCSeconds(chat.MessageTime);

    //             data.push({
    //                 name: chat.Username,
    //                 lastMessage: chat.MessageText,
    //                 lastMessageTime: date,
    //                 pictureUri: `https://picsum.photos/seed/1/200/200`, //TODO: ADD
    //                 notificationCount: 100, //TODO: ADD
    //                 voiceChatActive: false, //TODO: ADD 
    //                 codeSessionActive: false,//TODO: ADD
    //                 friendId: chat.rowid.toString(),
    //                 groupId: undefined,
    //               });
    //         }
    //     }

    //     return data;
    // }

    // async getGroupChatList(): Promise<IChat[]> {
    //     let data: IChat[] = [];
    //     const apiData = await this.getRequest(`/list_chats_groups/${this.userID}`);
        
    //     if(apiData){
    //         const data_json = await apiData.json() as {data: IApiGroupChatList[]};
    //         console.log(data_json);
    //         for(let chat of data_json.data){
    //             // Perform UTC Conversion
    //             const date =  new Date(0);
    //             date.setUTCSeconds(chat.MessageTime);

    //             data.push({
    //                 name: chat.GroupName,
    //                 lastMessage: chat.MessageText,
    //                 lastMessageTime: date,
    //                 pictureUri: `https://picsum.photos/seed/1/200/200`, //TODO: ADD
    //                 notificationCount: 100, //TODO: ADD
    //                 voiceChatActive: false, //TODO: ADD 
    //                 codeSessionActive: false,//TODO: ADD
    //                 friendId: undefined,
    //                 groupId: chat.GroupId.toString(),
    //               });
    //         }
    //     }

    //     return data;
    // }

    async addFriend(friend: string): Promise<boolean>{
        const apiData = await this.postRequest(`/add_friend`, {UserId: this.userID, FriendId: friend});
        
        if(apiData){
            return true;
        }

        return false;
    }

    async getInvites(): Promise<string[]>{
        const inviteList: string[] = []
        const friend_invites = await this.getRequest(`/list_received_invitations_friends/${this.userID}`);

        if(friend_invites){
            const data = await friend_invites.json() as {data: {UserId: string}[]};
            if(data){
                for(let invite of data.data ){
                    inviteList.push(invite.UserId);
                }
            }

        }

        const group_invites = await this.getRequest(`/list_received_invitations_groups/${this.userID}`);
        if(group_invites){
            const data = await group_invites.json() as {data: string[]};
            if(data){
                for(let invite of data.data ){
                    inviteList.push(invite);
                }
            }

        }

        return inviteList;
    }

    async acceptFriendInvite(friend: string): Promise<boolean>{
        const apiData = await this.postRequest(`/accept_invite_friend`, {FriendId: friend, UserId: this.userID});
        
        if(apiData){
            return true;
        }

        return false;
    }
    async declineFriendInvite(friend: string): Promise<boolean>{
        const apiData = await this.postRequest(`/decline_invite_friend`, {FriendId: friend, UserId: this.userID});
        
        if(apiData){
            return true;
        }

        return false;
    }
}
