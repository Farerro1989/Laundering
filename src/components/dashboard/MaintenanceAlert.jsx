import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MaintenanceAlert({ transactions }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 今天到期的交易
  const expiringToday = transactions.filter(t => {
    if (!t.maintenance_end_date) return false;
    const endDate = new Date(t.maintenance_end_date);
    endDate.setHours(0, 0, 0, 0);
    return endDate.getTime() === today.getTime();
  });
  
  // 3天内到期的交易
  const expiringSoon = transactions.filter(t => {
    if (!t.maintenance_end_date) return false;
    const endDate = new Date(t.maintenance_end_date);
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 3;
  });
  
  // 已过期但未完成的交易
  const expired = transactions.filter(t => {
    if (!t.maintenance_end_date) return false;
    if (t.fund_status === '已完成交易') return false;
    const endDate = new Date(t.maintenance_end_date);
    return endDate < today;
  });

  if (expiringToday.length === 0 && expiringSoon.length === 0 && expired.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-orange-600" />
          维护期提醒
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {expiringToday.length > 0 && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <p className="font-semibold text-red-900 mb-2">🔴 今天到期的交易 ({expiringToday.length}笔)</p>
              <div className="space-y-1">
                {expiringToday.map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="font-mono text-xs">
                      {t.transaction_number}
                    </Badge>
                    <span className="text-red-800">{t.customer_name}</span>
                    <span className="text-red-600">- {t.deposit_amount} {t.currency}</span>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {expiringSoon.length > 0 && (
          <Alert className="bg-orange-50 border-orange-200">
            <Clock className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <p className="font-semibold text-orange-900 mb-2">🟠 即将到期的交易 ({expiringSoon.length}笔)</p>
              <div className="space-y-1">
                {expiringSoon.map(t => {
                  const endDate = new Date(t.maintenance_end_date);
                  const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={t.id} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="font-mono text-xs">
                        {t.transaction_number}
                      </Badge>
                      <span className="text-orange-800">{t.customer_name}</span>
                      <span className="text-orange-600">- {daysLeft}天后到期</span>
                    </div>
                  );
                })}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {expired.length > 0 && (
          <Alert className="bg-gray-50 border-gray-200">
            <AlertCircle className="h-4 w-4 text-gray-600" />
            <AlertDescription>
              <p className="font-semibold text-gray-900 mb-2">⚫ 已过期未完成 ({expired.length}笔)</p>
              <div className="space-y-1">
                {expired.slice(0, 5).map(t => {
                  const endDate = new Date(t.maintenance_end_date);
                  const daysOverdue = Math.ceil((today - endDate) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={t.id} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="font-mono text-xs">
                        {t.transaction_number}
                      </Badge>
                      <span className="text-gray-800">{t.customer_name}</span>
                      <span className="text-gray-600">- 已过期{daysOverdue}天</span>
                    </div>
                  );
                })}
                {expired.length > 5 && (
                  <p className="text-xs text-gray-500 mt-2">还有 {expired.length - 5} 笔...</p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}