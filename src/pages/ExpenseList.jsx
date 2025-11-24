import React, { useState, useEffect } from "react";
import { Expense } from "@/entities/Expense";
import { ExpenseCategory } from "@/entities/ExpenseCategory";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";

import ExpenseForm from "../components/expense/ExpenseForm";
import ExpenseTable from "../components/expense/ExpenseTable";
import ExpenseFilters from "../components/expense/ExpenseFilters";

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    paymentMethod: "all"
  });

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

  const handleSubmit = async (expenseData) => {
    try {
      if (editingExpense) {
        await Expense.update(editingExpense.id, expenseData);
      } else {
        await Expense.create(expenseData);
      }
      setShowForm(false);
      setEditingExpense(null);
      loadData();
    } catch (error) {
      console.error("保存开销失败:", error);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (expenseId) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    
    try {
      await Expense.delete(expenseId);
      loadData();
    } catch (error) {
      console.error("删除开销失败:", error);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filters.category === "all" || expense.category === filters.category;
    const matchesPayment = filters.paymentMethod === "all" || expense.payment_method === filters.paymentMethod;
    
    return matchesSearch && matchesCategory && matchesPayment;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              开销列表
            </h1>
            <p className="text-slate-600 mt-1">管理您的所有开销记录</p>
          </div>
          
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            新增开销
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ExpenseForm
                expense={editingExpense}
                categories={categories}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingExpense(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="搜索开销..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80"
              />
            </div>
            <ExpenseFilters filters={filters} onFiltersChange={setFilters} categories={categories} />
          </div>

          <ExpenseTable 
            expenses={filteredExpenses}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}