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

  getMockData(): IChat[] {
    let data: IChat[] = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const groupId = Math.random() > 0.75 ? `Group ${i}` : undefined;
      data.push({
        name: groupId ? groupId : `Friend ${i}`,
        lastMessage: `Last message ${i}`,
        lastMessageTime: new Date(now.getTime() + i * 60000 * 60 * 24),
        pictureUri: `https://picsum.photos/seed/${i+1}/200/200`,
        notificationCount: i,
        voiceChatActive: Math.random() > 0.75,
        codeSessionActive: Math.random() > 0.75,
        groupId,
      });
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
