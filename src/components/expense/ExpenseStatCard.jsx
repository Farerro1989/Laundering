import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

const colorVariants = {
  emerald: {
    bg: "bg-gradient-to-br from-emerald-50 to-green-50",
    border: "border-emerald-200",
    iconBg: "bg-gradient-to-r from-emerald-500 to-green-500",
    text: "text-emerald-600"
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50", 
    border: "border-blue-200",
    iconBg: "bg-gradient-to-r from-blue-500 to-indigo-500",
    text: "text-blue-600"
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-50 to-violet-50",
    border: "border-purple-200",
    iconBg: "bg-gradient-to-r from-purple-500 to-violet-500", 
    text: "text-purple-600"
  },
  red: {
    bg: "bg-gradient-to-br from-red-50 to-rose-50",
    border: "border-red-200",
    iconBg: "bg-gradient-to-r from-red-500 to-rose-500",
    text: "text-red-600"
  }
};

export default function ExpenseStatCard({ title, value, description, icon: Icon, color = "emerald", trend, loading = false }) {
  const variant = colorVariants[color];

  return (
    <Card className={`${variant.bg} ${variant.border} border shadow-lg hover:shadow-xl transition-all duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-600 truncate">{title}</p>
            {loading ? (
              <>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-16" />
              </>
            ) : (
              <>
                <p className={`text-2xl font-bold ${variant.text}`}>{value}</p>
                {description && (
                  <p className="text-xs text-slate-500">{description}</p>
                )}
                {trend && parseFloat(trend) !== 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    {parseFloat(trend) > 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-red-500" />
                        <span className="text-red-600">+{trend}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">{trend}%</span>
                      </>
                    )}
                    <span className="text-slate-500">vs 上月</span>
                  </div>
                )}
              </>
            )}
          </div>
          <div className={`p-3 rounded-xl ${variant.iconBg} shadow-lg ml-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}