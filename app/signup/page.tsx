"use client";

import { useState } from "react";

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    birthday: "",
    inviteCode: "",
  });

  const [message, setMessage] = useState("");
  const [invite, setInvite] = useState("");

  function updateField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setMessage("Submitting...");

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!data.success) {
      setMessage("❌ " + data.error);
      return;
    }

    setInvite(data.customer.inviteCode.code);

    setMessage(
      `🎉 Welcome ${data.customer.fullName || ""}!\n` +
        `Your sign-up is complete.\n\n` +
        `Sign-up bonus: ${
          data.signupBonusApplied ? "+20 points" : "Already applied"
        }\n` +
        `Referral bonus: ${
          data.inviterBonusApplied ? "+20 points" : "None"
        }`
    );
  }

  return (
    <main className="min-h-screen bg-rose-50 flex justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-6 space-y-4">

        {/* Title */}
        <h1 className="text-center text-3xl font-bold text-rose-600">
          Yeah1 Nails 💅
        </h1>
        <p className="text-center text-gray-700 text-sm">
          Sign up & earn reward points ✨
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Full Name</label>
            <input
              className="w-full border p-3 rounded-lg placeholder-gray-600 text-gray-800"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Phone Number</label>
            <input
              className="w-full border p-3 rounded-lg placeholder-gray-600 text-gray-800"
              placeholder="Phone (10 digits)"
              maxLength={10}
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Email (optional)</label>
            <input
              className="w-full border p-3 rounded-lg placeholder-gray-600 text-gray-800"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          {/* Birthday */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Birthday (optional)</label>
            <div className="relative">
              <input
                type="date"
                className="w-full border p-3 rounded-lg pl-10 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 text-gray-800"
                value={form.birthday}
                onChange={(e) => updateField("birthday", e.target.value)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400">
                📅
              </span>
            </div>
            <p className="text-xs text-gray-600">Format: MM / DD / YYYY</p>
          </div>

          {/* Invite Code */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Invite Code (optional)</label>
            <input
              className="w-full border p-3 rounded-lg placeholder-gray-600 text-gray-800"
              placeholder="Enter invite code"
              value={form.inviteCode}
              onChange={(e) => updateField("inviteCode", e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-rose-600 hover:bg-rose-700 w-full text-white font-semibold p-3 rounded-lg"
          >
            Sign Up
          </button>
        </form>

        {/* Result Message */}
        {message && (
          <pre className="bg-rose-50 p-3 rounded-lg whitespace-pre-wrap text-sm text-gray-700 border">
            {message}
          </pre>
        )}

        {/* Show Invite Code */}
        {invite && (
          <div className="text-center bg-green-50 p-4 rounded-xl border">
            <p className="font-semibold text-green-700">Your invite code:</p>
            <p className="text-xl font-bold text-green-800">{invite}</p>
          </div>
        )}
      </div>
    </main>
  );
}
