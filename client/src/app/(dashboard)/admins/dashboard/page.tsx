"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    TrendingUp,
    TrendingDown,
    Users,
    ShoppingCart,
    DollarSign,
    Package,
    CreditCard,
    BarChart3,
    Calendar,
    Download,
    MoreVertical,
    Activity,
    PieChart as PieChartIcon,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGetDashboardStatsQuery } from "@/state/api";

// Import ECharts wrapper
import ReactECharts from "echarts-for-react";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#ff6b6b", "#a28ef4"];

const Dashboard = () => {
    const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month");
    const [activeTab, setActiveTab] = useState("overview");

    const { data: stats, isLoading, isError } = useGetDashboardStatsQuery({ range: timeRange });

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    if (isError || !stats) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-semibold">Error loading dashboard</h3>
                    <p className="text-red-600">Please try again later</p>
                </div>
            </div>
        );
    }

    // Prepare data
    const quickStats = [
        {
            title: "Total Revenue",
            value: `KES ${stats.quickStats.totalRevenue.toLocaleString()}`,
            change: "+12.5%",
            trend: "up" as const,
            icon: DollarSign,
            color: "bg-green-500",
        },
        {
            title: "Total Orders",
            value: stats.quickStats.totalOrders.toLocaleString(),
            change: "+8.2%",
            trend: "up" as const,
            icon: ShoppingCart,
            color: "bg-blue-500",
        },
        {
            title: "Active Users",
            value: stats.quickStats.activeUsers.toLocaleString(),
            change: "+15.3%",
            trend: "up" as const,
            icon: Users,
            color: "bg-purple-500",
        },
        {
            title: "Conversion Rate",
            value: `${stats.quickStats.conversionRate.toFixed(1)}%`,
            change: "-1.2%",
            trend: "down" as const,
            icon: Activity,
            color: "bg-orange-500",
        },
    ];

    const revenueData = stats.revenueOverTime.map((item) => ({
        month: item.date,
        revenue: item.revenue,
        orders: item.orders,
    }));

    const categoryData = stats.categoryDistribution.map((cat, index) => ({
        name: cat.name,
        value: cat.value,
    }));

    const topProducts = stats.topProducts;
    const recentActivity = stats.recentActivity;

    // ECharts Options

    // 1. Revenue & Orders Line Chart
    const lineChartOption = {
        tooltip: {
            trigger: "axis",
            formatter: (params: any) => {
                const date = params[0].name;
                return params
                    .map((p: any) => `${p.seriesName}: KES ${Number(p.value).toLocaleString()}`)
                    .join("<br/>");
            },
        },
        legend: {
            data: ["Revenue", "Orders"],
            bottom: 0,
        },
        grid: { left: "3%", right: "4%", bottom: "10%", containLabel: true },
        xAxis: {
            type: "category",
            data: revenueData.map((d) => d.month),
            axisLabel: { color: "#666" },
        },
        yAxis: [
            {
                type: "value",
                name: "Revenue (KES)",
                axisLabel: { color: "#666" },
            },
            {
                type: "value",
                name: "Orders",
                axisLabel: { color: "#666" },
            },
        ],
        series: [
            {
                name: "Revenue",
                type: "line",
                smooth: true,
                lineStyle: { width: 3, color: "#8884d8" },
                itemStyle: { color: "#8884d8" },
                areaStyle: { opacity: 0.1 },
                data: revenueData.map((d) => d.revenue),
                yAxisIndex: 0,
            },
            {
                name: "Orders",
                type: "line",
                smooth: true,
                lineStyle: { width: 3, color: "#82ca9d" },
                itemStyle: { color: "#82ca9d" },
                data: revenueData.map((d) => d.orders),
                yAxisIndex: 1,
            },
        ],
    };

    // 2. Category Distribution Pie Chart
    const pieChartOption = {
        tooltip: {
            trigger: "item",
            formatter: "{b}: KES {c} ({d}%)",
        },
        legend: {
            orient: "vertical",
            right: 10,
            top: "center",
        },
        series: [
            {
                name: "Category Sales",
                type: "pie",
                radius: ["40%", "70%"],
                center: ["50%", "50%"],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 8,
                    borderColor: "#fff",
                    borderWidth: 2,
                },
                label: {
                    show: true,
                    formatter: "{b}: {d}%",
                },
                emphasis: {
                    label: { show: true, fontWeight: "bold" },
                },
                data: categoryData.map((item, index) => ({
                    ...item,
                    itemStyle: { color: COLORS[index % COLORS.length] },
                })),
            },
        ],
    };

    // 3. Sales Performance Area Chart (Analytics tab)
    const areaChartOption = {
        tooltip: {
            trigger: "axis",
            formatter: (params: any) => `Revenue: KES ${Number(params[0].value).toLocaleString()}`,
        },
        grid: { left: "3%", right: "4%", bottom: "10%", containLabel: true },
        xAxis: {
            type: "category",
            data: revenueData.map((d) => d.month),
            axisLabel: { color: "#666" },
        },
        yAxis: {
            type: "value",
            axisLabel: { color: "#666" },
        },
        series: [
            {
                name: "Revenue",
                type: "area",
                smooth: true,
                lineStyle: { color: "#8884d8", width: 3 },
                areaStyle: { color: "#8884d8", opacity: 0.3 },
                data: revenueData.map((d) => d.revenue),
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600 mt-2">
                            Welcome back! Here's what's happening with your store today.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">Last 7 days</SelectItem>
                                <SelectItem value="month">Last 30 days</SelectItem>
                                <SelectItem value="quarter">Last 90 days</SelectItem>
                                <SelectItem value="year">Last year</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="gap-2">
                            <Download className="w-4 h-4" /> Export
                        </Button>
                        <Button>
                            <Calendar className="w-4 h-4 mr-2" /> Generate Report
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {quickStats.map((stat, index) => (
                    <Card key={index} className="relative overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                                    <div className="flex items-center mt-2">
                                        <Badge
                                            variant={stat.trend === "up" ? "default" : "destructive"}
                                            className={`${
                                                stat.trend === "up"
                                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                    : "bg-red-100 text-red-800 hover:bg-red-100"
                                            }`}
                                        >
                                            {stat.trend === "up" ? (
                                                <TrendingUp className="w-3 h-3 mr-1" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3 mr-1" />
                                            )}
                                            {stat.change}
                                        </Badge>
                                        <span className="text-sm text-gray-500 ml-2">vs last {timeRange}</span>
                                    </div>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Target</span>
                                    <span>85%</span>
                                </div>
                                <Progress value={85} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue & Orders */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Revenue & Orders</CardTitle>
                                        <CardDescription>Revenue and order count over time</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ReactECharts option={lineChartOption} style={{ height: "100%", width: "100%" }} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Category Distribution */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Category Distribution</CardTitle>
                                        <CardDescription>Sales by product category</CardDescription>
                                    </div>
                                    <PieChartIcon className="w-5 h-5 text-gray-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ReactECharts option={pieChartOption} style={{ height: "100%", width: "100%" }} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bottom Row (Top Products & Recent Activity) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Top Selling Products</CardTitle>
                                        <CardDescription>Best performing products this period</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm">View All</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {topProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-gray-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{product.name}</h4>
                                                    <p className="text-sm text-gray-500">{product.sales.toLocaleString()} sales</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">KES {product.revenue.toLocaleString()}</p>
                                                <div
                                                    className={`flex items-center gap-1 text-sm ${
                                                        product.growth >= 0 ? "text-green-600" : "text-red-600"
                                                    }`}
                                                >
                                                    {product.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                    {Math.abs(product.growth)}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Recent Activity</CardTitle>
                                        <CardDescription>Latest user actions</CardDescription>
                                    </div>
                                    <Activity className="w-5 h-5 text-gray-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3 p-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Users className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm">
                                                    <span className="font-semibold">{activity.user}</span> {activity.action}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="ghost" className="w-full mt-4" size="sm">
                                    Show More
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Traffic Sources</CardTitle>
                                <CardDescription>Where your visitors come from</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { source: "Organic Search", percentage: 45, color: "bg-blue-500" },
                                        { source: "Direct", percentage: 25, color: "bg-green-500" },
                                        { source: "Social Media", percentage: 15, color: "bg-purple-500" },
                                        { source: "Referral", percentage: 10, color: "bg-yellow-500" },
                                        { source: "Email", percentage: 5, color: "bg-red-500" },
                                    ].map((item, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>{item.source}</span>
                                                <span className="font-medium">{item.percentage}%</span>
                                            </div>
                                            <Progress value={item.percentage} className="h-2" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Sales Performance</CardTitle>
                                <CardDescription>Revenue trend</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64">
                                    <ReactECharts option={areaChartOption} style={{ height: "100%", width: "100%" }} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="reports">
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Reports</CardTitle>
                            <CardDescription>Download detailed reports for each month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500">Reports feature coming soon...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Summary Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100">Average Order Value</p>
                                <h3 className="text-2xl font-bold mt-2">
                                    KES {stats.summary.averageOrderValue.toLocaleString()}
                                </h3>
                                <p className="text-blue-100 mt-1">+8.2% from last month</p>
                            </div>
                            <CreditCard className="w-12 h-12 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100">Customer Satisfaction</p>
                                <h3 className="text-2xl font-bold mt-2">{stats.summary.customerSatisfaction}/5.0</h3>
                                <p className="text-green-100 mt-1">Based on reviews</p>
                            </div>
                            <BarChart3 className="w-12 h-12 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100">Returning Customers</p>
                                <h3 className="text-2xl font-bold mt-2">{stats.summary.returningCustomersPercent}%</h3>
                                <p className="text-purple-100 mt-1">Repeat purchase rate</p>
                            </div>
                            <Users className="w-12 h-12 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;