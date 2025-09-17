"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useClientStats } from "@/hooks/clients";
import { getCurrentUser } from "@/lib/auth";
import { fetchCreditReportStats } from "@/lib/creditReportApi";
import { fetchDisputeStats } from "@/lib/disputeAPI";
import { GrowthStat } from "@/types/dashboard";
import { ALL_MONTHS } from "./constants/dashboard";
import { WelcomeHeader } from "./components/WelcomeHeader";
import { StatsCards } from "./components/StatsCards";
import { RecentActivity } from "./components/RecentActivity";
import { ClientGrowthChart } from "./components/ClientGrowthChart";

const DashboardPage = () => {
  const { data, isLoading, isError } = useClientStats();
  const [userName, setUserName] = useState<string>("");
  const [reportCount, setReportCount] = useState(0);
  const [reportGrowth, setReportGrowth] = useState(0);
  const [disputesCount, setDisputesCount] = useState<number>(0);
  const [disputeGrowth, setDisputeGrowth] = useState<number>(0);

  useEffect(() => {
    fetchDisputeData();
    fetchCreditReportData();
    fetchUserData();
  }, []);

  const fetchDisputeData = async () => {
    try {
      const stats = await fetchDisputeStats();
      setDisputesCount(stats.total);

      const countsByMonth = stats.monthlyCounts;
      const sorted = countsByMonth.filter(
        (m: { disputes: number }) => m.disputes >= 0
      );
      const current = sorted[sorted.length - 1]?.disputes || 0;
      const prev = sorted[sorted.length - 2]?.disputes || 0;
      const growth =
        prev > 0 ? ((current - prev) / prev) * 100 : current > 0 ? 100 : 0;

      setDisputeGrowth(Math.round(growth * 10) / 10);
    } catch (err) {
      console.error("Failed to fetch disputes:", err);
      setDisputesCount(0);
      setDisputeGrowth(0);
    }
  };

  const fetchCreditReportData = async () => {
    try {
      const stats = await fetchCreditReportStats();
      if (stats.success) {
        setReportCount(stats.total);

        const months = stats.monthlyCounts.filter(
          (m: { reports: number }) => m.reports > 0 || true
        );

        const sorted = [...months].sort(
          (a: { month: string }, b: { month: string }) =>
            ALL_MONTHS.indexOf(a.month) - ALL_MONTHS.indexOf(b.month)
        );
        const current = sorted[sorted.length - 1]?.reports || 0;
        const prev = sorted[sorted.length - 2]?.reports || 0;
        const growth =
          prev > 0 ? ((current - prev) / prev) * 100 : current > 0 ? 100 : 0;
        setReportGrowth(Math.round(growth * 10) / 10);
      }
    } catch {
      setReportCount(0);
      setReportGrowth(0);
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await getCurrentUser();
      setUserName(res?.user?.name || "");
    } catch {
      setUserName("");
    }
  };

  const growthData = useMemo(() => {
    const apiGrowth: GrowthStat[] = data?.data?.growth ?? [];
    const growthMap = new Map<string, number>(
      apiGrowth.map((m: GrowthStat) => [m.month, m.clients])
    );

    return ALL_MONTHS.map((month) => ({
      month,
      clients: growthMap.get(month) ?? 0,
    }));
  }, [data]);

  const totalClients = data?.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <WelcomeHeader userName={userName} />

      <StatsCards
        isLoading={isLoading}
        isError={isError}
        totalClients={totalClients}
        growthData={growthData}
        disputesCount={disputesCount}
        disputeGrowth={disputeGrowth}
        reportCount={reportCount}
        reportGrowth={reportGrowth}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <ClientGrowthChart growthData={growthData} />
      </div>
    </div>
  );
};

export default DashboardPage;
