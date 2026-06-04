import { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { AddCampaignFormValues } from "@/utils/schemas/campaign";
import { InventoryTypeData } from "@/utils/data/campaignData";

const StepInventoryType = () => {
  const { setValue, watch } = useFormContext<AddCampaignFormValues>();

  const selectedInventoryType = watch("inventoryType") || "programmatic";
  const oemList = watch("oemPremiumPartners") || [];
  const [oemInput, setOemInput] = useState("");

  const addOemTag = () => {
    if (oemInput.trim() && !oemList.includes(oemInput.trim())) {
      setValue("oemPremiumPartners", [...oemList, oemInput.trim()], {
        shouldValidate: true,
      });
      setOemInput("");
    }
  };

  const removeOemTag = (idx: number) => {
    setValue(
      "oemPremiumPartners",
      oemList.filter((_, i) => i !== idx),
      { shouldValidate: true },
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Type</CardTitle>

          <CardDescription>
            Refers to the various forms of advertising space or placements
            available for purchase or allocation, such as display ads, video
            ads, or sponsored content.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {InventoryTypeData.map((item, idx) => (
              <Card
                key={idx}
                className={`cursor-pointer hover:border-ring/30 border-2 hover:scale-101 ${
                  selectedInventoryType === item.value
                    ? "border-primary border-2 hover:border-primary "
                    : ""
                }`}
                onClick={() =>
                  setValue("inventoryType", item.value, {
                    shouldValidate: true,
                  })
                }
              >
                <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                  <Download className="h-5 w-5" />
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

      {selectedInventoryType === "oem_premium_partners" && (
        <Card className="animate-in fade-in duration-200">
          <CardHeader>
            <CardTitle>Specify OEM Partners</CardTitle>
            <CardDescription>
              Select or type partner brands where ads should be deployed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Xiaomi, Samsung, Oppo"
                value={oemInput}
                onChange={(e) => setOemInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOemTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addOemTag}>
                Add
              </Button>
            </div>
            {oemList.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {oemList.map((tag, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-xs px-2.5 py-1 rounded-full font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeOemTag(idx)}
                      className="hover:text-destructive text-sm font-bold"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StepInventoryType;
