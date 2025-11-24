import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { format, subDays, isValid, parseISO } from "date-fns";

export default function TransactionChart({ transactions, loading }) {
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getLast7DaysData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'MM/dd'),
        fullDate: date,
        count: 0,
        amount: 0
      };
    });

    transactions.forEach(transaction => {
      try {
        // 安全的日期解析
        let transactionDate;
        if (transaction.created_date) {
          transactionDate = typeof transaction.created_date === 'string' 
            ? parseISO(transaction.created_date) 
            : new Date(transaction.created_date);
        } else {
          return; // 跳过没有创建日期的交易
        }
        
        // 验证日期是否有效
        if (!isValid(transactionDate)) {
          console.warn('无效的交易日期:', transaction.created_date);
          return;
        }

        const dayData = last7Days.find(day => 
          format(day.fullDate, 'yyyy-MM-dd') === format(transactionDate, 'yyyy-MM-dd')
        );
        
        if (dayData) {
          dayData.count += 1;
          dayData.amount += transaction.deposit_amount || 0;
        }
      } catch (error) {
        console.error('处理交易日期时出错:', error, transaction);
      }
    });

    return last7Days;
  };

  const chartData = getLast7DaysData();

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          近7天交易趋势
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}