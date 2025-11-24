import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2 } from "lucide-react";

export default function CategoryGrid({ categories, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>暂无分类</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Card 
          key={category.id} 
          className="bg-white/80 backdrop-blur-sm border-2 hover:shadow-lg transition-all duration-300"
          style={{ borderColor: category.color }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md"
                style={{ backgroundColor: category.color + '20' }}
              >
                {category.icon}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(category)}
                  className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(category.id)}
                  className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg mb-2">{category.name}</CardTitle>
            {category.budget_limit > 0 && (
              <p className="text-sm text-slate-600 mb-2">
                预算: ¥{category.budget_limit?.toLocaleString()}
              </p>
            )}
            {category.description && (
              <p className="text-xs text-slate-500 line-clamp-2">
                {category.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}