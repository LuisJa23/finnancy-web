import React, { useState } from "react";
import {
  registerExpense,
  validateExpenseData,
} from "../../services/transactionService";
import "./RegisterExpenseCard.css";

function RegisterExpenseCard() {
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
    const validation = validateExpenseData(formData);
    if (!validation.isValid) {
      setError(validation.errors.join(", "));
      return;
    }

    setError("");

    // Confirmar con el usuario
    const confirmed = window.confirm("¿Deseas registrar este egreso?");
    if (!confirmed) return;

    setLoading(true);

    try {
      const result = await registerExpense(formData);

      if (result.success) {
        // Éxito - resetear formulario y cerrar
        setExpanded(false);
        setAmount("");
        setDetails("");
        setCategory("");
        setMethod("");

        // Opcional: mostrar mensaje de éxito
        alert("Egreso registrado exitosamente");

        // Opcional: disparar evento para actualizar la lista de transacciones
        window.dispatchEvent(
          new CustomEvent("expenseRegistered", {
            detail: result.data,
          })
        );
      } else {
        setError(result.error || "Error al registrar el egreso");
      }
    } catch (error) {
      setError("Error inesperado al registrar el egreso");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-expense-card">
      <div onClick={handleToggle}>
        <div className="register-expense-icon">
          <span>-</span>
        </div>
        <div>
          <div className="register-expense-title">Registrar Egreso</div>
          <div className="register-expense-desc">Añadir egreso manualmente</div>
        </div>
      </div>
      {expanded && (
        <form className="expense-form-custom" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Egreso</label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  padding: "10px 12px",
                  background: "#fff3f3",
                  border: "1px solid #e3e3e3",
                  borderRadius: "6px 0 0 6px",
                  borderRight: "none",
                  color: "#e53935",
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
                placeholder="Valor del Egreso"
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
              <option value="alimentacion">Alimentación</option>
              <option value="servicios">Servicios</option>
              <option value="transporte">Transporte</option>
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
            <button
              type="submit"
              className="btn-primary btn-expense"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default RegisterExpenseCard;
