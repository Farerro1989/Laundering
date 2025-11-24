import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS = {
  "等待中": "#f59e0b",
  "已退回": "#ef4444",
  "已到账": "#10b981",
  "承兑中": "#3b82f6",
  "已完成交易": "#059669",
  "风控调解中": "#f97316",
  "冻结（正在处理）": "#8b5cf6",
  "冻结（不能处理）": "#6b7280"
};

export default function StatusAnalytics({ transactions, loading }) {
  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const getStatusData = () => {
    const statusStats = {};
    
    transactions.forEach(transaction => {
      const status = transaction.fund_status || '未知';
      if (!statusStats[status]) {
        statusStats[status] = {
          name: status,
          count: 0,
          amount: 0
        };
      }
      statusStats[status].count += 1;
      statusStats[status].amount += transaction.deposit_amount || 0;
    });

    return Object.values(statusStats).sort((a, b) => b.count - a.count);
  };

  const data = getStatusData();

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <p>暂无数据</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="name" 
          stroke="#64748b" 
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={100}
        />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <Bar 
          dataKey="count" 
          fill="#3b82f6"
          name="交易数量"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}