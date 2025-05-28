import React, { useState } from "react";
import {
  registerIncome,
  validateIncomeData,
} from "../../services/transactionService";
import "./RegisterIncomeCard.css";

function RegisterIncomeCard() {
  const [expanded, setExpanded] = useState(false);
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState("");
  const [method, setMethod] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
    setError("");
    setAmount("");
    setDetails("");
    setCategory("");
    setMethod("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Preparar datos del formulario
    const formData = {
      amount,
      details,
      category,
      method,
    };

    // Validar datos
    const validation = validateIncomeData(formData);
    if (!validation.isValid) {
      setError(validation.errors.join(", "));
      return;
    }

    setError("");

    // Confirmar con el usuario
    const confirmed = window.confirm("¿Deseas registrar este ingreso?");
    if (!confirmed) return;

    setLoading(true);

    try {
      const result = await registerIncome(formData);

      if (result.success) {
        // Éxito - resetear formulario y cerrar
        setExpanded(false);
        setAmount("");
        setDetails("");
        setCategory("");
        setMethod("");

        // Opcional: mostrar mensaje de éxito
        alert("Ingreso registrado exitosamente");

        // Opcional: disparar evento para actualizar la lista de transacciones
        window.dispatchEvent(
          new CustomEvent("incomeRegistered", {
            detail: result.data,
          })
        );
      } else {
        setError(result.error || "Error al registrar el ingreso");
      }
    } catch (error) {
      setError("Error inesperado al registrar el ingreso");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-income-card">
      <div onClick={handleToggle}>
        <div className="register-income-icon">
          <span>+</span>
        </div>
        <div>
          <div className="register-income-title">Registrar Ingreso</div>
          <div className="register-income-desc">Añadir ingreso manualmente</div>
        </div>
      </div>
      {expanded && (
        <form className="income-form-custom" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Ingreso</label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  padding: "10px 12px",
                  background: "#f0f9ff",
                  border: "1px solid #e3e3e3",
                  borderRadius: "6px 0 0 6px",
                  borderRight: "none",
                  color: "#059669",
                  fontSize: "1rem",
                }}
              >
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="form-input"
                style={{ borderRadius: "0 6px 6px 0", borderLeft: "none" }}
                placeholder="Valor del Ingreso"
                name="amount"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*\.?\d*$/.test(val)) setAmount(val); // Permite decimales
                }}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detalles</label>
            <textarea
              className="form-input"
              placeholder="Detalles (opcional)"
              name="details"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Categoría</label>
            <select
              className="form-input"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Seleccionar Categoría</option>
              <option value="salario">Salario</option>
              <option value="venta">Venta</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="form-group form-group-row">
            <div style={{ flex: 1 }}>
              <label className="form-label">Método de pago</label>
              <select
                className="form-input"
                name="method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                disabled={loading}
                required
              >
                <option value="">Seleccionar Método</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="form-group">
              <span style={{ color: "red", fontSize: "0.95em" }}>{error}</span>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default RegisterIncomeCard;
