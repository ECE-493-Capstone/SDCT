import * as vscode from 'vscode';
import { IChatRoom } from '../interfaces/IChatRoom';

export async function chatMenu(chatRoom: IChatRoom) {
    const options = [
        "Send Media", 
        "Send File", 
        "Send Code Message"
    ];
    if (chatRoom.friends.length > 1) {
        options.push("Leave Group");
        options.push("See Group Members");
    }
    if (!chatRoom.joinedVoiceChat) {
        options.push("Join Voice Chat");
    }
    if (!chatRoom.joinedCodeSession) {
        options.push("Join Code Session");
    }
    const chosenOption = await vscode.window.showQuickPick(options);
    if (!!chosenOption) {
        if (chosenOption === "Send Media") {
            await sendMedia(chatRoom);
        } else if (chosenOption === "Send File") {
            await sendFile(chatRoom);
        } else if (chosenOption === "Send Code Message") {
            await sendCodeMessage(chatRoom);
        } else if (chosenOption === "Leave Group") {
            return;
        } else if (chosenOption === "Join Voice Chat") {
            joinVoiceChat(chatRoom);
        } else if (chosenOption === "Join Code Session") {
            joinedCodeSession(chatRoom);
        } else if (chosenOption === "See Group Members") {
            await showGroupMembers(chatRoom);
        }
    }
}

const sendMedia = async (chatRoom: IChatRoom) => {
    const media = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: true,
        filters: {
            'Media': ['png', 'jpg', 'jpeg', 'mp4', 'gif'],
            'All Files': ['*']
        }
    });
    if (!!media) {
        vscode.commands.executeCommand("sdct.sendMedia", chatRoom, media);
    }
};

const sendFile = async (chatRoom: IChatRoom) => {
    const file = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: true,
        filters: {
            'All Files': ['*']
        }
    });
    if (!!file) {
        vscode.commands.executeCommand("sdct.sendFile", chatRoom, file);
    }
};

const sendCodeMessage = async (chatRoom: IChatRoom) => {
    const languages = ["javascript", "python", "java", "c", "c++", "c#", "typescript", "php", "ruby", "swift", "go", "rust", "kotlin", "scala", "r", "shell", "html", "css"];
    const language = await vscode.window.showQuickPick(languages);
    vscode.commands.executeCommand("sdct.sendCodeMessage", chatRoom, language);
};

const joinVoiceChat = (chatRoom: IChatRoom) => {
    vscode.commands.executeCommand("sdct.openVoiceChat", chatRoom);
};

const joinedCodeSession = (chatRoom: IChatRoom) => {
    vscode.commands.executeCommand("sdct.openCodeSession", chatRoom);
};

const showGroupMembers = async (chatRoom: IChatRoom) => {
    vscode.window.showQuickPick(chatRoom.friends.map(friend => friend.name));
};