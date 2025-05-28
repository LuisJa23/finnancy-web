import { useRef, useEffect } from "react";
import "./NotificationDropdown.css";

function NotificationDropdown({ show, setShow, notifications }) {
  const notifRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShow(false);
      }
    }
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, setShow]);

  if (!show) return null;

  return (
    <div ref={notifRef} className="notification-dropdown">
      <div className="notification-title">Notificaciones</div>
      {notifications.length === 0 ? (
        <div className="notification-empty">Sin notificaciones</div>
      ) : (
        notifications.map((n) => (
          <div key={n.id} className="notification-item">
            <div className="notification-icon">{n.icon}</div>
            <div className="notification-content">
              <div className="notification-item-title">{n.title}</div>
              <div className="notification-item-desc">{n.description}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default NotificationDropdown;