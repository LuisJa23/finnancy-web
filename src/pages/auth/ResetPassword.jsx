import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const validateEmail = (value) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(value);
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setEmailError("");
    setErrorMsg("");
    setSuccessMsg("");
    if (!validateEmail(email)) {
      setEmailError("Introduce un correo válido (user@dominio.com)");
      return;
    }
    try {
      const url = `${BACKEND_URL}/auth/forgotPassword?email=${encodeURIComponent(
        email
      )}`;
      const response = await fetch(url, { method: "POST" });
      if (response.ok) {
        setSuccessMsg(
          "Correo de recuperación enviado. Revisa tu bandeja de entrada."
        );
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setErrorMsg(
          "No se pudo enviar el correo de recuperación. Intenta de nuevo."
        );
      }
    } catch (error) {
      setErrorMsg("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="reset-fullpage">
      <div className="reset-container">
        <h2>Recuperar contraseña</h2>
        <form onSubmit={handleSendCode} className="reset-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className={emailError ? "input-error" : ""}
            />
            {emailError && <span className="error-message">{emailError}</span>}
          </div>
          {errorMsg && <div className="error-message">{errorMsg}</div>}
          {successMsg && <div className="success-message">{successMsg}</div>}
          <button type="submit" className="reset-btn">
            Enviar correo de recuperación
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
