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

const defaultChatRoom: IChatRoom = {user: {name: "", pictureUri: ""}, friends: [], joinedCodeSession: false, joinedVoiceChat: false};

function App() {
  const [page, setPage] = useState<EPage>(EPage.ChatRoom);
  const [chatRoom, setChatRoom] = useState<IChatRoom>(defaultChatRoom);
  const [messageHistory, setMessageHistory] = useState<IMessage[]>([]);

  const handleNewMessage = (message: IMessage) => {
    let newMessageHistory = [...messageHistory];
    newMessageHistory.push(message);
    setMessageHistory(newMessageHistory);
  };

  useEffect(() => {
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.command) {
        case 'route':
          setPage(message.page);
          break;
        case 'initChatRoom':
          setChatRoom(message.chatRoom);
          break;
        case 'new message':
          handleNewMessage(message.message);
          break;
      };
    });
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
