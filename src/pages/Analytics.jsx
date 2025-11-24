
import React, { useState, useEffect } from "react";
import { Transaction } from "@/entities/Transaction";
import { User } from "@/entities/User"; // New import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, PieChart, ShieldAlert } from "lucide-react"; // ShieldAlert is new

import ProfitChart from "../components/analytics/ProfitChart";
import CurrencyBreakdown from "../components/analytics/CurrencyBreakdown";
import StatusAnalytics from "../components/analytics/StatusAnalytics";

export default function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false); // New state

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const user = await User.me();
        // Check if user is admin or has 'can_view_profit_data' permission
        const canView = user.role === 'admin' || user.permissions?.can_view_profit_data;
        setHasPermission(canView);
        if (canView) {
          const data = await Transaction.list("-created_date");
          setTransactions(data);
        }
      } catch (error) {
        console.error("加载数据失败:", error);
        // In case of error fetching user or permissions, default to no permission
        setHasPermission(false);
      }
      setLoading(false);
    };
    init();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return <div className="p-8 text-center text-lg text-slate-700">加载中...</div>;
  }

  if (!hasPermission) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Card className="max-w-lg text-center p-8 bg-white/80 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-xl text-red-600 font-bold">
              <ShieldAlert className="w-8 h-8"/>
              访问受限
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mt-4 text-base">抱歉，您没有查看此页面的权限。请联系管理员为您分配“查看盈利数据”的权限。</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            盈利分析
          </h1>
          <p className="text-slate-600 mt-2">深入分析您的业务表现和盈利趋势</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                盈利趋势分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfitChart transactions={transactions} loading={loading} />
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-600" />
                币种分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CurrencyBreakdown transactions={transactions} loading={loading} />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              资金状态分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusAnalytics transactions={transactions} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
