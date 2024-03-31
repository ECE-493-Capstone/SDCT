import * as vscode from 'vscode';
import { ConnectionProvider } from '../providers/ConnectionProvider';

export async function manageAccount(cprovider: ConnectionProvider) {
    const options = ["Add friend", "Create group", "Accept invites", "Decline invites", "Log out"];
    const chosenOption = await vscode.window.showQuickPick(options);
    if (!!chosenOption) {
        if (chosenOption === "Add friend") {
            await addFriend(cprovider);
        } else if (chosenOption === "Create group") {
            await createGroup(cprovider);
        } else if (chosenOption === "Accept invites") {
            await acceptInvites(cprovider);
        } else if (chosenOption === "Decline invites") {
            await declineInvites(cprovider);
        } else if (chosenOption === "Log out") {
            vscode.commands.executeCommand('sdct.logout');
        }
    }
}

async function addFriend(cprovider: ConnectionProvider) {
    const username = await vscode.window.showInputBox({ prompt: "Enter username" });
    if (!!username) {
        if(await cprovider.addFriend(username)){
            vscode.window.showInformationMessage(`Added ${username} as a friend`);
        } else{
            vscode.window.showErrorMessage(`Failed to add ${username} as a friend`);
        }
    }
}

async function createGroup(cprovider: ConnectionProvider) {
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

async function acceptInvites(cprovider: ConnectionProvider) {
    const inviteData = await cprovider.getInvites();
    const acceptInvites = await vscode.window.showQuickPick(inviteData.map(String), { canPickMany: true });
    if (!!acceptInvites) {
        for (let friend of acceptInvites){
            await cprovider.acceptFriendInvite(friend);
        }
        vscode.window.showInformationMessage(`Accepted invites`);
    }
}

async function declineInvites(cprovider: ConnectionProvider) {
    const inviteData = await cprovider.getInvites();
    const declineInvites = await vscode.window.showQuickPick(inviteData.map(String), { canPickMany: true });
    if (!!declineInvites) {
        for (let friend of declineInvites){
            await cprovider.declineFriendInvite(friend);
        }
        vscode.window.showInformationMessage(`Declined invites`);
    }
}
