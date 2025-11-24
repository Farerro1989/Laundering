import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays } from "date-fns";

export default function ExpenseChart({ expenses, loading }) {
  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const getLast7DaysData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'MM/dd'),
        fullDate: date,
        amount: 0,
        count: 0
      };
    });

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.expense_date);
      const dayData = last7Days.find(day => 
        format(day.fullDate, 'yyyy-MM-dd') === format(expenseDate, 'yyyy-MM-dd')
      );
      
      if (dayData) {
        // 使用USDT金额
        dayData.amount += expense.usdt_amount || 0;
        dayData.count += 1;
      }
    });

    return last7Days;
  };

  const chartData = getLast7DaysData();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
          formatter={(value) => [`${value.toFixed(2)} USDT`, '消费金额']}
        />
        <Line 
          type="monotone" 
          dataKey="amount" 
          stroke="#10b981" 
          strokeWidth={3}
          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}