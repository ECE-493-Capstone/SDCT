import * as vscode from 'vscode';
import { UserAuth } from './UserAuth';

interface ChatRoom {
  name: string;
  description: string;
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

    this.data = [
        { name: 'Room 1', description: 'Description of Room 1' },
        { name: 'Room 2', description: 'Description of Room 2' },
        { name: 'Room 3', description: 'Description of Room 3' }
    ];
  }

  getTreeItem(element: ChatRoom): vscode.TreeItem {
    return {
        label: element.name,
        tooltip: element.description,
        contextValue: 'chatRoom'
    };
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
