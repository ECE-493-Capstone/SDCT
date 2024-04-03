import * as vscode from 'vscode';
import { BackendAPI } from '../backend/BackendAPI';

export async function manageAccount(api: BackendAPI) {
    const options = ["Add friend", "Create group", "Accept invites", "Decline invites", "Log out"];
    const chosenOption = await vscode.window.showQuickPick(options);
    if (!!chosenOption) {
        if (chosenOption === "Add friend") {
            await addFriend(api);
        } else if (chosenOption === "Create group") {
            await createGroup(api);
        } else if (chosenOption === "Accept invites") {
            await acceptInvites(api);
        } else if (chosenOption === "Decline invites") {
            await declineInvites(api);
        } else if (chosenOption === "Log out") {
            vscode.commands.executeCommand('sdct.logout');
        }
    }
}

async function addFriend(api: BackendAPI) {
    const username = await vscode.window.showInputBox({ prompt: "Enter username" });
    if (!!username) {
        if(await api.addFriend(username)){
            vscode.window.showInformationMessage(`Added ${username} as a friend`);
        } else{
            vscode.window.showErrorMessage(`Failed to add ${username} as a friend`);
        }
    }
}

async function createGroup(api: BackendAPI) {
    const groupName = await vscode.window.showInputBox({ prompt: "Enter group name" });
    if (!!groupName) {
        const groupId = await api.createGroup(groupName);
        if(groupId === undefined){
            vscode.window.showErrorMessage(`Failed to create group with name ${groupName}`);
            return;
        }
        const friendData = await api.getFriends();
        const members = await vscode.window.showQuickPick(friendData.map(function(item){return item.FriendId.toString()}), { canPickMany: true });
        if (!!members) {
            for(let member of members){
                if(!await api.addUserToGroup(groupId, member)){
                    console.log(`Unable to add ${member} to ${groupId}`)
                    return;
                }
            }
            vscode.window.showInformationMessage(`Created group ${groupName}`);
        }
    }
}

async function acceptInvites(api: BackendAPI) {
    const inviteData = await api.getInvites();
    const acceptInvites = await vscode.window.showQuickPick(inviteData.map(String), { canPickMany: true });
    if (!!acceptInvites) {
        for (let friend of acceptInvites){
            await api.acceptFriendInvite(friend);
        }
        vscode.window.showInformationMessage(`Accepted invites`);
    }
}

async function declineInvites(api: BackendAPI) {
    const inviteData = await api.getInvites();
    const declineInvites = await vscode.window.showQuickPick(inviteData.map(String), { canPickMany: true });
    if (!!declineInvites) {
        for (let friend of declineInvites){
            await api.declineFriendInvite(friend);
        }
        vscode.window.showInformationMessage(`Declined invites`);
    }
}
