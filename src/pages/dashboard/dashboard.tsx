import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Upload,
  FileText,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

export default function Dashboard() {
  // Calendar State
  const [selectedDate, setSelectedDate] = useState<number | null>(15);
  const currentMonth = "June 2026";

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Checklist State
  const [completedItems, setCompletedItems] = useState<number[]>([1, 2, 4]);

  // Contributions state
  const [makeProfilePrivate, setMakeProfilePrivate] = useState(false);
  const [savingContributions, setSavingContributions] = useState(false);

  // Visitors statistics
  const visitorsData = [
    { month: "Jan", visitors: 180 },
    { month: "Feb", visitors: 220 },
    { month: "Mar", visitors: 300 },
    { month: "Apr", visitors: 240 },
    { month: "May", visitors: 320 },
    { month: "Jun", visitors: 380 },
  ];

  // Analytics statistics
  const analyticsData = [
    { day: "Mon", count: 280 },
    { day: "Tue", count: 340 },
    { day: "Wed", count: 410 },
    { day: "Thu", count: 380 },
    { day: "Fri", count: 450 },
    { day: "Sat", count: 480 },
    { day: "Sun", count: 418 },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate a premium upload progress bar
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            toast.success(`File "${file.name}" uploaded successfully!`);
            return 100;
          }
          return prev + 20;
        });
      }, 150);
    }
  };

  const triggerFileBrowser = () => {
    fileInputRef.current?.click();
  };

  const handleBookAppointment = () => {
    if (selectedDate) {
      toast.success(
        `Appointment successfully booked for ${currentMonth} ${selectedDate}, 2026!`,
      );
    } else {
      toast.error("Please select a date from the calendar.");
    }
  };

  const toggleChecklistItem = (id: number) => {
    setCompletedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSaveContributions = () => {
    setSavingContributions(true);
    setTimeout(() => {
      setSavingContributions(false);
      toast.success("Contributions visibility updated successfully!");
    }, 800);
  };

  // Generate calendar days for June 2026 (starting on Monday)
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);
  const allDays = [...Array(1).fill(null), ...calendarDays]; // June 1, 2026 is a Monday, so Sunday (null) padding is 1 day

  return (
    <div className="space-y-6">
      {/* THREE-COLUMN RESPONSIVE LAYOUT MATCHING PREVIEW */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* COLUMN 1: BOOK APPOINTMENT */}
        <div className="space-y-6">
          <Card className="flex flex-col h-full justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarIcon className="w-4 h-4 text-primary" />
                Schedule Appointment
              </CardTitle>
              <CardDescription>
                Select a date to organize your consultation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Custom Interactive Calendar Grid */}
              <div className="border border-border p-4 rounded-(--radius) bg-muted/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold">{currentMonth}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="size-7">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Weekday Initials Header */}
                <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground mb-2">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {allDays.map((day, idx) => {
                    if (day === null) return <div key={`empty-${idx}`} />;
                    const isSelected = selectedDate === day;
                    return (
                      <button
                        key={`day-${day}`}
                        onClick={() => setSelectedDate(day)}
                        className={`size-8 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/25"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button
                onClick={handleBookAppointment}
                className="w-full"
                size="lg"
              >
                Book Appointment
              </Button>
            </div>
          </Card>
        </div>

        {/* COLUMN 2: BROWSE FILES, ANALYTICS, & CYCLE REGISTRY */}
        <div className="space-y-6">
          {/* Card 2: Browse Files Upload */}
          <Card>
            <CardContent className="pt-6">
              <div
                onClick={triggerFileBrowser}
                className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/30 transition-all p-8 flex flex-col items-center justify-center text-center cursor-pointer rounded-(--radius) gap-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".png,.jpg,.pdf"
                />

                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-10 h-10 text-primary animate-bounce" />
                    <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                      {uploadedFile.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-10 h-10 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">
                      PNG, JPG, PDF up to 10MB
                    </span>
                  </div>
                )}

                {isUploading && (
                  <div className="w-full bg-border h-1.5 rounded-full overflow-hidden mt-2 max-w-[150px]">
                    <div
                      className="bg-primary h-full transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
              <Button
                onClick={triggerFileBrowser}
                className="w-full mt-4"
                variant="default"
              >
                Browse Files
              </Button>
            </CardContent>
          </Card>

          {/* Card 4: Analytics Chart */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Analytics
                </CardTitle>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-foreground">
                    418.2K
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                    +10%
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Analytics
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analyticsData}
                    margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorYellow"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--chart-1)"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--chart-1)"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border border-border p-2 shadow-md rounded-(--radius) text-xs">
                              <p className="font-semibold text-foreground">
                                {payload[0].value}K Visitors
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorYellow)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Cycle Check List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">
                5 days remaining in cycle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {[
                { id: 1, name: "Edge Requests", value: "$1.83K" },
                { id: 2, name: "Fast Data Transfer", value: "$952.51" },
                { id: 3, name: "Monitoring data points", value: "$901.20" },
                { id: 4, name: "Web Analytics Events", value: "$603.71" },
                { id: 5, name: "ISR Writes", value: "524.52K / 2M" },
              ].map((item) => {
                const isCompleted = completedItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className="flex items-center justify-between text-xs cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-4.5 rounded-full border flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30 group-hover:border-primary/50"
                        }`}
                      >
                        {isCompleted && <Check className="w-3 h-3" />}
                      </div>
                      <span
                        className={`font-medium transition-all ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <span className="font-semibold text-muted-foreground">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* COLUMN 3: VISITORS LINE & CONTRIBUTIONS PREFERENCES */}
        <div className="space-y-6">
          {/* Card 3: Visitors Line Chart */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Visitors
                </CardTitle>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">
                  +2% vs last month
                </span>
              </div>
              <CardDescription className="text-xs">
                Last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 mt-4">
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={visitorsData}
                    margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorYellowLine"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--chart-1)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--chart-1)"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border border-border p-2 shadow-md rounded-(--radius) text-xs">
                              <p className="font-semibold text-foreground">
                                {payload[0].value}K
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="var(--chart-1)"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorYellowLine)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Card 6: Contributions & Activity settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">
                Contributions & Activity
              </CardTitle>
              <CardDescription className="text-xs">
                Manage your contributions and activity visibility.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div
                onClick={() => setMakeProfilePrivate(!makeProfilePrivate)}
                className="flex items-start gap-3 cursor-pointer select-none group"
              >
                <div
                  className={`size-4.5 rounded-full border shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                    makeProfilePrivate
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30 group-hover:border-primary/50"
                  }`}
                >
                  {makeProfilePrivate && <Check className="w-3 h-3" />}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">
                    Make profile private and hide activity
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Enabling this will hide your contributions and activity from
                    your GitHub profile and from social features like followers,
                    stars, feeds, leaderboards and releases.
                  </p>
                </div>
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button
                onClick={handleSaveContributions}
                disabled={savingContributions}
                className="w-full"
                variant="default"
              >
                {savingContributions ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
