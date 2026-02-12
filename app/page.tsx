"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Code2, Zap, BookOpen, ArrowRight, CheckCircle, Sparkles, Github } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const codeExamples = [
    {
      code: [
        { line: 1, text: "// Your code here", type: "comment" },
        { line: 2, text: "const", type: "keyword", parts: [
          { text: "const", color: "text-purple-400" },
          { text: " quickSort", color: "text-teal-400" },
          { text: " = ", color: "text-gray-400" },
          { text: "(arr)", color: "text-yellow-300" },
          { text: " => {}", color: "text-gray-400" }
        ]},
        { line: 3, text: "// Sorts array using pivot...", type: "comment" }
      ],
      explanation: "This defines a recursive quicksort function that sorts an array by partitioning around a pivot element and recursively sorting the sub-arrays. The arrow function syntax creates a concise function declaration in modern JavaScript."
    },
    {
      code: [
        { line: 1, text: "// Async function example", type: "comment" },
        { line: 2, text: "async", type: "keyword", parts: [
          { text: "async", color: "text-purple-400" },
          { text: " function", color: "text-purple-400" },
          { text: " fetchData", color: "text-teal-400" },
          { text: "(", color: "text-gray-400" },
          { text: "url", color: "text-yellow-300" },
          { text: ") {}", color: "text-gray-400" }
        ]},
        { line: 3, text: "// Returns promise data", type: "comment" }
      ],
      explanation: "An async function that fetches data from an API endpoint. The async keyword allows the use of await inside the function, making asynchronous code easier to read and write while handling promises elegantly."
    },
    {
      code: [
        { line: 1, text: "// React Hook", type: "comment" },
        { line: 2, text: "useState", type: "keyword", parts: [
          { text: "const", color: "text-purple-400" },
          { text: " [count", color: "text-teal-400" },
          { text: ", ", color: "text-gray-400" },
          { text: "setCount", color: "text-teal-400" },
          { text: "] = ", color: "text-gray-400" },
          { text: "useState", color: "text-yellow-300" },
          { text: "(0)", color: "text-gray-400" }
        ]},
        { line: 3, text: "// State management", type: "comment" }
      ],
      explanation: "React's useState hook provides state management in functional components. It returns a stateful value and a setter function, enabling components to maintain and update local state without using class components."
    }
  ];

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % codeExamples.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [codeExamples.length, isHovered]);

  if (isAuthenticated) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimalist background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-50/50 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-8 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-full text-sm font-medium">
              AI-Powered Code Analysis
            </div>
            <div>
              <h2 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="text-gray-900">Understand Code,</span>
                <br />
                <span className="text-teal-600">Line by Line</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Paste any code snippet and get instant AI-powered explanations. Try it free - no signup required. Create an account to save and share your snippets.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
              <Link href="/editor">
                <button className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2">
                  Try It Free <ArrowRight size={20} />
                </button>
              </Link>
              {/* <Link href="/login">
                <button className="px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-teal-600 hover:text-teal-600 transition-all duration-200">
                  Demo Account
                </button>
              </Link> */}
            </div>
            {/* <p className="text-sm text-gray-600 pt-4">
              ✓ No credit card required • ✓ Free tier available • ✓ 5+ programming languages
            </p> */}
          </div>
          <div className="hidden md:block animate-fadeInUp animation-delay-200">
            <div className="relative">
              <div 
                className="relative bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-teal-100/50 hover:border-teal-200 hover:scale-105 cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300 transition-colors duration-300 group-hover:bg-teal-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300 transition-colors duration-300 group-hover:bg-teal-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-600 transition-transform duration-300 hover:scale-125"></div>
                    </div>
                    <div className="flex gap-1.5">
                      {codeExamples.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveSlide(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 hover:scale-125 ${
                            index === activeSlide ? "bg-teal-600 w-6" : "bg-gray-300 hover:bg-teal-400"
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Sliding container */}
                  <div className="relative h-32 overflow-hidden">
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                    >
                      {codeExamples.map((example, index) => (
                        <div key={index} className="min-w-full">
                          <div className="bg-white border border-gray-200 rounded-lg p-4 font-mono text-sm space-y-1 transition-colors duration-300 hover:bg-gray-50">
                            {example.code.map((line) => (
                              <div key={line.line} className="text-gray-500">
                                <span className="text-gray-400">{line.line}</span>  
                                {line.type === "comment" ? (
                                  <span className="text-gray-400">{line.text}</span>
                                ) : (
                                  line.parts?.map((part, i) => (
                                    <span key={i} className={part.color}>{part.text}</span>
                                  ))
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-teal-600 transition-all duration-300 hover:scale-150 hover:bg-teal-700"></div>
                      <span className="text-xs font-semibold text-gray-800">AI Explanation</span>
                    </div>
                    {/* Explanation with fade transition */}
                    <div className="relative min-h-[60px]">
                      {codeExamples.map((example, index) => (
                        <p
                          key={index}
                          className={`text-sm text-gray-600 leading-relaxed transition-opacity duration-500 ${
                            index === activeSlide ? "opacity-100" : "opacity-0 absolute top-0 left-0"
                          }`}
                        >
                          {example.explanation}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
