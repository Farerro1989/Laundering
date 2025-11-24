import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Send, Loader2 } from "lucide-react";

const permissionDefinitions = [
  { id: 'can_view_profit_data', label: '查看盈利数据', description: '允许访问仪表盘和分析页的核心财务指标。' },
  { id: 'can_edit_transactions', label: '编辑入金数据', description: '允许修改现有交易记录的详细信息。' },
  { id: 'can_delete_transactions', label: '删除交易数据', description: '允许删除交易记录，此操作风险较高。' },
  { id: 'can_manage_users', label: '创建和管理用户', description: '允许访问用户管理页面，邀请新用户并编辑其权限。' },
];

export default function InviteUserForm({ onInvite, onCancel, isSending }) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('user');
  const [permissions, setPermissions] = useState({
    can_view_profit_data: true,
    can_edit_transactions: true,
    can_delete_transactions: false,
    can_manage_users: false,
  });

  const handlePermissionChange = (permissionId, checked) => {
    setPermissions(prev => ({ ...prev, [permissionId]: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const inviteData = { email, full_name: fullName, role };
    if (role === 'user') {
      inviteData.permissions = permissions;
    }
    onInvite(inviteData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm animate-in fade-in-0 zoom-in-95">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">邀请新用户</CardTitle>
            <p className="text-sm text-slate-500">被邀请者将收到一封包含注册链接的邮件。</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">姓名</Label>
                <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱地址</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">角色</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">用户</SelectItem>
                  <SelectItem value="admin">管理员 (拥有所有权限)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {role === 'user' && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold text-slate-800">设置用户权限</h4>
                <div className="space-y-4">
                  {permissionDefinitions.map(p => (
                    <div key={p.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-slate-50">
                      <Checkbox
                        id={`invite-${p.id}`}
                        checked={!!permissions[p.id]}
                        onCheckedChange={(checked) => handlePermissionChange(p.id, checked)}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor={`invite-${p.id}`}>{p.label}</Label>
                        <p className="text-sm text-slate-600">{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-3 bg-slate-50/50 py-4 px-6">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSending}>取消</Button>
            <Button type="submit" disabled={isSending}>
              {isSending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />发送中...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" />发送邀请</>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}