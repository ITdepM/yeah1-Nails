"use client";

import { useState } from "react";

const SERVICES = [
  "Manicure", "Pedicure", "Gel Manicure", "Acrylic Full Set",
  "Fill", "Dip Powder", "Nail Art", "Waxing", "Other",
];

const HEARD_FROM = [
  "Google", "Facebook/Instagram", "Walk-in",
  "Friend/Family", "Drive-by", "Other",
];

export default function Kiosk() {
  const [mode, setMode] = useState<"check-in" | "check-out">("check-in");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [heard, setHeard] = useState("");
  const [message, setMessage] = useState("");
  const [totalPoints, setTotalPoints] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!/^\d{10}$/.test(phone)) {
      setMessage("⚠️ Phone number must be exactly 10 digits.");
      return;
    }

    setMessage("Processing... ⏳");
    setTotalPoints(null);

    try {
      if (mode === "check-in") {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, phone, service, heard }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setMessage(`💅 ${data.message}`);

      } else {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setMessage("🎉 +15 points awarded!");
        setTotalPoints(data.totalPoints);
      }

      // Clear inputs
      setFullName("");
      setPhone("");
      setService("");
      setHeard("");

    } catch (err: any) {
      setMessage("❌ Error: " + err.message);
    }
  }

  return (
    <main className="min-h-screen bg-rose-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6 space-y-6">

        {/* Header */}
        <header className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-rose-600">Yeah1 Nails 💅</h1>
          <p className="text-gray-600 text-sm">Relax • Refresh • Renew</p>

          <p className="text-gray-700 text-sm font-semibold mt-1">
            Welcome to Yeah1 Nails — Check in / Check out to earn reward points ✨
          </p>
        </header>

        {/* Mode Switch */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setMode("check-in")}
            className={`px-4 py-2 rounded-lg border font-semibold ${
              mode === "check-in"
                ? "bg-green-500 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            🟢 Check-in
          </button>

          <button
            onClick={() => setMode("check-out")}
            className={`px-4 py-2 rounded-lg border font-semibold ${
              mode === "check-out"
                ? "bg-pink-500 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            💖 Check-out
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {mode === "check-in" && (
            <>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border rounded-lg p-3 placeholder-gray-600 text-gray-800"
                placeholder="Full Name"
                required
              />

              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full border rounded-lg p-3 bg-white text-gray-800"
                required
              >
                <option value="">Service Today</option>
                {SERVICES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>

              <select
                value={heard}
                onChange={(e) => setHeard(e.target.value)}
                className="w-full border rounded-lg p-3 bg-white text-gray-800"
                required
              >
                <option value="">How did you hear about us?</option>
                {HEARD_FROM.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </>
          )}

          {/* Phone */}
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-lg p-3 placeholder-gray-600 text-gray-800"
            placeholder="Phone Number (10 digits)"
            inputMode="tel"
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700"
          >
            {mode === "check-in"
              ? "Check In"
              : "Check Out (+15 pts)"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className="text-center text-green-700 font-semibold whitespace-pre-line">
            {message}

            {totalPoints !== null && (
              <p className="text-pink-600 font-bold mt-2">
                🎯 Total Points: {totalPoints} pts<br />
                Collect 150 points to get <b>$15 OFF!</b>
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
