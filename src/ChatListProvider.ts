import * as vscode from 'vscode';
import { UserAuth } from './UserAuth';

interface Chat {
  name: string;
  lastMessage: string;
  pictureUri: vscode.Uri;
  notificationCount: number;
}

export class ChatListProvider implements vscode.TreeDataProvider<Chat> {
  private data: Chat[];
  private authenticated: boolean;
  private _onDidChangeTreeData: vscode.EventEmitter<Chat | undefined | null | void> = new vscode.EventEmitter<Chat | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<Chat | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(context: vscode.ExtensionContext): void {
    this.authenticated = !!context.globalState.get<UserAuth>('userAuth');
    this._onDidChangeTreeData.fire();
  }

  constructor(context: vscode.ExtensionContext) {
    this.authenticated = !!context.globalState.get<UserAuth>('userAuth');

    let data: Chat[] = [];
    for (let i = 0; i < 5; i++) {
      data.push({
        name: `Chat ${i}`,
        lastMessage: `Last message ${i}`,
        pictureUri: vscode.Uri.parse(`https://picsum.photos/seed/${i+1}/200/200`),
        notificationCount: i
      });
    }
    this.data = data;
  }

  getTreeItem(element: Chat): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element.name);
    if (element.notificationCount > 0) {
      treeItem.label += ` [${element.notificationCount}]`;
    }
    treeItem.iconPath = element.pictureUri;
    treeItem.description = element.lastMessage;
    return treeItem;
}

  getChildren(): Chat[] | Thenable<Chat[]> {
    if (this.authenticated) {
        return this.data;
    }
    return [];
  }
}
