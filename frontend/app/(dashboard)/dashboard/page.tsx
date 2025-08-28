// dashboard/page.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FiUsers,
  FiAlertCircle,
  FiSend,
  FiFileText,
  FiTrendingUp,
  FiClock,
} from "react-icons/fi";
import dynamic from "next/dynamic";

const LineChart = dynamic(
  () => import("recharts").then((recharts) => recharts.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import("recharts").then((recharts) => recharts.Line),
  { ssr: false }
);

// Dynamically import Recharts to avoid SSR issues

const XAxis = dynamic(
  () => import("recharts").then((recharts) => recharts.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((recharts) => recharts.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import("recharts").then((recharts) => recharts.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("recharts").then((recharts) => recharts.Tooltip),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import("recharts").then((recharts) => recharts.ResponsiveContainer),
  { ssr: false }
);

// Dummy data - matching the image exactly
const recentActivity = [
  {
    id: 1,
    initials: "JS",
    name: "John Smith",
    action: "Credit report imported",
    time: "2 hours ago",
  },
  {
    id: 2,
    initials: "SJ",
    name: "Sarah Johnson",
    action: "Dispute letter sent to Equifix",
    time: "4 hours ago",
  },
  {
    id: 3,
    initials: "MD",
    name: "Mike Davis",
    action: "New client added",
    time: "6 hours ago",
  },
  {
    id: 4,
    initials: "LW",
    name: "Lisa Wilson",
    action: "Credit report updated",
    time: "8 hours ago",
  },
];

const clientGrowthData = [
  { month: "Feb", clients: 22 },
  { month: "Mar", clients: 27 },
  { month: "Apr", clients: 31 },
  { month: "May", clients: 38 },
  { month: "Jun", clients: 47 },
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section - Exact match to image */}
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2 flex items-center">
          <p className="mr-2">👋</p>
          Welcome back, John
        </h1>
        <p className="text-gray-600">
          Welcome back! Here&apos;s what&apos;s happening with your credit
          repair business.
        </p>
      </div>

      {/* Stats Cards - Exact match to image */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients Card */}
        <Card className="border border-gray-200 rounded-lg shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Clients
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">47</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <FiTrendingUp className="w-3 h-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <FiUsers className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Disputes Card */}
        <Card className="border border-gray-200 rounded-lg shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Disputes
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">23</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <FiTrendingUp className="w-3 h-3 mr-1" />
                  +5% from last month
                </p>
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <FiAlertCircle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Letters Sent Card */}
        <Card className="border border-gray-200 rounded-lg shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Letters Sent
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">156</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <FiTrendingUp className="w-3 h-3 mr-1" />
                  +18% from last month
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <FiSend className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Imported Card */}
        <Card className="border border-gray-200 rounded-lg shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Reports Imported
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">31</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <FiTrendingUp className="w-3 h-3 mr-1" />
                  +8% from last month
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <FiFileText className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Exact match to image */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border border-gray-200 rounded-lg shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Recent Activity
            </CardTitle>
            <p className="text-sm text-gray-600">
              Latest updates from your credit repair workflow
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start bg-gray-50 rounded-lg p-3"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">
                        {activity.initials}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.name}
                    </p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>

                  {/* Time */}
                  <div className="flex items-center text-xs text-gray-500 whitespace-nowrap mt-2">
                    <FiClock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clients Overview Chart */}
        {/* Clients Overview Chart */}
        <Card className="border border-gray-200 rounded-lg shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Clients Overview
            </CardTitle>
            <p className="text-sm text-gray-600">
              Your client growth over the past 6 months
            </p>
          </CardHeader>

          <CardContent>
            <div className="h-56 w-full mt-2">
              {" "}
              {/* increased height for clarity */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={clientGrowthData}
                  margin={{ top: 10, right: 20, left: 20, bottom: 20 }} // extra chart margin
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 13, fill: "#6b7280" }}
                    tickMargin={25} // extra space below ticks
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 13, fill: "#6b7280" }}
                    width={40} // wider Y axis spacing
                    tickMargin={25} // extra space from axis
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="clients"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#3b82f6" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
