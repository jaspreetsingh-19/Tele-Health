"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Calendar, DollarSign, Users, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import axios from "axios";

export default function DoctorEarningsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchEarnings() {
            try {
                setLoading(true);
                // Using fetch instead of axios for better compatibility
                const response = await axios.get("/api/earning");

                if (!response) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.data;
                console.log("data is", result);
                setData(result);
                setError(null);
            } catch (err) {
                console.error("Earnings API error:", err);
                setError("Failed to load earnings data");
            } finally {
                setLoading(false);
            }
        }
        fetchEarnings();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading earnings data...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <Card className="w-96 shadow-md border border-gray-200">
                    <CardContent className="text-center p-8">
                        <div className="text-red-500 text-4xl mb-4">⚠️</div>
                        <p className="text-red-600 text-lg font-medium mb-2">Error Loading Data</p>
                        <p className="text-gray-600 mb-4">{error || "Failed to load earnings"}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Retry
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Transform monthly earnings data for charts
    const monthNames = {
        1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
        7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"
    };

    const chartData = Object.entries(data.earningsByMonth || {})
        .map(([monthKey, value]) => {
            const [year, month] = monthKey.split('-');
            return {
                month: `${monthNames[parseInt(month)]} ${year}`,
                earnings: value,
                monthNum: parseInt(month),
                year: parseInt(year)
            };
        })
        .sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.monthNum - b.monthNum;
        });

    // Calculate statistics
    const totalAppointments = Object.values(data.earningsByMonth || {}).length;
    const averageMonthlyEarning = chartData.length > 0
        ? Math.round(data.totalEarnings / chartData.length)
        : 0;
    const highestMonth = chartData.reduce((max, curr) =>
        curr.earnings > (max.earnings || 0) ? curr : max, {});

    // Pie chart data for earnings distribution
    const pieData = chartData.slice(-6).map((item, index) => ({
        name: item.month,
        value: item.earnings,
        fill: `hsl(${210 + index * 15}, 45%, ${45 + index * 8}%)`
    }));

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-2">
                        Earnings Overview
                    </h1>
                    <p className="text-gray-600">
                        Monitor your consultation revenue and financial performance
                    </p>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    {/* Total Earnings */}
                    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-blue-600" />
                                Total Earnings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl md:text-3xl font-bold text-gray-800">
                                ₹{data.totalEarnings?.toLocaleString() || 0}
                            </div>
                            <p className="text-gray-500 text-sm mt-1">
                                All time revenue
                            </p>
                        </CardContent>
                    </Card>

                    {/* Average Monthly */}
                    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                Average Monthly
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl md:text-3xl font-bold text-gray-800">
                                ₹{averageMonthlyEarning.toLocaleString()}
                            </div>
                            <p className="text-gray-500 text-sm mt-1">
                                Per month average
                            </p>
                        </CardContent>
                    </Card>

                    {/* Active Months */}
                    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                Active Months
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl md:text-3xl font-bold text-gray-800">
                                {chartData.length}
                            </div>
                            <p className="text-gray-500 text-sm mt-1">
                                Months with earnings
                            </p>
                        </CardContent>
                    </Card>

                    {/* Best Month */}
                    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Award className="h-4 w-4 text-blue-600" />
                                Best Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg md:text-xl font-bold text-gray-800">
                                ₹{highestMonth.earnings?.toLocaleString() || 0}
                            </div>
                            <p className="text-gray-500 text-sm mt-1">
                                {highestMonth.month || "N/A"}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Monthly Earnings Bar Chart */}
                    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-xl font-medium text-gray-800 flex items-center gap-2">
                                <BarChart className="h-5 w-5 text-blue-600" />
                                Monthly Earnings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={70}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            tickFormatter={(value) => `₹${value.toLocaleString()}`}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`₹${value.toLocaleString()}`, "Earnings"]}
                                            labelStyle={{ color: "#374151" }}
                                            contentStyle={{
                                                backgroundColor: "white",
                                                border: "1px solid #d1d5db",
                                                borderRadius: "6px",
                                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                            }}
                                        />
                                        <Bar
                                            dataKey="earnings"
                                            fill="#3b82f6"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="text-center">
                                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-lg">No earnings data available</p>
                                        <p className="text-sm text-gray-400">Start consulting to see your earnings</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Earnings Distribution
                    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-xl font-medium text-gray-800 flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-blue-600" />
                                Recent Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={90}
                                            innerRadius={50}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`₹${value.toLocaleString()}`, "Earnings"]}
                                            contentStyle={{
                                                backgroundColor: "white",
                                                border: "1px solid #d1d5db",
                                                borderRadius: "6px",
                                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="text-center">
                                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-lg">No recent data</p>
                                        <p className="text-sm text-gray-400">Chart will appear with earnings</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card> */}
                </div>

                {/* Monthly Breakdown Table */}
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-6">
                    <CardHeader>
                        <CardTitle className="text-xl font-medium text-gray-800 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Monthly Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {chartData.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Month</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-700">Earnings</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-700">Growth</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {chartData.map((item, index) => {
                                            const prevEarnings = index > 0 ? chartData[index - 1].earnings : 0;
                                            const growth = prevEarnings > 0
                                                ? ((item.earnings - prevEarnings) / prevEarnings * 100)
                                                : 0;

                                            return (
                                                <tr key={item.month} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-4 font-medium text-gray-800">
                                                        {item.month}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                                                        ₹{item.earnings.toLocaleString()}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        {index === 0 ? (
                                                            <span className="text-gray-400">-</span>
                                                        ) : (
                                                            <span className={`font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500 text-lg">No monthly data available</p>
                                <p className="text-gray-400 text-sm">Complete consultations to see monthly breakdown</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Line Chart for Trend */}
                {chartData.length > 1 && (
                    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-xl font-medium text-gray-800 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                Earnings Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={70}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        tickFormatter={(value) => `₹${value.toLocaleString()}`}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`₹${value.toLocaleString()}`, "Earnings"]}
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #d1d5db",
                                            borderRadius: "6px",
                                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="earnings"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Footer */}
                <div className="mt-8 text-center text-gray-400 text-sm border-t border-gray-200 pt-4">
                    <p>Last updated: {new Date().toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}