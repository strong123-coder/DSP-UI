import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Lock, Mail, ShieldCheck } from "lucide-react";
import logo from "@/assets/strongmetrics-logo.webp";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import {
  superAdminLoginSchema,
  type SuperAdminLoginFormValues,
} from "@/utils/schemas/auth";
import { useSuperAdminLogin } from "@/query/useSuperAdmin";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const { mutate: mutateLogin, isPending } = useSuperAdminLogin();

  const form = useForm<SuperAdminLoginFormValues>({
    resolver: zodResolver(superAdminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: SuperAdminLoginFormValues) => {
    mutateLogin(data, {
      onSuccess: () => navigate("/super-admin/dashboard"),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans relative">
      <div className="w-full max-w-[420px] relative z-10">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Strongmetrics" className="w-56 h-auto mb-6" />
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Super Admin Console
          </p>
        </div>

        <Card>
          <CardContent className="pt-8 pb-8 px-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="h-10"
                  {...form.register("email")}
                />
                <div className="h-5 flex items-center mt-1">
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive font-medium">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-primary" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-10"
                  {...form.register("password")}
                />
                <div className="h-5 flex items-center mt-1">
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive font-medium">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-6 cursor-pointer"
                disabled={isPending}
              >
                {isPending && <RefreshCw className="w-5 h-5 animate-spin mr-2" />}
                {isPending ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
