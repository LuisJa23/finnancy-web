import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./RegisterUser.css";

const RegisterUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [step, setStep] = useState(1);
  const [validationCode, setValidationCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const validateEmail = (value) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(value);
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setEmailError("");
    setRegisterError("");
    setRegisterSuccess("");

    if (!validateEmail(email)) {
      setEmailError("Introduce un correo válido (user@dominio.com)");
      return;
    }

    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setValidationCode(code);
      const url = `${BACKEND_URL}/auth/sendValidationCode?email=${encodeURIComponent(
        email
      )}&code=${code}`;
      console.log("Enviando a:", url);

      const response = await fetch(url, { method: "POST" });
      if (response.ok) {
        setRegisterSuccess("Código enviado al correo electrónico.");
        setStep(2);
      } else {
        setRegisterError("No se pudo enviar el código. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error al enviar código:", error);
      setRegisterError("Error de conexión con el servidor.");
    }
  };

  const handleValidateCode = (e) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");
    if (inputCode === validationCode) {
      setRegisterSuccess("Código validado. Ahora crea tu contraseña.");
      setStep(3);
    } else {
      setRegisterError("El código ingresado es incorrecto.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setRegisterError("");
    setRegisterSuccess("");

    if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const url = `${BACKEND_URL}/auth/register?email=${encodeURIComponent(
        email
      )}&password=${encodeURIComponent(password)}`;
      const response = await fetch(url, { method: "POST" });
      if (response.ok) {
        setRegisterSuccess("¡Registro exitoso! Ahora puedes iniciar sesión.");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setRegisterError("No se pudo registrar. El correo puede estar en uso.");
      }
    } catch (error) {
      setRegisterError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="register-fullpage">
      <div className="register-container">
        <h2>Registro</h2>
        {step === 1 && (
          <form onSubmit={handleSendCode} className="register-form">
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
              {emailError && (
                <span className="error-message">{emailError}</span>
              )}
            </div>
            {registerError && (
              <div className="error-message" style={{ marginBottom: "10px" }}>
                {registerError}
              </div>
            )}
            {registerSuccess && (
              <div
                className="success-message"
                style={{ marginBottom: "10px", color: "#22c55e" }}
              >
                {registerSuccess}
              </div>
            )}
            <button type="submit" className="register-btn">
              Enviar código
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleValidateCode} className="register-form">
            <div className="form-group">
              <label htmlFor="code">Código de verificación:</label>
              <input
                type="text"
                id="code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                required
                maxLength={6}
              />
            </div>
            {registerError && (
              <div className="error-message" style={{ marginBottom: "10px" }}>
                {registerError}
              </div>
            )}
            {registerSuccess && (
              <div
                className="success-message"
                style={{ marginBottom: "10px", color: "#22c55e" }}
              >
                {registerSuccess}
              </div>
            )}
            <button type="submit" className="register-btn">
              Validar código
            </button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="password">Contraseña:</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña:</label>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  tabIndex={0}
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  role="button"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
              {passwordError && (
                <span className="error-message">{passwordError}</span>
              )}
            </div>
            {registerError && (
              <div className="error-message" style={{ marginBottom: "10px" }}>
                {registerError}
              </div>
            )}
            {registerSuccess && (
              <div
                className="success-message"
                style={{ marginBottom: "10px", color: "#22c55e" }}
              >
                {registerSuccess}
              </div>
            )}
            <button type="submit" className="register-btn">
              Registrarse
            </button>
          </form>
        )}
        <div className="register-links">
          <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
