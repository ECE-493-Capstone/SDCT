import * as vscode from 'vscode';
import { IChatRoom } from '../interfaces/IChatRoom';

export async function chatMenu(chatRoom: IChatRoom) {
    const options = [
        "Send Media", 
        "Send File", 
        "Send Code Message"
    ];
    if (chatRoom.isGroupChat) {
        options.push("Leave Group");
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
            return;
        } else if (chosenOption === "Send File") {
            return;
        } else if (chosenOption === "Send Code Message") {
            return;
        } else if (chosenOption === "Leave Group") {
            return;
        } else if (chosenOption === "Join Voice Chat") {
            joinVoiceChat(chatRoom)
        } else if (chosenOption === "Join Code Session") {
            return;
        }
    }
}

const joinVoiceChat = (chatRoom: IChatRoom) => {
    vscode.commands.executeCommand("sdct.openVoiceChat", chatRoom);
};