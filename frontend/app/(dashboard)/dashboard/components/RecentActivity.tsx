import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiClock } from "react-icons/fi";
import { RecentActivity as RecentActivityType } from "@/types/dashboard";
import { RECENT_ACTIVITIES } from "../constants/dashboard";

export const RecentActivity = ({
  activities = RECENT_ACTIVITIES,
}: {
  activities?: RecentActivityType[];
}) => {
  return (
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
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start bg-[#F9FAFB] rounded-lg p-3"
            >
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-[#F1F5F9] flex items-center justify-center">
                  <span className="text-[14px] font-medium text-[#3D3D3D]">
                    {activity.initials}
                  </span>
                </div>
              </div>
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
  );
};
