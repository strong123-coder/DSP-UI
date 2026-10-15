// Choices for line item targeting.

// ISO 639-1 codes, matched against device.language (its primary subtag).
export const LanguageData: Array<{ name: string; value: string }> = [
  ["Arabic", "ar"], ["Bengali", "bn"], ["Bulgarian", "bg"], ["Chinese", "zh"], ["Croatian", "hr"],
  ["Czech", "cs"], ["Danish", "da"], ["Dutch", "nl"], ["English", "en"], ["Filipino", "tl"],
  ["Finnish", "fi"], ["French", "fr"], ["German", "de"], ["Greek", "el"], ["Gujarati", "gu"],
  ["Hebrew", "he"], ["Hindi", "hi"], ["Hungarian", "hu"], ["Indonesian", "id"], ["Italian", "it"],
  ["Japanese", "ja"], ["Kannada", "kn"], ["Korean", "ko"], ["Malay", "ms"], ["Malayalam", "ml"],
  ["Marathi", "mr"], ["Norwegian", "no"], ["Odia", "or"], ["Persian", "fa"], ["Polish", "pl"],
  ["Portuguese", "pt"], ["Punjabi", "pa"], ["Romanian", "ro"], ["Russian", "ru"], ["Serbian", "sr"],
  ["Slovak", "sk"], ["Spanish", "es"], ["Swahili", "sw"], ["Swedish", "sv"], ["Tamil", "ta"],
  ["Telugu", "te"], ["Thai", "th"], ["Turkish", "tr"], ["Ukrainian", "uk"], ["Urdu", "ur"],
  ["Vietnamese", "vi"],
].map(([name, value]) => ({ name: `${name} (${value})`, value }));

export const SegmentData: Array<{ name: string; value: "clickers" | "viewers" | "any" }> = [
  { name: "Clicked or saw an ad", value: "any" },
  { name: "Clicked an ad", value: "clickers" },
  { name: "Saw an ad", value: "viewers" },
];

export const FrequencyUnitData: Array<{ name: string; value: "hour" | "day" | "week" }> = [
  { name: "Hour(s)", value: "hour" },
  { name: "Day(s)", value: "day" },
  { name: "Week(s)", value: "week" },
];

// Every IANA zone the browser knows, UTC first.
export const timezoneData = (): Array<{ name: string; value: string }> => {
  let zones: string[] = [];
  try {
    zones = Intl.supportedValuesOf("timeZone");
  } catch {
    zones = ["Asia/Kolkata", "America/New_York", "Europe/London"];
  }
  return [{ name: "UTC", value: "UTC" }, ...zones.filter((z) => z !== "UTC").map((z) => ({ name: z.replace(/_/g, " "), value: z }))];
};

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
