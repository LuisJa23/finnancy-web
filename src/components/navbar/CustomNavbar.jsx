import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaCog, FaBell, FaBars, FaTimes } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CustomNavbar.css";

import logo from "../../assets/finnanci.png";
import avatar from "./assets/avatars/person_1.png";
import NotificationDropdown from "../notifications/NotificationDropdown"; // Asegúrate de tener este componente

function CustomNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path) => (location.pathname === path ? "active" : "");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleNavbar = () => setIsExpanded(!isExpanded);

  const notifications = [
    {
      id: 1,
      title: "Ingreso",
      description: "Nuevo ingreso registrado: $500",
      icon: <FaBell color="#4caf50" />,
    },
    {
      id: 2,
      title: "Pago",
      description: "Pago de Netflix realizado",
      icon: <FaBell color="#f44336" />,
    },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light nv">
      <div className="container-fluid">
        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} alt="Logo" width="50" height="50" className="me-2" />
          <span className="brand-text fw-bold">finnancy</span>
        </Link>

        {/* Botón hamburguesa */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
          aria-expanded={isExpanded}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Menú */}
        <div className={`collapse navbar-collapse ${isExpanded ? "show" : ""}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/")}`}
                to="/"
                onClick={toggleNavbar}
              >
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/stats")}`}
                to="/stats"
                onClick={toggleNavbar}
              >
                Estadísticas
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/chat")}`}
                to="/chat"
                onClick={toggleNavbar}
              >
                Chat
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/goals")}`}
                to="/goals"
                onClick={toggleNavbar}
              >
                Metas
              </Link>
            </li>
          </ul>

          {/* Iconos y sesión */}
          <div className="d-flex align-items-center">
            <Link to="/settings" className="icon-link me-2">
              <FaCog size={18} />
            </Link>

            {/* Notificaciones con dropdown */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="icon-link btn btn-link me-3 p-0"
                style={{ boxShadow: "none" }}
                onClick={() => setShowNotifications((prev) => !prev)}
              >
                <FaBell size={18} />
              </button>
              <NotificationDropdown
                show={showNotifications}
                setShow={setShowNotifications}
                notifications={notifications}
              />
            </div>

            {/* Avatar */}
            <Link to="/perfil" className="me-3">
              <img
                src={avatar}
                alt="Avatar"
                width="32"
                height="32"
                className="rounded-circle"
              />
            </Link>

            {/* Logout */}
            <button className="btn btn-outline-danger" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default CustomNavbar;
