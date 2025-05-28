import React, { useState } from "react";
import { getCurrentUserUID } from "../../services/AuthService";
import "./RegisterGoalCard.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function RegisterGoalCard({ onCreateGoal }) {
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [goalData, setGoalData] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
    category: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  const formatDeadline = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    return `${day} - ${months[date.getMonth()]} - ${date.getFullYear()}`;
  };

  const handleToggle = () => {
    setExpanded((prev) => !prev);
    setErrors({});
    setGoalData({
      name: "",
      targetAmount: "",
      deadline: "",
      category: "",
      description: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "targetAmount") {
      if (!/^\d*\.?\d*$/.test(value)) return;
    }

    setGoalData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!goalData.name.trim()) {
      newErrors.name = "El nombre de la meta es requerido";
    }

    if (Number(goalData.targetAmount) <= 0) {
      newErrors.targetAmount = "La meta debe ser mayor que 0";
    }

    if (!goalData.deadline) {
      newErrors.deadline = "La fecha límite es requerida";
    } else {
      const selectedDate = new Date(goalData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate <= today) {
        newErrors.deadline = "La fecha límite debe ser futura";
      }
    }

    if (!goalData.category) {
      newErrors.category = "La categoría es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      viaje: "✈️",
      casa: "🏠",
      auto: "🚗",
      educacion: "📚",
      emergencia: "🚨",
      tecnologia: "💻",
      salud: "⚕️",
      otro: "🎯",
    };
    return icons[category] || "🎯";
  };

  const createGoalInBackend = async (goalPayload) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(`${BACKEND_URL}/api/savings-goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(goalPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la meta");
      }

      const createdGoal = await response.json();
      return createdGoal;
    } catch (error) {
      console.error("Error al crear meta en backend:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const confirmed = window.confirm("¿Deseas crear esta meta de ahorro?");
    if (!confirmed) return;

    setIsLoading(true);

    try {
      // Obtener el userId del token
      const userId = getCurrentUserUID();
      if (!userId) {
        throw new Error("No se pudo obtener el ID del usuario");
      }

      // Preparar los datos para el backend
      const backendPayload = {
        userId: userId,
        name: goalData.name,
        targetAmount: Number(goalData.targetAmount),
        targetDate: goalData.deadline, // Formato YYYY-MM-DD
        category: goalData.category,
      };

      // Crear la meta en el backend
      const createdGoal = await createGoalInBackend(backendPayload);

      // Preparar los datos para el componente padre (formato local)
      const localGoal = {
        id: createdGoal.id, // ID del backend
        titulo: goalData.name,
        currentValue: 0,
        targetValue: Number(goalData.targetAmount),
        deadline: formatDeadline(goalData.deadline),
        icon: getCategoryIcon(goalData.category),
        category: goalData.category,
        description: goalData.description,
      };

      // Llamar al callback del componente padre
      if (onCreateGoal) {
        onCreateGoal(localGoal);
      }

      // Resetear el formulario
      setExpanded(false);
      setGoalData({
        name: "",
        targetAmount: "",
        deadline: "",
        category: "",
        description: "",
      });

      alert("Meta creada exitosamente");
    } catch (error) {
      console.error("Error al crear la meta:", error);
      alert(`Error al crear la meta: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-goal-card">
      <div onClick={handleToggle} className="register-goal-header">
        <div className="register-goal-icon">
          <span>+</span>
        </div>
        <div>
          <div className="register-goal-title">Crear Meta</div>
          <div className="register-goal-desc">Añadir nueva meta de ahorro</div>
        </div>
      </div>
      {expanded && (
        <form className="goal-form-custom" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre de la Meta</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Viaje a Cancún, Casa nueva..."
              name="name"
              value={goalData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Meta ($)</label>
            <div className="input-with-prefix">
              <span className="input-prefix input-prefix-success">$</span>
              <input
                type="text"
                inputMode="numeric"
                className="form-input input-with-prefix-field"
                placeholder="10000"
                name="targetAmount"
                value={goalData.targetAmount}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>
            {errors.targetAmount && (
              <span className="error-message">{errors.targetAmount}</span>
            )}
          </div>

          <div className="form-group form-group-row">
            <div style={{ flex: 1 }}>
              <label className="form-label">Fecha Límite</label>
              <input
                type="date"
                className="form-input"
                name="deadline"
                value={goalData.deadline}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
              {errors.deadline && (
                <span className="error-message">{errors.deadline}</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Categoría</label>
              <select
                className="form-input"
                name="category"
                value={goalData.category}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              >
                <option value="">Seleccionar</option>
                <option value="viaje">✈️ Viaje</option>
                <option value="casa">🏠 Casa/Hogar</option>
                <option value="auto">🚗 Vehículo</option>
                <option value="educacion">📚 Educación</option>
                <option value="emergencia">🚨 Emergencia</option>
                <option value="tecnologia">💻 Tecnología</option>
                <option value="salud">⚕️ Salud</option>
                <option value="otro">🎯 Otro</option>
              </select>
              {errors.category && (
                <span className="error-message">{errors.category}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción (Opcional)</label>
            <textarea
              className="form-input"
              placeholder="Describe tu meta de ahorro..."
              name="description"
              rows={3}
              value={goalData.description}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          {goalData.category && (
            <div className="goal-preview">
              <div className="goal-preview-icon">
                {getCategoryIcon(goalData.category)}
              </div>
              <div className="goal-preview-info">
                <div className="goal-preview-name">
                  {goalData.name || "Nueva Meta"}
                </div>
                <div className="goal-preview-amount">
                  $0 de ${goalData.targetAmount || "0"}
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleToggle}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary btn-goal"
              disabled={isLoading}
            >
              {isLoading ? "Creando..." : "Crear Meta"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default RegisterGoalCard;
