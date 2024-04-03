import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useState, useEffect, useRef } from "react";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { vscode } from "../utilities/vscode";
import { IChatRoom } from "../../../src/interfaces/IChatRoom";
import { IMessage } from "../../../src/interfaces/IMessage";
import { EMessageType } from "../../../src/enums/EMessageType";

function ChatRoomPage(props: {chatRoom: IChatRoom, messageHistory: IMessage[], handleNewMessage: (message: IMessage) => void}) {
  const [message, _setMessage] = useState("");
  const chatRoomRef = useRef(props.chatRoom);
  const messageRef = useRef(message);
  const setMessage = (data: string) => {
    messageRef.current = data;
    _setMessage(data);
  };

  useEffect(() => {
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.command) {
        case 'media':
          const media = message.media[0];
          // send media
          const isVideo = media.path.endsWith('.mp4');
          const mediaMessage = {
            content: media.path, // change with URL of media in server
            timestamp: new Date(),
            sender: chatRoomRef.current.user,
            type: isVideo ? EMessageType.MediaVideo : EMessageType.Media,
          };
          props.handleNewMessage(mediaMessage);
          vscode.postMessage({
            command: 'sendChatMessage',
            message: mediaMessage,
            roomid: chatRoomRef.current.groupId ? chatRoomRef.current.groupId : chatRoomRef.current.friendId
          });
        case 'file':
          const file = message.file[0];
          // send file
          const fileMessage = {
            content: file.path, // change with URL of file in server
            timestamp: new Date(),
            sender: chatRoomRef.current.user,
            type: EMessageType.File
          };
          props.handleNewMessage(fileMessage);
          vscode.postMessage({
            command: 'sendChatMessage',
            message: fileMessage,
            roomid: chatRoomRef.current.groupId ? chatRoomRef.current.groupId : chatRoomRef.current.friendId
          });
        case 'code':
          const language = message.language;
          const codeMessage = {
            content: messageRef.current,
            timestamp: new Date(),
            sender: chatRoomRef.current.user,
            type: EMessageType.Code,
            language
          };
          props.handleNewMessage(codeMessage);
          vscode.postMessage({
            command: 'sendChatMessage',
            message: codeMessage,
            roomid: chatRoomRef.current.groupId ? chatRoomRef.current.groupId : chatRoomRef.current.friendId
          });
          setMessage("");
      };
    });
  }, []);

  useEffect(() => {
    chatRoomRef.current = props.chatRoom;
  }, [props.chatRoom]);

  const handleOpenMenu = () => {
    vscode.postMessage({
      command: 'openChatRoomMenu',
      chatRoom: props.chatRoom,
    });
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newMessage = {
      content: message, 
      timestamp: new Date(), 
      sender: props.chatRoom.user,
      type: EMessageType.Text
    };

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
      <div className="chatContent">
        {props.messageHistory.map((message, index) => (
          <div key={index} style={{ textAlign: message.sender !== props.chatRoom.user ? 'left' : 'right' }}>
            {message.sender !== props.chatRoom.user && !!message.content ? <img src={message.sender.pictureUri} width="20" /> : null}
            {message.type === EMessageType.Text ? <span>{message.content} </span> : null}
            {message.type === EMessageType.Media ? <img src={message.content} width="150" /> : null}
            {message.type === EMessageType.MediaVideo ? 
              <video width="200" height="150" controls>
                <source src={message.content} type="video/mp4" />
                Your browser does not support the video tag.
              </video> : null}
            {message.type === EMessageType.File ? <a href={message.content} download>{message.content}</a> : null}
            {message.type === EMessageType.Code && !!message.content ?
              <SyntaxHighlighter language={message.language} style={docco}>
                {message.content}
              </SyntaxHighlighter> : null}
            {!!message.content && <span>{getTimeFormatted(message.timestamp)}</span>}
            {message.sender === props.chatRoom.user && !!message.content ? <img src={message.sender.pictureUri} width="20" /> : null}
          </div>
        ))}
      </div>
      <VSCodeButton className="menuButton" appearance="secondary" onClick={handleOpenMenu}>+</VSCodeButton>
      <form className="chatForm" onSubmit={handleSendMessage}>
        <VSCodeTextField className="chatInput" value={message} onInput={e => {
          const target = e.target as HTMLInputElement;
          setMessage(target.value);
        }}/>
        <VSCodeButton type="submit">Send</VSCodeButton>
      </form>
    </main>
  );
}

export default ChatRoomPage;
