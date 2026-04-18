"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getUserRole } from "@/lib/clientAuth";

export default function RouteGuard({ children, allowedRoles = [] }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const accessToken = getAccessToken();
    const userRole = getUserRole();

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    if (
      allowedRoles.length > 0 &&
      userRole &&
      !allowedRoles.includes(userRole)
    ) {
      router.replace("/unauthorized");
      return;
    }

    setIsChecking(false);
  }, [allowedRoles, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Checking session...
      </div>
    );
  }

  return children;
}
