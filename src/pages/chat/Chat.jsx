import ChatLogo from "../../assets/logo-chat.svg";
import Finn from "../../assets/finn-chat.svg";
import ChatComponent from "../../components/chat-component/ChatComponent";
import "./Chat.css";

function Chat() {
  let state = true;
  let name = "Finn";

  const activeClass = state ? "green" : "red";

  return (
    <div className="main-content-chat">
      <div className="logo">
        <h1 className="text-primary">¡Hola soy Finn!</h1>
        <p className="text-muted">¡Bienvenido al chat!</p>
        <img
          src={Finn}
          alt="Chat"
          className="img-fluid"
          style={{ maxWidth: "400px" }}
        />
      </div>
      <div className="chat-container-a">
        <div className="info-chat">
          <img
            src={ChatLogo}
            alt="Chat"
            className="img-fluid chat-logo"
            style={{ maxWidth: "400px" }}
          />
          <div>
            <p style={{ fontWeight: "bolder" }}>{name}</p>
            <p style={{ color: "#ccc" }}>
              {" "}
              <span
                className={`${activeClass}`}
                style={{ fontWeight: "bolder" }}
              >
                •
              </span>
              {state ? "Activo" : "Inactivo"}
            </p>
          </div>
        </div>
        <div className="chat-content">
          <ChatComponent />
        </div>
      </div>
    </div>
  );
}
export default Chat;
