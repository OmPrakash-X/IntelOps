import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { useLogin } from "../hooks/useAuth";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "At least 6 characters"),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values) => mutate(values);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-primary p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center">
            <ShieldCheck size={18} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-primary-foreground tracking-tight">IntelOps</span>
        </div>

        <div className="space-y-6">
          <div className="h-px w-12 bg-primary-foreground/30" />
          <h2 className="text-4xl font-bold text-primary-foreground leading-tight">
            Autonomous<br />Incident<br />Intelligence
          </h2>
          <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-xs">
            Real-time AI-powered detection, triage, and resolution across your entire infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Avg. MTTR Reduction", value: "68%" },
            { label: "Incidents Resolved",  value: "12k+" },
            { label: "Teams Onboarded",     value: "340+" },
            { label: "Uptime SLA",          value: "99.9%" },
          ].map((s) => (
            <div key={s.label} className="border border-primary-foreground/10 rounded-sm p-4">
              <div className="text-2xl font-bold text-primary-foreground">{s.value}</div>
              <div className="text-[10px] font-semibold text-primary-foreground/50 uppercase tracking-widest mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 md:px-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-sm bg-primary flex items-center justify-center">
            <ShieldCheck size={18} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">IntelOps</span>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg border border-destructive/30 bg-destructive/10 text-sm text-destructive font-medium">
              {error?.response?.data?.message || "Invalid email or password."}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                {...register("email")}
                className={`w-full h-11 bg-background border px-4 text-sm rounded-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? "border-destructive focus:ring-destructive/20"
                    : "border-input focus:ring-ring/30 focus:border-ring"
                }`}
              />
              {errors.email && (
                <p className="text-[10px] font-semibold text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full h-11 bg-background border px-4 pr-12 text-sm rounded-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? "border-destructive focus:ring-destructive/20"
                      : "border-input focus:ring-ring/30 focus:border-ring"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] font-semibold text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="relative w-full h-11 rounded-sm bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest overflow-hidden group disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? (
                <span className="animate-pulse">Signing in…</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Contact your admin to request access.
          </p>
        </div>
      </div>
    </div>
  );
}