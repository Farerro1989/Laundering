import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // 验证用户权限
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: '需要管理员权限' }, { status: 403 });
        }

        // 获取所有交易数据
        const transactions = await base44.asServiceRole.entities.Transaction.list();
        
        // 获取所有用户数据（除了敏感信息）
        const users = await base44.asServiceRole.entities.User.list();
        const safeUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            permissions: user.permissions,
            created_date: user.created_date
        }));

        // 创建备份对象
        const backupData = {
            backup_info: {
                created_at: new Date().toISOString(),
                created_by: user.email,
                version: "1.0"
            },
            transactions: transactions,
            users: safeUsers
        };

        // 返回JSON数据
        return new Response(JSON.stringify(backupData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename=backup_${new Date().toISOString().split('T')[0]}.json`
            }
        });

    } catch (error) {
        console.error("备份失败:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});