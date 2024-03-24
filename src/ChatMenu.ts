import * as vscode from 'vscode';

export async function chatMenu(isGroupChat: boolean, joinedVoiceChat: boolean, joinedCodeSession: boolean) {
    const options = [
        "Send Media", 
        "Send File", 
        "Send Code Message"
    ];
    if (isGroupChat) {
        options.push("Leave Group");
    }
    if (!joinedVoiceChat) {
        options.push("Join Voice Chat");
    }
    if (!joinedCodeSession) {
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
            return;
        } else if (chosenOption === "Join Code Session") {
            return;
        }
    }
}