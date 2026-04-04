"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/app/actions";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await loginUser(email, password);
      if (result.error) {
        setError(result.error);
      } else if (result.token) {
        // Check if there's a pending snippet to save
        const pendingSnippet = localStorage.getItem("pendingSnippetSave");
        if (pendingSnippet) {
          router.push("/editor");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Radial gradient background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="rounded-2xl border border-cyan-500/15 bg-linear-to-b from-slate-900/85 to-slate-950/85 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            
          
            <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">Cognitive Flow Environment</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-200 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs text-slate-400 uppercase tracking-[0.12em] font-semibold mb-2">
               Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="dev@codelens.ai"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs text-slate-400 uppercase tracking-[0.12em] font-semibold">
                  PassWord
                </label>
                <Link href="#" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-[0.08em]">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-2.5 bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all text-sm"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Create Account Link */}
          <p className="text-center text-slate-400 text-xs mt-6">
            New to the ecosystem?{" "}
            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              Create Account
            </Link>
          </p>
          <p className="text-center text-slate-500 text-xs mt-3">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              Back to Landing Page
            </Link>
          </p>
        </div>
</div>

      {/* Footer */}
      <div className="mt-10 sm:mt-16 text-center px-2">
        <p className="text-slate-600 text-lg font-bold tracking-wider mb-6">SAFE & WORK</p>
        <div className="flex items-center justify-center gap-6 text-xs text-slate-500 font-medium uppercase tracking-[0.08em] flex-wrap">
          <span>CodeLens AI © 2026 Built for the cognitive flow.</span>
        </div>
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 text-xs text-slate-600 uppercase tracking-[0.08em] flex-wrap">
          <Link href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link href="#" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link href="#" className="hover:text-slate-400 transition-colors">Security</Link>
          <span>•</span>
          <Link href="#" className="hover:text-slate-400 transition-colors">Status</Link>
        </div>
      </div>
    </div>
  );
}
