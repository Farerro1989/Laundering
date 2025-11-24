import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // 验证用户
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 获取所有交易数据
        const transactions = await base44.entities.Transaction.list("-created_date");
        
        const doc = new jsPDF();
        
        // 标题和头部信息
        doc.setFontSize(20);
        doc.text('优汇金融 - 交易报告', 20, 20);
        
        doc.setFontSize(10);
        doc.text(`生成时间: ${new Date().toLocaleString('zh-CN')}`, 20, 30);
        doc.text(`生成人: ${user.full_name || user.email}`, 20, 35);
        doc.text(`交易总数: ${transactions.length}`, 20, 40);
        
        // 表格头部
        let y = 55;
        doc.setFontSize(8);
        doc.text('客户姓名', 20, y);
        doc.text('银行', 55, y);
        doc.text('币种', 80, y);
        doc.text('金额', 100, y);
        doc.text('状态', 125, y);
        doc.text('日期', 150, y);
        doc.text('USDT', 170, y);
        
        // 数据行
        y += 10;
        transactions.forEach((transaction, index) => {
            if (y > 270) { // 换页
                doc.addPage();
                y = 20;
                
                // 重复表头
                doc.setFontSize(8);
                doc.text('客户姓名', 20, y);
                doc.text('银行', 55, y);
                doc.text('币种', 80, y);
                doc.text('金额', 100, y);
                doc.text('状态', 125, y);
                doc.text('日期', 150, y);
                doc.text('USDT', 170, y);
                y += 10;
            }
            
            doc.setFontSize(7);
            doc.text(String(transaction.customer_name || '').substring(0, 15), 20, y);
            doc.text(String(transaction.bank_name || '').substring(0, 12), 55, y);
            doc.text(String(transaction.currency || '').substring(0, 8), 80, y);
            doc.text(String(transaction.deposit_amount || 0), 100, y);
            doc.text(String(transaction.fund_status || '').substring(0, 8), 125, y);
            doc.text(String(transaction.deposit_date || '').substring(0, 10), 150, y);
            doc.text(String((transaction.settlement_usdt || 0).toFixed(2)), 170, y);
            
            y += 6;
        });
        
        const pdfBytes = doc.output('arraybuffer');
        
        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=transactions_report_${new Date().toISOString().split('T')[0]}.pdf`
            }
        });

    } catch (error) {
        console.error("导出PDF失败:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});