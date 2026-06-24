import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Lock, Mail, Building2 } from "lucide-react";
import logo from "@/assets/strongmetrics-logo.webp";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import SelectComponent from "@/components/inputComponents/select-component";

import { loginSchema, type LoginFormValues } from "@/utils/schemas/auth";
import { useLogin } from "@/query/useUserManagement";
import { useGetOrgList } from "@/query/useOrgConfig";

export default function Login() {
  const navigate = useNavigate();

  const { mutate: mutateLogin, isPending: isPendingLogin } = useLogin();
  const { data: orgListResponse, isLoading: isOrgLoading } = useGetOrgList();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      orgId: "",
      email: "",
      password: "",
    },
  });

  // Normalize the org list response into { name, value } options for the dropdown.
  // API shape: { status, data: { details: [{ key, value }] } }
  const orgOptions = useMemo(() => {
    const details: any[] = orgListResponse?.data?.details ?? [];

    return details.map((org) => ({
      name: org.value,
      value: org.key,
    }));
  }, [orgListResponse]);

  const selectedOrgId = form.watch("orgId");

  // Auto-select when there is only one organization
  useEffect(() => {
    if (!selectedOrgId && orgOptions.length === 1) {
      form.setValue("orgId", orgOptions[0].value, { shouldValidate: true });
    }
  }, [orgOptions, selectedOrgId, form]);

  const onSubmit = (data: LoginFormValues) => {
    mutateLogin(data, {
      onSuccess: () => {
        navigate("/dashboard");
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans relative">
      <div className="w-full max-w-[420px] relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Strongmetrics" className="w-56 h-auto mb-6" />

          <p className="text-sm text-muted-foreground">
            Console Management Administration
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardContent className="pt-8 pb-8 px-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Organization */}
              <div className="space-y-2">
                <Label
                  htmlFor="orgId"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-primary" />
                  Organization
                </Label>

                <SelectComponent
                  id="orgId"
                  className="h-10"
                  search
                  value={selectedOrgId}
                  data={orgOptions}
                  ariaInvalid={!!form.formState.errors.orgId}
                  disabled={isOrgLoading}
                  title="Organization"
                  placeholder={
                    isOrgLoading
                      ? "Loading organizations..."
                      : "Select your organization"
                  }
                  onValueChange={(value) =>
                    form.setValue("orgId", value, { shouldValidate: true })
                  }
                />

                <div className="h-5 flex items-center mt-1">
                  {form.formState.errors.orgId ? (
                    <p className="text-xs text-destructive font-medium">
                      {form.formState.errors.orgId.message}
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">
                      Select the organization you belong to.
                    </p>
                  )}
                </div>
              </div>

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
