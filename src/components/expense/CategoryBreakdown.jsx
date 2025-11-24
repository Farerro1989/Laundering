import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function CategoryBreakdown({ expenses, categories, loading }) {
  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const getCategoryData = () => {
    const categoryStats = {};
    
    expenses.forEach(expense => {
      const category = expense.category || 'Unknown';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          name: category,
          value: 0
        };
      }
      // 使用USDT金额
      categoryStats[category].value += expense.usdt_amount || 0;
    });

    return Object.values(categoryStats).sort((a, b) => b.value - a.value);
  };

  const data = getCategoryData();

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
        <Tooltip formatter={(value) => `${value.toFixed(2)} USDT`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}