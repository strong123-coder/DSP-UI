import React, { useState } from "react";
import { Info, Check, Copy } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Info popover documenting the {macro} tokens the bid engine substitutes into a
 * campaign's CTA / VTA URLs at bid time. Mirrors the "CTA / VTA URL macros" guide
 * in the DSP bid engine README. Click any macro chip to copy it.
 */

type MacroItem = { token: string; desc: string };
type MacroGroup = { group: string; items: MacroItem[] };

// Ordered most-useful-first. The first group covers the AppsFlyer/Branch install
// attribution params advertisers actually need.
const MACRO_GROUPS: MacroGroup[] = [
  {
    group: "Attribution (most used)",
    items: [
      { token: "{click_id}", desc: "Unique click id minted per click (MMP dedup)" },
      { token: "{gaid}", desc: "Google Ad ID — fills on Android app traffic" },
      { token: "{idfa}", desc: "Apple IDFA — fills on iOS app traffic" },
      { token: "{ifa}", desc: "Raw device.ifa (gaid or idfa)" },
      { token: "{source}", desc: "App bundle the impression came from (install sub-source)" },
      { token: "{camp_id}", desc: "Campaign id (alias of {campaign_id})" },
      { token: "{campaign_title}", desc: "Campaign name" },
      { token: "{creative_id}", desc: "Creative id served" },
    ],
  },
  {
    group: "Auction / IDs",
    items: [
      { token: "{auction_id}", desc: "OpenRTB request id" },
      { token: "{imp_id}", desc: "Impression id" },
      { token: "{tagid}", desc: "Placement tag id (imp.tagid)" },
      { token: "{zone}", desc: "Zone from ?zone=" },
      { token: "{tid}", desc: "source.tid" },
      { token: "{bid_id}", desc: "Engine bid id" },
      { token: "{campaign_id}", desc: "Campaign id" },
    ],
  },
  {
    group: "Price",
    items: [
      { token: "{auction_price}", desc: "Settled CPM — VTA only (see notes)" },
      { token: "{bid_price}", desc: "Your bid CPM" },
      { token: "{currency}", desc: "Currency (cur)" },
      { token: "{bidfloor}", desc: "Impression floor" },
    ],
  },
  {
    group: "Device",
    items: [
      { token: "{ua}", desc: "User agent" },
      { token: "{ip}", desc: "IPv4" },
      { token: "{ipv6}", desc: "IPv6" },
      { token: "{make}", desc: "Device make" },
      { token: "{model}", desc: "Device model" },
      { token: "{os}", desc: "OS" },
      { token: "{osv}", desc: "OS version" },
      { token: "{devicetype}", desc: "Device type" },
      { token: "{language}", desc: "Language" },
      { token: "{carrier}", desc: "Carrier" },
      { token: "{connectiontype}", desc: "Connection type" },
      { token: "{dnt}", desc: "Do-not-track" },
      { token: "{lmt}", desc: "Limit ad tracking" },
    ],
  },
  {
    group: "Geo",
    items: [
      { token: "{country}", desc: "Alpha-3 country (e.g. IND)" },
      { token: "{region}", desc: "Region" },
      { token: "{city}", desc: "City" },
      { token: "{zip}", desc: "Postal code" },
      { token: "{metro}", desc: "Metro / DMA" },
      { token: "{lat}", desc: "Latitude" },
      { token: "{lon}", desc: "Longitude" },
    ],
  },
  {
    group: "App",
    items: [
      { token: "{app_bundle}", desc: "App bundle id" },
      { token: "{app_id}", desc: "App store id" },
      { token: "{app_name}", desc: "App name" },
      { token: "{app_domain}", desc: "App domain" },
    ],
  },
  {
    group: "Site",
    items: [
      { token: "{site_domain}", desc: "Site domain" },
      { token: "{site_page}", desc: "Page URL" },
      { token: "{site_id}", desc: "Site id" },
    ],
  },
  {
    group: "Publisher",
    items: [
      { token: "{pub_id}", desc: "Publisher id" },
      { token: "{pub_name}", desc: "Publisher name" },
    ],
  },
  {
    group: "User",
    items: [
      { token: "{user_id}", desc: "User id" },
      { token: "{buyeruid}", desc: "Buyer uid" },
      { token: "{gender}", desc: "Gender" },
      { token: "{yob}", desc: "Year of birth" },
    ],
  },
  {
    group: "Dynamic",
    items: [
      { token: "{timestamp}", desc: "Bid-time unix timestamp" },
      { token: "{cachebuster}", desc: "Random cache-buster" },
      { token: "{rand}", desc: "Random number" },
    ],
  },
];

const EXAMPLE_CTA =
  "https://app.appsflyer.com/<store_id>?pid=<partner>&af_siteid=strong_dsp&c={campaign_title}&af_sub_siteid={source}&af_c_id={camp_id}&af_sub1={idfa}&af_sub2={gaid}&clickid={click_id}";

const MacroChip: React.FC<{ token: string; desc: string }> = ({ token, desc }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      title={`${desc} — click to copy`}
      className="group inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[11px] text-foreground hover:bg-muted transition-colors cursor-pointer"
    >
      <span>{token}</span>
      {copied ? (
        <Check className="w-3 h-3 text-emerald-500" />
      ) : (
        <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
      )}
    </button>
  );
};

interface MacroHelpProps {
  className?: string;
}

export const MacroHelp: React.FC<MacroHelpProps> = ({ className }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="URL macro reference"
          title="Available URL macros"
          className={cn(
            "inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer align-middle",
            className
          )}
        >
          <Info className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[360px] p-0">
        <div className="px-4 py-3 border-b border-border/50">
          <p className="text-sm font-semibold">CTA / VTA URL macros</p>
          <p className="text-xs text-muted-foreground mt-1">
            Drop <code className="font-mono">{"{macro}"}</code> tokens anywhere in your
            CTA / VTA URL. The engine replaces them at bid time so your MMP
            (AppsFlyer / Branch) receives the device id, click id, geo, etc. Click a
            macro to copy it.
          </p>
        </div>

        <div className="max-h-[320px] overflow-y-auto px-4 py-3 space-y-3">
          {MACRO_GROUPS.map((g) => (
            <div key={g.group}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                {g.group}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((m) => (
                  <MacroChip key={m.token} token={m.token} desc={m.desc} />
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-md bg-muted/40 border border-border/50 p-2.5 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Good to know
            </p>
            <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
              <li>An unknown / missing value becomes an empty string — the token never leaks into the URL.</li>
              <li>
                <code className="font-mono">{"{gaid}"}</code> /{" "}
                <code className="font-mono">{"{idfa}"}</code> /{" "}
                <code className="font-mono">{"{source}"}</code> populate only on
                <strong> app / install</strong> inventory (empty on web).
              </li>
              <li>
                <code className="font-mono">{"{auction_price}"}</code> works in the
                <strong> VTA</strong> pixel but not inside the CTA landing URL.
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Example CTA (AppsFlyer install link)
            </p>
            <pre className="text-[10px] font-mono whitespace-pre-wrap break-all bg-muted/50 rounded-md p-2 text-foreground/80">
              {EXAMPLE_CTA}
            </pre>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MacroHelp;
