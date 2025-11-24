import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

// AI监控配置
const MONITORING_RULES = {
  // 汇率异常检测
  exchange_rate: {
    min: 0.001,
    max: 100,
    warning_change_threshold: 0.1 // 10%变化
  },
  // 金额异常检测
  deposit_amount: {
    small_amount_threshold: 100,
    large_amount_threshold: 500000,
    suspicious_amount_patterns: [77777, 88888, 99999] // 可疑金额模式
  },
  // 佣金异常检测
  commission: {
    min: 0,
    max: 50,
    typical_range: [5, 15]
  },
  // 状态异常检测
  status_flow: {
    normal_progression: ["等待中", "已到账", "承兑中", "已完成交易"],
    suspicious_statuses: ["已退回", "风控调解中", "冻结（正在处理）", "冻结（不能处理）"]
  }
};

// 检测异常交易
function detectAnomalies(transactions) {
  const anomalies = [];
  const now = new Date();
  
  transactions.forEach(transaction => {
    const issues = [];
    
    // 1. 汇率异常检测
    if (transaction.exchange_rate < MONITORING_RULES.exchange_rate.min || 
        transaction.exchange_rate > MONITORING_RULES.exchange_rate.max) {
      issues.push(`汇率异常: ${transaction.exchange_rate} (正常范围: ${MONITORING_RULES.exchange_rate.min}-${MONITORING_RULES.exchange_rate.max})`);
    }
    
    // 2. 金额异常检测
    if (transaction.deposit_amount < MONITORING_RULES.deposit_amount.small_amount_threshold) {
      issues.push(`金额过小: ${transaction.deposit_amount} (可能是测试数据)`);
    }
    
    if (transaction.deposit_amount > MONITORING_RULES.deposit_amount.large_amount_threshold) {
      issues.push(`大额交易: ${transaction.deposit_amount} (需要额外审查)`);
    }
    
    // 检测可疑金额模式
    if (MONITORING_RULES.deposit_amount.suspicious_amount_patterns.some(pattern => 
        Math.abs(transaction.deposit_amount - pattern) < 10)) {
      issues.push(`可疑金额模式: ${transaction.deposit_amount}`);
    }
    
    // 3. 佣金异常检测
    if (transaction.commission_percentage < MONITORING_RULES.commission.min || 
        transaction.commission_percentage > MONITORING_RULES.commission.max) {
      issues.push(`佣金异常: ${transaction.commission_percentage}% (正常范围: ${MONITORING_RULES.commission.min}-${MONITORING_RULES.commission.max}%)`);
    }
    
    // 4. 承兑回USDT与结算USDT差异检测
    if (transaction.acceptance_usdt > 0 && transaction.settlement_usdt > 0) {
      const difference = transaction.acceptance_usdt - transaction.settlement_usdt;
      const percentageDiff = Math.abs(difference / transaction.settlement_usdt) * 100;
      
      if (percentageDiff > 50) {
        issues.push(`承兑与结算差异过大: ${percentageDiff.toFixed(1)}% (${difference.toFixed(2)} USDT)`);
      }
    }
    
    // 5. 状态异常检测
    if (MONITORING_RULES.status_flow.suspicious_statuses.includes(transaction.fund_status)) {
      issues.push(`状态需要关注: ${transaction.fund_status}`);
    }
    
    // 6. 时间异常检测
    const createdDate = new Date(transaction.created_date);
    const depositDate = new Date(transaction.deposit_date);
    const daysDifference = Math.abs((createdDate - depositDate) / (1000 * 60 * 60 * 24));
    
    if (daysDifference > 7) {
      issues.push(`入金日期与创建日期差异过大: ${daysDifference.toFixed(1)} 天`);
    }
    
    // 7. 数据完整性检测
    const requiredFields = ['customer_name', 'bank_name', 'bank_account', 'currency'];
    const missingFields = requiredFields.filter(field => !transaction[field] || transaction[field].trim() === '');
    
    if (missingFields.length > 0) {
      issues.push(`缺少必要信息: ${missingFields.join(', ')}`);
    }
    
    if (issues.length > 0) {
      anomalies.push({
        transaction_id: transaction.id,
        customer_name: transaction.customer_name,
        amount: transaction.deposit_amount,
        currency: transaction.currency,
        status: transaction.fund_status,
        issues: issues,
        severity: issues.length > 3 ? 'high' : issues.length > 1 ? 'medium' : 'low',
        created_date: transaction.created_date
      });
    }
  });
  
  return anomalies;
}

// 生成业务洞察
function generateBusinessInsights(transactions) {
  const insights = [];
  const completedTransactions = transactions.filter(t => t.fund_status === '已完成交易');
  const pendingTransactions = transactions.filter(t => t.fund_status === '等待中');
  const suspiciousTransactions = transactions.filter(t => 
    ['已退回', '风控调解中', '冻结（正在处理）', '冻结（不能处理）'].includes(t.fund_status)
  );
  
  // 完成率分析
  const completionRate = (completedTransactions.length / transactions.length) * 100;
  if (completionRate < 70) {
    insights.push({
      type: 'warning',
      title: '交易完成率偏低',
      message: `当前完成率为 ${completionRate.toFixed(1)}%，建议检查流程效率`,
      priority: 'medium'
    });
  }
  
  // 待处理交易积压
  if (pendingTransactions.length > 10) {
    insights.push({
      type: 'alert',
      title: '待处理交易积压',
      message: `有 ${pendingTransactions.length} 笔交易仍在等待处理`,
      priority: 'high'
    });
  }
  
  // 风险交易监控
  if (suspiciousTransactions.length > 0) {
    insights.push({
      type: 'danger',
      title: '风险交易预警',
      message: `发现 ${suspiciousTransactions.length} 笔需要关注的交易`,
      priority: 'high'
    });
  }
  
  // 币种分布分析
  const currencyDistribution = transactions.reduce((acc, t) => {
    acc[t.currency] = (acc[t.currency] || 0) + 1;
    return acc;
  }, {});
  
  const dominantCurrency = Object.keys(currencyDistribution).reduce((a, b) => 
    currencyDistribution[a] > currencyDistribution[b] ? a : b
  );
  
  if (currencyDistribution[dominantCurrency] / transactions.length > 0.8) {
    insights.push({
      type: 'info',
      title: '币种集中度高',
      message: `${dominantCurrency} 占比超过80%，建议关注汇率风险`,
      priority: 'low'
    });
  }
  
  return insights;
}

// 生成AI智能建议
async function generateAIRecommendations(base44, anomalies, insights, transactions) {
  try {
    const prompt = `作为一个金融风控专家，请分析以下数据并给出专业建议：

异常交易数据：
${JSON.stringify(anomalies.slice(0, 5), null, 2)}

业务洞察：
${JSON.stringify(insights, null, 2)}

交易总量：${transactions.length}
请提供以下方面的建议：
1. 风险控制建议
2. 业务流程优化建议
3. 数据质量改进建议
4. 监控重点建议

请用简洁的中文回答，每个建议不超过50字。`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          risk_control: { type: "string", description: "风险控制建议" },
          process_optimization: { type: "string", description: "流程优化建议" },
          data_quality: { type: "string", description: "数据质量建议" },
          monitoring_focus: { type: "string", description: "监控重点建议" }
        }
      }
    });

    return aiResponse || {
      risk_control: "加强大额交易审查，建立汇率波动预警机制",
      process_optimization: "优化待处理交易流程，减少处理时间",
      data_quality: "完善数据录入规范，减少信息缺失",
      monitoring_focus: "重点监控异常汇率和可疑金额模式"
    };
  } catch (error) {
    console.error('AI分析失败:', error);
    return {
      risk_control: "系统建议：建立多层风控体系",
      process_optimization: "系统建议：标准化操作流程",
      data_quality: "系统建议：加强数据验证机制",
      monitoring_focus: "系统建议：实时监控异常指标"
    };
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const user = await base44.auth.me();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // 获取所有交易数据
    const transactions = await base44.entities.Transaction.list();
    
    // 执行异常检测
    const anomalies = detectAnomalies(transactions);
    
    // 生成业务洞察
    const insights = generateBusinessInsights(transactions);
    
    // 生成AI建议
    const aiRecommendations = await generateAIRecommendations(base44, anomalies, insights, transactions);
    
    // 计算风险评分
    const riskScore = Math.min(100, 
      (anomalies.filter(a => a.severity === 'high').length * 20) +
      (anomalies.filter(a => a.severity === 'medium').length * 10) +
      (anomalies.filter(a => a.severity === 'low').length * 5)
    );
    
    const monitoringResult = {
      timestamp: new Date().toISOString(),
      risk_score: riskScore,
      risk_level: riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'low',
      anomalies: anomalies,
      insights: insights,
      ai_recommendations: aiRecommendations,
      statistics: {
        total_transactions: transactions.length,
        anomalies_count: anomalies.length,
        high_risk_count: anomalies.filter(a => a.severity === 'high').length,
        completion_rate: (transactions.filter(t => t.fund_status === '已完成交易').length / transactions.length * 100).toFixed(1)
      }
    };

    return new Response(JSON.stringify(monitoringResult), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI监控失败:', error);
    return new Response(JSON.stringify({ 
      error: 'AI监控失败', 
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});