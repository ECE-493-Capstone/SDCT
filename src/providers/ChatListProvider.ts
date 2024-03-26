import * as vscode from 'vscode';
import { IUser } from '../interfaces/IUser';
import { get } from 'http';
import { IChat } from '../interfaces/IChat';

export class ChatListProvider implements vscode.TreeDataProvider<IChat> {
  private data: IChat[];
  private authenticated: boolean;
  private searchQuery: string | undefined;
  private _onDidChangeTreeData: vscode.EventEmitter<IChat | undefined | null | void> = new vscode.EventEmitter<IChat | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<IChat | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(context: vscode.ExtensionContext): void {
    this.authenticated = !!context.globalState.get<IUser>('userAuth');
    this._onDidChangeTreeData.fire();
  }

  constructor(context: vscode.ExtensionContext) {
    this.authenticated = !!context.globalState.get<IUser>('userAuth');
    this.data = this.getMockData();
  }

  getTreeItem(element: IChat): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element.name);
    if (element.notificationCount > 0) {
      treeItem.label += ` [${element.notificationCount}]`;
    }
    treeItem.iconPath = element.pictureUri;
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

  getMockData(): IChat[] {
    let data: IChat[] = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      data.push({
        name: `Chat ${i}`,
        lastMessage: `Last message ${i}`,
        lastMessageTime: new Date(now.getTime() + i * 60000 * 60 * 24),
        pictureUri: vscode.Uri.parse(`https://picsum.photos/seed/${i+1}/200/200`),
        notificationCount: i,
        isGroup: false
      });
    }
    return data;
  }

  async searchChatList() {
    this.searchQuery = await vscode.window.showInputBox({
      prompt: 'Search for chat',
      placeHolder: this.searchQuery
    });
    if (!!this.searchQuery) {
      const filteredData = this.getMockData().filter(chat => chat.name.toLowerCase().includes(this.searchQuery ? this.searchQuery.toLowerCase() : ''));
      this.data = filteredData;
      this._onDidChangeTreeData.fire();
    } else {
      this.data = this.getMockData();
      this._onDidChangeTreeData.fire();
    }
  }
}
