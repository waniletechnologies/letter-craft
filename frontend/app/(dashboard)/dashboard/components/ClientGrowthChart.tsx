import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GrowthStat } from "@/types/dashboard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ClientGrowthChartProps {
  growthData: GrowthStat[];
}

export const ClientGrowthChart = ({ growthData }: ClientGrowthChartProps) => {
  return (
    <Card className="border border-gray-200 rounded-lg shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Clients Overview
        </CardTitle>
        <p className="text-sm text-gray-600">
          Your client growth over the past months
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={growthData}
              margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid vertical={false} stroke="#01012E14" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 13, fill: "#6b7280" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 13, fill: "#6b7280" }}
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
  );
};
