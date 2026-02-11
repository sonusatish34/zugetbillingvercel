"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow login pages without auth
    if (pathname === "/login" || pathname === "/approval-login") {
      setReady(true);
      return;
    }

    // Check if user is logged in
    const userPhone = localStorage.getItem("user_phone");
    const token = userPhone ? localStorage.getItem(`${userPhone}_token`) : null;

    if (!token) {
      router.replace("/login");
      return;
    }

    setReady(true);
  }, [router, pathname]);

  if (!ready) return null;

  return <>{children}</>;
}
