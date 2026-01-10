"use client"

import React from "react";
import OrdersTable from "./components/orders-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminOrdersDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Orders Dashboard</h1>
                    <p className="text-gray-600">Manage and track all customer orders</p>
                </div>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl">All Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <OrdersTable />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}