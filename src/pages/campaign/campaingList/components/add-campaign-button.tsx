import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const AddCampaignButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      onClick={onClick}
      aria-label="Add new campaign"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer z-50"
    >
      <Plus
        strokeWidth={2.5}
        className="transition-transform duration-300 w-7 h-7"
      />
    </Button>
  );
};

export default AddCampaignButton;
