import * as vscode from 'vscode';
import { UserAuth } from './UserAuth';

interface Profile {
  name: string;
  pictureUri: vscode.Uri;
}

export class ProfileProvider implements vscode.TreeDataProvider<Profile> {
  private userAuth: UserAuth | undefined;
  private _onDidChangeTreeData: vscode.EventEmitter<Profile | undefined | null | void> = new vscode.EventEmitter<Profile | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<Profile | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(context: vscode.ExtensionContext): void {
    this.userAuth = context.globalState.get<UserAuth>('userAuth');
    this._onDidChangeTreeData.fire();
  }

  constructor(context: vscode.ExtensionContext) {
    this.userAuth = context.globalState.get<UserAuth>('userAuth');
  }

  getTreeItem(element: Profile): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element.name);
    treeItem.iconPath = element.pictureUri;
    return treeItem;
}

  getChildren(): Profile[] | Thenable<Profile[]> {
    let data = [];
    if (!!this.userAuth) {
      data.push({
        name: this.userAuth.username,
        pictureUri: vscode.Uri.parse(this.userAuth.pictureUri ? this.userAuth.pictureUri : 'https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg')
      });
    }
    return data;
  }
}
