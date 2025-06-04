import React, { useState, useEffect } from 'react';
// import Slider from 'react-slick';
import ExpensesByCategory from '../../components/charts/expensesByCategory/ExpensesByCategory';
import TotalSavings from '../../components/charts/totalSavings/TotalSavings';
import IncomeVsExpenses from '../../components/charts/incomeVsExpenses/IncomeVsExpenses';
import { getFinancialReport, getLastTransactionsWithBalance } from '../../services/statsService';

// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
import './Stats.css'; // We will create this file for Stats page specific styles

// Import general chart card styles if they are not globally available
// For now, assuming they are picked up from ExpensesByCategory.css or similar
// or we might need to import them here if components are truly isolated.
// import '../../components/charts/expensesByCategory/ExpensesByCategory.css';

function Stats() {
  const [financialData, setFinancialData] = useState(null);
  const [lastTransactions, setLastTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar datos en paralelo
        const [financialReport, transactionsWithBalance] = await Promise.all([
          getFinancialReport(),
          getLastTransactionsWithBalance()
        ]);
        
        setFinancialData(financialReport);
        setLastTransactions(transactionsWithBalance);
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos de estadísticas:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="stats-container">
        <div className="loading-message">Cargando estadísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-container">
        <div className="error-message">
          <p>Error al cargar las estadísticas: {error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }
  // const settings = {
  //   dots: true,
  //   infinite: true,
  //   speed: 500,
  //   slidesToShow: 3,
  //   slidesToScroll: 1,
  //   responsive: [
  //     {
  //       breakpoint: 1024, // Adjust breakpoints as needed
  //       settings: {
  //         slidesToShow: 2,
  //         slidesToScroll: 1,
  //         infinite: true,
  //         dots: true
  //       }
  //     },
  //     {
  //       breakpoint: 600,
  //       settings: {
  //         slidesToShow: 1,
  //         slidesToScroll: 1
  //       }
  //     }
  //   ]
  // };
  return (
    <div className="stats-container">
      {/* The main title "Estadísticas" is usually part of the page layout or a higher-level component. */}
      {/* For now, let's keep it simple, it might be part of a Header component later. */}
      {/* <h1 className="page-title">Estadísticas</h1> */}
      
      {/* <Slider {...settings}>
        <div>
          <ExpensesByCategory />
        </div>
        <div>
          <TotalSavings />
        </div>
        <div>
          <IncomeVsExpenses />
        </div>
      </Slider> */}      <div>
        <ExpensesByCategory data={financialData?.expensesByCategory || []} loading={loading} error={error} />
      </div>
      <div>
        <TotalSavings data={lastTransactions} loading={loading} error={error} />
      </div>
      <div>
        <IncomeVsExpenses data={financialData?.incomeVsExpenses} loading={loading} error={error} />
      </div>
    </div>
  );
}

export default Stats;
