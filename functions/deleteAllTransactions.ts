import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // 验证用户权限 - 只有管理员才能删除所有数据
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ 
                success: false, 
                error: '需要管理员权限才能执行此操作' 
            }, { status: 403 });
        }

        // 获取所有交易记录
        const allTransactions = await base44.asServiceRole.entities.Transaction.list();
        
        if (allTransactions.length === 0) {
            return Response.json({ 
                success: true, 
                message: '数据库中没有交易记录需要删除。' 
            });
        }

        let deletedCount = 0;
        let errors = [];

        // 批量删除所有交易记录
        for (const transaction of allTransactions) {
            try {
                await base44.asServiceRole.entities.Transaction.delete(transaction.id);
                deletedCount++;
            } catch (error) {
                console.error(`删除交易 ${transaction.id} 失败:`, error);
                errors.push(`删除交易 ID ${transaction.id} 失败: ${error.message}`);
            }
        }

        return Response.json({ 
            success: true, 
            message: `成功删除 ${deletedCount} 条交易记录${errors.length > 0 ? `，${errors.length} 条记录删除失败` : '。'}`,
            deleted_count: deletedCount,
            total_count: allTransactions.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error("清空交易数据失败:", error);
        return Response.json({ 
            success: false, 
            error: error.message || '未知错误' 
        }, { status: 500 });
    }
});