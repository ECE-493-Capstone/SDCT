import { IUser } from './IUser';

export interface IMessage {
    text: string;
    timestamp: Date;
    sender: IUser;
}