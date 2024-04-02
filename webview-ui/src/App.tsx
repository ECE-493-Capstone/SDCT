import { useState, useEffect, useRef } from "react";
import { vscode } from "./utilities/vscode";
import { EPage } from "../../src/enums/EPage";
import "./App.css";
import ChatRoomPage from "./pages/ChatRoomPage";
import VoiceChatPage from "./pages/VoiceChatPage";
import CodeSessionPage from "./pages/CodeSessionPage";
import { IChatRoom } from "../../src/interfaces/IChatRoom";
import { IMessage } from "../../src/interfaces/IMessage";
import { IUser } from "../../src/interfaces/IUser";
import { EMessageType } from "../../src/enums/EMessageType";

const defaultChatRoom: IChatRoom = {user: {name: "", pictureUri: ""}, friends: [], joinedCodeSession: false, joinedVoiceChat: false};

function App() {
  const [page, setPage] = useState<EPage>(EPage.ChatRoom);
  const [chatRoom, setChatRoom] = useState<IChatRoom>(defaultChatRoom);
  const [messageHistory, _setMessageHistory] = useState<IMessage[]>([]);
  const messageHistoryRef = useRef(messageHistory);
  const setMessageHistory = (data: IMessage[]) => {
    messageHistoryRef.current = data;
    _setMessageHistory(data);
  };

  const handleNewMessage = (message: IMessage) => {
    let newMessageHistory = [...messageHistoryRef.current];
    newMessageHistory.push(message);
    setMessageHistory(newMessageHistory);
  };

  useEffect(() => {
    function handleMessage(event: any) {
      const message = event.data;
      switch (message.command) {
        case 'route':
          setPage(message.page);
          break;
        case 'initChatRoom':
          setChatRoom(message.chatRoom);
          break;
        case 'new message':
          const newMessage = {
            content: message.message.text,
            timestamp: new Date(message.message.timestamp),
            sender: message.message.sender,
            type: EMessageType.Text
          };
          handleNewMessage(newMessage);
          break;
      };
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [messageHistory]);

  return (
    <main>
      {page === EPage.ChatRoom && <ChatRoomPage chatRoom={chatRoom} messageHistory={messageHistory} handleNewMessage={handleNewMessage}/>}
      {page === EPage.VoiceChat && <VoiceChatPage chatRoom={chatRoom}/>}
      {page === EPage.CodeSession && <CodeSessionPage chatRoom={chatRoom}/>}
    </main>
  );
}

export default App;
