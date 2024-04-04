import { VSCodeButton, } from "@vscode/webview-ui-toolkit/react";
import { useState, useEffect } from "react";
import { vscode } from "../utilities/vscode";
import { IChatRoom } from "../../../src/interfaces/IChatRoom";

function WhiteboardPage({chatRoom}: {chatRoom: IChatRoom}) {

  return (
    <main>
        <h1>Whiteboard</h1>
    </main>
  );
}

export default WhiteboardPage;
