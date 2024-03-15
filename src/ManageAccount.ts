import * as vscode from 'vscode';

export async function manageAccount() {
    const options = ["Add friend", "Create group", "See invites", "Log out"];
    const chosenOption = await vscode.window.showQuickPick(options);
    if (!!chosenOption) {
        vscode.window.showInformationMessage(chosenOption); // DEBUG
        if (chosenOption === "Log out") {
            vscode.commands.executeCommand('sdct.logout');
        }
    }
}