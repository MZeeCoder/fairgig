"use client";

import { useState } from "react";

const initialShifts = [
  {
    id: 1,
    date: "2026-04-12",
    hours: "6",
    net: "$96",
    status: "Verified",
  },
  {
    id: 2,
    date: "2026-04-14",
    hours: "8",
    net: "$132",
    status: "Pending",
  },
  {
    id: 3,
    date: "2026-04-15",
    hours: "5",
    net: "$77",
    status: "Flagged",
  },
];

export default function WorkerPage() {
  const [formData, setFormData] = useState({
    date: "",
    hours: "",
    gross: "",
    deductions: "",
    net: "",
    fileName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [recentShifts, setRecentShifts] = useState(initialShifts);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const newShift = {
        id: recentShifts.length + 1,
        date: formData.date,
        hours: formData.hours,
        net: `$${formData.net}`,
        status: "Pending",
      };

      setRecentShifts((prev) => [newShift, ...prev]);
      setFormData({
        date: "",
        hours: "",
        gross: "",
        deductions: "",
        net: "",
        fileName: "",
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <main className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Worker Dashboard</h1>

      <section className="grid md:grid-cols-3 gap-3 mb-6">
        <div className="border p-4">
          <p className="font-semibold">Total Earned</p>
          <p>$4,210</p>
        </div>
        <div className="border p-4">
          <p className="font-semibold">Hourly Rate</p>
          <p>$18.40/hr</p>
        </div>
        <div className="border p-4">
          <p className="font-semibold">Platforms</p>
          <p>Uber, Lyft, DoorDash</p>
        </div>
      </section>

      <section className="border p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">Log New Shift</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(event) => updateField("date", event.target.value)}
            className="border p-2 w-full mb-3"
            required
          />

          <label className="block mb-2">Hours</label>
          <input
            type="number"
            step="0.1"
            value={formData.hours}
            onChange={(event) => updateField("hours", event.target.value)}
            className="border p-2 w-full mb-3"
            required
          />

          <label className="block mb-2">Gross</label>
          <input
            type="number"
            step="0.01"
            value={formData.gross}
            onChange={(event) => updateField("gross", event.target.value)}
            className="border p-2 w-full mb-3"
            required
          />

          <label className="block mb-2">Deductions</label>
          <input
            type="number"
            step="0.01"
            value={formData.deductions}
            onChange={(event) => updateField("deductions", event.target.value)}
            className="border p-2 w-full mb-3"
            required
          />

          <label className="block mb-2">Net</label>
          <input
            type="number"
            step="0.01"
            value={formData.net}
            onChange={(event) => updateField("net", event.target.value)}
            className="border p-2 w-full mb-3"
            required
          />

          <label className="block mb-2">Proof File</label>
          <input
            type="file"
            onChange={(event) =>
              updateField("fileName", event.target.files?.[0]?.name || "")
            }
            className="border p-2 w-full mb-3"
          />

          {formData.fileName && <p className="mb-3">Selected: {formData.fileName}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-teal-600 text-white px-4 py-2"
          >
            {isLoading ? "Loading..." : "Submit Shift"}
          </button>
        </form>
      </section>

      <section className="border p-4">
        <h2 className="text-xl font-semibold mb-3">Recent Shifts</h2>
        <table className="border w-full">
          <thead>
            <tr>
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-left">Hours</th>
              <th className="border p-2 text-left">Net</th>
              <th className="border p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentShifts.map((shift) => (
              <tr key={shift.id}>
                <td className="border p-2">{shift.date}</td>
                <td className="border p-2">{shift.hours}</td>
                <td className="border p-2">{shift.net}</td>
                <td className="border p-2">{shift.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
