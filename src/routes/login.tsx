import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — BiteRush" },
      { name: "description", content: "Sign in to your BiteRush account to track orders and reorder favourites." },
      { property: "og:title", content: "Sign in to BiteRush" },
      { property: "og:description", content: "Access your orders, saved details and faster checkout." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      toast.error(
        error.message.toLowerCase().includes("invalid")
          ? "That email and password combination doesn't match an account."
          : error.message,
      );
      return;
    }
    toast.success("Welcome back!");
    void navigate({ to: "/", replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <div className="surface-card p-8">
        <h1 className="text-2xl font-extrabold">Welcome back</h1>
        <p className="text-muted-foreground mt-1 text-sm">Sign in to continue your BiteRush order.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-11"
            />
            {errors["email"] && <p className="text-destructive text-sm">{errors["email"]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="h-11"
            />
            {errors["password"] && <p className="text-destructive text-sm">{errors["password"]}</p>}
          </div>
          <Button type="submit" className="h-11 w-full rounded-full" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />} Sign in
          </Button>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          New to BiteRush?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}