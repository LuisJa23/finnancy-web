import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './TotalSavings.css';

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatYAxis = (tickItem) => {
  if (Math.abs(tickItem) >= 1000000) {
    return `${(tickItem / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(tickItem) >= 1000) {
    return `${(tickItem / 1000).toFixed(0)}K`;
  }
  return tickItem;
};

const formatTooltip = (value, name) => {
  if (name === 'balance') {
    return [formatCurrency(value), 'Balance Acumulado'];
  }
  return [value, name];
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`Fecha: ${label}`}</p>
        <p className="tooltip-balance">
          <span className="tooltip-label-text">Balance: </span>
          <span className="tooltip-value">{formatCurrency(data.balance)}</span>
        </p>
        <p className="tooltip-change">
          <span className="tooltip-label-text">Cambio: </span>
          <span className={`tooltip-value ${data.amount >= 0 ? 'positive' : 'negative'}`}>
            {data.amount >= 0 ? '+' : ''}{formatCurrency(data.amount)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

function TotalSavings({ data, loading, error }) {
  // Procesar datos para el gráfico de área
  const processChartData = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map(item => ({
      name: new Date(item.date).toLocaleDateString('es-CO', { 
        month: 'short', 
        day: 'numeric' 
      }),
      balance: item.runningBalance || 0,
      amount: item.amount || 0,
      date: item.date
    }));
  };

  const chartData = processChartData();
  const currentBalance = chartData.length > 0 ? chartData[chartData.length - 1].balance : 0;
  const previousBalance = chartData.length > 1 ? chartData[chartData.length - 2].balance : 0;
  const balanceChange = currentBalance - previousBalance;
  const isPositiveChange = balanceChange >= 0;

  if (loading) {
    return (
      <div className="chart-card total-savings-container">
        <div className="header-container">
          <h3 className="chart-title amount">Cargando...</h3>
          <p className="savings-text">Obteniendo datos de balance</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-card total-savings-container">
        <div className="header-container">
          <h3 className="chart-title amount">Error</h3>
          <p className="savings-text error-text">No se pudieron cargar los datos</p>
        </div>
        <div className="error-container">
          <p>Error al obtener el balance</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="chart-card total-savings-container">
        <div className="header-container">
          <h3 className="chart-title amount">{formatCurrency(0)}</h3>
          <p className="savings-text">No hay datos de transacciones disponibles</p>
        </div>
        <div className="no-data-container">
          <p>Sin datos para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card total-savings-container">
      <div className="header-container">
        <h3 className="chart-title amount">{formatCurrency(currentBalance)}</h3>
        <div className="balance-info">
          <p className="savings-text">
            {isPositiveChange ? 'Tu balance está creciendo' : 'Cambios en tu balance'}
          </p>
          <p className={`balance-change ${isPositiveChange ? 'positive' : 'negative'}`}>
            {isPositiveChange ? '+' : ''}{formatCurrency(balanceChange)} desde la última transacción
          </p>
        </div>
      </div>
      <div style={{ flexGrow: 1, width: '100%', minHeight: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
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
                <stop offset="5%" stopColor={isPositiveChange ? "#22c55e" : "#ef4444"} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={isPositiveChange ? "#22c55e" : "#ef4444"} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
              tickLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
              tickLine={{ stroke: '#e0e0e0' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke={isPositiveChange ? "#16a34a" : "#dc2626"} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorBalance)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TotalSavings; 