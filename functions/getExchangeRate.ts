import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

// 使用一个免费的汇率API，以USD为基准
const API_URL = 'https://open.er-api.com/v6/latest/USD';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const { currencyCode } = await req.json();

    if (!currencyCode) {
        return new Response(JSON.stringify({ error: 'Currency code is required' }), { status: 400 });
    }

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();

        if (data.result === 'success') {
            const rate = data.rates[currencyCode];
            if (rate) {
                // 扣除3% (之前是2.5%，现在改为3%)
                const finalRate = rate * (1 - 0.03);
                return new Response(JSON.stringify({ rate: finalRate }), {
                    headers: { 'Content-Type': 'application/json' },
                });
            } else {
                return new Response(JSON.stringify({ error: 'Currency not found' }), { status: 404 });
            }
        } else {
            throw new Error('API did not return success');
        }
    } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});