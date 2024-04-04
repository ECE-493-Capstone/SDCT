import * as vscode from 'vscode';
import { IChatRoom } from '../interfaces/IChatRoom';
import { ChatSocket } from '../backend/BackendSocket';
import { ChatRoomPanel } from '../panels/ChatRoomPanel';
import { readFileSync } from 'fs';

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
            await handleUserCodeMessage(chatRoom);
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
        canSelectMany: false,
        filters: {
            'Media': ['png', 'jpg', 'jpeg', 'mp4', 'gif'],
            'All Files': ['*']
        }
    });
    if (!!media) {
        let file = readFileSync(media[0].fsPath);
        ChatSocket.socketEmit("send media message", ChatRoomPanel.getChatRoomId(chatRoom), file);
    }
};

const sendFile = async (chatRoom: IChatRoom) => {
    const file = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
            'All Files': ['*']
        }
    });
    if (!!file) {
        vscode.commands.executeCommand("sdct.sendFile", chatRoom, file);
    }
};

const handleUserCodeMessage = async (chatRoom: IChatRoom) => {
    const languages = ["javascript", "python", "java", "c", "c++", "c#", "typescript", "php", "ruby", "swift", "go", "rust", "kotlin", "scala", "r", "shell", "html", "css"];
    const language = await vscode.window.showQuickPick(languages);
    vscode.commands.executeCommand("sdct.handleUserCodeMessage", chatRoom, language);
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
