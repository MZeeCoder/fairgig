"use client";

import { useMemo, useState } from "react";

const mockSubmissions = [
  {
    id: "SUB-1001",
    worker: "Worker A",
    date: "2026-04-16",
    hours: "7",
    gross: "$140",
    net: "$118",
    note: "Attached screenshot of shift summary.",
    status: "Pending",
  },
  {
    id: "SUB-1002",
    worker: "Worker B",
    date: "2026-04-15",
    hours: "5",
    gross: "$95",
    net: "$78",
    note: "No issue reported.",
    status: "Pending",
  },
  {
    id: "SUB-1003",
    worker: "Worker C",
    date: "2026-04-14",
    hours: "8",
    gross: "$160",
    net: "$134",
    note: "File is slightly blurry.",
    status: "Pending",
  },
];

export default function VerifierPage() {
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const [selectedId, setSelectedId] = useState(mockSubmissions[0].id);

  const selectedSubmission = useMemo(
    () => submissions.find((submission) => submission.id === selectedId),
    [selectedId, submissions]
  );

  const updateStatus = (status) => {
    setSubmissions((prev) =>
      prev.map((submission) =>
        submission.id === selectedId ? { ...submission, status } : submission
      )
    );
  };

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Verifier Panel</h1>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="border p-4">
          <h2 className="text-xl font-semibold mb-3">Pending Submissions</h2>
          <ul className="border">
            {submissions.map((submission) => (
              <li key={submission.id} className="border-b p-2">
                <button
                  className="text-left w-full"
                  onClick={() => setSelectedId(submission.id)}
                >
                  {submission.id} - {submission.worker} ({submission.status})
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="border p-4">
          <h2 className="text-xl font-semibold mb-3">Submission Details</h2>
          {selectedSubmission ? (
            <div>
              <p className="mb-1">ID: {selectedSubmission.id}</p>
              <p className="mb-1">Worker: {selectedSubmission.worker}</p>
              <p className="mb-1">Date: {selectedSubmission.date}</p>
              <p className="mb-1">Hours: {selectedSubmission.hours}</p>
              <p className="mb-1">Gross: {selectedSubmission.gross}</p>
              <p className="mb-1">Net: {selectedSubmission.net}</p>
              <p className="mb-1">Note: {selectedSubmission.note}</p>
              <p className="mb-3">Current Status: {selectedSubmission.status}</p>

              <button
                onClick={() => updateStatus("Confirmed")}
                className="bg-teal-600 text-white px-3 py-2 m-1"
              >
                Confirm
              </button>
              <button
                onClick={() => updateStatus("Flagged")}
                className="bg-teal-600 text-white px-3 py-2 m-1"
              >
                Flag
              </button>
              <button
                onClick={() => updateStatus("Unverifiable")}
                className="bg-teal-600 text-white px-3 py-2 m-1"
              >
                Unverifiable
              </button>
            </div>
          ) : (
            <p>No submission selected.</p>
          )}
        </div>
      </section>
    </main>
  );
}
