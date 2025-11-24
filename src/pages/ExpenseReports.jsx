import React, { useState, useEffect } from "react";
import { Expense } from "@/entities/Expense";
import { ExpenseCategory } from "@/entities/ExpenseCategory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingDown, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { startOfMonth, endOfMonth, format as formatDate, subMonths } from "date-fns";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function ExpenseReports() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [expenseData, categoryData] = await Promise.all([
          Expense.list("-expense_date"),
          ExpenseCategory.list()
        ]);
        setExpenses(expenseData);
        setCategories(categoryData);
      } catch (error) {
        console.error("加载数据失败:", error);
      }
      setLoading(false);
    };
    init();
  }, []);

  const getMonthlyData = () => {
    const monthlyStats = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.expense_date);
      const monthKey = formatDate(date, 'yyyy-MM');
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: monthKey,
          amount: 0,
          count: 0
        };
      }
      
      monthlyStats[monthKey].amount += expense.usdt_amount || 0;
      monthlyStats[monthKey].count += 1;
    });

    return Object.values(monthlyStats)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  };

  const getCategoryData = () => {
    const categoryStats = {};
    
    expenses.forEach(expense => {
      const category = expense.category || 'Unknown';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          name: category,
          value: 0,
          count: 0
        };
      }
      categoryStats[category].value += expense.usdt_amount || 0;
      categoryStats[category].count += 1;
    });

    return Object.values(categoryStats).sort((a, b) => b.value - a.value);
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            报表分析
          </h1>
          <p className="text-slate-600 mt-2">深入了解您的消费模式和趋势</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 月度趋势 */}
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                近6个月趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length === 0 ? (
                <p className="text-center text-slate-500 py-8">暂无数据</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, '消费金额']}
                    />
                    <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* 分类占比 */}
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                分类占比
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <p className="text-center text-slate-500 py-8">暂无数据</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 分类详情 */}
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle>分类详细统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryData.map((category, index) => (
                <div 
                  key={category.name} 
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div>
                      <p className="font-medium text-slate-900">{category.name}</p>
                      <p className="text-sm text-slate-500">{category.count} 笔消费</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">
                    ${category.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}