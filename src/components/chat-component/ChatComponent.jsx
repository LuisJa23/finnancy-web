import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { getCurrentUserUID } from "../../services/AuthService"; // Cambiado a AuthService
import "./ChatComponent.css";

const ChatComponent = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hola, Soy Finn! Tu asistente de Finnanzas. ¿En qué puedo ayudarte hoy?",
      avatar: "🐿️",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      text: newMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsBotTyping(true);

    try {
      const uid = getCurrentUserUID();
      if (!uid) throw new Error("No se pudo obtener el UID");

      const response = await fetch(`${BACKEND_URL}/api/ai/ask/${uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newMessage }),
      });

      const data = await response.json();

      const botMessage = {
        id: messages.length + 2,
        sender: "bot",
        text: data.answer || "Lo siento, no entendí tu pregunta.",
        avatar: "🐿️",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error al enviar la pregunta:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 2,
          sender: "bot",
          text: "Hubo un error al procesar tu solicitud. Intenta nuevamente.",
          avatar: "🐿️",
        },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div className="chat-app">
      <div className="chat-container" ref={chatContainerRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-row ${
              msg.sender === "user" ? "user-message" : "bot-message"
            }`}
          >
            {msg.sender === "bot" && msg.avatar && (
              <div className="avatar">{msg.avatar}</div>
            )}
            <div className={`message ${msg.sender}`}>{msg.text}</div>
          </div>
        ))}
        {isBotTyping && (
          <div className="message-row bot-message">
            <div className="avatar">🐿️</div>
            <div className="message bot">Escribiendo...</div>
          </div>
        )}
      </div>
      <div className="input-area">
        <input
          type="text"
          className="message-input"
          placeholder="Escribe tu mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="send-button" onClick={handleSendMessage}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
