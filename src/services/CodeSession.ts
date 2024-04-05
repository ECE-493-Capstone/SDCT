import * as tar from 'tar';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export class CodeSession {
  private storagePath: string | undefined;
  private context = <vscode.ExtensionContext>{};
  constructor(context: vscode.ExtensionContext) {
    this.storagePath = context.globalStorageUri.fsPath;
    this.context = context;
    if(!fs.existsSync(this.storagePath)){
      fs.mkdirSync(this.storagePath);
    }
	}
  
  private async archiveWorkspace(){
		let workspacename = vscode.workspace.name;
		let workspacefolders = vscode.workspace.workspaceFolders?.map(folder => folder.uri.fsPath)
		if(workspacename && workspacefolders){ 

        let parent = path.dirname(workspacefolders[0]);

        if(workspacefolders.length !== 1 || workspacename.toLowerCase().includes("(workspace)")){
          vscode.window.showErrorMessage('Please open a single folder or a folder without "(workspace)" in it');
          return;
        }

        await tar.c(
          {
            gzip: true,
            file: `${this.storagePath}/${workspacename}.tar.gz`,
            cwd: parent,
          },
          workspacefolders.map(folder => {return folder.split(path.sep).slice(-1)[0]})
        )
		} else{
			vscode.window.showErrorMessage('Please open a Folder');
		}
  }
  
  private async extractWorkspace(workspacename: string){
    if(!fs.existsSync(`${this.storagePath}/${workspacename}.tar.gz`)){
      console.log("Unable to find tar for session")
      return;
    }

    return tar.x(
      {
        C: this.storagePath, 
        file:`${this.storagePath}/${workspacename}.tar.gz`
      })
  }

  private async loadWorkspace(workspacename: string){
    if(vscode.workspace.name){
      vscode.window.showErrorMessage('Please Close Existing Workspace');
      return;
    } else {
      await this.extractWorkspace(workspacename)
      console.log(`${this.storagePath}/${workspacename}`)
      // vscode.workspace.updateWorkspaceFolders(1,null,{uri:vscode.Uri.file(`${this.storagePath}/${workspacename}`)})
      await vscode.commands.executeCommand(
        'vscode.openFolder', 
        vscode.Uri.file(`${this.storagePath}/${workspacename}`));
    }
  }


  private startDecorator(){
    let timeout: NodeJS.Timeout | undefined = undefined;

    // create a decorator type that we use to decorate small numbers
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
  
  startSession(){
    this.archiveWorkspace();
    this.startDecorator();
  }

  joinSession(workspace: string){
    this.loadWorkspace(workspace);
    this.startDecorator();
  }
}

