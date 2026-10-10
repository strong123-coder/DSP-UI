import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ShieldCheck, Zap, EyeOff, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock, Section } from "../_shared";

const SDK = "github.com/maket-dotcom/MCP-BID-BIDDER/sdk/go/mktool";

const STEPS = [
  { t: "Register your server", d: "Add MCP Server → pick categories, choose which tools may show an ad, and block hosts or categories you don't want." },
  { t: "Create a test key", d: "Open your server → API keys → Test key. Copy it; it's shown once." },
  { t: "Add the SDK", d: "Install the Go package and add one option when you create your MCP server (below)." },
  { t: "See a test ad", d: "Call a tool from MCP Inspector or your AI client. A “Sponsored · MkTool test ad” line appears under the result." },
  { t: "Submit for review", d: "Once approved, create a live key, swap it in, and real ads start serving." },
];

const GUARANTEES = [
  { icon: CheckCircle2, t: "Your output is never changed", d: "One block is appended after your tool result, labelled “Sponsored” and addressed to the user — never phrased as an instruction to the AI." },
  { icon: Zap, t: "Fails open", d: "No ad if our bidder is slow (>80 ms), down, or has nothing relevant. Tool errors never get ads." },
  { icon: EyeOff, t: "Sends almost nothing", d: "Tool name, category, optional keywords/intent you choose, the AI host's name, and a salted hash of the session id. Never arguments, results or prompts." },
  { icon: Power, t: "Kill switches", d: "Pause in this portal (takes effect in seconds) or set MKTOOL_DISABLED=1 on your server." },
];

const McpGuide: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-5 max-w-4xl pb-10">
      <Section title="How it works" desc="About 15 minutes from sign-up to your first test ad.">
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li key={s.t} className="flex gap-3">
              <span className="w-6 h-6 shrink-0 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">{i + 1}</span>
              <div>
                <div className="text-sm font-medium">{s.t}</div>
                <div className="text-sm text-muted-foreground">{s.d}</div>
              </div>
            </li>
          ))}
        </ol>
        <Button onClick={() => navigate("/supply/servers/new")}>Add MCP server</Button>
      </Section>

      <Section title="Go (mark3labs/mcp-go)">
        <CodeBlock title="Install" code={`go get ${SDK}@latest`} />
        <CodeBlock
          title=".env"
          code={`MKTOOL_ENDPOINT=<bidder URL from your server's Integrate panel>\nMKTOOL_API_KEY=mk_test_...            # server-side only, never commit it\nMKTOOL_SESSION_SALT=<random 32+ chars> # keep stable across restarts`}
        />
        <CodeBlock
          title="main.go"
          code={`ads := mktool.New(mktool.Config{Placement: "tool_footer"})
defer ads.Close()

s := server.NewMCPServer("your-server", "1.0.0",
    server.WithToolHandlerMiddleware(ads.Middleware()),
)`}
        />
        <CodeBlock
          title="Optional, inside a tool handler"
          code={`mktool.SetKeywords(ctx, "attribution", "ga4") // ≤5 short words you choose — never the user's prompt
mktool.SetIntent(ctx, "evaluate_solution")   // how_to | evaluate_solution | troubleshoot | buy | learn
mktool.Skip(ctx)                             // no ad for this result`}
        />
        <CodeBlock
          title="What your users see"
          code={`Here is your normal tool output…

Sponsored · Acme Analytics
Server-side attribution in 10 minutes
Fix GA4 data loss with first-party tracking.
Learn more (acme.example): https://…/v1/c/…`}
        />
      </Section>

      <Section icon={<ShieldCheck className="w-4 h-4 text-primary" />} title="What the SDK guarantees">
        <div className="grid md:grid-cols-2 gap-4">
          {GUARANTEES.map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex gap-3">
              <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium">{t}</div>
                <div className="text-sm text-muted-foreground">{d}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Check the listing policy of each AI host or directory you distribute through, and block any host that
          doesn't allow sponsored content.
        </p>
      </Section>

      <Section title="Not using Go?" desc="Call the bidder directly and append the returned creative yourself.">
        <CodeBlock
          title="HTTP"
          code={`POST {MKTOOL_ENDPOINT}/v1/ads/select
Authorization: Bearer <MKTOOL_API_KEY>
Content-Type: application/json

{"placement":"tool_footer","tool":"compare_tools","host":{"name":"claude-ai"},
 "context":{"category":"marketing_analytics","keywords":["attribution"]},
 "session":"h:<hmac of your session id>"}

→ 200 {"decisionId":"…","disclosure":"Sponsored","creative":{"advertiser":"…","title":"…",
        "description":"…","cta":"Learn more","displayDomain":"…","clickUrl":"…"}}
→ 204 no ad (X-Mktool-Nofill header says why)`}
        />
        <p className="text-xs text-muted-foreground">TypeScript and Python SDKs are coming.</p>
      </Section>
    </div>
  );
};

export default McpGuide;
