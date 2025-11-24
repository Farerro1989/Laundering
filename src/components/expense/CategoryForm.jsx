import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save } from "lucide-react";

const ICON_OPTIONS = ["🍜", "🚗", "🛍️", "🎮", "💊", "🏠", "📚", "💰", "✈️", "🎬", "⚡", "🎨"];
const COLOR_OPTIONS = [
  "#ef4444", "#f59e0b", "#10b981", "#3b82f6", 
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
];

export default function CategoryForm({ category, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(category || {
    name: "",
    icon: "💰",
    color: "#3b82f6",
    budget_limit: 0,
    description: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-slate-900">
          {category ? '编辑分类' : '新增分类'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">分类名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="bg-white/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget_limit">预算上限</Label>
              <Input
                id="budget_limit"
                type="number"
                step="0.01"
                value={formData.budget_limit}
                onChange={(e) => handleChange('budget_limit', parseFloat(e.target.value) || 0)}
                className="bg-white/80"
              />
            </div>

            <div className="space-y-2">
              <Label>图标</Label>
              <div className="grid grid-cols-6 gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => handleChange('icon', icon)}
                    className={`p-2 text-2xl rounded-lg border-2 transition-all ${
                      formData.icon === icon 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>颜色</Label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleChange('color', color)}
                    className={`h-10 rounded-lg border-2 transition-all ${
                      formData.color === color 
                        ? 'border-slate-900 scale-110' 
                        : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="bg-white/80"
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