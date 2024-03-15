import * as vscode from 'vscode';

export async function manageAccount() {
    const options = ["Add friend", "Create group", "See invites", "Log out"];
    const chosenOption = await vscode.window.showQuickPick(options);
    // print the chosen option to windows
    if (!!chosenOption) {
        vscode.window.showInformationMessage(chosenOption);
    }
}