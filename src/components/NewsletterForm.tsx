"use client";

import { useState, type FormEvent } from "react";
import { Mail, Send } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium px-2 py-3">
        <span>Thanks! You are subscribed to corporate updates.</span>
      </div>
    );
  }

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <div className="relative flex-1">
        <Mail
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your work email"
          className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-lg pl-9 pr-3 py-3 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-light text-slate-950 font-semibold px-5 py-3 rounded-lg transition-all text-sm shrink-0"
      >
        <Send size={14} />
        Subscribe
      </button>
    </form>
  );
}
