import * as tar from 'tar';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { CodeSocket } from '../backend/BackendSocket';
import { readFileSync } from 'fs';
import { ChatRoomPanel } from '../panels/ChatRoomPanel';
import { IChatRoom } from '../interfaces/IChatRoom';
import { IUser } from '../interfaces/IUser'

export class CodeSession {
  private storagePath: string | undefined;
  public static filepath: string | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.storagePath = context.globalStorageUri.fsPath;
    if(!fs.existsSync(this.storagePath)){
      fs.mkdirSync(this.storagePath);
    }
	}
  
  private async archiveWorkspace(): Promise<string | undefined>{
		let workspacename = vscode.workspace.name;
		let workspacefolders = vscode.workspace.workspaceFolders?.map(folder => folder.uri.fsPath)
		if(workspacename && workspacefolders){ 
        
        let parent = path.dirname(workspacefolders[0]);

        if(workspacefolders.length !== 1 || workspacename.toLowerCase().includes("(workspace)")){
          vscode.window.showErrorMessage('Please open a single folder or a folder without "(workspace)" in it');
          return;
        }
        console.log(parent, `${this.storagePath}/${workspacename}.tar.gz`);
        await tar.c(
          {
            gzip: true,
            file: `${this.storagePath}/${workspacename}.tar.gz`,
            cwd: parent,
          },
          workspacefolders.map(folder => {return folder.split(path.sep).slice(-1)[0]})
        )

        CodeSession.filepath = `${this.storagePath}/${workspacename}.tar.gz`;
		} else{
			vscode.window.showErrorMessage('Please open a Folder');
		}

    return undefined;
  }
  
  private async extractWorkspace(){
    if(CodeSession.filepath){
      if(!fs.existsSync(CodeSession.filepath)){
        console.log("Unable to find tar for session")
        return;
      }

      return tar.x(
        {
          C: this.storagePath, 
          file: CodeSession.filepath
        })
    }
  }

  private async loadWorkspace(): Promise<boolean>{
    if(vscode.workspace.name){
      vscode.window.showErrorMessage('Please Close Existing Workspace');
      return false;
    } else {
      if(CodeSession.filepath){
        await this.extractWorkspace()
        // vscode.workspace.updateWorkspaceFolders(1,null,{uri:vscode.Uri.file(`${this.storagePath}/${workspacename}`)})
      }

    }

    return true;
  }

  async startSession(chatRoom: IChatRoom): Promise<boolean>{
    await this.archiveWorkspace();
		if(CodeSession.filepath === undefined){
			console.log("No file");
			return false;
		}
		let _file = readFileSync(CodeSession.filepath);
		return new Promise((resolve, reject) => {
      CodeSocket.socketEmit("start code session", ChatRoomPanel.getChatRoomId(chatRoom), 
													{name: vscode.workspace.name, data: _file}, (response: any) => {
			  console.log(response);
        if(response === "CodeSession Exists"){
          vscode.window.showErrorMessage("CodeSession exists for this room");
          CodeSession.endCodeSession();
        } else if (response === "Started"){
          resolve(true);
        } else{
          vscode.window.showErrorMessage("Backend Error");
        }
        resolve(false);
		  })
    });
    //this.startDecorator();
  }

  getSessionFile(){
    if(CodeSession.filepath){
      return CodeSession.filepath
    }
  }

  public static endCodeSession(){
    if(CodeSession.filepath){
      fs.unlink(CodeSession.filepath, (err: any) => {
            if (err) throw err //handle your error the way you want to;
            console.log('path/file.txt was deleted');//or else the file will be deleted
          });
      fs.unlink(CodeSession.filepath.replace(".tar.gz", ""), (err: any) => {
        if (err) throw err //handle your error the way you want to;
        console.log('path/file.txt was deleted');//or else the file will be deleted
      });
      CodeSocket.endCodeSession();
    }
  }

  async joinSession(context: vscode.ExtensionContext, chatRoom: IChatRoom): Promise<boolean>{
		CodeSocket.socketEmit("join code session", ChatRoomPanel.getChatRoomId(chatRoom), async (response: any, file: any) => {
        console.log(response);
        if(response === "CodeSession DNE"){
          vscode.window.showErrorMessage("No Codesession for this room");
          CodeSession.endCodeSession();
        } else if (response === "joined"){
          CodeSession.filepath = `${this.storagePath}/${file.name}.tar.gz`
          fs.writeFileSync(CodeSession.filepath, file.data, {encoding: null});
          if(await this.loadWorkspace()){
            context.globalState.update('codeRoom', chatRoom)
            await vscode.commands.executeCommand(
              'vscode.openFolder', 
              vscode.Uri.file(CodeSession.filepath.replace(".tar.gz", "")),{forceReuseWindow: true});
            return true;
          } else{
            CodeSession.endCodeSession();
          }
          return false;
        } else{
          vscode.window.showErrorMessage("Backend Error");
        }
      });
      return false;
      //this.startDecorator();
  }
}

export class CodeHelper{
  private static decorationType = vscode.window.createTextEditorDecorationType({
    borderWidth: '1px',
    borderStyle: 'solid',
    overviewRulerColor: 'blue',
    overviewRulerLane: vscode.OverviewRulerLane.Full,
  });
  private static activeEditor = vscode.window.activeTextEditor;
  private context: vscode.ExtensionContext;
  private static selections: Map<string, vscode.Range> = new Map();
  private static _disposables: vscode.Disposable[] = [];
  private static socketChanges: vscode.TextDocumentContentChangeEvent[] = [];
  private static readOnly: boolean = false;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  start(roomid: string){
    CodeHelper._disposables.push(vscode.window.onDidChangeActiveTextEditor(async editor => {
      CodeHelper.activeEditor = editor;
      if (editor) {
        CodeHelper.updateDecorations();
        if(CodeHelper.readOnly){
          await vscode.commands.executeCommand('workbench.action.files.setActiveEditorReadonlyInSession')
        } else{
          await vscode.commands.executeCommand('workbench.action.files.setActiveEditorWriteableInSession')
        }
      }
    }, null, this.context.subscriptions));
  
    CodeHelper._disposables.push(vscode.workspace.onDidChangeTextDocument(async event => {
        if (CodeHelper.activeEditor && event.document === CodeHelper.activeEditor.document) {
          if(CodeHelper.readOnly){
            await vscode.commands.executeCommand('workbench.action.files.setActiveEditorReadonlyInSession')
          } else{
            await vscode.commands.executeCommand('workbench.action.files.setActiveEditorWriteableInSession')
          }
          CodeHelper.selections.clear();
          CodeHelper.updateDecorations();
        }
      }, null, this.context.subscriptions));

    CodeHelper._disposables.push(vscode.window.onDidChangeTextEditorSelection(event => {
      if(CodeHelper.activeEditor === event.textEditor){
        CodeSocket.socketEmit("send selection change", roomid, event.selections[0].start, 
          event.selections[0].end, this.context.globalState.get<IUser>('userAuth')?.name);
      }
    }, null, this.context.subscriptions));
  
    CodeHelper._disposables.push(vscode.workspace.onDidChangeTextDocument(event => {
      if(CodeHelper.activeEditor?.document === event.document){

        for(let change of event.contentChanges){
          for(var i = 0; i < CodeHelper.socketChanges.length; i++){
            const item = CodeHelper.socketChanges[i];

            if(item.range.isEqual(change.range) && item.text === change.text){
              CodeHelper.socketChanges.splice(i,1);
              return;
            }
          }
          if(!CodeHelper.readOnly){
            CodeSocket.socketEmit("send file change", roomid, JSON.stringify(change));
          }
        }

      }
    }, null, this.context.subscriptions));
  }

  public static endHelper(){
    while (CodeHelper._disposables.length) {
      const disposable = CodeHelper._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  public static updateDecorations() {
    if (!this.activeEditor) {
      return;
    }
    this.activeEditor.setDecorations(CodeHelper.decorationType, 
      Array.from(CodeHelper.selections, ([hoverMessage, range]) => ({ hoverMessage, range })));
  }

  public static updateSelections(start: vscode.Position, end: vscode.Position, user: string){
    CodeHelper.selections.set(user, new vscode.Range(start, end));
    CodeHelper.updateDecorations();
  }

  public static async updateFile(change: vscode.TextDocumentContentChangeEvent){
    if (!this.activeEditor) {
      return;
    }
    if(CodeHelper.readOnly){
      await vscode.commands.executeCommand('workbench.action.files.setActiveEditorWriteableInSession')
      this.activeEditor.edit(editBuilder => {
          editBuilder.replace(change.range, change.text);
          CodeHelper.socketChanges.push(change);
      
      });
      await vscode.commands.executeCommand('workbench.action.files.setActiveEditorReadonlyInSession')
    } else{
      this.activeEditor.edit(editBuilder => {
        editBuilder.replace(change.range, change.text);
        CodeHelper.socketChanges.push(change);
    
      });
    }
  }

  public static async updateReadOnly(readOnly: boolean){
    CodeHelper.readOnly = readOnly;
    if(CodeHelper.readOnly){
      await vscode.commands.executeCommand('workbench.action.files.setActiveEditorReadonlyInSession')
    } else{
      await vscode.commands.executeCommand('workbench.action.files.setActiveEditorWriteableInSession')
    }
  }
}

