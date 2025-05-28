// This is a new file
import React from 'react';
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

const data = [
  { name: '10', Ingresos: 25, Egresos: 15 },
  { name: '11', Ingresos: 45, Egresos: 30 },
  { name: '12', Ingresos: 30, Egresos: 20 },
  { name: '13', Ingresos: 40, Egresos: 25 },
  { name: '14', Ingresos: 20, Egresos: 12 },
];

const formatYAxis = (tickItem) => `$${tickItem}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Día ${label}`}</p>
        <p className="intro" style={{ color: payload[0].color }}>{`${payload[0].name}: $${payload[0].value}`}</p>
        <p className="intro" style={{ color: payload[1].color }}>{`${payload[1].name}: $${payload[1].value}`}</p>
      </div>
    );
  }
  return null;
};

function IncomeVsExpenses() {
  return (
    <div className="chart-card income-vs-expenses-container">
      <div className="header-container">
        <h3 className="chart-title">Ingresos vs Egresos</h3>
        <p className="total-amount">$3650</p>
      </div>
      <div style={{ flexGrow: 1, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
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
      <button className="filter-button">Filtrar</button>
    </div>
  );
}

export default IncomeVsExpenses; 