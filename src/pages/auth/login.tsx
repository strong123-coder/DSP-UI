import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { RefreshCw, Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { loginSchema, type LoginFormValues } from "@/utils/schemas/auth";
import { useLogin } from "@/query/useUserManagement";

export default function Login() {
  const navigate = useNavigate();

  const { mutate: mutateLogin, isPending: isPendingLogin } = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      orgId: "6a1ec7182918d319d9975cc3",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    mutateLogin(data, {
      onSuccess: () => {
        navigate("/dashboard");
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-linear-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 mb-6">
            <span className="text-primary-foreground text-2xl font-bold">
              D
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            DSP-UI Portal
          </h1>

          <p className="text-sm text-muted-foreground mt-2">
            Console Management Administration
          </p>
        </div>

        {/* Login Card */}
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
                  {form.formState.errors.email ? (
                    <p className="text-xs text-destructive font-medium">
                      {form.formState.errors.email.message}
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">
                      Enter your registered email address.
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
                  {form.formState.errors.password ? (
                    <p className="text-xs text-destructive font-medium">
                      {form.formState.errors.password.message}
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">
                      Enter your account password.
                    </p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full mt-6 cursor-pointer"
                disabled={isPendingLogin}
              >
                {isPendingLogin && (
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                )}

                {isPendingLogin ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
