import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const validateEmail = (value) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailError("Introduce un correo válido (user@dominio.com)");
      return;
    }
    setEmailError("");
    setLoginError("");

    try {
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('password', password);

      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
          // 'Content-Type': 'application/x-www-form-urlencoded', // URLSearchParams en body lo establece automáticamente
        },
        body: formData,
      });

      let token = null;
      // Intentar parsear la respuesta como JSON independientemente del status code inicial,
      // ya que el token puede venir en una respuesta exitosa o un error puede tener detalles en JSON.
      try {
        const data = await response.json();
        if (response.ok) { // Solo procesar como éxito si response.ok es true
          token = data.token || data.idToken || data.accessToken || data.uid || null;
          if (data.status === "success" && data.token) { // Específico para tu respuesta de curl
            token = data.token;
          }
        } else { // Si response.ok es false, es un error HTTP (ej. 400, 401, etc.)
          setLoginError(data.message || data.error || "Credenciales incorrectas o error de autenticación.");
          // No se navega ni se guarda token si hay error
          return; 
        }
      } catch (jsonError) {
        // Si la respuesta no es JSON (inesperado para éxito o error con detalles)
        console.warn("La respuesta del login no fue JSON:", jsonError);
        if (response.ok) {
          // Si era una respuesta ok pero no JSON, es un problema.
          setLoginError("Respuesta inesperada del servidor.");
        } else {
          // Si era una respuesta de error y no JSON, usar un mensaje genérico.
          setLoginError(`Error ${response.status}: ${response.statusText || "Error de autenticación."}`);
        }
        // No se navega ni se guarda token si hay error o respuesta inesperada
        return;
      }

      if (token) { // Solo si se obtuvo un token y la respuesta fue ok
        localStorage.setItem("token", token);
        navigate("/");
      } else if (response.ok) { 
        // Llegó aquí si response.ok pero no se pudo extraer el token del JSON
        setLoginError("No se pudo obtener el token de la respuesta.");
      }
      // Si no fue response.ok, el error ya se estableció en el bloque catch de JSON o antes.

    } catch (error) { // Captura errores de red (fetch falló completamente, no errores HTTP)
      console.error("Error en la petición de login (catch general):", error);
      setLoginError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="login-fullpage">
      <div className="login-container">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              required
              autoComplete="username"
              className={emailError ? "input-error" : ""}
            />
            {emailError && <span className="error-message">{emailError}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={0}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                role="button"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>
          {loginError && (
            <div className="error-message" style={{ marginBottom: "10px" }}>
              {loginError}
            </div>
          )}
          <button type="submit" className="login-btn">
            Entrar
          </button>
        </form>
        <div className="login-links">
          <Link to="/reset-password">¿Olvidaste tu contraseña?</Link>
          <Link to="/register">¿No tienes cuenta? Regístrate</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
