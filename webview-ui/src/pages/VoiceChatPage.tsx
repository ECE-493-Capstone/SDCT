import { VSCodeButton, } from "@vscode/webview-ui-toolkit/react";
import { useState, useEffect } from "react";
import { vscode } from "../utilities/vscode";
import { IChatRoom } from "../../../src/interfaces/IChatRoom";

function VoiceChatPage({chatRoom}: {chatRoom: IChatRoom}) {
  const handleMute = () => {
    
  };

  const handleEndCall = () => {
    
  };

  return (
    <main>
      <img src={chatRoom?.user.pictureUri} width="100" />
      {chatRoom?.friends.map(friend => (
        <img key={friend.name} src={friend.pictureUri} width="100" />
      ))}
      <br/>
      <VSCodeButton appearance="secondary" onClick={handleMute}>Mute</VSCodeButton>
      <VSCodeButton appearance="primary" onClick={handleEndCall}>End Call</VSCodeButton>
    </main>
  );
}

export default VoiceChatPage;
