import { Card, CardContent } from "@/components/ui/card";
import {
  FiUsers,
  FiAlertCircle,
  FiSend,
  FiFileText,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";
import { GrowthStat } from "@/types/dashboard";
import {
  getGrowthIcon,
  getGrowthColor,
  calculateGrowthPercentage,
} from "../utils/dashboard";

interface StatsCardsProps {
  isLoading: boolean;
  isError: boolean;
  totalClients: number;
  growthData: GrowthStat[];
  disputesCount: number;
  disputeGrowth: number;
  reportCount: number;
  reportGrowth: number;
}

export const StatsCards = ({
  isLoading,
  isError,
  totalClients,
  growthData,
  disputesCount,
  disputeGrowth,
  reportCount,
  reportGrowth,
}: StatsCardsProps) => {
  const growthPercentage = calculateGrowthPercentage(growthData);

  // Helper function to render the appropriate icon
  const renderGrowthIcon = (percentage: number) => {
    const iconType = getGrowthIcon(percentage);
    if (iconType === "up") {
      return <FiTrendingUp className="w-3 h-3 mr-1" />;
    } else if (iconType === "down") {
      return <FiTrendingDown className="w-3 h-3 mr-1" />;
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {/* Total Clients Card */}
      <Card className="h-[139px] rounded-lg shadow-none">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#171744]">
                Total Clients
              </p>
              <p className="text-[24px] font-bold mt-3">
                {isLoading ? "Loading..." : isError ? "Error" : totalClients}
              </p>
              {!isLoading && !isError && growthData && (
                <p
                  className={`text-[12px] ${getGrowthColor(
                    growthPercentage
                  )} mt-3 flex items-center`}
                >
                  {renderGrowthIcon(growthPercentage)}
                  {growthPercentage > 0 ? "+" : ""}
                  {growthPercentage}% from last month
                </p>
              )}
            </div>
            <FiUsers className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* Active Disputes Card */}
      <Card className="h-[139px] rounded-lg shadow-none">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#171744]">
                Active Disputes
              </p>
              <p className="text-[24px] font-bold mt-3">{disputesCount}</p>
              <p
                className={`text-[12px] mt-3 flex items-center ${getGrowthColor(
                  disputeGrowth
                )}`}
              >
                {renderGrowthIcon(disputeGrowth)}
                {disputeGrowth > 0 ? "+" : ""}
                {disputeGrowth}% from last month
              </p>
            </div>
            <FiAlertCircle className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* Letters Sent Card */}
      <Card className="h-[139px] rounded-lg shadow-none">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#171744]">
                Letters Sent
              </p>
              <p className="text-[24px] font-bold mt-3">57</p>
              <p className="text-[12px] text-[#22C55E] mt-3 flex items-center">
                <FiTrendingUp className="w-3 h-3 mr-1" />
                +16% from last month
              </p>
            </div>
            <FiSend className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* Credit Reports Card */}
      <Card className="h-[139px] rounded-lg shadow-none">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#171744]">
                Credit Reports
              </p>
              <p className="text-[24px] font-bold mt-3">{reportCount}</p>
              <p
                className={`text-[12px] mt-3 flex items-center ${getGrowthColor(
                  reportGrowth
                )}`}
              >
                {renderGrowthIcon(reportGrowth)}
                {reportGrowth > 0 ? "+" : ""}
                {reportGrowth}% from last month
              </p>
            </div>
            <FiFileText className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
