import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

export default function CurrencyBreakdown({ transactions, loading }) {
  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const getCurrencyData = () => {
    const currencyStats = {};
    
    transactions.forEach(transaction => {
      const currency = transaction.currency || 'Unknown';
      if (!currencyStats[currency]) {
        currencyStats[currency] = {
          name: currency,
          value: 0,
          count: 0
        };
      }
      currencyStats[currency].value += transaction.deposit_amount || 0;
      currencyStats[currency].count += 1;
    });

    return Object.values(currencyStats).sort((a, b) => b.value - a.value);
  };

  const data = getCurrencyData();

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <p>暂无数据</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [value.toLocaleString(), name]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}