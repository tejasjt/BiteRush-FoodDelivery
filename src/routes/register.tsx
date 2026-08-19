import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const schema = z
  .object({
    fullName: z.string().trim().min(2, "Please enter your full name").max(80),
    email: z.string().trim().email("Enter a valid email address").max(255),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\s-]{10,15}$/, "Enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters").max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Your Account — BiteRush" },
      { name: "description", content: "Register on BiteRush for faster checkout, live order tracking and offers." },
      { property: "og:title", content: "Create a BiteRush account" },
      { property: "og:description", content: "Save your details, track orders live and reorder in one tap." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (user) void navigate({ to: "/", replace: true });
  }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: parsed.data.fullName, phone: parsed.data.phone },
      },
    });
    setLoading(false);

    if (error) {
      toast.error(
        error.message.toLowerCase().includes("already registered")
          ? "An account with this email already exists. Try signing in."
          : error.message,
      );
      return;
    }
    if (!data.session) {
      setCheckEmail(true);
      return;
    }
    toast.success("Account created. Welcome to BiteRush!");
    void navigate({ to: "/", replace: true });
  }

  if (checkEmail) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-20 sm:px-6">
        <div className="surface-card flex flex-col items-center gap-3 p-8 text-center">
          <MailCheck className="text-primary size-10" />
          <h1 className="text-xl font-extrabold">Confirm your email</h1>
          <p className="text-muted-foreground text-sm">
            We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your BiteRush account,
            then sign in.
          </p>
          <Button asChild className="mt-2 rounded-full">
            <Link to="/login">Go to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <div className="surface-card p-8">
        <h1 className="text-2xl font-extrabold">Create your account</h1>
        <p className="text-muted-foreground mt-1 text-sm">It takes less than a minute.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <Field
            id="fullName"
            label="Full name"
            value={form.fullName}
            error={errors["fullName"]}
            onChange={(v) => setForm({ ...form, fullName: v })}
            autoComplete="name"
          />
          <Field
            id="email"
            label="Email"
            type="email"
            value={form.email}
            error={errors["email"]}
            onChange={(v) => setForm({ ...form, email: v })}
            autoComplete="email"
          />
          <Field
            id="phone"
            label="Phone"
            type="tel"
            value={form.phone}
            error={errors["phone"]}
            onChange={(v) => setForm({ ...form, phone: v })}
            autoComplete="tel"
          />
          <Field
            id="password"
            label="Password"
            type="password"
            value={form.password}
            error={errors["password"]}
            onChange={(v) => setForm({ ...form, password: v })}
            autoComplete="new-password"
          />
          <Field
            id="confirmPassword"
            label="Confirm password"
            type="password"
            value={form.confirmPassword}
            error={errors["confirmPassword"]}
            onChange={(v) => setForm({ ...form, confirmPassword: v })}
            autoComplete="new-password"
          />
          <Button type="submit" className="h-11 w-full rounded-full" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />} Create account
          </Button>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="h-11"
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}