import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Wallet, ArrowRight, TrendingUp, Receipt } from "lucide-react";
import { motion } from "framer-motion";

export default function SystemSelector() {
  const navigate = useNavigate();

  const systems = [
    {
      id: 'settlement',
      title: '运营自动结算系统',
      description: '管理客户入金、交易结算、盈利分析等核心业务功能',
      icon: CreditCard,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      features: ['交易管理', '盈利分析', '数据备份', 'Telegram集成'],
      path: '/Dashboard'
    },
    {
      id: 'expense',
      title: '开销记账系统',
      description: '记录日常开销、管理预算、分析消费趋势',
      icon: Wallet,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'from-emerald-50 to-green-50',
      features: ['开销记录', '分类管理', '预算跟踪', '消费报表'],
      path: '/ExpenseDashboard'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl space-y-8">
        {/* 头部 */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              优汇管理平台
            </h1>
            <p className="text-slate-600 mt-3 text-lg">选择您要使用的系统模块</p>
          </motion.div>
        </div>

        {/* 系统卡片 */}
        <div className="grid md:grid-cols-2 gap-6">
          {systems.map((system, index) => (
            <motion.div
              key={system.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`bg-gradient-to-br ${system.bgColor} border-2 border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-2xl group cursor-pointer h-full`}>
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${system.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <system.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    {system.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-base">
                    {system.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 功能列表 */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700 mb-3">核心功能：</p>
                    <div className="grid grid-cols-2 gap-2">
                      {system.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${system.color}`} />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 进入按钮 */}
                  <Button
                    onClick={() => navigate(system.path)}
                    className={`w-full bg-gradient-to-r ${system.color} hover:opacity-90 text-white font-semibold py-6 text-lg group/btn`}
                  >
                    进入系统
                    <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 底部提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Card className="bg-white/60 backdrop-blur-sm border border-slate-200 inline-block">
            <CardContent className="py-4 px-6">
              <p className="text-sm text-slate-600">
                💡 提示：两个系统完全独立，您可以随时在系统间切换
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}