import { VSCodeButton, } from "@vscode/webview-ui-toolkit/react";
import { useState, useEffect } from "react";
import { vscode } from "../utilities/vscode";
import { IChatRoom } from "../../../src/interfaces/IChatRoom";

function CodeSessionPage({chatRoom}: {chatRoom: IChatRoom}) {
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isHost, setIsHost] = useState(false); // fetch value from server

  const handleWhiteboard = () => {
    
  };

  const handleReadOnly= () => {
    setIsReadOnly(!isReadOnly);
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
      <span>{chatRoom?.user.name + "\t"}</span>
      {chatRoom?.friends.map(friend => (
        <span key={friend.name}>{friend.name + "\t"}</span>
      ))}
      <br/>
      <VSCodeButton appearance="secondary" onClick={handleWhiteboard}>Whiteboard</VSCodeButton>
      {isHost && <VSCodeButton appearance={isReadOnly ? "primary" : "secondary"} onClick={handleReadOnly}>{isReadOnly ? "Read-only" : "Edit-mode"}</VSCodeButton>}
      <VSCodeButton appearance="primary" onClick={handleEndSession}>End Session</VSCodeButton>
    </main>
  );
}

export default CodeSessionPage;
