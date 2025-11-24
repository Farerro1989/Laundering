import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

const PAYMENT_METHODS = ["现金", "银行卡", "支付宝", "微信", "信用卡", "其他"];

export default function ExpenseFilters({ filters, onFiltersChange, categories }) {
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
        <Select 
          value={filters.category} 
          onValueChange={(value) => handleFilterChange('category', value)}
        >
          <SelectTrigger className="w-32 bg-white/80">
            <SelectValue placeholder="分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Select 
        value={filters.paymentMethod} 
        onValueChange={(value) => handleFilterChange('paymentMethod', value)}
      >
        <SelectTrigger className="w-32 bg-white/80">
          <SelectValue placeholder="支付方式" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部方式</SelectItem>
          {PAYMENT_METHODS.map((method) => (
            <SelectItem key={method} value={method}>
              {method}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}