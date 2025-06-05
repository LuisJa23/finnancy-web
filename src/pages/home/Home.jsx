import React, { useState, useEffect, useCallback, useRef } from "react";
import CardData from "../../components/cardData/CardData";
import logo from "../../assets/finnanci.png";
import TransactionTable from "../../components/transactionInfo/TransactionTable";
import RegisterIncomeCard from "../../components/cashFlow/RegisterIncomeCard";
import RegisterExpenseCard from "../../components/cashFlow/RegisterExpenseCard";
import { getTransactionSummary } from "../../services/transactionService";
import { getCurrentUserUID } from "../../services/AuthService";
import "./Home.css";

function Home() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Ref para evitar múltiples llamadas simultáneas
  const isRefreshing = useRef(false);

  // Función memoizada para obtener datos del resumen
  const fetchSummaryData = useCallback(async () => {
    // Evitar múltiples llamadas simultáneas
    if (isRefreshing.current) return;

    try {
      isRefreshing.current = true;
      setLoading(true);

      const userId = getCurrentUserUID();

      if (!userId) {
        throw new Error("No se pudo obtener el ID del usuario");
      }

      const data = await getTransactionSummary(userId);
      setSummaryData(data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar el resumen:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      isRefreshing.current = false;
    }
  }, []);

  // Efecto principal para cargar datos iniciales y cuando cambie refreshTrigger
  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData, refreshTrigger]);

  // Función para formatear números
  const formatNumber = useCallback((number) => {
    return number.toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  // Función optimizada para refrescar los datos
  const refreshData = useCallback(async () => {
    // Incrementar el trigger para forzar la recarga
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Función para manejar errores y reintentar
  const handleRetry = useCallback(() => {
    setError(null);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

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
              <button onClick={handleRetry} className="retry-button">
                Reintentar
              </button>
            </div>
          ) : summaryData ? (
            // Mostrar las tarjetas con datos reales
            <div className="card-container">
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
            </div>
          ) : (
            // Fallback si no hay datos
            <div className="no-data-message">
              <p>No se encontraron datos financieros</p>
              <button onClick={handleRetry} className="retry-button">
                Cargar datos
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="content-transaction">
        <div className="table-transaction">
          <TransactionTable
            onTransactionChange={refreshData}
            key={refreshTrigger} // Forzar re-render de la tabla
          />
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
