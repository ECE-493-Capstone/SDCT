import * as vscode from 'vscode';

interface ChatRoom {
  name: string;
  description: string;
}

export class DashboardProvider implements vscode.TreeDataProvider<ChatRoom> {
  private data: ChatRoom[];

  constructor() {
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
    return this.data;
  }
}
