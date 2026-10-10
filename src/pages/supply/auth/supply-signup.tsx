import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCw, Lock, Mail, Building2, User, Phone, Sparkles, CheckCircle2 } from "lucide-react";
import logo from "@/assets/strongmetrics-logo.webp";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { supplySignupSchema, type SupplySignupFormValues } from "@/utils/schemas/auth";
import { useSupplySignup } from "@/query/useMcpPublisher";

const FIELDS: {
  name: keyof SupplySignupFormValues;
  label: string;
  type: string;
  placeholder: string;
  icon: React.ElementType;
}[] = [
  { name: "orgName", label: "Company", type: "text", placeholder: "Acme Tools Inc.", icon: Building2 },
  { name: "name", label: "Your name", type: "text", placeholder: "Jane Doe", icon: User },
  { name: "email", label: "Work email", type: "email", placeholder: "you@company.com", icon: Mail },
  { name: "mobile", label: "Phone (optional)", type: "tel", placeholder: "+91 98xxxxxx", icon: Phone },
  { name: "password", label: "Password", type: "password", placeholder: "At least 8 characters", icon: Lock },
];

export default function SupplySignup() {
  const navigate = useNavigate();
  const { mutate, isPending } = useSupplySignup();

  const form = useForm<SupplySignupFormValues>({
    resolver: zodResolver(supplySignupSchema),
    defaultValues: { orgName: "", name: "", email: "", mobile: "", password: "" },
  });

  const onSubmit = (data: SupplySignupFormValues) => {
    const payload = { ...data, mobile: data.mobile?.trim() || undefined };
    mutate(payload, { onSuccess: () => navigate("/supply/servers/new") });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
      <div className="w-full max-w-[460px]">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Strongmetrics" className="w-56 h-auto mb-5" />
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Monetize your MCP server
          </h2>
          <ul className="text-xs text-muted-foreground mt-3 space-y-1">
            {[
              "One labelled sponsored line under your tool results",
              "Earn on every valid click — you control tools, hosts and categories",
              "One-line Go integration, test ads before approval",
            ].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <Card>
          <CardContent className="pt-6 pb-6 px-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              {FIELDS.map(({ name, label, type, placeholder, icon: Icon }) => (
                <div key={name} className="space-y-1.5">
                  <Label htmlFor={name} className="text-sm font-medium flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" /> {label}
                  </Label>
                  <Input id={name} type={type} placeholder={placeholder} className="h-10" {...form.register(name)} />
                  <div className="h-4 flex items-center">
                    {form.formState.errors[name] && (
                      <p className="text-xs text-destructive font-medium">{form.formState.errors[name]?.message}</p>
                    )}
                  </div>
                </div>
              ))}

              <Button type="submit" size="lg" className="w-full mt-4 cursor-pointer" disabled={isPending}>
                {isPending && <RefreshCw className="w-5 h-5 animate-spin mr-2" />}
                {isPending ? "Creating account..." : "Create publisher account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/supply/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
