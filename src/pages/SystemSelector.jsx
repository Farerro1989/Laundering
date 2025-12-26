import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Wallet, ArrowRight, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function SystemSelector() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const systems = [
    {
      id: 'settlement',
      title: '运营自动结算系统',
      description: '管理客户入金、交易结算、盈利分析等核心业务功能',
      icon: CreditCard,
      color: 'from-blue-500 via-indigo-500 to-purple-600',
      glowColor: 'rgba(99, 102, 241, 0.3)',
      features: ['交易管理', '盈利分析', '数据备份', 'Telegram集成'],
      path: '/Dashboard'
    },
    {
      id: 'expense',
      title: '开销记账系统',
      description: '记录日常开销、管理预算、分析消费趋势',
      icon: Wallet,
      color: 'from-emerald-500 via-green-500 to-teal-600',
      glowColor: 'rgba(16, 185, 129, 0.3)',
      features: ['开销记录', '分类管理', '预算跟踪', '消费报表'],
      path: '/ExpenseDashboard'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      {/* 动态背景网格 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
      
      {/* 浮动光晕效果 */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-7xl space-y-12">
          {/* 头部 */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative inline-block"
            >
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(99, 102, 241, 0.5)',
                    '0 0 60px rgba(99, 102, 241, 0.8)',
                    '0 0 20px rgba(99, 102, 241, 0.5)',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 blur-2xl"
              />
              <h1 className="relative text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
                优汇管理平台
              </h1>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-8 -right-8"
              >
                <Sparkles className="w-8 h-8 text-blue-400" />
              </motion.div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-300 text-xl md:text-2xl font-light tracking-wide"
            >
              智能化 · 可视化 · 数据驱动
            </motion.p>
          </div>

          {/* 系统卡片 */}
          <div className="grid md:grid-cols-2 gap-8 px-4">
            {systems.map((system, index) => (
              <motion.div
                key={system.id}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -10,
                  rotateY: 5,
                  scale: 1.02
                }}
                onHoverStart={() => setHoveredCard(system.id)}
                onHoverEnd={() => setHoveredCard(null)}
                style={{ perspective: '1000px' }}
              >
                <Card 
                  className="relative overflow-hidden bg-slate-900/40 backdrop-blur-xl border-2 border-slate-700/50 hover:border-slate-600 transition-all duration-500 h-full group"
                  style={{
                    boxShadow: hoveredCard === system.id 
                      ? `0 20px 60px ${system.glowColor}` 
                      : '0 10px 30px rgba(0,0,0,0.3)'
                  }}
                >
                  {/* 光效边框 */}
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(45deg, ${system.glowColor}, transparent)`
                    }}
                  />

                  {/* 浮动粒子效果 */}
                  <div className="absolute inset-0 overflow-hidden opacity-30">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, -30, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 3 + Math.random() * 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </div>

                  <CardHeader className="relative z-10 space-y-6">
                    <motion.div 
                      className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${system.color} flex items-center justify-center shadow-2xl relative`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.8 }}
                    >
                      <system.icon className="w-10 h-10 text-white" />
                      <motion.div
                        className="absolute inset-0 rounded-3xl"
                        animate={{
                          boxShadow: [
                            `0 0 20px ${system.glowColor}`,
                            `0 0 40px ${system.glowColor}`,
                            `0 0 20px ${system.glowColor}`,
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                    
                    <div>
                      <CardTitle className="text-3xl font-bold text-white mb-3 tracking-tight">
                        {system.title}
                      </CardTitle>
                      <CardDescription className="text-slate-300 text-base leading-relaxed">
                        {system.description}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="relative z-10 space-y-6">
                    {/* 功能列表 */}
                    <div className="space-y-3 bg-slate-800/40 rounded-2xl p-5 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <p className="text-sm font-semibold text-slate-200">核心功能</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {system.features.map((feature, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                            className="flex items-center gap-2 text-sm text-slate-300 bg-slate-700/30 rounded-lg px-3 py-2"
                          >
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${system.color} shadow-lg`} />
                            {feature}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* 进入按钮 */}
                    <Button
                      onClick={() => navigate(system.path)}
                      className={`w-full bg-gradient-to-r ${system.color} hover:opacity-90 text-white font-bold py-7 text-lg rounded-2xl shadow-2xl group/btn relative overflow-hidden`}
                    >
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                      <span className="relative flex items-center justify-center gap-2">
                        进入系统
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* 底部提示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center"
          >
            <div className="inline-block bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl px-8 py-4 shadow-2xl">
              <p className="text-slate-300 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span>两个系统完全独立，您可以随时在系统间切换</span>
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}