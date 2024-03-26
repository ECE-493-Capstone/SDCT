import { IUser } from "./IUser";

export interface IChatRoom {
    user: IUser;
    friends: IUser[];
    joinedVoiceChat: boolean;
    joinedCodeSession: boolean;
}