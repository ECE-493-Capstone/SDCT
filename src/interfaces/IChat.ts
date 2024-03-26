import * as vscode from 'vscode';

export interface IChat {
    name: string;
    lastMessage: string;
    lastMessageTime: Date;
    pictureUri: vscode.Uri;
    notificationCount: number;
    isGroup: boolean;
}