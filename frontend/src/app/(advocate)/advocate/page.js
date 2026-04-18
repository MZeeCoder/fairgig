"use client";

import { useState } from "react";

const initialComplaints = [
  {
    id: "CMP-01",
    platform: "Uber",
    category: "Pay Issue",
    description: "Worker reports missing incentive payment.",
    status: "Open",
  },
  {
    id: "CMP-02",
    platform: "DoorDash",
    category: "Safety",
    description: "Unsafe pickup location reported at night.",
    status: "In Review",
  },
  {
    id: "CMP-03",
    platform: "Lyft",
    category: "Deactivation",
    description: "Account deactivated without clear reason.",
    status: "Open",
  },
];

export default function AdvocatePage() {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [editingId, setEditingId] = useState(null);

  const updateStatus = (id, status) => {
    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint.id === id ? { ...complaint, status } : complaint
      )
    );
  };

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Advocate Dashboard</h1>

      <section className="grid md:grid-cols-3 gap-3 mb-6">
        <div className="border p-4">
          <p className="font-semibold">Open Cases</p>
          <p>18</p>
        </div>
        <div className="border p-4">
          <p className="font-semibold">Resolved This Week</p>
          <p>9</p>
        </div>
        <div className="border p-4">
          <p className="font-semibold">Escalated</p>
          <p>4</p>
        </div>
      </section>

      <section className="border p-4">
        <h2 className="text-xl font-semibold mb-3">Anonymous Complaints</h2>
        <table className="border w-full">
          <thead>
            <tr>
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">Platform</th>
              <th className="border p-2 text-left">Category</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              <tr key={complaint.id}>
                <td className="border p-2">{complaint.id}</td>
                <td className="border p-2">{complaint.platform}</td>
                <td className="border p-2">{complaint.category}</td>
                <td className="border p-2">{complaint.description}</td>
                <td className="border p-2">{complaint.status}</td>
                <td className="border p-2">
                  <button
                    onClick={() =>
                      setEditingId((prev) => (prev === complaint.id ? null : complaint.id))
                    }
                    className="bg-teal-600 text-white px-3 py-1"
                  >
                    Edit
                  </button>
                  {editingId === complaint.id && (
                    <select
                      value={complaint.status}
                      onChange={(event) => updateStatus(complaint.id, event.target.value)}
                      className="border p-1 ml-2"
                    >
                      <option value="Open">Open</option>
                      <option value="In Review">In Review</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Escalated">Escalated</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
