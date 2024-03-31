import * as vscode from 'vscode';
import { IUser } from '../interfaces/IUser';
import { IChat } from '../interfaces/IChat';
import { ConnectionProvider } from './ConnectionProvider'

export class ChatListProvider implements vscode.TreeDataProvider<IChat> {
  private data: IChat[] = [];
  private authenticated: boolean;
  private cprovider: ConnectionProvider | undefined;
  private searchQuery: string | undefined;
  private _onDidChangeTreeData: vscode.EventEmitter<IChat | undefined | null | void> = new vscode.EventEmitter<IChat | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<IChat | undefined | null | void> = this._onDidChangeTreeData.event;

  async refresh(context: vscode.ExtensionContext): Promise<void> {
    this.authenticated = !!context.globalState.get<IUser>('userAuth');
    this.data = await this.getData();
    this._onDidChangeTreeData.fire();
  }

  constructor(context: vscode.ExtensionContext, cprovider: ConnectionProvider) {
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
    if (this.authenticated) {
      return this.data.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    }
    return [];
  }

  async getData(): Promise<IChat[]> {
    let data: IChat[] = [];
    const now = new Date();
    console.log("Here1")
    if(this.cprovider){
      const data2 = await this.cprovider.getChatFriends();
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
      this.data = filteredData
      this._onDidChangeTreeData.fire();
    } else {
      this.data = unfilteredData;
      this._onDidChangeTreeData.fire();
    }
  }
}
