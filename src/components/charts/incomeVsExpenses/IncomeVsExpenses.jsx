// This is a new file
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './IncomeVsExpenses.css';

const formatYAxis = (tickItem) => `$${tickItem}`;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Período: ${label}`}</p>
        <p className="intro" style={{ color: payload[0].color }}>{`${payload[0].name}: ${formatCurrency(payload[0].value)}`}</p>
        {payload[1] && (
          <p className="intro" style={{ color: payload[1].color }}>{`${payload[1].name}: ${formatCurrency(payload[1].value)}`}</p>
        )}
      </div>
    );
  }
  return null;
};

function IncomeVsExpenses({ data: propData }) {
  // Estado para forzar re-render en móviles
  const [containerKey, setContainerKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil y manejar resize
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Forzar re-render cuando cambia el tamaño o es móvil
      if (mobile) {
        setContainerKey(prev => prev + 1);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    // Forzar re-render adicional en móviles después de un pequeño delay
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        setContainerKey(prev => prev + 1);
      }, 100);
    }

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Forzar re-render cuando cambien los datos del propData
  useEffect(() => {
    if (isMobile && propData) {
      setTimeout(() => {
        setContainerKey(prev => prev + 1);
      }, 50);
    }
  }, [propData, isMobile]);

  // Transformar los datos del backend al formato requerido por el gráfico
  const chartData = React.useMemo(() => {
    if (!propData?.data || !Array.isArray(propData.data) || propData.data.length === 0) {
      // Retornar array vacío si no hay datos
      return [];
    }

    return propData.data.map(item => ({
      name: item.period,
      Ingresos: item.ingresos || 0,
      Egresos: item.egresos || 0
    }));
  }, [propData]);

  // Obtener datos del mes actual
  const currentMonthData = React.useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return null;
    }

    // Obtener el mes y año actual
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() retorna 0-11
    const currentYear = now.getFullYear();

    // Mapear nombres de meses a números
    const monthMap = {
      'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4,
      'Mayo': 5, 'Junio': 6, 'Julio': 7, 'Agosto': 8,
      'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12,
      'Ene': 1, 'Feb': 2, 'Mar': 3, 'Abr': 4,
      'May': 5, 'Jun': 6, 'Jul': 7, 'Ago': 8,
      'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dic': 12
    };

    // Mapear abreviaciones a nombres completos
    const fullMonthNames = {
      'Ene': 'Enero', 'Feb': 'Febrero', 'Mar': 'Marzo', 'Abr': 'Abril',
      'May': 'Mayo', 'Jun': 'Junio', 'Jul': 'Julio', 'Ago': 'Agosto',
      'Sep': 'Septiembre', 'Oct': 'Octubre', 'Nov': 'Noviembre', 'Dic': 'Diciembre'
    };

    // Buscar el dato del mes actual
    // Primero intentar con el formato completo del año
    let currentData = chartData.find(item => {
      const period = item.name;
      // Buscar patrones como "Enero 2024", "Ene 2024", "01/2024", etc.
      if (period.includes(currentYear.toString())) {
        for (const [monthName, monthNum] of Object.entries(monthMap)) {
          if (period.includes(monthName) && monthNum === currentMonth) {
            return true;
          }
        }
        // También buscar formato numérico
        const monthStr = currentMonth.toString().padStart(2, '0');
        if (period.includes(`${monthStr}/${currentYear}`) || period.includes(`${currentMonth}/${currentYear}`)) {
          return true;
        }
      }
      return false;
    });

    // Si no se encuentra con año, buscar solo por mes (último dato disponible)
    if (!currentData) {
      currentData = chartData.find(item => {
        const period = item.name;
        for (const [monthName, monthNum] of Object.entries(monthMap)) {
          if (period.includes(monthName) && monthNum === currentMonth) {
            return true;
          }
        }
        return false;
      });
    }

    // Si aún no se encuentra, tomar el último dato disponible
    if (!currentData && chartData.length > 0) {
      currentData = chartData[chartData.length - 1];
    }

    // Convertir abreviaciones a nombres completos en el nombre del período
    if (currentData) {
      let displayName = currentData.name;
      
      // Reemplazar abreviaciones por nombres completos
      for (const [abbrev, fullName] of Object.entries(fullMonthNames)) {
        if (displayName.includes(abbrev)) {
          displayName = displayName.replace(abbrev, fullName);
          break;
        }
      }
      
      return {
        ...currentData,
        displayName: displayName
      };
    }

    return currentData;
  }, [chartData]);

  const totalIncome = propData?.totalIncome || 0;
  const totalExpenses = propData?.totalExpenses || 0;
  const netAmount = propData?.netAmount || 0;

  return (
    <div className="chart-card income-vs-expenses-container">
      <div className="header-container">
        <h3 className="chart-title">Ingresos vs Egresos</h3>
        <p className="total-amount">{formatCurrency(netAmount)}</p>
      </div>
      <div className="chart-container">
        {chartData.length === 0 ? (
          <div className="no-data-container">
            <div className="no-data-icon">📊</div>
            <div className="no-data-text">No hay datos de ingresos vs egresos</div>
            <div className="no-data-subtext">Los datos aparecerán cuando registres transacciones</div>
          </div>
        ) : (
          <div style={{ width: '100%', height: isMobile ? (window.innerWidth <= 480 ? '120px' : '140px') : '220px' }}>
            <ResponsiveContainer 
              key={containerKey}
              width="100%" 
              height="100%"
            >
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              barGap={10} // Adjust gap between bars of the same group
              barCategoryGap="20%" // Adjust gap between categories
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right" 
                wrapperStyle={{ top: -10, right: 0 }} 
                iconSize={10}
                payload={[
                    { value: 'Ingresos', type: 'circle', id: 'ID01', color: '#8884d8' },
                    { value: 'Egresos', type: 'circle', id: 'ID02', color: '#82ca9d' },
                ]}
              />
              <Bar dataKey="Ingresos" fill="#8884d8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Egresos" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        )}
      </div>
      {currentMonthData ? (
        <div className="current-month-info">
          <div className="current-month-header">
            <h4 className="current-month-title">{currentMonthData.displayName || currentMonthData.name}</h4>
          </div>
          <div className="current-month-details">
            <div className="income-info">
              <span className="income-icon">💰</span>
              <span className="income-label">Ingresos:</span>
              <span className="income-amount">{formatCurrency(currentMonthData.Ingresos)}</span>
            </div>
            <div className="expense-info">
              <span className="expense-icon">📉</span>
              <span className="expense-label">Egresos:</span>
              <span className="expense-amount">{formatCurrency(currentMonthData.Egresos)}</span>
            </div>
            <div className="balance-info">
              <span className="balance-icon">⚖️</span>
              <span className="balance-label">Balance:</span>
              <span className={`balance-amount ${currentMonthData.Ingresos - currentMonthData.Egresos >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(currentMonthData.Ingresos - currentMonthData.Egresos)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-current-month-info">
          <p>No hay datos disponibles para el mes actual</p>
        </div>
      )}
    </div>
  );
}

export default IncomeVsExpenses; 