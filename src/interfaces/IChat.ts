export interface IChat {
    name: string;
    lastMessage: string;
    lastMessageTime: Date;
    pictureUri: string;
    notificationCount: number;
    voiceChatActive: boolean;
    codeSessionActive: boolean;
    groupId?: string;
}
