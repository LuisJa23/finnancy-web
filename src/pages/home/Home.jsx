import React, { useState, useEffect } from "react";
import CardData from "../../components/cardData/CardData";
import logo from "../../assets/finnanci.png";
import TransactionTable from "../../components/transactionInfo/TransactionTable";
import RegisterIncomeCard from "../../components/cashFlow/RegisterIncomeCard";
import RegisterExpenseCard from "../../components/cashFlow/RegisterExpenseCard";
import { getTransactionSummary } from "../../services/transactionService";
import { getCurrentUserUID } from "../../services/AuthService"; // Cambiado a AuthService
import "./Home.css";

function Home() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);

        // Obtener el UID del usuario actual
        const userId = getCurrentUserUID();

        if (!userId) {
          throw new Error("No se pudo obtener el ID del usuario");
        }

        // Obtener los datos del resumen
        const data = await getTransactionSummary(userId);
        setSummaryData(data);
        setError(null);
      } catch (err) {
        console.error("Error al cargar el resumen:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  // Función para formatear números
  const formatNumber = (number) => {
    return number.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Función para refrescar los datos (útil después de agregar transacciones)
  const refreshData = async () => {
    try {
      const userId = getCurrentUserUID();
      if (userId) {
        const data = await getTransactionSummary(userId);
        setSummaryData(data);
      }
    } catch (err) {
      console.error("Error al refrescar datos:", err);
    }
  };

  return (
    <div className="main-content">
      <div className="main-data">
        <h1 className="text-primary">Bienvenido a Finnancy</h1>
        <div className="cash-flow-info">
          {loading ? (
            // Mostrar skeleton loading para las tarjetas
            <>
              <div className="card-skeleton"></div>
              <div className="card-skeleton"></div>
              <div className="card-skeleton"></div>
            </>
          ) : error ? (
            // Mostrar error
            <div className="error-message">
              <p>Error al cargar los datos: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="retry-button"
              >
                Reintentar
              </button>
            </div>
          ) : summaryData ? (
            // Mostrar las tarjetas con datos reales
            <>
              <CardData
                title="Saldo Actual"
                value={formatNumber(summaryData.totalBalance)}
                count={
                  summaryData.incomeTransactionsCount +
                  summaryData.expenseTransactionsCount
                }
              />
              <CardData
                title="Ingresos"
                value={formatNumber(summaryData.totalIncome)}
                count={summaryData.incomeTransactionsCount}
              />
              <CardData
                title="Gastos"
                value={formatNumber(summaryData.totalExpenses)}
                count={summaryData.expenseTransactionsCount}
              />
            </>
          ) : (
            // Fallback si no hay datos
            <div className="no-data-message">
              <p>No se encontraron datos financieros</p>
            </div>
          )}
        </div>
      </div>

      <div className="content-transaction">
        <div className="table-transaction">
          <TransactionTable onTransactionChange={refreshData} />
        </div>
        <div className="transaction-buttons container mt-4">
          <RegisterIncomeCard onTransactionAdded={refreshData} />
          <RegisterExpenseCard onTransactionAdded={refreshData} />
        </div>
      </div>

      <div className="final-content">
        <p className="text-secondary">Tu asistente financiero personal</p>
        <img src={logo} alt="Logo" className="mt-4" width="70" height="70" />
        <div className="mt-4"></div>
      </div>
    </div>
  );
}

export default Home;
