import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Check admin permission
    const user = await base44.auth.me();
    if (user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
    }

    // Get all "已退回" transactions
    const returnedTransactions = await base44.asServiceRole.entities.Transaction.filter({
      fund_status: '已退回'
    });

    const updates = [];
    
    for (const t of returnedTransactions) {
      // Set acceptance_usdt to 0 for returned transactions
      await base44.asServiceRole.entities.Transaction.update(t.id, {
        acceptance_usdt: 0
      });
      
      updates.push({
        id: t.id,
        transaction_number: t.transaction_number,
        customer_name: t.customer_name,
        old_acceptance_usdt: t.acceptance_usdt,
        new_acceptance_usdt: 0
      });
    }

    return Response.json({
      success: true,
      message: '已成功重算所有已退回交易',
      total_checked: returnedTransactions.length,
      total_updated: updates.length,
      updates
    });

  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});