import { GrowthStat } from "@/types/dashboard";
import { ALL_MONTHS } from "../constants/dashboard";

export const calculateGrowthPercentage = (growthData: GrowthStat[]): number => {
  if (!growthData || growthData.length < 2) return 0;

  const sortedData = [...growthData].sort(
    (a, b) => ALL_MONTHS.indexOf(a.month) - ALL_MONTHS.indexOf(b.month)
  );

  const currentMonthData = sortedData[sortedData.length - 1];
  const previousMonthData = sortedData[sortedData.length - 2];

  if (
    !currentMonthData ||
    !previousMonthData ||
    previousMonthData.clients === 0
  ) {
    return 0;
  }

  const growth =
    ((currentMonthData.clients - previousMonthData.clients) /
      previousMonthData.clients) *
    100;
  return Math.round(growth * 10) / 10;
};

export const getGrowthIcon = (percentage: number) => {
  if (percentage > 0) {
    return "up";
  } else if (percentage < 0) {
    return "down";
  }
  return null;
};

export const getGrowthColor = (percentage: number): string => {
  if (percentage > 0) {
    return "text-[#22C55E]";
  } else if (percentage < 0) {
    return "text-[#EF4444]";
  }
  return "text-gray-500";
};
