import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Transaction } from "@/entities/Transaction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, CreditCard, Wallet, DollarSign } from "lucide-react";
import TransactionList from "@/components/transactions/TransactionList";
import TransactionChart from "@/components/dashboard/TransactionChart";
import StatCard from "@/components/dashboard/StatCard";

export default function AccountDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const companyName = searchParams.get("company");
  const filterCurrency = searchParams.get("currency");
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const allTransactions = await Transaction.list("-created_date");
        // Filter by company name
        const filtered = allTransactions.filter(t => 
          t.receiving_account_name === companyName
        );
        setTransactions(filtered);
      } catch (error) {
        console.error("加载交易失败:", error);
      }
      setLoading(false);
    };

    if (companyName) {
      loadData();
    }
  }, [companyName]);

  const metrics = useMemo(() => {
    const filtered = filterCurrency 
      ? transactions.filter(t => t.currency?.includes(filterCurrency))
      : transactions;

    const totalAmount = filtered.reduce((sum, t) => sum + (t.deposit_amount || 0), 0);
    const totalCount = filtered.length;
    
    const byCurrency = filtered.reduce((acc, t) => {
      const curr = t.currency?.substring(0, 3) || 'Other';
      if (!acc[curr]) acc[curr] = 0;
      acc[curr] += (t.deposit_amount || 0);
      return acc;
    }, {});

    const byStatus = filtered.reduce((acc, t) => {
        const status = t.fund_status || 'Unknown';
        if (!acc[status]) acc[status] = 0;
        acc[status] += 1;
        return acc;
    }, {});

    return { totalAmount, totalCount, byCurrency, byStatus, filteredList: filtered };
  }, [transactions, filterCurrency]);

  const handleBack = () => {
    navigate(-1);
  };

  if (!companyName) {
    return <div className="p-8">参数错误: 缺少公司名称</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="hover:bg-white/50">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回仪表盘
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {companyName}
            </h1>
            <p className="text-sm text-slate-500">
              {filterCurrency ? `${filterCurrency} 账户详情` : "公司账户总览"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
                title="总入金金额"
                value={metrics.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                description={filterCurrency ? `${filterCurrency} 累计` : "所有币种折算参考"}
                icon={DollarSign}
                color="green"
                loading={loading}
            />
            <StatCard
                title="总交易笔数"
                value={metrics.totalCount}
                description="累计交易次数"
                icon={CreditCard}
                color="blue"
                loading={loading}
            />
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">资金状态分布</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {Object.entries(metrics.byStatus).slice(0, 3).map(([status, count]) => (
                            <div key={status} className="flex justify-between text-sm">
                                <span>{status}</span>
                                <span className="font-bold">{count}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <TransactionChart transactions={metrics.filteredList} loading={loading} />
            </div>
            <div className="space-y-6">
                 <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-indigo-600" />
                            币种分布
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(metrics.byCurrency).map(([curr, amount]) => (
                                <div key={curr} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="font-bold text-slate-700">{curr}</div>
                                    <div className="text-emerald-600 font-mono">
                                        {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                 </Card>
            </div>
        </div>

        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">交易流水</h2>
            <TransactionList 
                transactions={metrics.filteredList} 
                loading={loading}
                // Pass empty handlers if modification is not main purpose here, or implement if needed
                onDelete={() => {}} 
                onUpdate={() => {}}
            />
        </div>
      </div>
    </div>
  );
}