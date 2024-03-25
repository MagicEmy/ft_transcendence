import { useEffect, useState, useRef } from "react";
import ChatBar from "../components/Chat/ChatBar";
import ChatBody from "../components/Chat/ChatBody";
import ChatFooter from "../components/Chat/ChatFooter";
import '../components/Chat/Chat.css';

const ChatPage = ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");
  const lastMessageRef = useRef(null);

  // Fetch initial messages from API
//   useEffect(() => {
//     function fetchMessages() {
//       fetch("http://localhost:5000/api")
//         .then((response) => response.json())
//         .then((data) => setMessages(data.messages))
//         .catch((error) => console.error("Error fetching messages:", error));
//     }
//     fetchMessages();
//   }, []);

  // Listen for real-time chat messages
  useEffect(() => {
    socket.on("messageResponse", (data) => {
      setMessages([...messages, data]);
      // Scroll to the last message after update
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    // Clean up event listener on unmount
    return () => socket.off("messageResponse");
  }, [socket, messages, lastMessageRef]);

  // Listen for typing notifications
  useEffect(() => {
    socket.on("typingResponse", (data) => setTypingStatus(data));
    // Clean up event listener on unmount
    return () => socket.off("typingResponse");
  }, [socket]);

  return (
	<>
    <div className="chat">
      <ChatBar socket={socket} />
      <div className="chat__main">
        <ChatBody
          messages={messages}
          typingStatus={typingStatus}
          lastMessageRef={lastMessageRef}
		  />
        <ChatFooter socket={socket} />
      </div>
    </div>
	</>
  );
};

export default ChatPage;