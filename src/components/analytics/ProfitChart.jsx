import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, isValid, parseISO } from "date-fns";

export default function ProfitChart({ transactions, loading }) {
  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const getLast30DaysData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return {
        date: format(date, 'MM/dd'),
        fullDate: date,
        commission: 0,
        exchangeRateProfit: 0,
        totalProfit: 0
      };
    });

    // 只统计已完成的交易
    const completedTransactions = transactions.filter(t => t.fund_status === '已完成交易');

    completedTransactions.forEach(transaction => {
      try {
        let transactionDate;
        if (transaction.created_date) {
          transactionDate = typeof transaction.created_date === 'string' 
            ? parseISO(transaction.created_date) 
            : new Date(transaction.created_date);
        } else {
          return;
        }
        
        if (!isValid(transactionDate)) {
          console.warn('无效的交易日期:', transaction.created_date);
          return;
        }

        const dayData = last30Days.find(day => 
          format(day.fullDate, 'yyyy-MM-dd') === format(transactionDate, 'yyyy-MM-dd')
        );
        
        if (dayData && transaction.deposit_amount && transaction.exchange_rate && transaction.exchange_rate !== 0) {
          // 计算各项收入
          const initialUsdt = transaction.deposit_amount / transaction.exchange_rate;
          const commission = initialUsdt * ((transaction.commission_percentage || 0) / 100);
          const transferFee = transaction.transfer_fee || 0;
          const exchangeRateProfit = (transaction.acceptance_usdt || 0) - initialUsdt;
          const violationPenalty = transaction.violation_penalty || 0;
          
          const totalProfit = commission + transferFee + exchangeRateProfit - violationPenalty;

          dayData.commission += commission;
          dayData.exchangeRateProfit += exchangeRateProfit;
          dayData.totalProfit += totalProfit;
        }
      } catch (error) {
        console.error('处理交易日期时出错:', error, transaction);
      }
    });

    return last30Days;
  };

  const chartData = getLast30DaysData();

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
          formatter={(value) => value.toFixed(2) + ' USDT'}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="commission" 
          stroke="#f59e0b" 
          strokeWidth={2}
          name="佣金收入"
        />
        <Line 
          type="monotone" 
          dataKey="exchangeRateProfit" 
          stroke="#10b981" 
          strokeWidth={2}
          name="汇率差盈利"
        />
        <Line 
          type="monotone" 
          dataKey="totalProfit" 
          stroke="#8b5cf6" 
          strokeWidth={3}
          name="总盈利"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}