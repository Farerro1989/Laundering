import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Transaction } from "@/entities/Transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Filter } from "lucide-react";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, isValid, isWithinInterval } from "date-fns";

export default function ProfitDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const type = searchParams.get("type") || "profit"; // profit, commission, fee, exchange, penalty, frozen
  const timeFilter = searchParams.get("timeFilter") || "all";
  const year = searchParams.get("year");
  const quarter = searchParams.get("quarter");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await Transaction.list("-created_date", 10000); // Fetch enough data
        setTransactions(data);
      } catch (error) {
        console.error("Failed to load transactions", error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const getQuarterDates = (yearStr, quarterStr) => {
    const yearNum = parseInt(yearStr);
    switch (quarterStr) {
      case "Q1": return { start: new Date(yearNum, 0, 1), end: new Date(yearNum, 2, 31, 23, 59, 59) };
      case "Q2": return { start: new Date(yearNum, 3, 1), end: new Date(yearNum, 5, 30, 23, 59, 59) };
      case "Q3": return { start: new Date(yearNum, 6, 1), end: new Date(yearNum, 8, 30, 23, 59, 59) };
      case "Q4": return { start: new Date(yearNum, 9, 1), end: new Date(yearNum, 11, 31, 23, 59, 59) };
      default: return { start: new Date(), end: new Date() };
    }
  };

  const filteredTransactions = React.useMemo(() => {
    let filtered = transactions;

    // 1. Time Filter
    const now = new Date();
    if (timeFilter !== "all") {
      let interval = null;
      if (timeFilter === "today") {
        interval = { start: startOfDay(now), end: endOfDay(now) };
      } else if (timeFilter === "month") {
        interval = { start: startOfMonth(now), end: endOfMonth(now) };
      } else if (timeFilter === "quarter" && year && quarter) {
        interval = getQuarterDates(year, quarter);
      } else if (timeFilter === "year" && year) {
        interval = { start: startOfYear(new Date(parseInt(year), 0, 1)), end: endOfYear(new Date(parseInt(year), 0, 1)) };
      }

      if (interval) {
        filtered = filtered.filter(t => {
          const d = new Date(t.created_date);
          return isValid(d) && isWithinInterval(d, interval);
        });
      }
    }

    // 2. Type Filter Logic
    return filtered.filter(t => {
      const isCompleted = t.fund_status === '已完成交易';
      const isFrozen = t.fund_status === '冻结（不能处理）';
      const isReturned = t.fund_status === '已退回';
      const hasPenalty = (parseFloat(t.violation_penalty) || 0) > 0;

      switch (type) {
        case 'commission':
          return isCompleted && (parseFloat(t.commission_percentage) || 0) > 0;
        case 'fee':
          return isCompleted && (parseFloat(t.transfer_fee) || 0) > 0;
        case 'exchange':
          return isCompleted; // All completed have potential exchange profit
        case 'penalty':
          return hasPenalty; // Penalties apply to ALL statuses
        case 'frozen':
          return isFrozen;
        case 'profit':
        default:
          // Show Completed OR Penalty > 0
          return isCompleted || hasPenalty;
      }
    });
  }, [transactions, timeFilter, year, quarter, type]);

  const calculateRowData = (t) => {
    const deposit = parseFloat(t.deposit_amount) || 0;
    const rate = parseFloat(t.exchange_rate) || 1;
    const initialUsdt = rate > 0 ? deposit / rate : 0;
    
    const commPercent = parseFloat(t.commission_percentage) || 0;
    const commNative = deposit * (commPercent / 100);
    const commUsdt = rate > 0 ? commNative / rate : 0;

    const feeNative = parseFloat(t.transfer_fee) || 0;
    const feeUsdt = rate > 0 ? feeNative / rate : 0;

    const penaltyUsdt = parseFloat(t.violation_penalty) || 0;

    const acceptanceUsdt = parseFloat(t.acceptance_usdt) || 0;
    const netNative = deposit - feeNative - commNative;
    const settlementUsdt = rate > 0 ? netNative / rate : 0;
    const actualAcceptance = acceptanceUsdt > 0 ? acceptanceUsdt : initialUsdt; // Default to initial if 0 to show 0 profit
    // Fix: If actualAcceptance is taken from initial (because acceptance is 0), then profit is 0. 
    // If acceptance is explicitly entered, profit is acceptance - initial.
    // Dashboard logic: 
    // const actualAcceptance = acceptanceUsdt > 0 ? acceptanceUsdt : initialUsdt;
    // const exchangeProfit = actualAcceptance - initialUsdt;
    const exchangeProfit = actualAcceptance - initialUsdt;

    let totalProfit = 0;
    if (t.fund_status === '已完成交易') {
      totalProfit = commUsdt + feeUsdt + exchangeProfit + penaltyUsdt;
    } else {
      totalProfit = penaltyUsdt; // Only penalty counts for non-completed
    }

    return {
      commUsdt,
      feeUsdt,
      exchangeProfit,
      penaltyUsdt,
      totalProfit,
      initialUsdt,
      actualAcceptance
    };
  };

  const getTitle = () => {
    const timeLabel = timeFilter === 'today' ? '今日' : 
                      timeFilter === 'month' ? '本月' :
                      timeFilter === 'quarter' ? `${year} ${quarter}` :
                      timeFilter === 'year' ? `${year}年` : '全部';
    
    switch (type) {
      case 'commission': return `佣金收入明细 (${timeLabel})`;
      case 'fee': return `手续费收入明细 (${timeLabel})`;
      case 'exchange': return `汇率差盈亏明细 (${timeLabel})`;
      case 'penalty': return `违规罚金明细 (${timeLabel})`;
      case 'frozen': return `冻结资金明细 (${timeLabel})`;
      default: return `盈利总览明细 (${timeLabel})`;
    }
  };

  const formatMoney = (val) => val?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00';

  const totalSum = React.useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      const data = calculateRowData(t);
      if (type === 'commission') return acc + data.commUsdt;
      if (type === 'fee') return acc + data.feeUsdt;
      if (type === 'exchange') return acc + data.exchangeProfit;
      if (type === 'penalty') return acc + data.penaltyUsdt;
      if (type === 'frozen') return acc + (t.fund_status === '冻结（不能处理）' ? data.initialUsdt : 0);
      return acc + data.totalProfit;
    }, 0);
  }, [filteredTransactions, type]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{getTitle()}</h1>
              <p className="text-slate-500">共 {filteredTransactions.length} 笔交易</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">合计金额</p>
            <p className={`text-2xl font-bold ${totalSum >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
              {formatMoney(totalSum)} USDT
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              交易列表
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>交易日期</TableHead>
                    <TableHead>客户/单号</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">查收金额</TableHead>
                    
                    {(type === 'profit' || type === 'commission') && <TableHead className="text-right">佣金(USDT)</TableHead>}
                    {(type === 'profit' || type === 'fee') && <TableHead className="text-right">手续费(USDT)</TableHead>}
                    {(type === 'profit' || type === 'exchange') && <TableHead className="text-right">汇率盈亏(USDT)</TableHead>}
                    {(type === 'profit' || type === 'penalty') && <TableHead className="text-right">罚金(USDT)</TableHead>}
                    
                    {type === 'frozen' && <TableHead className="text-right">冻结金额(USDT)</TableHead>}
                    
                    {(type === 'profit') && <TableHead className="text-right font-bold">总盈利</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">加载中...</TableCell>
                    </TableRow>
                  ) : filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">无相关数据</TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((t) => {
                      const data = calculateRowData(t);
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="font-mono text-xs">
                            <div>{t.created_date?.split('T')[0]}</div>
                            <div className="text-slate-400">{t.created_date?.split('T')[1]?.substring(0,5)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{t.customer_name}</div>
                            <div className="text-xs text-slate-500">{t.transaction_number}</div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              t.fund_status === '已完成交易' ? 'bg-green-100 text-green-700' :
                              t.fund_status === '冻结（不能处理）' ? 'bg-slate-100 text-slate-700' :
                              t.fund_status === '已退回' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {t.fund_status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div>{formatMoney(t.deposit_amount)} <span className="text-xs text-slate-500">{t.currency?.substring(0,3)}</span></div>
                            <div className="text-xs text-slate-400">汇率: {t.exchange_rate}</div>
                          </TableCell>

                          {(type === 'profit' || type === 'commission') && (
                            <TableCell className="text-right font-mono">
                              {t.fund_status === '已完成交易' ? formatMoney(data.commUsdt) : '-'}
                              {type === 'commission' && <div className="text-xs text-slate-400">{t.commission_percentage}%</div>}
                            </TableCell>
                          )}
                          
                          {(type === 'profit' || type === 'fee') && (
                            <TableCell className="text-right font-mono">
                              {t.fund_status === '已完成交易' ? formatMoney(data.feeUsdt) : '-'}
                            </TableCell>
                          )}
                          
                          {(type === 'profit' || type === 'exchange') && (
                            <TableCell className={`text-right font-mono ${data.exchangeProfit < 0 ? 'text-red-500' : 'text-green-600'}`}>
                              {t.fund_status === '已完成交易' ? formatMoney(data.exchangeProfit) : '-'}
                              {type === 'exchange' && (
                                <div className="text-xs text-slate-400" title="实际承兑 - 初始USDT">
                                  {formatMoney(data.actualAcceptance)} - {formatMoney(data.initialUsdt)}
                                </div>
                              )}
                            </TableCell>
                          )}
                          
                          {(type === 'profit' || type === 'penalty') && (
                            <TableCell className="text-right font-mono text-red-600">
                              {data.penaltyUsdt > 0 ? `+${formatMoney(data.penaltyUsdt)}` : '-'}
                            </TableCell>
                          )}

                          {type === 'frozen' && (
                            <TableCell className="text-right font-mono">
                              {formatMoney(data.initialUsdt)}
                            </TableCell>
                          )}
                          
                          {(type === 'profit') && (
                            <TableCell className={`text-right font-bold font-mono ${data.totalProfit < 0 ? 'text-red-600' : 'text-indigo-600'}`}>
                              {formatMoney(data.totalProfit)}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}