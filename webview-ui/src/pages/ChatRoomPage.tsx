import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useState, useEffect, useRef } from "react";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { vscode } from "../utilities/vscode";
import { IChatRoom } from "../../../src/interfaces/IChatRoom";
import { IMessage } from "../../../src/interfaces/IMessage";
import { EMessageType } from "../../../src/enums/EMessageType";

function ChatRoomPage({chatRoom}: {chatRoom: IChatRoom}) {
  const [message, _setMessage] = useState("");
  const [messageHistory, _setMessageHistory] = useState<IMessage[]>([]);
  const messageHistoryRef = useRef(messageHistory);
  const setMessageHistory = (data: IMessage[]) => {
    messageHistoryRef.current = data;
    _setMessageHistory(data);
  };
  const chatRoomRef = useRef(chatRoom);
  const messageRef = useRef(message);
  const setMessage = (data: string) => {
    messageRef.current = data;
    _setMessage(data);
  };

  useEffect(() => {
    window.addEventListener('message', event => {
      const message = event.data;
      const newMessageHistory = [...messageHistoryRef.current];
      switch (message.command) {
        case 'media':
          const medias = message.media;
          // send media
          medias.forEach((media: { path: string; }) => {
            const isVideo = media.path.endsWith('.mp4');
            newMessageHistory.push({
              content: media.path, // change with URL of media in server
              timestamp: new Date(),
              sender: chatRoomRef.current.user,
              type: isVideo ? EMessageType.MediaVideo : EMessageType.Media,
            });
          });
          setMessageHistory(newMessageHistory);
        case 'file':
          const files = message.file;
          // send file
          files.forEach((file: { path: string; }) => {
            newMessageHistory.push({
              content: file.path, // change with URL of file in server
              timestamp: new Date(),
              sender: chatRoomRef.current.user,
              type: EMessageType.File,
            });
          });
          setMessageHistory(newMessageHistory);
        case 'code':
          const language = message.language;
          newMessageHistory.push({
            content: messageRef.current,
            timestamp: new Date(),
            sender: chatRoomRef.current.user,
            type: EMessageType.Code,
            language
          });
          setMessageHistory(newMessageHistory);
          setMessage("");
      };
    });
  }, []);

  useEffect(() => {
    chatRoomRef.current = chatRoom;
  }, [chatRoom]);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let newMessageHistory = [...messageHistory];
    newMessageHistory.push({
      content: message,
      timestamp: new Date(),
      sender: mockSenderGenerator(),
      type: EMessageType.Text,
    });
    setMessageHistory(newMessageHistory);
    setMessage("");
  };

  const handleOpenMenu = () => {
    vscode.postMessage({
      command: 'openChatRoomMenu',
      chatRoom,
    });
  };

  const getTimeFormatted = (date: Date) => {
    let hours = date.getHours();
    let minutes: number | string = date.getMinutes();
    let ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 ? hours % 12 : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  }; 

  const mockSenderGenerator = () => {
    const senders = [chatRoom.user, ...chatRoom.friends];
    return senders[Math.floor(Math.random() * senders.length)];
  };

  return (
    <main>
      {messageHistory.map((message, index) => (
        <div key={index} style={{ textAlign: message.sender !== chatRoom.user ? 'left' : 'right' }}>
          {message.sender !== chatRoom.user ? <img src={message.sender.pictureUri} width="20" /> : null}
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
          {message.sender === chatRoom.user ? <img src={message.sender.pictureUri} width="20" /> : null}
        </div>
      ))}
      <VSCodeButton appearance="secondary" onClick={handleOpenMenu}>+</VSCodeButton>
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
