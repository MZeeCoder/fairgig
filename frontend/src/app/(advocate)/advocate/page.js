"use client";

import RouteGuard from "@/components/RouteGuard";

export default function AdvocatePage() {
  return (
    <RouteGuard allowedRoles={["advocate"]}>
      <div>Advocate Dashboard</div>
    </RouteGuard>
  );
}
