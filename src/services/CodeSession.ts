import * as tar from 'tar';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { CodeSocket } from '../backend/BackendSocket';
import { readFileSync } from 'fs';
import { ChatRoomPanel } from '../panels/ChatRoomPanel';
import { IChatRoom } from '../interfaces/IChatRoom';

export class CodeSession {
  private storagePath: string | undefined;
  private context = <vscode.ExtensionContext>{};
  public static filepath: string | undefined;


  constructor(context: vscode.ExtensionContext) {
    this.storagePath = context.globalStorageUri.fsPath;
    this.context = context;
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


  private startDecorator(){
    let timeout: NodeJS.Timeout | undefined = undefined;

    // create a decorator type for cursor
    const test = vscode.window.createTextEditorDecorationType({
      borderWidth: '1px',
      borderStyle: 'solid',
      overviewRulerColor: 'blue',
      overviewRulerLane: vscode.OverviewRulerLane.Right,
    });
  
    let activeEditor = vscode.window.activeTextEditor;
  
    function updateDecorations() {
      if (!activeEditor) {
        return;
      }
      [{ range: new vscode.Range(activeEditor.document.positionAt(10), activeEditor.document.positionAt(10)), hoverMessage: 'User1' }]
      activeEditor.setDecorations(test,[{ range: new vscode.Range(activeEditor.document.positionAt(10), activeEditor.document.positionAt(10)), hoverMessage: 'User1' }])
    }
  
    function triggerUpdateDecorations(throttle = false) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
      }
      if (throttle) {
        timeout = setTimeout(updateDecorations, 500);
      } else {
        updateDecorations();
      }
    }
  
    if (activeEditor) {
      triggerUpdateDecorations();
    }
  
    vscode.window.onDidChangeActiveTextEditor(editor => {
      activeEditor = editor;
      if (editor) {
        triggerUpdateDecorations();
      }
    }, null, this.context.subscriptions);
  
    vscode.workspace.onDidChangeTextDocument(event => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations(true);
      }
    }, null, this.context.subscriptions);
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
            context.globalState.update('codeSession', true);
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

