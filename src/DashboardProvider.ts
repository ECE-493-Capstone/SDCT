import * as vscode from 'vscode';
import { UserAuth } from './UserAuth';

interface ChatRoom {
  name: string;
  lastMessage: string;
  pictureUri: vscode.Uri;
  notificationCount: number;
}

export class DashboardProvider implements vscode.TreeDataProvider<ChatRoom> {
  private data: ChatRoom[];
  private authenticated: boolean;
  private _onDidChangeTreeData: vscode.EventEmitter<ChatRoom | undefined | null | void> = new vscode.EventEmitter<ChatRoom | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ChatRoom | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(context: vscode.ExtensionContext): void {
    this.authenticated = this.isAuthenticated(context);
    this._onDidChangeTreeData.fire();
  }

  constructor(context: vscode.ExtensionContext) {
    this.authenticated = this.isAuthenticated(context);

    let data: ChatRoom[] = [];
    for (let i = 0; i < 5; i++) {
      data.push({
        name: `Chat Room ${i}`,
        lastMessage: `Last message ${i}`,
        pictureUri: vscode.Uri.parse(`https://picsum.photos/seed/${i}/200/200`),
        notificationCount: i
      });
    }
    this.data = data;
  }

  getTreeItem(element: ChatRoom): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element.name);
    if (element.notificationCount > 0) {
      treeItem.label += ` [${element.notificationCount}]`;
    }
    treeItem.iconPath = element.pictureUri;
    treeItem.description = element.lastMessage;
    return treeItem;
}

  getChildren(): ChatRoom[] | Thenable<ChatRoom[]> {
    if (this.authenticated) {
        return this.data;
    }
    return [];
  }

  private isAuthenticated(context: vscode.ExtensionContext): boolean {
    const userAuth = context.globalState.get<UserAuth>('userAuth');
    return userAuth !== undefined;
  }
}
