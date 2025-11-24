
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

const CURRENCIES = [
  "USD美元", "EUR欧元", "SGD新元", "MYR马币", "AUD澳币", 
  "CHF瑞郎", "THB泰铢", "VND越南盾", "GBP英镑", "CAD加元", "HKD港币", "KRW韩币"
];

const FUND_STATUSES = [
  "等待中", "已退回", "已到账", "承兑中", "已完成交易", 
  "风控调解中", "冻结（正在处理）", "冻结（不能处理）"
];

export default function TransactionFilters({ filters, onFiltersChange }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="flex gap-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-32 bg-white/80">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            {FUND_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Select value={filters.currency} onValueChange={(value) => handleFilterChange('currency', value)}>
        <SelectTrigger className="w-32 bg-white/80">
          <SelectValue placeholder="币种" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部币种</SelectItem>
          {CURRENCIES.map((currency) => (
            <SelectItem key={currency} value={currency}>
              {currency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
