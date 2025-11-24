import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // 验证用户权限
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: '需要管理员权限' }, { status: 403 });
        }

        // 解析FormData
        const formData = await req.formData();
        const backupFile = formData.get('backupFile');
        
        if (!backupFile) {
            return Response.json({ error: '请选择备份文件' }, { status: 400 });
        }

        // 读取文件内容
        const fileContent = await backupFile.text();
        let backupData;
        
        try {
            backupData = JSON.parse(fileContent);
        } catch (error) {
            return Response.json({ error: '备份文件格式无效，请选择正确的JSON文件' }, { status: 400 });
        }

        // 验证备份数据结构
        if (!backupData.transactions || !Array.isArray(backupData.transactions)) {
            return Response.json({ error: '备份文件缺少交易数据或格式错误' }, { status: 400 });
        }

        let restoredCount = 0;
        let errors = [];

        // 恢复交易数据
        for (const transaction of backupData.transactions) {
            try {
                // 移除ID和创建时间，让系统重新生成
                const { id, created_date, updated_date, ...transactionData } = transaction;
                
                // 检查是否已存在相同的交易（通过客户名称、金额、日期判断）
                const existingTransactions = await base44.asServiceRole.entities.Transaction.filter({
                    customer_name: transactionData.customer_name,
                    deposit_amount: transactionData.deposit_amount,
                    deposit_date: transactionData.deposit_date
                });
                
                if (existingTransactions.length === 0) {
                    await base44.asServiceRole.entities.Transaction.create(transactionData);
                    restoredCount++;
                }
                // 如果已存在，跳过但不报错
                
            } catch (error) {
                console.error('恢复交易失败:', error, transaction);
                errors.push(`交易恢复失败: ${transaction.customer_name || 'Unknown'} - ${error.message}`);
            }
        }

        return Response.json({ 
            success: true, 
            restored_count: restoredCount,
            message: `成功恢复 ${restoredCount} 条交易记录${errors.length > 0 ? `，${errors.length} 条记录出现问题` : ''}`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error("恢复数据失败:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});