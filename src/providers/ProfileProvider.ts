import * as vscode from 'vscode';
import { IUserAuth } from '../interfaces/IUserAuth';
import { IProfile } from '../interfaces/IProfile';

export class ProfileProvider implements vscode.TreeDataProvider<IProfile> {
  private userAuth: IUserAuth | undefined;
  private _onDidChangeTreeData: vscode.EventEmitter<IProfile | undefined | null | void> = new vscode.EventEmitter<IProfile | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<IProfile | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(context: vscode.ExtensionContext): void {
    this.userAuth = context.globalState.get<IUserAuth>('userAuth');
    this._onDidChangeTreeData.fire();
  }

  constructor(context: vscode.ExtensionContext) {
    this.userAuth = context.globalState.get<IUserAuth>('userAuth');
  }

  getTreeItem(element: IProfile): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element.name);
    treeItem.iconPath = element.pictureUri;
    return treeItem;
}

  getChildren(): IProfile[] | Thenable<IProfile[]> {
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
