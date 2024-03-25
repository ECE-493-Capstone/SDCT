import { useState, useEffect } from "react";
import { vscode } from "./utilities/vscode";
import { EPage } from "../../src/enums/EPage";
import "./App.css";
import ChatRoomPage from "./pages/ChatRoomPage";

function App() {
  const [page, setPage] = useState<EPage>(EPage.ChatRoom);
  return (
    <main>
      {page === EPage.ChatRoom && <ChatRoomPage />}
    </main>
  );
}

export default App;
