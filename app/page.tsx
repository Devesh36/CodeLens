"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Braces, GitBranch, Globe2, Sparkles } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const codeExamples = [
    {
      code: [
        {
          line: 1,
          parts: [
            { text: "async ", color: "text-indigo-300" },
            { text: "function ", color: "text-cyan-300" },
            { text: "validateToken", color: "text-blue-200" },
            { text: "(token) {", color: "text-slate-300" },
          ],
        },
        {
          line: 2,
          parts: [
            { text: "  const ", color: "text-indigo-300" },
            { text: "decoded", color: "text-blue-200" },
            { text: " = jwt.verify(token, SECRET);", color: "text-slate-300" },
          ],
        },
        {
          line: 3,
          parts: [
            { text: "  if ", color: "text-indigo-300" },
            { text: "(!decoded)", color: "text-yellow-200" },
            { text: " throw new Error('Invalid');", color: "text-slate-300" },
          ],
        },
        {
          line: 4,
          parts: [
            { text: "  return ", color: "text-indigo-300" },
            { text: "decoded.user", color: "text-blue-200" },
            { text: ";", color: "text-slate-300" },
          ],
        },
        {
          line: 5,
          parts: [{ text: "}", color: "text-slate-300" }],
        },
      ],
      status: "Moderate Complexity",
      insight:
        "Validates session integrity using JWT verification and returns the authenticated user payload.",
    },
    {
      code: [
        {
          line: 1,
          parts: [
            { text: "const ", color: "text-indigo-300" },
            { text: "calculateDiscount", color: "text-blue-200" },
            { text: " = (price, tier) => {", color: "text-slate-300" },
          ],
        },
        {
          line: 2,
          parts: [
            { text: "  if ", color: "text-indigo-300" },
            { text: "(tier === 'pro')", color: "text-yellow-200" },
            { text: " return price * 0.8;", color: "text-slate-300" },
          ],
        },
        {
          line: 3,
          parts: [
            { text: "  if ", color: "text-indigo-300" },
            { text: "(tier === 'team')", color: "text-yellow-200" },
            { text: " return price * 0.7;", color: "text-slate-300" },
          ],
        },
        {
          line: 4,
          parts: [{ text: "  return price;", color: "text-slate-300" }],
        },
        {
          line: 5,
          parts: [{ text: "};", color: "text-slate-300" }],
        },
      ],
      status: "Simple Complexity",
      insight:
        "Branching logic applies predictable discount rules per plan while keeping a safe fallback to base price.",
    },
    {
      code: [
        {
          line: 1,
          parts: [
            { text: "for ", color: "text-indigo-300" },
            { text: "(let i = 0; i < users.length; i++)", color: "text-yellow-200" },
            { text: " {", color: "text-slate-300" },
          ],
        },
        {
          line: 2,
          parts: [
            { text: "  if ", color: "text-indigo-300" },
            { text: "(!users[i].isActive)", color: "text-yellow-200" },
            { text: " continue;", color: "text-slate-300" },
          ],
        },
        {
          line: 3,
          parts: [{ text: "  active.push(users[i]);", color: "text-slate-300" }],
        },
        {
          line: 4,
          parts: [{ text: "}", color: "text-slate-300" }],
        },
        {
          line: 5,
          parts: [{ text: "return active;", color: "text-slate-300" }],
        },
      ],
      status: "Moderate Complexity",
      insight:
        "Filters active users through an imperative loop; clear to read but could be simplified with array helpers.",
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const data = (await response.json()) as { user?: { id?: string } | null };
        setIsAuthenticated(!!data?.user?.id);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % codeExamples.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  if (isAuthenticated) {
    router.push("/dashboard");
    return null;
  }

  if (checkingAuth) {
    return null;
  }

  const activeExample = codeExamples[activeSlide];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(59,130,246,0.25),transparent_36%),radial-gradient(circle_at_78%_45%,rgba(79,70,229,0.30),transparent_42%),radial-gradient(circle_at_50%_92%,rgba(6,182,212,0.18),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.2),rgba(2,6,23,0.92)_72%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="pt-5 pb-4">
          <nav className="h-14 rounded-xl border border-indigo-400/15 bg-slate-900/55 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between gap-2">
            <Link href="/" className="text-base sm:text-lg font-bold tracking-tight text-white">
              CodeLens AI
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
              <a href="#features" className="text-cyan-300 border-b border-cyan-300 pb-0.5">
                Features
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </a>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm shrink-0">
              <Link href="/login" className="text-slate-300 hover:text-white transition-colors px-1.5 sm:px-2 py-1">
                Sign In
              </Link>
              <Link
                href="/editor"
                className="rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-3 sm:px-4 py-2 transition-all shadow-[0_0_25px_rgba(99,102,241,0.35)]"
              >
                Try Editor
              </Link>
            </div>
          </nav>
        </header>

        <section className="pt-10 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_1fr] gap-10 lg:gap-12 items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs tracking-[0.2em] text-cyan-200 uppercase font-semibold">
                Cognitive Flow Active
              </span>

              <h1 className="mt-7 text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight text-white">
                Code
                <br />
                explanation,
                <span className="bg-linear-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent"> line-by-line.</span>
              </h1>

              <p className="mt-7 text-lg text-slate-300 leading-relaxed max-w-xl">
                Stop squinting at complex pull requests. CodeLens AI deconstructs technical debt into clear,
                actionable narratives using contextual AI analysis.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/editor"
                  className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 px-7 py-3.5 text-base font-semibold text-white shadow-[0_10px_40px_rgba(99,102,241,0.38)] hover:from-indigo-400 hover:to-violet-400 transition-all"
                >
                  Start Explaining
                  <ArrowRight size={18} />
                </Link>
              </div>

              <div className="mt-16">
                <p className="text-[11px] tracking-[0.22em] uppercase text-slate-500 font-semibold mb-3">Trusted by devs at</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="rounded-md border border-slate-700 bg-slate-900/50 px-3 py-1.5">Vercel</span>
                  <span className="rounded-md border border-slate-700 bg-slate-900/50 px-3 py-1.5">Stripe</span>
                  <span className="rounded-md border border-slate-700 bg-slate-900/50 px-3 py-1.5">Linear</span>
                  <span className="rounded-md border border-slate-700 bg-slate-900/50 px-3 py-1.5">Sentry</span>
                </div>
              </div>
            </div>

            <div id="features" className="relative">
              <div className="absolute -inset-6 bg-linear-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 blur-3xl" />
              <article className="relative overflow-hidden rounded-2xl border border-indigo-300/20 bg-slate-900/80 shadow-[0_22px_80px_rgba(6,182,212,0.14)] backdrop-blur">
                <header className="h-12 px-5 border-b border-slate-800/90 flex items-center justify-between bg-slate-900/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">utils/auth.js • JavaScript</p>
                  <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-200 font-semibold">
                    {activeExample.status}
                  </span>
                </header>

                <div className="p-5 sm:p-6 border-b border-slate-800/90">
                  <div className="space-y-1.5 font-mono text-sm">
                    {activeExample.code.map((line) => (
                      <div key={line.line} className="grid grid-cols-[26px_1fr] gap-3 text-slate-300">
                        <span className="text-slate-500 text-right">{line.line}</span>
                        <span>
                          {line.parts.map((part) => (
                            <span key={`${line.line}-${part.text}`} className={part.color}>
                              {part.text}
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 sm:p-6 bg-slate-950/60">
                  <div className="rounded-xl border border-slate-700 bg-slate-900/75 p-4">
                    <p className="text-[11px] tracking-[0.15em] uppercase text-cyan-300 font-semibold mb-2">AI Insight</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{activeExample.insight}</p>
                  </div>

                  <div className="mt-4 space-y-1.5 font-mono text-xs text-cyan-100/80">
                    <p>› Explanation Console</p>
                    <p className="text-slate-400">› Analyzing call stack...</p>
                    <p className="text-emerald-300">› Success: Explained 5 lines with 98% confidence.</p>
                  </div>

                  <div className="mt-5 flex gap-2">
                    {codeExamples.map((example, index) => (
                      <button
                        key={`${example.status}-${index}`}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        aria-label={`Switch sample ${index + 1}`}
                        className={`h-1.5 rounded-full transition-all ${
                          index === activeSlide ? "w-9 bg-cyan-300" : "w-4 bg-slate-700 hover:bg-slate-500"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="pricing" className="pb-14">
          <div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <article className="rounded-2xl border border-cyan-400/20 bg-slate-900/55 p-5 sm:p-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-400/10 text-cyan-200">
                <Globe2 size={18} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Multilingual Insight Engine</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Explain complex code in 35+ languages, including regional and romanized variants for faster team onboarding.
              </p>
            </article>

            <article className="rounded-2xl border border-indigo-400/20 bg-slate-900/55 p-5 sm:p-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-300/30 bg-indigo-400/10 text-indigo-200">
                <GitBranch size={18} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Snippet Intelligence Vault</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Save, favorite, and share snippets with context-aware summaries so code reviews become faster and more precise.
              </p>
            </article>

            <article className="rounded-2xl border border-emerald-400/20 bg-slate-900/55 p-5 sm:p-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-300/30 bg-emerald-400/10 text-emerald-200">
                <Braces size={18} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">DSA + Development Ready</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                From interview-style algorithm code to production APIs, CodeLens gives line-level clarity on any coding style.
              </p>
            </article>
          </div>

          <div className="mb-10 rounded-2xl border border-slate-800 bg-slate-900/55 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl sm:text-2xl font-semibold text-white">How It Works</h3>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase text-cyan-200">
                <Sparkles size={13} />
                Instant Cognitive Flow
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-700/70 bg-slate-950/60 p-4">
                <p className="text-[11px] text-cyan-300 font-semibold tracking-[0.15em] uppercase">Step 01</p>
                <p className="mt-2 text-base font-semibold text-white">Paste or Write Code</p>
                <p className="mt-1.5 text-sm text-slate-400">Drop in any snippet: utility logic, backend routes, frontend components, or DSA solutions.</p>
              </div>

              <div className="rounded-xl border border-slate-700/70 bg-slate-950/60 p-4">
                <p className="text-[11px] text-indigo-300 font-semibold tracking-[0.15em] uppercase">Step 02</p>
                <p className="mt-2 text-base font-semibold text-white">Generate AI Insights</p>
                <p className="mt-1.5 text-sm text-slate-400">Get line-by-line explanation, complexity summary, and optimization suggestions in your preferred language.</p>
              </div>

              <div className="rounded-xl border border-slate-700/70 bg-slate-950/60 p-4">
                <p className="text-[11px] text-emerald-300 font-semibold tracking-[0.15em] uppercase">Step 03</p>
                <p className="mt-2 text-base font-semibold text-white">Save and Share</p>
                <p className="mt-1.5 text-sm text-slate-400">Store explained snippets in your dashboard, filter by language, and share clarity with your team instantly.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/55 px-6 py-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div>
              <p className="text-base sm:text-lg font-semibold text-white">Free to start. Upgrade only when your team scales.</p>
              <p className="text-sm text-slate-400 mt-1">No credit card required for your first projects and public shares.</p>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
