import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date } = await req.json();
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // 格式化日期为 YYYYMMDD
    const dateStr = targetDate.replace(/-/g, '');
    
    // 获取当天所有交易
    const allTransactions = await base44.entities.Transaction.list();
    
    // 筛选出当天的交易
    const todayTransactions = allTransactions.filter(t => {
      if (!t.transaction_number) return false;
      return t.transaction_number.startsWith(dateStr);
    });
    
    // 找出最大的序号
    let maxNumber = 0;
    todayTransactions.forEach(t => {
      const parts = t.transaction_number.split('/');
      if (parts.length === 2) {
        const num = parseInt(parts[1]);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    
    // 生成新编号
    const newNumber = maxNumber + 1;
    const paddedNumber = String(newNumber).padStart(4, '0');
    const transactionNumber = `${dateStr}/${paddedNumber}`;
    
    return Response.json({ 
      transaction_number: transactionNumber,
      date: targetDate,
      sequence: newNumber
    });

  } catch (error) {
    console.error("生成编号失败:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});