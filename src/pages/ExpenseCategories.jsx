import React, { useState, useEffect } from "react";
import { ExpenseCategory } from "@/entities/ExpenseCategory";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import CategoryForm from "../components/expense/CategoryForm";
import CategoryGrid from "../components/expense/CategoryGrid";

export default function ExpenseCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await ExpenseCategory.list();
      setCategories(data);
    } catch (error) {
      console.error("加载分类失败:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (categoryData) => {
    try {
      if (editingCategory) {
        await ExpenseCategory.update(editingCategory.id, categoryData);
      } else {
        await ExpenseCategory.create(categoryData);
      }
      setShowForm(false);
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      console.error("保存分类失败:", error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    try {
      await ExpenseCategory.delete(categoryId);
      loadCategories();
    } catch (error) {
      console.error("删除分类失败:", error);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              分类管理
            </h1>
            <p className="text-slate-600 mt-1">管理您的开销分类</p>
          </div>
          
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            新增分类
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CategoryForm
                category={editingCategory}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <CategoryGrid 
          categories={categories}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}