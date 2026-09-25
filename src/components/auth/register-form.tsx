"use client";

import { FormEvent, useState } from "react";

export default function RegisterForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"student" | "instructor">("student");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false); 

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage("");
        setIsLoading(true);

        const payload = {
            name,
            email: email.trim().toLowerCase(),
            password,
            role,
        }

        try {
            const response = await fetch("/api/auth/register",{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            setMessage(data.message);

            if (response.ok) {
                setName("");
                setEmail("");
                setPassword("");
            }
        } catch {
            setMessage("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-blue-600">
                Join your learning desk
            </p>

            <h2 className="text-4xl font-bold tracking-tight text-slate-950">
                Create your account.
            </h2>

            <p className="mt-3 text-sm text-slate-500">
                Setup your workspace in less than a minute.
            </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
            <button
                type="button"
                onClick={() => setRole("student")}
                className={`rounded-2xl border p-4 text-left transition ${
                role === "student"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white"
                }`}
            >
                <span className="block text-sm font-semibold text-slate-900">
                I am a student
                </span>
            </button>

            <button
                type="button"
                onClick={() => setRole("instructor")}
                className={`rounded-2xl border p-4 text-left transition ${
                role === "instructor"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white"
                }`}
            >
                <span className="block text-sm font-semibold text-slate-900">
                I am an instructor
                </span>
            </button>
            </div>

            <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
                Full name

                <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Avery Morgan"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
            </label>

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

                <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
            </label>
            </div>

            <button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-blue-600 font-semibold text-white shadow-[0_4px_0_#1d4ed8] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
            {isLoading
                ? "Creating account..."
                : `Create ${role} account`}
            </button>

            {message && (
            <p className="text-center text-sm text-slate-600">
                {message}
            </p>
            )}

            <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <a
                href="/auth/login"
                className="font-semibold text-blue-600 hover:underline"
            >
                Log in
            </a>
            </p>
        </form>
    );
}