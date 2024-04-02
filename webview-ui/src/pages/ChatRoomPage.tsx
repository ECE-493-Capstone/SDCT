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
  const messageHistoryRef = useRef(props.messageHistory);
  const messageRef = useRef(message);
  const setMessage = (data: string) => {
    messageRef.current = data;
    _setMessage(data);
  };

  useEffect(() => {
    window.addEventListener('message', event => {
      const message = event.data;
      const newMessages: IMessage[] = [];
      switch (message.command) {
        case 'media':
          const medias = message.media;
          // send media
          medias.forEach((media: { path: string; }) => {
            const isVideo = media.path.endsWith('.mp4');
            newMessages.push({
              content: media.path, // change with URL of media in server
              timestamp: new Date(),
              sender: chatRoomRef.current.user,
              type: isVideo ? EMessageType.MediaVideo : EMessageType.Media,
            });
          });
        case 'file':
          const files = message.file;
          // send file
          files.forEach((file: { path: string; }) => {
            newMessages.push({
              content: file.path, // change with URL of file in server
              timestamp: new Date(),
              sender: chatRoomRef.current.user,
              type: EMessageType.File,
            });
          });
        case 'code':
          const language = message.language;
          newMessages.push({
            content: messageRef.current,
            timestamp: new Date(),
            sender: chatRoomRef.current.user,
            type: EMessageType.Code,
            language
          });
          setMessage("");
      };
      newMessages.forEach((newMessage) => {
        props.handleNewMessage(newMessage);
        vscode.postMessage({
          command: 'sendChatMessage',
          message: newMessage,
          roomid: props.chatRoom.groupId ? props.chatRoom.groupId : props.chatRoom.friendId
          });
      });
    });
  }, []);

  useEffect(() => {
    chatRoomRef.current = props.chatRoom;
  }, [props.chatRoom]);
  
  useEffect(() => {
    messageHistoryRef.current = props.messageHistory;
  }, [props.messageHistory]);

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
      {props.messageHistory.map((message, index) => (
        <div key={index} style={{ textAlign: message.sender !== props.chatRoom.user ? 'left' : 'right' }}>
          {message.sender !== props.chatRoom.user ? <img src={message.sender.pictureUri} width="20" /> : null}
          {message.type === EMessageType.Text ? <span>{message.content} </span> : null}
          {message.type === EMessageType.Media ? <img src={message.content} width="150" /> : null}
          {message.type === EMessageType.MediaVideo ? 
            <video width="200" height="150" controls>
              <source src={message.content} type="video/mp4" />
              Your browser does not support the video tag.
            </video> : null}
          {message.type === EMessageType.File ? <a href={message.content} download>{message.content}</a> : null}
          {message.type === EMessageType.Code ?
            <SyntaxHighlighter language={message.language} style={docco}>
              {message.content}
            </SyntaxHighlighter> : null}
          <span>{getTimeFormatted(message.timestamp)}</span>
          {message.sender === props.chatRoom.user ? <img src={message.sender.pictureUri} width="20" /> : null}
        </div>
      ))}
      {}
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
