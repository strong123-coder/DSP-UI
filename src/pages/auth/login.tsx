import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Smartphone, 
  RefreshCw, 
  Lock 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Zod validation schema for clean input validation
const loginSchema = z.object({
  mobileNumber: z
    .string()
    .length(10, { message: "Mobile number must be exactly 10 digits" })
    .regex(/^[0-9]+$/, { message: "Only numeric digits are allowed" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Setup React Hook Form with Zod validation resolver
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mobileNumber: "",
      password: ""
    }
  });

  const onSubmit = (data: LoginFormValues) => {
    setIsSubmitting(true);
    
    // Simulate minor network delay for premium UI experience
    setTimeout(() => {
      // Create mock token and user details to populate our global store
      const mockToken = "mock_jwt_token_for_dsp_ui_console";
      const mockUser = {
        _id: "mock_user_id_101",
        name: "Sarthak Administrator",
        mobileNumber: `+91${data.mobileNumber}`,
        role: "CONSOLE_ADMINISTRATOR"
      };

      loginAction(mockToken, mockUser);
      setIsSubmitting(false);
      toast.success("Welcome Back! Sign in completed successfully.");
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans relative">
      {/* Floating Theme Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Brand Logo & Header Info */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-linear-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 mb-6 transform transition-all hover:scale-105">
            <span className="text-primary-foreground text-2xl font-bold">D</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            DSP-UI Portal
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Console Management Administration
          </p>
        </div>

        <Card>
          <CardContent className="pt-8 pb-8 px-6">
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* INPUT 1: MOBILE NUMBER */}
              <div className="space-y-2">
                <Label
                  htmlFor="mobileNumber"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-primary" />
                  Mobile Number
                </Label>
                <div className="relative">
                  <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    className="h-10 transition-colors pl-3"
                    {...register("mobileNumber")}
                    aria-invalid={errors.mobileNumber ? "true" : "false"}
                  />
                </div>
                <div className="h-5 flex items-center mt-1">
                  {errors.mobileNumber ? (
                    <p className="text-xs text-destructive font-medium">
                      {errors.mobileNumber.message}
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">
                      Format: Enter a 10-digit registered number.
                    </p>
                  )}
                </div>
              </div>

              {/* INPUT 2: SECURITY PASSWORD */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-primary" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-10 transition-colors pl-3"
                    {...register("password")}
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                </div>
                <div className="h-5 flex items-center mt-1">
                  {errors.password ? (
                    <p className="text-xs text-destructive font-medium">
                      {errors.password.message}
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">
                      Enter password credentials.
                    </p>
                  )}
                </div>
              </div>

              {/* ACTION: SUBMIT BUTTON */}
              <Button
                type="submit"
                size="lg"
                className="w-full mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                {isSubmitting ? "Authenticating..." : "Sign In to Console"}
              </Button>
              
            </form>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
