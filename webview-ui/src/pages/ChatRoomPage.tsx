import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useState, useEffect, useRef } from "react";
import { vscode } from "../utilities/vscode";
import { IChatRoom } from "../../../src/interfaces/IChatRoom";
import { IMessage } from "../../../src/interfaces/IMessage";
import { EMessageType } from "../../../src/enums/EMessageType";

function ChatRoomPage({chatRoom}: {chatRoom: IChatRoom}) {
  const [message, setMessage] = useState("");
  const [messageHistory, _setMessageHistory] = useState<IMessage[]>([]);
  const messageHistoryRef = useRef(messageHistory);
  const setMessageHistory = (data: IMessage[]) => {
    messageHistoryRef.current = data;
    _setMessageHistory(data);
  };

  useEffect(() => {
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.command) {
        case 'media':
          const medias = message.media;
          // send media
          const newMessageHistory = [...messageHistoryRef.current];
          medias.forEach((media: { path: string; }) => {
            newMessageHistory.push({
              content: media.path, // change with URL of media in server
              timestamp: new Date(),
              sender: chatRoom.user,
              type: EMessageType.Media,
            });
          });
          setMessageHistory(newMessageHistory);
      };
    });
  }, []);

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
          {message.type === EMessageType.Media ? <span>{message.content} </span> : null}
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
