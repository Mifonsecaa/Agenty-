"use client";
import { useState, useEffect } from "react";
import { MessageSquare, ArrowUpRight, Zap, Users, CheckCircle2 } from "lucide-react";

export default function DashboardOverview() {
    const [agentName, setAgentName] = useState("Asistente Virtual");
    const [metrics, setMetrics] = useState({
        conversations: 1245,
        tasksAutomated: 840,
        savedTime: 125 // Reutilizando esto para human handoffs visualmente o tiempo
    });

    useEffect(() => {
        const savedConfig = localStorage.getItem("agenty_config");
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                if (config.name) setAgentName(config.name);
                if (config.metrics) setMetrics(config.metrics);
            } catch (e) {
                console.error("Error parsing config", e);
            }
        }
    }, []);
    return (
        <div className="max-w-6xl mx-auto space-y-8 relative z-10">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {agentName}👋</h1>
                <p className="text-white/60">Here is what happening with your AI Agent today.</p>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metric Card 1 */}
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                            <ArrowUpRight className="w-3 h-3" /> 12%
                        </span>
                    </div>
                    <h3 className="text-4xl font-bold mb-1">{metrics.conversations}</h3>
                    <p className="text-sm text-white/50 font-medium tracking-wide">TOTAL CONVERSATIONS</p>
                </div>

                {/* Metric Card 2 */}
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
                            <Zap className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                            <ArrowUpRight className="w-3 h-3" /> 8%
                        </span>
                    </div>
                    <h3 className="text-4xl font-bold mb-1">{metrics.tasksAutomated}</h3>
                    <p className="text-sm text-white/50 font-medium tracking-wide">TASKS AUTOMATED</p>
                </div>

                {/* Metric Card 3 */}
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-400/10 px-2 py-1 rounded-full border border-rose-400/20">
                            <ArrowUpRight className="w-3 h-3 rotate-90" /> 2%
                        </span>
                    </div>
                    <h3 className="text-4xl font-bold mb-1">{metrics.savedTime} hrs</h3>
                    <p className="text-sm text-white/50 font-medium tracking-wide">SAVED TIME</p>
                </div>
            </div>

            {/* Main Content Area - Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Token Usage Graph Placeholder */}
                <div className="col-span-1 lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold">Token Usage</h2>
                        <select className="bg-transparent border border-white/10 text-white/70 text-sm rounded-lg px-3 py-1 outline-none">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                        </select>
                    </div>
                    <div className="flex-1 min-h-[250px] border border-dashed border-white/10 rounded-xl flex items-center justify-center text-white/30 text-sm font-medium bg-white/[0.02]">
                        [ Chart Graphic Placeholder ]
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="col-span-1 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <h2 className="text-lg font-bold mb-6">Recent Activity</h2>

                    <div className="space-y-6">

                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm text-white/90 font-medium">Agent scheduled an appointment</p>
                                <p className="text-xs text-white/50 mt-1">with Carlos for Tomorrow 10:00 AM</p>
                                <p className="text-xs text-white/30 mt-2">Just now</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm text-white/90 font-medium">Sale closed automatically </p>
                                <p className="text-xs text-white/50 mt-1">Order #892 - 'Air Max Size 40'</p>
                                <p className="text-xs text-white/30 mt-2">15 mins ago</p>
                            </div>
                        </div>

                        <div className="flex gap-4 opacity-60">
                            <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm text-white/90 font-medium">Human Takeover Requested</p>
                                <p className="text-xs text-white/50 mt-1">Client asked for wholesale discount</p>
                                <p className="text-xs text-white/30 mt-2">1 hour ago</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
