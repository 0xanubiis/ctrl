"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const parseHashTokens = (hash: string) => {
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      return {
        access_token: params.get("access_token"),
        refresh_token: params.get("refresh_token"),
      };
    };

    const handleCallback = async () => {
      try {
        // 1) If the URL contains the access_token (magic-link / confirm link), parse it and set session
        if (typeof window !== "undefined" && window.location.hash && window.location.hash.includes("access_token")) {
          const { access_token, refresh_token } = parseHashTokens(window.location.hash);

          if (access_token) {
            // Preferred: set session explicitly with parsed tokens
            // supabase-js v2 provides auth.setSession()
            try {
              await supabase.auth.setSession({
                access_token: access_token!,
                refresh_token: refresh_token ?? undefined,
              });
            } catch (err) {
              // fallback: some helpers expose exchangeCodeForSession / setSessionFromUrl
              // try them without disrupting flow
              try {
                // @ts-ignore
                if (typeof supabase.auth.exchangeCodeForSession === "function") {
                  // some helper versions support this
                  // @ts-ignore
                  await supabase.auth.exchangeCodeForSession(window.location.hash);
                } else if (typeof (supabase.auth as any).setSessionFromUrl === "function") {
                  // older helper name
                  // @ts-ignore
                  await (supabase.auth as any).setSessionFromUrl();
                }
              } catch (err2) {
                console.error("Fallback session exchange failed:", err2);
              }
            }

            // remove token from URL for security / UX
            try {
              window.history.replaceState({}, document.title, "/auth/login");
            } catch (err) {
              // ignore
            }

            // Now attempt to get session and redirect
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              router.replace("/dashboard");
              return;
            }
          }
        }

        // 2) No token in URL, just check normal session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace("/dashboard");
        } else {
          setCheckingSession(false);
        }
      } catch (err) {
        console.error("Auth callback handling error:", err);
        setCheckingSession(false);
      }
    };

    handleCallback();

    // Listen for live auth state changes as backup (SIGNED_IN via other flows)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/dashboard");
    });

    return () => {
      try {
        listener.subscription.unsubscribe();
      } catch {}
    };
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Checking session...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your CTRL8 account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

