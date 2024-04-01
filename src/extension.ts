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
import { BackendAPI } from './backend/BackendAPI';
import { BackendSocket } from './backend/BackendSocket'
import { IMessage } from './interfaces/IMessage';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "SDCT" is now active!');
	context.globalState.update('userAuth', undefined);

	const credentials = new Credentials();
	await credentials.initialize(context);
	
	const backendAPI = new BackendAPI("http://[2605:fd00:4:1000:f816:3eff:fe7d:baf9]", 8000);
	const backendSocket = new BackendSocket("http://[2605:fd00:4:1000:f816:3eff:fe7d:baf9]", 3000);

	const chatListProvider = new ChatListProvider(context, backendAPI);
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
		backendSocket.startSocketIO(userInfo.data.login);
		backendAPI.login(userAuth).then(async (success) =>{
			if(success){
				context.globalState.update('userAuth', userAuth);
				await chatListProvider.refresh(context);
				profileProvider.refresh(context);
				console.log("Login Success");
			}else{
				console.log("Login Failure");
			}

		}).catch(err => {
			console.log("Login Error", err);
		})
	});

	const logoutDisposable = vscode.commands.registerCommand('sdct.logout', async () => {
		context.globalState.update('userAuth', undefined);
		await chatListProvider.refresh(context);
		profileProvider.refresh(context);
	});

	const searchChatDisposable = vscode.commands.registerCommand('sdct.searchChat', () => {
		chatListProvider.searchChatList();
	});

	const manageAccountDisposable = vscode.commands.registerCommand('sdct.manageAccount', () => {
		manageAccount(backendAPI);
	});

	const openChatRoomDisposable = vscode.commands.registerCommand("sdct.openChatRoom", (chat: IChat) => {
		const userAuth = context.globalState.get<IUser>('userAuth');
		const emptyUser: IUser = { name: "", pictureUri: "" };
		const user = userAuth ? userAuth : emptyUser;
		const friends: IUser[] = [];
		if (chat.groupId) {
			for (let i = 0; i < 3; i++) { // MOCK DATA
				const friend: IUser = { name: `Member ${i}`, pictureUri: `https://picsum.photos/seed/${i+1}/200/200` };
				friends.push(friend);
			}
		} else {
			const friend: IUser = { name: chat.name, pictureUri: chat.pictureUri };
			friends.push(friend);
		}
		const chatRoom: IChatRoom = {
			user,
			friends,
			joinedVoiceChat: false, 
			joinedCodeSession: false,
			friendId: chat.friendId,
			groupId: chat.groupId
		};
		const socketChatRoom = chat.groupId ? chat.groupId : chat.friendId;
		backendSocket.getSocket().emit("join chat", socketChatRoom);
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

	const sendChatMessage = vscode.commands.registerCommand("sdct.sendChatMessage", (roomId: string, message: IMessage) => {
		backendSocket.getSocket().emit("send chat message", roomId, message);
	});

	const mockLogin = vscode.commands.registerCommand("sdct.mockLogin", () => {
		const userAuth: IUser = {
			name: "MOCKUSER",
			pictureUri: "adada"
		};
		backendSocket.startSocketIO("MOCKUSER");
		backendAPI.login(userAuth).then(async (success) => {
			if(success){
				context.globalState.update('userAuth', userAuth);
				await chatListProvider.refresh(context);
				profileProvider.refresh(context);
				console.log("Login Success");
			}else{
				console.log("Login Failure");
			}

		}).catch(err => {
			console.log("Login Error", err);
		})
	});

	context.subscriptions.push(
		mockLogin,
		loginDisposable,
		logoutDisposable, 
		searchChatDisposable, 
		manageAccountDisposable, 
		openChatRoomDisposable, 
		openChatRoomMenuDisposable, 
		openVoiceChatDisposable,
		openCodeSessionDisposable,
		sendChatMessage
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
