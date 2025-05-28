import { useState, useEffect } from "react";
import { getCurrentUserUID } from "../../services/AuthService";
import CardGoal from "../../components/card-goal/CardGoal";
import RegisterGoal from "../../components/cashFlow/RegisterGoalCard";
import "./Goals.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Goals() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para formatear fecha del backend al formato local
  const formatDeadlineFromBackend = (dateString) => {
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

  // Función para obtener el icono según la categoría (puedes expandir esto)
  const getCategoryIcon = (category) => {
    const icons = {
      viaje: "✈️",
      casa: "🏠",
      hogar: "🏠",
      auto: "🚗",
      educacion: "📚",
      emergencia: "🚨",
      tecnologia: "💻",
      salud: "⚕️",
      otro: "🎯",
    };
    return icons[category?.toLowerCase()] || "🎯";
  };

  // Función para obtener las metas del usuario desde el backend
  const fetchUserGoals = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userId = getCurrentUserUID();
      if (!userId) {
        throw new Error("No se pudo obtener el ID del usuario");
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(
        `${BACKEND_URL}/api/savings-goals/user/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar las metas");
      }

      const backendGoals = await response.json();

      // Transformar los datos del backend al formato que espera el frontend
      const formattedGoals = backendGoals.map((goal) => ({
        id: goal.id,
        titulo: goal.name,
        currentValue: goal.currentAmount,
        targetValue: goal.targetAmount,
        deadline: formatDeadlineFromBackend(goal.targetDate),
        icon: getCategoryIcon(goal.category),
        category: goal.category,
        completed: goal.completed,
        progressPercentage: goal.progressPercentage,
      }));

      setGoals(formattedGoals);
    } catch (error) {
      console.error("Error al cargar las metas:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar las metas cuando el componente se monta
  useEffect(() => {
    fetchUserGoals();
  }, []);

  // Función para agregar nuevas metas
  const handleCreateGoal = (newGoal) => {
    setGoals((prevGoals) => [...prevGoals, newGoal]);
  };

  // Función para actualizar una meta existente cuando se agregan fondos
  const handleUpdateGoal = (goalId, updatedData) => {
    setGoals((prevGoals) =>
      prevGoals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              currentValue: updatedData.currentValue,
              progressPercentage: updatedData.progressPercentage,
              completed: updatedData.completed,
            }
          : goal
      )
    );
  };

  return (
    <div className="goals-pane">
      <div className="register-goal">
        <RegisterGoal onCreateGoal={handleCreateGoal} />
      </div>

      {isLoading ? (
        <div className="goals-loading">
          <div className="loading-spinner"></div>
          <p>Cargando tus metas...</p>
        </div>
      ) : error ? (
        <div className="goals-error">
          <div className="error-icon">⚠️</div>
          <p>Error al cargar las metas: {error}</p>
          <button className="retry-button" onClick={fetchUserGoals}>
            Reintentar
          </button>
        </div>
      ) : goals.length === 0 ? (
        <div className="goals-empty">
          <div className="empty-icon">🎯</div>
          <h3>No tienes metas de ahorro</h3>
          <p>
            ¡Crea tu primera meta de ahorro para empezar a alcanzar tus
            objetivos!
          </p>
        </div>
      ) : (
        <div className="cards">
          {goals.map((goal) => (
            <CardGoal
              key={goal.id}
              id={goal.id}
              titulo={goal.titulo}
              currentValue={goal.currentValue}
              targetValue={goal.targetValue}
              deadline={goal.deadline}
              icon={goal.icon}
              onUpdateGoal={handleUpdateGoal}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Goals;
