
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, UserCog, UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

import PermissionsForm from "../components/users/PermissionsForm";
import UserList from "../components/users/UserList";
import InviteUserForm from "../components/users/InviteUserForm";
import { inviteUser } from "@/functions/inviteUser";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showPermissionsForm, setShowPermissionsForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const allUsers = await User.list();
      setUsers(allUsers);
    } catch (error) {
      console.error("加载用户失败:", error);
      toast({ title: "错误", description: "加载用户列表失败。", variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleEditPermissions = (user) => {
    setEditingUser(user);
    setShowPermissionsForm(true);
  };

  const handleSavePermissions = useCallback(async (userId, permissions) => {
    try {
      await User.update(userId, { permissions });
      setShowPermissionsForm(false);
      setEditingUser(null);
      loadUsers();
      toast({ title: "成功", description: "用户权限已更新。" });
    } catch (error) {
      console.error("更新权限失败:", error);
      toast({ title: "错误", description: "更新权限失败。", variant: "destructive" });
    }
  }, [loadUsers, toast]);

  const handleInviteUser = useCallback(async (inviteData) => {
    setIsSendingInvite(true);
    try {
      const response = await inviteUser(inviteData);
      
      if (response.data.success) {
        setShowInviteForm(false);
        loadUsers();
        toast({ 
          title: "邀请成功", 
          description: response.data.message 
        });
      } else {
        throw new Error(response.data.error || '邀请失败');
      }
    } catch (error) {
      console.error("邀请用户失败:", error);
      toast({ 
        title: "邀请失败", 
        description: error.message || error.response?.data?.error || '未知错误',
        variant: "destructive" 
      });
    }
    setIsSendingInvite(false);
  }, [loadUsers, toast]);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              用户管理
            </h1>
            <p className="text-slate-600 mt-2">管理团队成员的账户和系统访问权限</p>
          </div>
          <Button onClick={() => setShowInviteForm(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            创建新用户
          </Button>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle>用户列表</CardTitle>
          </CardHeader>
          <CardContent>
            <UserList 
              users={users} 
              loading={loading}
              onEditPermissions={handleEditPermissions} 
            />
          </CardContent>
        </Card>

        {showPermissionsForm && editingUser && (
          <PermissionsForm
            user={editingUser}
            onSave={handleSavePermissions}
            onCancel={() => setShowPermissionsForm(false)}
          />
        )}

        {showInviteForm && (
          <InviteUserForm
            onInvite={handleInviteUser}
            onCancel={() => setShowInviteForm(false)}
            isSending={isSendingInvite}
          />
        )}
      </div>
    </div>
  );
}
