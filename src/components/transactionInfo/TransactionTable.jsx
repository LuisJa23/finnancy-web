import React, { useState, useEffect } from "react";
import { getCurrentUserUID } from "../../services/AuthService";
import "./TransactionTable.css";

const TransactionTable = ({ onTransactionChange }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Función para obtener todas las transacciones
  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const userId = getCurrentUserUID();
      if (!userId) {
        throw new Error("No se pudo obtener el ID del usuario");
      }

      const response = await fetch(
        `${BACKEND_URL}/api/transactions?userId=${userId}`
      );

      if (!response.ok) {
        throw new Error(`Error al obtener transacciones: ${response.status}`);
      }

      const data = await response.json();
      
      // IMPORTANTE: Ordenar las transacciones por fecha/hora para mostrar la más reciente primero
      // Esto asegura que la tabla respete el orden cronológico real
      const sortedTransactions = [...data].sort((a, b) => {
        // Convertir las fechas a objetos Date para comparación precisa
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        // Ordenar de más reciente a más antigua (descendente) para la tabla
        return dateB.getTime() - dateA.getTime();
      });
      
      setTransactions(sortedTransactions);
      setError(null);
    } catch (err) {
      console.error("Error al cargar transacciones:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar una transacción
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar transacción: ${response.status}`);
      }

      // Actualizar la lista local
      setTransactions(
        transactions.filter((transaction) => transaction.id !== id)
      );

      // Notificar al componente padre para actualizar el resumen
      if (onTransactionChange) {
        onTransactionChange();
      }
    } catch (err) {
      console.error("Error al eliminar transacción:", err);
      alert("Error al eliminar la transacción. Inténtalo de nuevo.");
    }
  };

  // Cargar transacciones al montar el componente
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Función para generar colores aleatorios
  const getRandomColor = () => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Función para renderizar el logo
  const renderLogo = (transaction) => {
    const backgroundColor = getRandomColor();
    const textColor = "#FFFFFF";

    // Generar iniciales basándose en la descripción
    const getInitials = (description) => {
      return description
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .join("")
        .substring(0, 2);
    };

    return (
      <div className="logo-container">
        <div
          className="transaction-logo initials"
          style={{ color: textColor, backgroundColor: backgroundColor }}
        >
          {getInitials(transaction.description || "TX")}
        </div>
      </div>
    );
  };

  // Función para formatear el monto
  const formatAmount = (amount, data) => {
    const formattedAmount = Math.abs(amount).toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return (data.type === "INCOME" ? "+" : "-") + "$" + formattedAmount;
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Cargando transacciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-error">
        <p>Error al cargar transacciones: {error}</p>
        <button onClick={fetchTransactions} className="retry-button">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <h2>Historial de Transacciones</h2>
        <span className="transactions-count">
          {transactions.length} transacción
          {transactions.length !== 1 ? "es" : ""}
        </span>
      </div>

      <div className="table-scroll-container">
        {transactions.length === 0 ? (
          <div className="no-transactions">
            <p>No tienes transacciones registradas</p>
            <span>¡Comienza agregando tu primera transacción!</span>
          </div>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Descripción</th>
                <th>Categoria</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="transaction-row">
                  <td>{renderLogo(transaction)}</td>
                  <td className="transaction-description">
                    {transaction.description}
                  </td>

                  <td className="transaction-category">
                    {transaction.category}
                  </td>
                  <td className="transaction-date">
                    {formatDate(transaction.date)}
                  </td>
                  <td
                    className={
                      transaction.type === "INCOME"
                        ? "transaction-amount-positive"
                        : "transaction-amount-negative"
                    }
                  >
                    {formatAmount(transaction.amount, transaction)}
                  </td>
                  <td>
                    <div className="action-menu">
                      <button
                        className="action-button delete-button"
                        onClick={() => {
                          if (
                            window.confirm(
                              "¿Estás seguro de que quieres eliminar esta transacción?"
                            )
                          ) {
                            handleDelete(transaction.id);
                          }
                        }}
                        title="Eliminar transacción"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TransactionTable;
