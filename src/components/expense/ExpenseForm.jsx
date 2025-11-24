import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";

const PAYMENT_METHODS = ["现金", "银行卡", "支付宝", "微信", "信用卡", "其他"];
const CURRENCIES = ["EUR欧元", "MYR马币", "USD美元"];

export default function ExpenseForm({ expense, categories, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(expense || {
    title: "",
    quantity: 1,
    amount: 0,
    currency: "USD美元",
    exchange_rate: 1.0,
    usdt_amount: 0,
    category: "",
    expense_date: format(new Date(), "yyyy-MM-dd"),
    payment_method: "现金",
    description: ""
  });
  
  const [loadingRate, setLoadingRate] = useState(false);

  const fetchExchangeRate = useCallback(async () => {
    if (!formData.currency || formData.amount <= 0) return;
    
    setLoadingRate(true);
    try {
      const response = await base44.functions.invoke('getExpenseExchangeRate', { 
        currency: formData.currency 
      });
      if (response.data && response.data.rate) {
        const rate = response.data.rate;
        const baseUsdt = formData.amount * rate * (formData.quantity || 1);
        const finalUsdt = baseUsdt * 1.01;
        
        setFormData(prev => ({
          ...prev,
          exchange_rate: rate,
          usdt_amount: finalUsdt
        }));
      }
    } catch (error) {
      console.error('获取汇率失败:', error);
      const fallbackRates = { 'EUR欧元': 1.1, 'USD美元': 1.0, 'MYR马币': 0.22 };
      const rate = fallbackRates[formData.currency] || 1.0;
      const baseUsdt = formData.amount * rate * (formData.quantity || 1);
      const finalUsdt = baseUsdt * 1.01;
      
      setFormData(prev => ({
        ...prev,
        exchange_rate: rate,
        usdt_amount: finalUsdt
      }));
    }
    setLoadingRate(false);
  }, [formData.currency, formData.amount, formData.quantity]);

  useEffect(() => {
    if (formData.currency && formData.amount > 0) {
      fetchExchangeRate();
    }
  }, [formData.currency, formData.amount, formData.quantity, fetchExchangeRate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if ((field === 'amount' || field === 'quantity') && updated.exchange_rate) {
        const baseUsdt = (updated.amount || 0) * updated.exchange_rate * (updated.quantity || 1);
        updated.usdt_amount = baseUsdt * 1.01;
      }
      
      return updated;
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-slate-900">
          {expense ? '编辑开销' : '新增开销'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                className="bg-white/80"
                placeholder="例如：午餐外卖"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">数量 *</Label>
              <Input
                id="quantity"
                type="number"
                step="1"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
                required
                className="bg-white/80"
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label>币种 *</Label>
              <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
                <SelectTrigger className="bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">单价 *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                required
                className="bg-white/80"
              />
            </div>

            <div className="space-y-2">
              <Label>汇率（自动获取）</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.exchange_rate?.toFixed(4) || '0.0000'}
                  readOnly
                  className="bg-slate-50"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={fetchExchangeRate}
                  disabled={loadingRate}
                >
                  <RefreshCw className={`w-4 h-4 ${loadingRate ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>USDT金额</Label>
              <Input
                value={`${formData.usdt_amount?.toFixed(2) || '0.00'} USDT`}
                readOnly
                className="bg-emerald-50 font-bold text-emerald-700"
              />
            </div>

            <div className="space-y-2">
              <Label>分类 *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger className="bg-white/80">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense_date">日期 *</Label>
              <Input
                id="expense_date"
                type="date"
                value={formData.expense_date}
                onChange={(e) => handleChange('expense_date', e.target.value)}
                required
                className="bg-white/80"
              />
            </div>

            <div className="space-y-2">
              <Label>支付方式</Label>
              <Select value={formData.payment_method} onValueChange={(value) => handleChange('payment_method', value)}>
                <SelectTrigger className="bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label htmlFor="description">备注说明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="bg-white/80"
                placeholder="添加详细说明..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}