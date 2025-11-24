import React, { useState, useEffect } from "react";
import { Expense } from "@/entities/Expense";
import { ExpenseCategory } from "@/entities/ExpenseCategory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingDown, Calendar, PieChart } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, startOfDay, endOfDay } from "date-fns";

import ExpenseStatCard from "../components/expense/ExpenseStatCard";
import ExpenseChart from "../components/expense/ExpenseChart";
import CategoryBreakdown from "../components/expense/CategoryBreakdown";
import RecentExpenses from "../components/expense/RecentExpenses";

export default function ExpenseDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("month");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

  const getFilteredExpenses = () => {
    const now = new Date();
    let start, end;

    switch (timeFilter) {
      case "month":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case "year":
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default:
        return expenses;
    }

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.expense_date);
      return isWithinInterval(expenseDate, { start, end });
    });
  };

  const calculateMetrics = () => {
    const filtered = getFilteredExpenses();
    const totalExpense = filtered.reduce((sum, e) => sum + (e.usdt_amount || 0), 0);
    const expenseCount = filtered.length;

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    
    const todayExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.expense_date);
      return isWithinInterval(expenseDate, { start: todayStart, end: todayEnd });
    });
    
    const todayTotal = todayExpenses.reduce((sum, e) => sum + (e.usdt_amount || 0), 0);

    const prevMonthExpenses = expenses.filter(e => {
      const date = new Date(e.expense_date);
      const prevMonth = new Date();
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      return date.getMonth() === prevMonth.getMonth();
    });
    const prevTotal = prevMonthExpenses.reduce((sum, e) => sum + (e.usdt_amount || 0), 0);
    const changePercent = prevTotal > 0 ? ((totalExpense - prevTotal) / prevTotal * 100).toFixed(1) : 0;

    return { totalExpense, expenseCount, todayTotal, changePercent };
  };

  const metrics = calculateMetrics();
  const filteredExpenses = getFilteredExpenses();

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              开销记账
            </h1>
            <p className="text-slate-600 mt-2">追踪您的日常消费和预算</p>
          </div>

          <Tabs value={timeFilter} onValueChange={setTimeFilter}>
            <TabsList className="bg-white/80">
              <TabsTrigger value="month">本月</TabsTrigger>
              <TabsTrigger value="year">本年</TabsTrigger>
              <TabsTrigger value="all">全部</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ExpenseStatCard
            title="总开销（USDT）"
            value={`${metrics.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`}
            icon={Wallet}
            color="emerald"
            trend={metrics.changePercent}
            loading={loading}
          />
          <ExpenseStatCard
            title="消费笔数"
            value={metrics.expenseCount}
            description="本期记录"
            icon={TrendingDown}
            color="blue"
            loading={loading}
          />
          <ExpenseStatCard
            title="当天开销（USDT）"
            value={`${metrics.todayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`}
            description={`今日 ${format(new Date(), 'MM-dd')}`}
            icon={Calendar}
            color="purple"
            loading={loading}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                消费趋势（USDT）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseChart expenses={filteredExpenses} loading={loading} />
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-green-600" />
                分类占比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryBreakdown expenses={filteredExpenses} categories={categories} loading={loading} />
            </CardContent>
          </Card>
        </div>

        <RecentExpenses expenses={filteredExpenses.slice(0, 10)} loading={loading} onRefresh={loadData} />
      </div>
    </div>
  );
}