import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import './ExpensesByCategory.css';

// Mapeo de categorías a iconos (categorías válidas del backend)
const categoryIcons = {
  // Categorías de gastos válidas del backend
  'Supermercado': '🛒',
  'Hogar': '🏠', 
  'Tarjeta de crédito': '💳',
  'Transporte': '🚗',
  'Tiendas': '🛍️',
  'Otro': '🧾',
  
  // Categoría de ingresos (NO debe aparecer en gastos)
  'Salario': '💰',
  
  // Estados especiales
  'Sin datos': '❓',
  
  // Compatibilidad con nombres en inglés (si es necesario)
  'Groceries': '🛒',
  'House': '🏠',
  'Credit card': '💳',
  'Transportation': '🚗',
  'Shopping': '🛍️',
  'Other': '🧾',
  'Salary': '💰'
};

// Colores predefinidos para las categorías
const COLORS = ['#A9A2F8', '#F76C6C', '#5AC8FA', '#50D1AA', '#6E62B6', '#EAEAEA', '#FF8C42', '#9B59B6'];

const CustomLegend = (props) => {
  const { chartData } = props;
  
  // Mostrar todas las categorías directamente desde chartData
  if (!chartData || chartData.length === 0) {
    return null;
  }

  return (
    <ul className="custom-legend">
      {chartData.map((item, index) => {
        const icon = categoryIcons[item.name] || categoryIcons[item.category] || '🧾';
        const color = COLORS[index % COLORS.length];
        
        return (
          <li key={`item-${index}`}>
            <div className="legend-icon-background" style={{ backgroundColor: color }}>
              <span className="legend-icon">{icon}</span>
            </div>
            <span className="legend-text">{item.name}</span>
            <span className="legend-value">{item.percentage?.toFixed(1)}%</span>
          </li>
        );
      })}
    </ul>
  );
};

function ExpensesByCategory({ data: propData }) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Transformar y validar datos recibidos del backend
  const chartData = React.useMemo(() => {
    if (!propData || !Array.isArray(propData) || propData.length === 0) {
      return [
        { name: 'Sin datos', value: 100, percentage: 100, category: 'Sin datos' }
      ];
    }

    // Categorías válidas de gastos (excluyendo "Salario" que es para ingresos)
    const validExpenseCategories = ['Supermercado', 'Hogar', 'Tarjeta de crédito', 'Transporte', 'Tiendas', 'Otro'];
    
    // Filtrar solo las categorías con valor mayor a 0 y que sean categorías de gastos válidas
    const validData = propData.filter(item => 
      item.amount > 0 && 
      item.percentage > 0 && 
      validExpenseCategories.includes(item.category)
    );
    
    if (validData.length === 0) {
      const invalidCategories = propData.filter(item => !validExpenseCategories.includes(item.category));
      return []; // Retornar array vacío en lugar de datos mock
    }

    const transformedData = validData.map(item => ({
      name: item.category,
      value: item.percentage,
      percentage: item.percentage,
      category: item.category,
      amount: item.amount
    }));
    
    return transformedData;
  }, [propData]);

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const icon = categoryIcons[data.payload.name] || '🧾';
      return (
        <div className="tooltip">
          <p className="tooltip-label">
            <span>{icon}</span> {data.payload.name}
          </p>
          <p className="tooltip-value">
            Porcentaje: {data.value.toFixed(1)}%
          </p>
          <p className="tooltip-amount">
            Monto: ${data.payload.amount?.toLocaleString("es-CO")}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calcular altura fija para la gráfica, independiente del número de categorías
  const chartHeight = windowSize.width <= 768 ? 200 : 240;
  const pieSize = windowSize.width <= 768 ? 70 : 90;

  // Calcular altura dinámica basada en el número de categorías
  const calculateDynamicHeight = () => {
    const numCategories = chartData.length > 0 ? chartData.length : 1;
    
    // Alturas base según dispositivo
    const baseHeight = windowSize.width <= 480 ? 180 : windowSize.width <= 768 ? 200 : 220; // Header + chart
    const categoryHeight = windowSize.width <= 480 ? 36 : windowSize.width <= 768 ? 40 : 44; // Altura por categoría
    const categoryGap = windowSize.width <= 480 ? 8 : 10; // Gap entre categorías
    const padding = windowSize.width <= 480 ? 32 : windowSize.width <= 768 ? 40 : 48; // Padding de la tarjeta
    
    const legendHeight = numCategories * categoryHeight + (numCategories - 1) * categoryGap;
    const totalHeight = baseHeight + legendHeight + padding + 20; // 20px extra para spacing mínimo
    
    // La altura mínima se ajusta mejor a las otras tarjetas del sistema
    const minHeight = windowSize.width <= 480 ? 400 : windowSize.width <= 768 ? 450 : 500;
    
    // Si tenemos pocas categorías, usamos la altura mínima para igualar otras tarjetas
    // Si tenemos muchas categorías, calculamos la altura necesaria
    return numCategories <= 4 ? minHeight : Math.max(totalHeight, minHeight);
  };

  const dynamicHeight = calculateDynamicHeight();

  return (
    <div 
      className="chart-card"
      style={{
        minHeight: `${dynamicHeight}px`,
        '--dynamic-height': `${dynamicHeight}px`,
        height: 'auto' // Permite que se estire si es necesario para igualar otras tarjetas
      }}
    >
      <div className="chart-header">
        <h3 className="chart-title">Gastos por Categoría</h3>
        <div className="chart-subtitle">
          Distribución porcentual de tus gastos
        </div>
      </div>
      <div className="chart-content">
        {chartData.length === 0 ? (
          <div className="no-data-container">
            <div className="no-data-icon">📊</div>
            <div className="no-data-text">No hay gastos registrados</div>
            <div className="no-data-subtext">Comienza registrando tu primer gasto para ver las estadísticas</div>
          </div>
        ) : (
          <div className="chart-container">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={pieSize}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="legend-wrapper">
              <CustomLegend chartData={chartData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpensesByCategory; 