import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function ExpenseTable({ expenses, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>暂无开销记录</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>标题</TableHead>
            <TableHead>数量</TableHead>
            <TableHead>分类</TableHead>
            <TableHead>原始金额</TableHead>
            <TableHead>USDT金额</TableHead>
            <TableHead>日期</TableHead>
            <TableHead>支付方式</TableHead>
            <TableHead>备注</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id} className="hover:bg-slate-50/50">
              <TableCell className="font-medium">{expense.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  x{expense.quantity || 1}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {expense.category}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-slate-600">
                {expense.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {expense.currency?.substring(0, 3)}
                {expense.quantity > 1 && <div className="text-xs text-slate-500">单价 × {expense.quantity}</div>}
              </TableCell>
              <TableCell className="font-mono font-bold text-emerald-600">
                {expense.usdt_amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {format(new Date(expense.expense_date), "yyyy-MM-dd")}
              </TableCell>
              <TableCell className="text-sm">{expense.payment_method}</TableCell>
              <TableCell className="text-sm text-slate-600 max-w-xs truncate">
                {expense.description || '-'}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(expense)}
                    className="hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(expense.id)}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}