import { useState, useEffect } from "react";
import { vscode } from "./utilities/vscode";
import { EPage } from "../../src/enums/EPage";
import "./App.css";
import ChatRoomPage from "./pages/ChatRoomPage";
import VoiceChatPage from "./pages/VoiceChatPage";

function App() {
  const [page, setPage] = useState<EPage>(EPage.ChatRoom);

  useEffect(() => {
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.command) {
        case 'route':
          setPage(message.page);
          break;
      };
    });
  }, []);

  return (
    <main>
      {page === EPage.ChatRoom && <ChatRoomPage />}
      {page === EPage.VoiceChat && <VoiceChatPage />}
    </main>
  );
}

export default App;
