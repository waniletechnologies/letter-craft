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
import { fetchLettersStats } from "@/lib/lettersApi";

const DashboardPage = () => {
  const { data, isLoading, isError } = useClientStats();
  const [userName, setUserName] = useState<string>("");
  const [letterCount, setLetterCount] = useState(0);
  const [letterGrowth, setLetterGrowth] = useState(0)
  const [reportCount, setReportCount] = useState(0);
  const [reportGrowth, setReportGrowth] = useState(0);
  const [disputesCount, setDisputesCount] = useState<number>(0);
  const [disputeGrowth, setDisputeGrowth] = useState<number>(0);

  useEffect(() => {
    fetchDisputeData();
    fetchCreditReportData();
    fetchUserData();
    fetchLettersData();
  }, []);

  const fetchDisputeData = async () => {
    try {
      const stats = await fetchDisputeStats();
      

      const countsByMonth = stats.monthlyCounts;
      console.log("Counts By Month:", countsByMonth);

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const currentMonthIndex = new Date().getMonth(); // 0-based index
      const prevMonthIndex =
        currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;

      const currentMonthName = monthNames[currentMonthIndex];
      const prevMonthName = monthNames[prevMonthIndex];

      console.log("Current Month Name:", currentMonthName);
      console.log("Previous Month Name:", prevMonthName);

      // ✅ Find those months in the response
      const currentMonthData = countsByMonth.find(
        (m: { month: string }) => m.month === currentMonthName
      );
      const prevMonthData = countsByMonth.find(
        (m: { month: string }) => m.month === prevMonthName
      );

      const current = currentMonthData?.disputes || 0;
      setDisputesCount(current);
      const prev = prevMonthData?.disputes || 0;
      const growth =
        prev > 0 ? ((current - prev) / prev) * 100 : current > 0 ? 100 : 0;

      setDisputeGrowth(Math.round(growth * 10) / 10);
    } catch (err) {
      console.error("Failed to fetch disputes:", err);
      setDisputesCount(0);
      setDisputeGrowth(0);
    }
  };

  const fetchLettersData = async () => {
    try {
      const stats = await fetchLettersStats();
      

      const countsByMonth = stats.monthlyCounts;
      console.log("Counts By Month:", countsByMonth);

      // Log each month’s count clearly
      countsByMonth.forEach((m: { month: string; letters: number }) => {
        console.log(`${m.month}: ${m.letters} letters`);
      });

      // ✅ Get current and previous month names dynamically
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const currentMonthIndex = new Date().getMonth(); // 0-based index
      const prevMonthIndex =
        currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;

      const currentMonthName = monthNames[currentMonthIndex];
      const prevMonthName = monthNames[prevMonthIndex];

      console.log("Current Month Name:", currentMonthName);
      console.log("Previous Month Name:", prevMonthName);

      // ✅ Find those months in the response
      const currentMonthData = countsByMonth.find(
        (m: { month: string }) => m.month === currentMonthName
      );
      const prevMonthData = countsByMonth.find(
        (m: { month: string }) => m.month === prevMonthName
      );

      const current = currentMonthData?.letters || 0;
      
      setLetterCount(current);
      const prev = prevMonthData?.letters || 0;

      console.log(`${currentMonthName}: ${current} letters`);
      console.log(`${prevMonthName}: ${prev} letters`);

      // ✅ Compute growth correctly
      const growth =
        prev > 0 ? ((current - prev) / prev) * 100 : current > 0 ? 100 : 0;

      console.log("Growth (%):", growth);
      setLetterGrowth(Math.round(growth * 10) / 10);
    } catch (err) {
      console.log("Failed to fetch letters: ", err);
    }
  };

  const fetchCreditReportData = async () => {
    try {
      const stats = await fetchCreditReportStats();
      if (stats.success) {
        

        const countsByMonth = stats.monthlyCounts;
        console.log("Counts By Month:", countsByMonth);

        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const currentMonthIndex = new Date().getMonth(); // 0-based index
        const prevMonthIndex =
          currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;

        const currentMonthName = monthNames[currentMonthIndex];
        const prevMonthName = monthNames[prevMonthIndex];

        console.log("Current Month Name:", currentMonthName);
        console.log("Previous Month Name:", prevMonthName);

        // ✅ Find those months in the response
        const currentMonthData = countsByMonth.find(
          (m: { month: string }) => m.month === currentMonthName
        );
        const prevMonthData = countsByMonth.find(
          (m: { month: string }) => m.month === prevMonthName
        );
        
        const current = currentMonthData?.reports || 0;
        setReportCount(current);
        const prev = prevMonthData?.reports || 0;
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
        letterCount={letterCount}
        letterGrowth={letterGrowth}
        disputeGrowth={disputeGrowth}
        reportCount={reportCount}
        reportGrowth={reportGrowth}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity limit={10} />
        <ClientGrowthChart growthData={growthData} />
      </div>
    </div>
  );
};

export default DashboardPage;
