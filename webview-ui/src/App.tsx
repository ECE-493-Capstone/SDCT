import { vscode } from "./utilities/vscode";
import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState<string[]>([]);

  function handleSendMessage() {
    let newMessageHistory = [...messageHistory];
    newMessageHistory.push(message);
    setMessageHistory(newMessageHistory);
  }

  return (
    <main>
      <VSCodeTextField value={message} onInput={e => {
        const target = e.target as HTMLInputElement;
        setMessage(target.value);
      }}/>
      <VSCodeButton onClick={handleSendMessage}>Send</VSCodeButton>
      {messageHistory.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </main>
  );
}

export default App;
