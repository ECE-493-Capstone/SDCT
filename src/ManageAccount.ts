import * as vscode from 'vscode';

export async function manageAccount() {
    const options = ["Add friend", "Create group", "Accept invites", "Decline invites", "Log out"];
    const chosenOption = await vscode.window.showQuickPick(options);
    if (!!chosenOption) {
        if (chosenOption === "Add friend") {
            await addFriend();
        } else if (chosenOption === "Create group") {
            await createGroup();
        } else if (chosenOption === "Accept invites") {
            await acceptInvites();
        } else if (chosenOption === "Decline invites") {
            await declineInvites();
        } else if (chosenOption === "Log out") {
            vscode.commands.executeCommand('sdct.logout');
        }
    }
}

async function addFriend() {
    const username = await vscode.window.showInputBox({ prompt: "Enter username" });
    if (!!username) {
        // TODO: Add friend logic
        vscode.window.showInformationMessage(`Added ${username} as a friend`);
    }
}

async function createGroup() {
    const groupName = await vscode.window.showInputBox({ prompt: "Enter group name" });
    if (!!groupName) {
        const mockData = ["user01", "user02", "user03", "user04", "user05"];
        const members = await vscode.window.showQuickPick(mockData, { canPickMany: true });
        if (!!members) {
            // TODO: Create group logic
            vscode.window.showInformationMessage(`Created group ${groupName}`);
        }
    }
}

async function acceptInvites() {
    const mockData = ["user01", "user02", "user03", "group01", "group02"];
    const acceptInvites = await vscode.window.showQuickPick(mockData, { canPickMany: true });
    if (!!acceptInvites) {
        // TODO: Accept invites logic
        vscode.window.showInformationMessage(`Accepted invites`);
    }
}

async function declineInvites() {
    const mockData = ["user01", "user02", "user03", "group01", "group02"];
    const declineInvites = await vscode.window.showQuickPick(mockData, { canPickMany: true });
    if (!!declineInvites) {
        // TODO: Decline invites logic
        vscode.window.showInformationMessage(`Declined invites`);
    }
}