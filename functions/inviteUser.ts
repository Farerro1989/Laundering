import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // 验证当前用户是否有权限
        const currentUser = await base44.auth.me();
        if (!currentUser) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        // 检查用户是否有管理用户的权限
        const canManageUsers = currentUser.role === 'admin' || currentUser.permissions?.can_manage_users;
        if (!canManageUsers) {
            return Response.json({ error: '您没有邀请用户的权限' }, { status: 403 });
        }

        // 获取请求数据
        const inviteData = await req.json();
        const { email, full_name, role, permissions } = inviteData;

        // 验证必要字段
        if (!email || !full_name) {
            return Response.json({ 
                error: '邮箱和姓名为必填项' 
            }, { status: 400 });
        }

        // 使用service role来邀请用户
        try {
            // 构建用户数据
            const userData = {
                email,
                full_name,
                role: role || 'user'
            };
            
            // 如果是普通用户，添加权限设置
            if (role === 'user' && permissions) {
                userData.permissions = permissions;
            }

            // 使用服务角色创建用户邀请
            const result = await base44.asServiceRole.auth.inviteUser(userData);
            
            return Response.json({ 
                success: true, 
                message: `邀请已发送至 ${email}`,
                user: result 
            });

        } catch (inviteError) {
            console.error('邀请用户时出错:', inviteError);
            
            // 如果API不支持inviteUser，我们尝试替代方案
            if (inviteError.message?.includes('inviteUser') || inviteError.message?.includes('not a function')) {
                // 创建临时用户记录作为邀请占位符
                const tempUser = await base44.asServiceRole.entities.User.create({
                    email,
                    full_name,
                    role: role || 'user',
                    permissions: role === 'user' ? permissions : undefined,
                    // 添加标记表示这是待激活的用户
                    status: 'pending_invitation'
                });

                return Response.json({ 
                    success: true, 
                    message: `用户 ${email} 已创建，请手动发送登录链接`, 
                    user: tempUser 
                });
            }
            
            throw inviteError;
        }
        
    } catch (error) {
        console.error("邀请用户失败:", error);
        return Response.json({ 
            error: `邀请失败: ${error.message || '未知错误'}` 
        }, { status: 500 });
    }
});