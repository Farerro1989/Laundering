import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // 验证用户权限
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 解析FormData
        const formData = await req.formData();
        const csvFile = formData.get('file');
        
        if (!csvFile) {
            return Response.json({ error: '请选择CSV文件' }, { status: 400 });
        }

        // 读取文件内容
        const fileContent = await csvFile.text();
        const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length < 2) {
            return Response.json({ error: 'CSV文件格式无效或为空' }, { status: 400 });
        }

        // 跳过表头
        const dataLines = lines.slice(1);
        let importedCount = 0;
        let errors = [];

        for (const line of dataLines) {
            try {
                // 解析CSV行
                const values = line.split(',').map(value => value.replace(/^"|"$/g, '').trim());
                
                if (values.length < 17) continue; // 跳过不完整的行
                
                const transactionData = {
                    customer_name: values[0] || '待完善',
                    bank_name: values[1] || '待完善',
                    bank_account: values[2] || '',
                    bank_address: values[3] || '',
                    bank_location: values[4] || '',
                    currency: values[5] || '',
                    deposit_amount: parseFloat(values[6]) || 0,
                    deposit_date: values[7] || new Date().toISOString().split('T')[0],
                    exchange_rate: parseFloat(values[8]) || 0.95,
                    commission_percentage: parseFloat(values[9]) || 11,
                    transfer_fee: parseFloat(values[10]) || 25,
                    violation_penalty: parseFloat(values[11]) || 0,
                    maintenance_period: values[12] || '',
                    fund_status: values[13] || '等待中',
                    settlement_usdt: parseFloat(values[14]) || 0,
                    acceptance_usdt: parseFloat(values[15]) || 0
                };

                // 创建交易记录
                await base44.entities.Transaction.create(transactionData);
                importedCount++;
                
            } catch (error) {
                console.error('导入交易失败:', error);
                errors.push(`第${importedCount + errors.length + 2}行导入失败: ${error.message}`);
            }
        }

        return Response.json({ 
            success: true, 
            message: `成功导入 ${importedCount} 条交易记录${errors.length > 0 ? `，${errors.length} 条记录出现问题` : ''}`,
            imported_count: importedCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error("导入CSV失败:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});