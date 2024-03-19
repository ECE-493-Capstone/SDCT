// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ChatListProvider } from './ChatListProvider';
import { ProfileProvider } from './ProfileProvider';
import { manageAccount } from './ManageAccount';
import { UserAuth } from './UserAuth';
import { Credentials } from './credentials';
import { ChatRoomPanel } from './panels/ChatRoomPanel';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "SDCT" is now active!');
	context.globalState.update('userAuth', undefined);

	const credentials = new Credentials();
	await credentials.initialize(context);

	const chatListProvider = new ChatListProvider(context);
	vscode.window.createTreeView('chatList', {
		treeDataProvider: chatListProvider
	});
	const profileProvider = new ProfileProvider(context);
	vscode.window.createTreeView('profile', {
		treeDataProvider: profileProvider
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const loginDisposable = vscode.commands.registerCommand('sdct.login', async () => {
		// The code you place here will be executed every time your command is executed
		const octokit = await credentials.setOctokit();
		const userInfo = await octokit.users.getAuthenticated();
		const userAuth: UserAuth = {
			username: userInfo.data.login,
			pictureUri: userInfo.data.avatar_url
		};
		context.globalState.update('userAuth', userAuth);
		chatListProvider.refresh(context);
		profileProvider.refresh(context);
	});

	const logoutDisposable = vscode.commands.registerCommand('sdct.logout', () => {
		context.globalState.update('userAuth', undefined);
		chatListProvider.refresh(context);
		profileProvider.refresh(context);
	});

	const searchChatDisposable = vscode.commands.registerCommand('sdct.searchChat', () => {
		chatListProvider.searchChatList();
	});

	const manageAccountDisposable = vscode.commands.registerCommand('sdct.manageAccount', () => {
		manageAccount();
	});

	const openChatRoomDisposable = vscode.commands.registerCommand("sdct.openChatRoom", () => {
		ChatRoomPanel.render(context.extensionUri);
	});

	context.subscriptions.push(loginDisposable,logoutDisposable, searchChatDisposable, manageAccountDisposable, openChatRoomDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
