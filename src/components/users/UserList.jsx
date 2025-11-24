import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings } from "lucide-react";
import { format } from "date-fns";

export default function UserList({ users, loading, onEditPermissions }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>暂无用户数据</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>用户信息</TableHead>
            <TableHead>角色</TableHead>
            <TableHead>权限</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-slate-50/50">
              <TableCell>
                <div>
                  <p className="font-medium text-slate-900">{user.full_name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role === 'admin' ? '管理员' : '用户'}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="text-xs space-y-1">
                  {user.role === 'admin' ? (
                    <Badge className="bg-green-100 text-green-800">全部权限</Badge>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {user.permissions?.can_view_profit_data && (
                        <Badge variant="outline" className="text-xs">盈利数据</Badge>
                      )}
                      {user.permissions?.can_edit_transactions && (
                        <Badge variant="outline" className="text-xs">编辑交易</Badge>
                      )}
                      {user.permissions?.can_manage_users && (
                        <Badge variant="outline" className="text-xs">用户管理</Badge>
                      )}
                      {(!user.permissions || Object.keys(user.permissions).length === 0) && (
                        <span className="text-slate-400">无特殊权限</span>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-sm text-slate-600">
                {user.created_date ? format(new Date(user.created_date), "yyyy-MM-dd") : '-'}
              </TableCell>

              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditPermissions(user)}
                  className="hover:bg-blue-50 hover:text-blue-600"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  设置权限
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}