import { VSCodeButton, } from "@vscode/webview-ui-toolkit/react";
import { useState, useEffect } from "react";
import { vscode } from "../utilities/vscode";
import { IChatRoom } from "../../../src/interfaces/IChatRoom";

function CodeSessionPage({chatRoom}: {chatRoom: IChatRoom}) {
  const handleWhiteboard = () => {
    
  };

  const handleReadOnly= () => {
    
  };

  const handleEndSession = () => {
    vscode.postMessage({command: 'endCodeSession'});
  };

  return (
    <main>
      <img src={chatRoom?.user.pictureUri} width="100" />
      {chatRoom?.friends.map(friend => (
        <img key={friend.name} src={friend.pictureUri} width="100" />
      ))}
      <br/>
      <VSCodeButton appearance="secondary" onClick={handleWhiteboard}>Whiteboard</VSCodeButton>
      <VSCodeButton appearance="secondary" onClick={handleReadOnly}>Read-only</VSCodeButton>
      <VSCodeButton appearance="primary" onClick={handleEndSession}>End Session</VSCodeButton>
    </main>
  );
}

export default CodeSessionPage;
