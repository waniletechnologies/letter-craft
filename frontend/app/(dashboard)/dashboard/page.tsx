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
  { month: "Mar", clients: 47 },
  { month: "Apr", clients: 31 },
  { month: "May", clients: 58 },
  { month: "Jun", clients: 12 },
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section - Exact match to image */}
      <div className="sm:p-8 p-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Total Clients Card */}
        <Card className="h-[139px] rounded-lg shadow-none">
          <CardContent>
            <div className="flex items-start justify-between">
              {/* Left content */}
              <div>
                <p className="text-[14px] font-medium text-[#171744] font-inter">
                  Total Clients
                </p>
                <p className="font-inter text-[24px] font-bold text-[#000000] mt-3">
                  47
                </p>
                <p className="text-[12px] font-poppins text-[#22C55E] font-medium mt-3 flex items-center">
                  <FiTrendingUp className="w-3 h-3 mr-1" />
                  +12% from last month
                </p>
              </div>

              {/* Right icon aligned with first p */}
              <div className=" rounded-full self-start">
                <FiUsers className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-[139px] rounded-lg shadow-none">
          <CardContent>
            <div className="flex items-start justify-between">
              {/* Left content */}
              <div>
                <p className="text-[14px] font-medium text-[#171744] font-inter">
                  Active Disputes
                </p>
                <p className="font-inter text-[24px] font-bold text-[#000000] mt-3">
                  33
                </p>
                <p className="text-[12px] font-poppins text-[#22C55E] font-medium mt-3 flex items-center">
                  <FiTrendingUp className="w-3 h-3 mr-1" />
                  +8% from last month
                </p>
              </div>

              {/* Right icon aligned with first p */}
              <div className=" rounded-full self-start">
                <FiAlertCircle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-[139px] rounded-lg shadow-none">
          <CardContent>
            <div className="flex items-start justify-between">
              {/* Left content */}
              <div>
                <p className="text-[14px] font-medium text-[#171744] font-inter">
                  Letters Sent
                </p>
                <p className="font-inter text-[24px] font-bold text-[#000000] mt-3">
                  57
                </p>
                <p className="text-[12px] font-poppins text-[#22C55E] font-medium mt-3 flex items-center">
                  <FiTrendingUp className="w-3 h-3 mr-1" />
                  +16% from last month
                </p>
              </div>

              {/* Right icon aligned with first p */}
              <div className=" rounded-full self-start">
                <FiSend className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-[139px] rounded-lg shadow-none">
          <CardContent>
            <div className="flex items-start justify-between">
              {/* Left content */}
              <div>
                <p className="text-[14px] font-medium text-[#171744] font-inter">
                  Reports Imported
                </p>
                <p className="font-inter text-[24px] font-bold text-[#000000] mt-3">
                  40
                </p>
                <p className="text-[12px] font-poppins text-[#22C55E] font-medium mt-3 flex items-center">
                  <FiTrendingUp className="w-3 h-3 mr-1" />
                  +18% from last month
                </p>
              </div>

              {/* Right icon aligned with first p */}
              <div className=" rounded-full self-start">
                <FiFileText className="w-5 h-5 border-[#000000]" />
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
                  className="flex items-start bg-[#F9FAFB] rounded-lg p-3"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-[#F1F5F9] flex items-center justify-center">
                      <span className="text-[14px] font-medium text-[#3D3D3D]">
                        {activity.initials}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#3D3D3D]">
                      {activity.name}
                    </p>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] text-[#897E9A]">
                          {activity.action}
                        </p>
                      </div>
                      <div className="flex items-center text-xs text-[#897E9A] whitespace-nowrap ">
                        <FiClock className="w-3 h-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
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
                  <CartesianGrid vertical={false} stroke="#01012E14" />
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
                    stroke="#2196F3"
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
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
