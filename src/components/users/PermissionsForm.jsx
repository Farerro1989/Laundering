import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Save } from "lucide-react";

const permissionDefinitions = [
  { 
    id: 'can_view_profit_data', 
    label: '查看盈利数据', 
    description: '允许访问仪表盘和分析页的核心财务指标。' 
  },
  { 
    id: 'can_view_commission_stats', 
    label: '查看佣金统计', 
    description: '允许查看佣金相关的统计数据。' 
  },
  { 
    id: 'can_edit_transactions', 
    label: '编辑入金数据', 
    description: '允许修改现有交易记录的详细信息。' 
  },
  { 
    id: 'can_delete_transactions', 
    label: '删除交易数据', 
    description: '允许删除交易记录，此操作风险较高。' 
  },
  { 
    id: 'can_manage_users', 
    label: '创建和管理用户', 
    description: '允许访问用户管理页面，邀请新用户并编辑其权限。' 
  },
];

export default function PermissionsForm({ user, onSave, onCancel }) {
  const [permissions, setPermissions] = useState(user.permissions || {});

  const handlePermissionChange = (permissionId, checked) => {
    setPermissions(prev => ({ ...prev, [permissionId]: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, permissions);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm animate-in fade-in-0 zoom-in-95">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  设置用户权限
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-slate-600">{user.full_name}</span>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? '管理员' : '用户'}
                  </Badge>
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {user.role === 'admin' ? (
              <div className="text-center py-8">
                <Badge className="bg-green-100 text-green-800 text-base px-4 py-2">
                  管理员拥有所有权限
                </Badge>
                <p className="text-sm text-slate-500 mt-2">
                  管理员账户自动拥有系统的全部访问权限，无需单独设置。
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-800">选择用户权限</h4>
                <div className="space-y-4">
                  {permissionDefinitions.map(permission => (
                    <div key={permission.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50">
                      <Checkbox
                        id={permission.id}
                        checked={!!permissions[permission.id]}
                        onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 leading-none flex-1">
                        <Label 
                          htmlFor={permission.id} 
                          className="text-sm font-medium cursor-pointer"
                        >
                          {permission.label}
                        </Label>
                        <p className="text-xs text-slate-600">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-3 bg-slate-50/50 py-4 px-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
            {user.role !== 'admin' && (
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                保存权限
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}