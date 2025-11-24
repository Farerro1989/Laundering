import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// 使用免费汇率API
const API_URL = 'https://open.er-api.com/v6/latest/USD';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { currency } = await req.json();

        if (!currency) {
            return Response.json({ error: '币种参数缺失' }, { status: 400 });
        }

        // 获取实时汇率
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`汇率API请求失败: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.result === 'success') {
            // 提取币种代码（EUR、MYR、USD）
            const currencyCode = currency.replace(/[^\w]/g, '').substring(0, 3);
            
            let rate;
            if (currencyCode === 'USD') {
                // USD to USDT 接近 1:1
                rate = 1.0;
            } else if (currencyCode === 'EUR') {
                // EUR to USD, 然后 USD to USDT
                rate = data.rates.EUR ? (1 / data.rates.EUR) : 1.1;
            } else if (currencyCode === 'MYR') {
                // MYR to USD, 然后 USD to USDT
                rate = data.rates.MYR ? (1 / data.rates.MYR) : 0.22;
            } else {
                return Response.json({ error: '不支持的币种' }, { status: 400 });
            }

            return Response.json({ 
                rate: rate,
                currency: currencyCode,
                timestamp: new Date().toISOString()
            });
        } else {
            throw new Error('汇率API返回失败');
        }
    } catch (error) {
        console.error('获取汇率失败:', error);
        return Response.json({ 
            error: error.message,
            // 返回备用固定汇率
            fallback: {
                EUR: 1.1,
                USD: 1.0,
                MYR: 0.22
            }
        }, { status: 500 });
    }
});