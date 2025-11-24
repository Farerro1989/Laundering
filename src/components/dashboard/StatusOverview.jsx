import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, ExternalLink } from "lucide-react";

const statusColors = {
  "等待中": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "已退回": "bg-red-100 text-red-800 border-red-200", 
  "已到账": "bg-green-100 text-green-800 border-green-200",
  "承兑中": "bg-blue-100 text-blue-800 border-blue-200",
  "已完成交易": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "风控调解中": "bg-orange-100 text-orange-800 border-orange-200",
  "冻结（正在处理）": "bg-purple-100 text-purple-800 border-purple-200",
  "冻结（不能处理）": "bg-gray-100 text-gray-800 border-gray-200"
};

// 所有可能的资金状态
const ALL_FUND_STATUSES = [
  "等待中",
  "已退回", 
  "已到账",
  "承兑中",
  "已完成交易",
  "风控调解中",
  "冻结（正在处理）",
  "冻结（不能处理）"
];

export default function StatusOverview({ transactions, loading, onStatusClick }) {
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 统计所有状态的交易数量
  const statusCounts = {};
  
  // 初始化所有状态为0
  ALL_FUND_STATUSES.forEach(status => {
    statusCounts[status] = 0;
  });
  
  // 统计实际的交易数量
  transactions.forEach(transaction => {
    if (transaction.fund_status && statusCounts.hasOwnProperty(transaction.fund_status)) {
      statusCounts[transaction.fund_status]++;
    }
  });

  const getStatusTransactions = (status) => {
    return transactions.filter(t => t.fund_status === status);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-indigo-600" />
          资金状态分布
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ALL_FUND_STATUSES.map((status) => {
            const count = statusCounts[status];
            const statusTransactions = getStatusTransactions(status);
            
            return (
              <div 
                key={status} 
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 cursor-pointer transition-colors"
                onClick={() => onStatusClick(status, statusTransactions)}
              >
                <div className="flex items-center gap-2">
                  <Badge className={`${statusColors[status]} border`}>
                    {status}
                  </Badge>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </div>
                <span className="font-semibold text-slate-700">{count}笔</span>
              </div>
            );
          })}
        </div>
        
        {/* 显示总计 */}
        <div className="mt-4 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm font-medium text-slate-600">
            <span>总计交易</span>
            <span>{transactions.length}笔</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}