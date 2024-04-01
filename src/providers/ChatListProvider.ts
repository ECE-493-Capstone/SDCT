import * as vscode from 'vscode';
import { IUser } from '../interfaces/IUser';
import { IChat } from '../interfaces/IChat';
import { BackendAPI } from '../backend/BackendAPI'

export class ChatListProvider implements vscode.TreeDataProvider<IChat> {
  private data: IChat[] = [];
  private authenticated: boolean;
  private cprovider: BackendAPI | undefined;
  private searchQuery: string | undefined;
  private _onDidChangeTreeData: vscode.EventEmitter<IChat | undefined | null | void> = new vscode.EventEmitter<IChat | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<IChat | undefined | null | void> = this._onDidChangeTreeData.event;

  async refresh(context: vscode.ExtensionContext): Promise<void> {
    this.authenticated = !!context.globalState.get<IUser>('userAuth');
    this.data = await this.getData();
    this._onDidChangeTreeData.fire();
  }

  constructor(context: vscode.ExtensionContext, cprovider: BackendAPI) {
    this.authenticated = !!context.globalState.get<IUser>('userAuth');
    this.cprovider = cprovider;
  }

  getTreeItem(element: IChat): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element.name);
    if (element.notificationCount > 0) {
      treeItem.label += ` ${this.getNotificationCountSymbol(element.notificationCount)}`;
    }
    if (element.voiceChatActive) {
      treeItem.label += ' 🎤';
    }
    if (element.codeSessionActive) {
      treeItem.label += ' 💻';
    }
    treeItem.iconPath = vscode.Uri.parse(element.pictureUri);
    treeItem.description = element.lastMessage;
    treeItem.command = {
      command: 'sdct.openChatRoom',
      title: 'chatListItemClicked',
      arguments: [element]
    };
    return treeItem;
  }

  getChildren(): IChat[] | Thenable<IChat[]> {
    if (this.authenticated && this.data.length > 0) {
      return this.data.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    } else if (this.authenticated) {
      const emptyChatList: IChat = {
        name: 'No chats available',
        pictureUri: '',
        lastMessage: '',
        lastMessageTime: new Date(),
        notificationCount: 0,
        voiceChatActive: false,
        codeSessionActive: false
      };
      return [emptyChatList];
    }
    return [];
  }

  async getData(): Promise<IChat[]> {
    let data: IChat[] = [];

    if(this.cprovider){
      const friendData = await this.cprovider.getFriendChatList();
      const groupData = await this.cprovider.getGroupChatList();

      data.push(...friendData);
      data.push(...groupData);
      console.log(data);
    }
    return data;
  }

  getNotificationCountSymbol(notificationCount: number): string {
    const symbols = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    if (notificationCount > 0) {
      const notificationCountStr = notificationCount.toString();
      let result = '';
      for (let i = 0; i < notificationCountStr.length; i++) {
        result += symbols[parseInt(notificationCountStr[i])];
      }
      return result;
    } else {
      return '';
    }
  }

  async searchChatList() {
    this.searchQuery = await vscode.window.showInputBox({
      prompt: 'Search for chat',
      placeHolder: this.searchQuery
    });

    const unfilteredData = await this.getData();
    if (!!this.searchQuery) {
      const filteredData = unfilteredData.filter(chat => chat.name.toLowerCase().includes(this.searchQuery ? this.searchQuery.toLowerCase() : ''));
      this.data = filteredData;
      this._onDidChangeTreeData.fire();
    } else {
      this.data = unfilteredData;
      this._onDidChangeTreeData.fire();
    }
  }
}
