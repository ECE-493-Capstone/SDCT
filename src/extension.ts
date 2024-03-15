// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ChatListProvider } from './ChatListProvider';
import { ProfileProvider } from './ProfileProvider';
import { manageAccount } from './ManageAccount';
import { UserAuth } from './UserAuth';
import { log } from 'console';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "SDCT" is now active!');

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
	let loginDisposable = vscode.commands.registerCommand('sdct.login', () => {
		// The code you place here will be executed every time your command is executed
		const userAuth: UserAuth = {
			username: 'user01',
			pictureUri: 'https://picsum.photos/seed/10/200/200'
		};
		context.globalState.update('userAuth', userAuth);
		chatListProvider.refresh(context);
		profileProvider.refresh(context);
	});

	let logoutDisposable = vscode.commands.registerCommand('sdct.logout', () => {
		context.globalState.update('userAuth', undefined);
		chatListProvider.refresh(context);
		profileProvider.refresh(context);
	});

	let searchChatDisposable = vscode.commands.registerCommand('sdct.searchChat', () => {
		chatListProvider.searchChatList();
	});

	let manageAccountDisposable = vscode.commands.registerCommand('sdct.manageAccount', () => {
		manageAccount();
	});

	context.subscriptions.push(loginDisposable,logoutDisposable, searchChatDisposable, manageAccountDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
