"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email hoac mat khau khong dung");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Khong the ket noi den may chu");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-blue-600">
          Welcome back
        </p>

        <h2 className="text-4xl font-bold tracking-tight text-slate-950">
          Ready to pick up?
        </h2>

        <p className="mt-3 text-sm text-slate-500">
          Your progress is right where you left it.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Email address

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@university.edu"
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Password

          <span className="relative mt-2 block">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-16 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </span>
        </label>
      </div>

      <div className="text-right">
        <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="h-12 w-full rounded-xl bg-blue-600 font-semibold text-white shadow-[0_4px_0_#1d4ed8] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Logging in..." : "Log in to Adaptive Quiz"}
      </button>

      {error && (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <p className="text-center text-sm text-slate-500">
        New to Adaptive Quiz?{" "}
        <a href="/auth/register" className="font-semibold text-blue-600 hover:underline">
          Create an account
        </a>
      </p>
    </form>
  );
}
