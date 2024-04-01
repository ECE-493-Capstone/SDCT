import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useState, useEffect } from "react";
import { vscode } from "../utilities/vscode";
import { IChatRoom } from "../../../src/interfaces/IChatRoom";
import { IMessage } from "../../../src/interfaces/IMessage";

function ChatRoomPage(props: {chatRoom: IChatRoom, messageHistory: IMessage[], handleNewMessage: (message: IMessage) => void}) {
  const [message, setMessage] = useState("");

  const handleOpenMenu = (chatRoom: IChatRoom) => {
    vscode.postMessage({
      command: 'openChatRoomMenu',
      chatRoom,
    });
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newMessage = {text: message, timestamp: new Date(), sender: props.chatRoom.user}

    props.handleNewMessage(newMessage);
    vscode.postMessage({
      command: 'sendChatMessage',
      message: newMessage,
      roomid: props.chatRoom.groupId ? props.chatRoom.groupId : props.chatRoom.friendId
      });
    setMessage("");
  };

  const getTimeFormatted = (date: Date) => {
    let hours = date.getHours();
    let minutes: number | string = date.getMinutes();
    let ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 ? hours % 12 : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  }; 
  
  return (
    <main>
      {props.messageHistory.map((message, index) => (
        <div key={index} style={{ textAlign: message.sender !== props.chatRoom.user ? 'left' : 'right' }}>
          {message.sender !== props.chatRoom.user ? <img src={message.sender.pictureUri} width="20" /> : null}
          <span>{message.text} </span>
          <span>{getTimeFormatted(message.timestamp)}</span>
          {message.sender === props.chatRoom.user ? <img src={message.sender.pictureUri} width="20" /> : null}
        </div>
      ))}
      {}
      <VSCodeButton appearance="secondary" onClick={() => handleOpenMenu(props.chatRoom)}>+</VSCodeButton>
      <form onSubmit={handleSendMessage}>
        <VSCodeTextField value={message} onInput={e => {
          const target = e.target as HTMLInputElement;
          setMessage(target.value);
        }}/>
        <VSCodeButton type="submit">Send</VSCodeButton>
      </form>
    </main>
  );
}

export default ChatRoomPage;
