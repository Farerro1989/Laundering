import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  Upload, 
  Database, 
  Shield, 
  Calendar, 
  FileDown,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Trash2 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { backupData } from "@/functions/backupData";
import { restoreData } from "@/functions/restoreData";
import { deleteAllTransactions } from "@/functions/deleteAllTransactions";

export default function DataBackup() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); 

  const handleBackup = async () => {
    setIsBackingUp(true);
    setMessage(null);
    
    try {
      const response = await backupData();
      
      if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `优汇金融_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        setMessage({
          type: 'success',
          text: '备份文件已生成并下载！'
        });
      } else {
        throw new Error('备份失败');
      }
    } catch (error) {
      console.error("备份失败:", error);
      setMessage({
        type: 'error',
        text: `备份失败：${error.message || '请检查权限或联系管理员'}`
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      setMessage({
        type: 'error',
        text: '请先选择备份文件'
      });
      return;
    }

    setIsRestoring(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('backupFile', selectedFile);

      const response = await restoreData(formData);

      if (response.status === 200 && response.data.success) {
        setMessage({
          type: 'success',
          text: `数据恢复成功！恢复了 ${response.data.restored_count} 条交易记录`
        });
        setSelectedFile(null);
        // 清空文件输入
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        const errorMsg = response.data?.error || response.data?.details || '恢复失败';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("恢复失败:", error);
      setMessage({
        type: 'error',
        text: `恢复失败：${error.message || error}`
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClearAllData = async () => {
    setIsDeleting(true);
    setMessage(null);
    try {
        const response = await deleteAllTransactions();
        
        if (response.status === 200 && response.data.success) {
            setMessage({
                type: 'success',
                text: response.data.message || '所有交易数据已成功清空。'
            });
        } else {
            const errorMessage = response.data?.error || response.data?.message || '未知错误，请检查服务器日志。';
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error("清空数据失败:", error);
        setMessage({
            type: 'error',
            text: `清空失败: ${error.message}`
        });
    } finally {
        setIsDeleting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 检查文件类型
      const validTypes = ['application/json', 'text/json'];
      const validExtensions = ['.json'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (validTypes.includes(file.type) || validExtensions.includes(fileExtension)) {
        setSelectedFile(file);
        setMessage({
          type: 'success', 
          text: `已选择文件：${file.name}`
        });
      } else {
        setMessage({
          type: 'error',
          text: '请选择有效的JSON备份文件（.json格式）'
        });
        e.target.value = ''; // 清空输入
        setSelectedFile(null);
      }
    } else {
      setSelectedFile(null);
      setMessage(null);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            数据备份管理
          </h1>
          <p className="text-slate-600 mt-2">保护您的重要业务数据，支持备份和恢复功能</p>
        </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'error' ? 
              <AlertTriangle className="h-4 w-4" /> : 
              <CheckCircle className="h-4 w-4" />
            }
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* 创建备份 */}
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-blue-600" />
                创建数据备份
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-600 space-y-2">
                <p>• 备份所有交易记录和用户数据</p>
                <p>• 包含完整的系统配置信息</p>
                <p>• 生成带时间戳的JSON文件</p>
                <p>• 建议定期备份重要数据</p>
              </div>
              
              <Button 
                onClick={handleBackup}
                disabled={isBackingUp}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isBackingUp ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    正在备份...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    立即备份
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 恢复备份 */}
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-600" />
                恢复数据备份
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-yellow-50 border-yellow-200">
                <Shield className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>注意：</strong>恢复备份将会向系统中添加备份文件中的所有数据。系统会自动过滤重复数据。
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="backup-file">选择备份文件 (.json)</Label>
                <Input
                  id="backup-file"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="mt-2"
                />
                {selectedFile && (
                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-green-800">
                      ✓ 已选择：{selectedFile.name}
                    </p>
                    <p className="text-xs text-green-600">
                      文件大小：{(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleRestore}
                disabled={isRestoring || !selectedFile}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    正在恢复...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    恢复备份
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* 危险操作区域 */}
        <Card className="bg-red-50 border border-red-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              危险操作
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-800">
              此操作将永久删除系统中的 <strong>所有</strong> 交易记录，并且 <strong>无法恢复</strong>。请在执行前确认您已完成数据备份。
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  className="w-full"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />正在清空...</>
                  ) : (
                    <><Trash2 className="w-4 h-4 mr-2" />清空所有交易数据</>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>您确定要继续吗？</AlertDialogTitle>
                  <AlertDialogDescription>
                    这将永久删除系统中的所有交易记录。此操作不可撤销。
                    <br/><br/>
                    <strong>请再次确认，您真的要清空所有数据吗？</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleClearAllData}
                  >
                    我确定，清空所有数据
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* 备份建议 */}
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              备份建议与最佳实践
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">定期备份计划</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• <strong>每日备份：</strong>营业结束后进行备份</li>
                  <li>• <strong>每周备份：</strong>周末创建完整备份</li>
                  <li>• <strong>月末备份：</strong>财务结算前备份</li>
                  <li>• <strong>重要操作前：</strong>大量数据变更前备份</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">恢复注意事项</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• 只支持本系统生成的JSON备份文件</li>
                  <li>• 系统会自动验证数据完整性</li>
                  <li>• 分批处理大量数据，确保稳定性</li>
                  <li>• 恢复前建议先创建当前数据备份</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}