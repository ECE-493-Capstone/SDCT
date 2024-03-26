// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ChatListProvider } from './providers/ChatListProvider';
import { ProfileProvider } from './providers/ProfileProvider';
import { manageAccount } from './services/ManageAccount';
import { IUser } from './interfaces/IUser';
import { Credentials } from './services/Credentials';
import { ChatRoomPanel } from './panels/ChatRoomPanel';
import { VoiceChatPanel } from './panels/VoiceChatPanel';
import { CodeSessionPanel } from './panels/CodeSessionPanel';
import { IChatRoom } from './interfaces/IChatRoom';
import { chatMenu } from './services/ChatMenu';
import { IChat } from './interfaces/IChat';

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
		const userAuth: IUser = {
			name: userInfo.data.login,
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

	const openChatRoomDisposable = vscode.commands.registerCommand("sdct.openChatRoom", (chat: IChat) => {
		const userAuth = context.globalState.get<IUser>('userAuth');
		const emptyUser: IUser = { name: "", pictureUri: "" };
		const user = userAuth ? userAuth : emptyUser;
		// If group, needs to fetch all members name and pictureUri
		const friend: IUser = { name: chat.name, pictureUri: chat.pictureUri };
		const chatRoom: IChatRoom = {
			user,
			friends: [friend],
			joinedVoiceChat: false, 
			joinedCodeSession: false
		};
		ChatRoomPanel.render(context.extensionUri, chatRoom);
	});

	const openChatRoomMenuDisposable = vscode.commands.registerCommand("sdct.openChatRoomMenu", (chatRoom: IChatRoom) => {
		chatMenu(chatRoom);
	});

	const openVoiceChatDisposable = vscode.commands.registerCommand("sdct.openVoiceChat", (chatRoom: IChatRoom) => {
		VoiceChatPanel.render(context.extensionUri, chatRoom);
	});

	const openCodeSessionDisposable = vscode.commands.registerCommand("sdct.openCodeSession", (chatRoom: IChatRoom) => {
		CodeSessionPanel.render(context.extensionUri, chatRoom);
	});

	context.subscriptions.push(
		loginDisposable,
		logoutDisposable, 
		searchChatDisposable, 
		manageAccountDisposable, 
		openChatRoomDisposable, 
		openChatRoomMenuDisposable, 
		openVoiceChatDisposable,
		openCodeSessionDisposable
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
