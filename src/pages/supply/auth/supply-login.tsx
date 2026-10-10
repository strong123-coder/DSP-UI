import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCw, Lock, Mail, Sparkles } from "lucide-react";
import logo from "@/assets/strongmetrics-logo.webp";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { superAdminLoginSchema, type SuperAdminLoginFormValues } from "@/utils/schemas/auth";
import { useSupplyLogin } from "@/query/useMcpPublisher";

// Email + password, no org picker: supply emails are globally unique.
export default function SupplyLogin() {
  const navigate = useNavigate();
  const { mutate, isPending } = useSupplyLogin();

  const form = useForm<SuperAdminLoginFormValues>({
    resolver: zodResolver(superAdminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: SuperAdminLoginFormValues) => {
    mutate(data, { onSuccess: () => navigate("/supply/servers") });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Strongmetrics" className="w-56 h-auto mb-6" />
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Monetize your MCP — publisher sign in
          </p>
        </div>

        <Card>
          <CardContent className="pt-8 pb-8 px-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" /> Email Address
                </Label>
                <Input id="email" type="email" placeholder="you@company.com" className="h-10" {...form.register("email")} />
                <div className="h-5 flex items-center mt-1">
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive font-medium">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" /> Password
                </Label>
                <Input id="password" type="password" placeholder="••••••••" className="h-10" {...form.register("password")} />
                <div className="h-5 flex items-center mt-1">
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive font-medium">{form.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full mt-6 cursor-pointer" disabled={isPending}>
                {isPending && <RefreshCw className="w-5 h-5 animate-spin mr-2" />}
                {isPending ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-sm text-center text-muted-foreground mt-6">
          New publisher?{" "}
          <Link to="/supply/signup" className="text-primary font-medium hover:underline">Create an account</Link>
        </p>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Advertiser? <Link to="/login" className="hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
