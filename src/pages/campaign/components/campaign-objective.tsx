import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, SquareMousePointer, VectorSquare } from "lucide-react";

const CampaingObjectiveData = [
  {
    icon: Download,
    title: "App Install",
    value: "install",
    description:
      "This feature allows advertiser to maximize app installs for new user acquisition.",
  },
  {
    icon: VectorSquare,
    title: "Engagement",
    value: "engagement",
    description:
      "This function guarantees installs based on deeper funnel optimization on the basis of soft KPIs.",
  },
  {
    icon: SquareMousePointer,
    title: "Retargeting",
    value: "retargeting",
    description:
      "App retargeting is to re-engage users in various ways, such as, reinstall the app if they have previously uninstalled it, encouraging them to revisit your app's content, or complete specific actions within the app, like finalizing a purchase that was previously abandoned.",
  },
];

const CampaingObjective = ({
  setSelectedGoal,
  selectedGoal,
}: {
  setSelectedGoal: (goal: string) => void;
  selectedGoal: string;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Objective</CardTitle>

        <CardDescription>
          The specific goal or desired outcome an advertising campaign aims to
          achieve.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {CampaingObjectiveData.map((item, idx) => (
            <Card
              key={idx}
              className={`cursor-pointer hover:border-ring/30 border-2 hover:scale-101 ${
                selectedGoal === item.value
                  ? "border-primary border-2 hover:border-primary "
                  : ""
              }`}
              onClick={() => setSelectedGoal(item.value)}
            >
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <item.icon className="h-5 w-5" />
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>

              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaingObjective;
