import { vscode } from "./utilities/vscode";
import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useState, useEffect } from "react";
import "./App.css";

interface Message {
  text: string;
  timestamp: Date;
  sender: string;
}

function App() {
  const [message, setMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const [user, setUser] = useState<string>("");
  const [friend, setFriend] = useState<string>("");

  useEffect(() => {
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.command) {
        case 'init':
          setUser(message.chatRoom.username);
          setFriend(message.chatRoom.friendUsername);
          break;
      };
    });
  }, []);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let newMessageHistory = [...messageHistory];
    newMessageHistory.push({
      text: message,
      timestamp: new Date(),
      sender: mockSenderGenerator(),
    });
    setMessageHistory(newMessageHistory);
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

  const mockSenderGenerator = () => {
    const senders = [user, friend];
    return senders[Math.floor(Math.random() * senders.length)];
  };

  return (
    <main>
      <h1>I ({user}) is talking to {friend} </h1>
      {messageHistory.map((message, index) => (
        <div key={index} style={{ textAlign: message.sender === user ? 'left' : 'right' }}>
          <span>{message.text} </span>
          <span>{getTimeFormatted(message.timestamp)}</span>
        </div>
      ))}
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

export default App;
