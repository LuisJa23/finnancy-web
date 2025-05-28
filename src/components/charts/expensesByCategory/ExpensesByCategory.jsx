import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import './ExpensesByCategory.css';

const data = [
  { name: 'House', value: 41.35, icon: '🏠' },
  { name: 'Credit card', value: 21.51, icon: '💳' },
  { name: 'Transportation', value: 13.47, icon: '🚗' },
  { name: 'Groceries', value: 9.97, icon: '🛒' },
  { name: 'Shopping', value: 3.35, icon: '🛍️' },
  { name: 'Other', value: 10.35, icon: '🧾' },
];

const COLORS = ['#A9A2F8', '#F76C6C', '#5AC8FA', '#50D1AA', '#6E62B6', '#EAEAEA'];

const CustomLegend = (props) => {
  const { payload } = props;
  const legendCategories = ["House", "Credit card", "Transportation", "Groceries", "Shopping"];
  const filteredPayload = payload.filter(entry => legendCategories.includes(entry.value));

  return (
    <ul className="custom-legend">
      {filteredPayload.map((entry, index) => {
        const dataEntry = data.find(d => d.name === entry.value);
        return (
          <li key={`item-${index}`}>
            <div className="legend-icon-background" style={{ backgroundColor: entry.color }}>
              <span className="legend-icon-emoji">{dataEntry?.icon}</span>
            </div>
            <span className="legend-text-category">{entry.value}</span>
            <span className="legend-value">{`${dataEntry?.value.toFixed(2)}%`}</span>
          </li>
        );
      })}
    </ul>
  );
};

function ExpensesByCategory() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <div className="chart-card expenses-by-category-container">
      <h3 className="chart-title">Gastos por categoria</h3>
      <div className="chart-container-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius="80%"
              innerRadius="60%"
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              paddingAngle={1}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
            <Legend content={<CustomLegend />} verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ExpensesByCategory; 