export interface IChat {
    name: string;
    lastMessage: string;
    lastMessageTime: Date;
    pictureUri: string;
    notificationCount: number;
    isGroup: boolean;
}