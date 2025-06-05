// This is a new file
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './TotalSavings.css';

const formatYAxis = (tickItem) => {
  if (tickItem >= 1000000) {
    return `${(tickItem / 1000000).toFixed(1)}M`;
  }
  if (tickItem >= 1000) {
    return `${(tickItem / 1000).toFixed(0)}K`;
  }
  return tickItem;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', {
    month: 'short',
    day: 'numeric'
  });
};

function TotalSavings({ data: propData }) {
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

  // Debugging: Monitorear cambios en los datos para verificar el ordenamiento
  useEffect(() => {
    if (propData && Array.isArray(propData) && propData.length > 0) {
      console.log('📊 TotalSavings - Datos recibidos del backend:');
      propData.forEach((transaction, index) => {
        console.log(`  ${index + 1}. ${transaction.date} - ${transaction.description} - Balance: ${transaction.accumulatedBalance}`);
      });
    }
  }, [propData]);

  // Transformar los datos del backend al formato requerido por el gráfico
  const chartData = React.useMemo(() => {
    if (!propData || !Array.isArray(propData) || propData.length === 0) {
      return [];
    }

    // IMPORTANTE: Ordenar las transacciones por fecha/hora antes de procesarlas
    // Esto asegura que la gráfica respete la línea de tiempo cronológica real
    const sortedTransactions = [...propData].sort((a, b) => {
      // Convertir las fechas a objetos Date para comparación precisa
      // Si la fecha incluye timestamp, se usará; si no, Date manejará solo la fecha
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // Si las fechas son exactamente iguales (mismo día), usar el ID como fallback
      // para mantener un orden consistente
      if (dateA.getTime() === dateB.getTime()) {
        return (a.id || 0) - (b.id || 0);
      }
      
      // Ordenar de más antigua a más reciente (ascendente)
      return dateA.getTime() - dateB.getTime();
    });

    // Log para debugging - mostrar el orden de las transacciones
    console.log('🔍 Orden de transacciones en la gráfica (de izquierda a derecha):');
    sortedTransactions.forEach((transaction, index) => {
      console.log(`  ${index + 1}. ${transaction.date} - ${transaction.description} - ${transaction.type} ${transaction.amount}`);
    });

    // Mapear las transacciones ordenadas con balance acumulado
    return sortedTransactions.map((transaction, index) => ({
      name: formatDate(transaction.date),
      balance: transaction.accumulatedBalance,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      category: transaction.category,
      transactionIndex: index + 1,
      // Añadir fecha original para debugging si es necesario
      originalDate: transaction.date
    }));
  }, [propData]);

  const currentBalance = chartData.length > 0 ? chartData[chartData.length - 1].balance : 0;
  const previousBalance = chartData.length > 1 ? chartData[chartData.length - 2].balance : currentBalance;
  const balanceChange = currentBalance - previousBalance;
  const isPositiveChange = balanceChange >= 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // Formatear la fecha completa con hora si está disponible
      const fullDate = new Date(data.originalDate);
      const dateTimeString = fullDate.toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          <p className="tooltip-date">
            {`Fecha completa: ${dateTimeString}`}
          </p>
          <p className="tooltip-balance">
            {`Balance: ${formatCurrency(data.balance)}`}
          </p>
          <p className="tooltip-transaction">
            {`${data.type === 'INCOME' ? '+' : '-'}${formatCurrency(Math.abs(data.amount))} - ${data.category}`}
          </p>
          <p className="tooltip-description">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card total-savings-container">
      <div className="header-container">
        <h3 className="chart-title amount">{formatCurrency(currentBalance)}</h3>
        <p className="savings-text">
          {chartData.length > 0 
            ? `Balance ${isPositiveChange ? 'aumentó' : 'disminuyó'} ${formatCurrency(Math.abs(balanceChange))} en la última transacción`
            : 'Registra transacciones para ver la evolución de tu balance'
          }
        </p>
      </div>
      <div className="chart-container">
        {chartData.length === 0 ? (
          <div className="no-data-container">
            <div className="no-data-icon">💳</div>
            <div className="no-data-text">No hay transacciones recientes</div>
            <div className="no-data-subtext">Los datos aparecerán cuando registres transacciones</div>
          </div>
        ) : (
          <div style={{ width: '100%', height: isMobile ? (window.innerWidth <= 480 ? '180px' : '200px') : '300px' }}>
            <ResponsiveContainer 
              key={containerKey}
              width="100%" 
              height="100%"
            >
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e90ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1e90ff" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={formatYAxis} 
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#1e90ff" 
                  strokeWidth={3}
                  fill="url(#colorBalance)"
                  dot={{ fill: '#1e90ff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#1e90ff', strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default TotalSavings; 