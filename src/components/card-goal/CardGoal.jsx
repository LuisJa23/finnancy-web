import React, { useState } from "react";
import { getCurrentUserUID } from "../../services/AuthService";
import "./CardGoal.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const CardGoal = ({
  id,
  titulo,
  currentValue,
  targetValue,
  deadline,
  icon,
  onUpdateGoal,
}) => {
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const porcentaje = Math.min((currentValue / targetValue) * 100, 100);
  const falta = Math.max(targetValue - currentValue, 0);
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (porcentaje / 100) * circumference;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("COP$", "$");
  };

  const handleFundAmountChange = (e) => {
    const value = e.target.value;
    // Solo permitir números y un punto decimal
    if (/^\d*\.?\d*$/.test(value)) {
      setFundAmount(value);
    }
  };

  const addFundsToGoal = async (goalId, amount) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(
        `${BACKEND_URL}/api/savings-goals/${goalId}/add?amount=${amount}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al agregar fondos");
      }

      const updatedGoal = await response.json();
      return updatedGoal;
    } catch (error) {
      console.error("Error al agregar fondos:", error);
      throw error;
    }
  };

  const handleAddFunds = async () => {
    if (!fundAmount || Number(fundAmount) <= 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    const amount = Number(fundAmount);
    const confirmed = window.confirm(
      `¿Deseas agregar ${formatCurrency(amount)} a tu meta "${titulo}"?`
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      const updatedGoal = await addFundsToGoal(id, amount);

      // Actualizar la meta en el componente padre
      if (onUpdateGoal) {
        onUpdateGoal(id, {
          currentValue: updatedGoal.currentAmount,
          progressPercentage: updatedGoal.progressPercentage,
          completed: updatedGoal.completed,
        });
      }

      // Resetear el formulario
      setFundAmount("");
      setIsAddingFunds(false);

      alert(
        `¡Fondos agregados exitosamente! Nuevo saldo: ${formatCurrency(
          updatedGoal.currentAmount
        )}`
      );
    } catch (error) {
      console.error("Error al agregar fondos:", error);
      alert(`Error al agregar fondos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAddFunds = () => {
    setFundAmount("");
    setIsAddingFunds(false);
  };

  return (
    <div className="card-goal">
      <h2 className="card-goal__title">{titulo}</h2>

      <div className="card-goal__chart-container">
        <svg className="card-goal__chart" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#e5e5e5"
            strokeWidth="12"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#1e90ff"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            className="card-goal__progress-circle"
          />
        </svg>
        <div className="card-goal__percentage">{Math.round(porcentaje)}%</div>
        <div className="card-goal__icon">{icon}</div>
      </div>

      <div className="card-goal__info">
        <div className="card-goal__amounts">
          <div className="card-goal__amount card-goal__amount--saved">
            <span className="card-goal__amount-dot card-goal__amount-dot--blue"></span>
            <span className="card-goal__amount-label">Ahorro</span>
            <span className="card-goal__amount-value">
              {formatCurrency(currentValue)}
            </span>
          </div>
          <div className="card-goal__amount card-goal__amount--remaining">
            <span className="card-goal__amount-dot card-goal__amount-dot--gray"></span>
            <span className="card-goal__amount-label">Falta</span>
            <span className="card-goal__amount-value">
              {formatCurrency(falta)}
            </span>
          </div>
        </div>

        <div className="card-goal__deadline">
          <span className="card-goal__deadline-dot"></span>
          <span className="card-goal__deadline-text">
            Fecha límite {deadline}
          </span>
        </div>

        {/* Sección para agregar fondos */}
        <div className="card-goal__add-funds">
          {!isAddingFunds ? (
            <button
              className="card-goal__add-funds-btn"
              onClick={() => setIsAddingFunds(true)}
              disabled={porcentaje >= 100}
            >
              {porcentaje >= 100 ? "🎉 Meta Completada" : "Agregar Fondos"}
            </button>
          ) : (
            <div className="card-goal__add-funds-form">
              <div className="card-goal__input-group">
                <span className="card-goal__input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="card-goal__fund-input"
                  placeholder="0.00"
                  value={fundAmount}
                  onChange={handleFundAmountChange}
                  disabled={isLoading}
                />
              </div>
              <div className="card-goal__fund-actions">
                <button
                  className="card-goal__fund-btn card-goal__fund-btn--cancel"
                  onClick={handleCancelAddFunds}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  className="card-goal__fund-btn card-goal__fund-btn--confirm"
                  onClick={handleAddFunds}
                  disabled={isLoading || !fundAmount}
                >
                  {isLoading ? "Agregando..." : "Agregar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardGoal;
