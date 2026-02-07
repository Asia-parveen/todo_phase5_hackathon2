"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Loading from "@/components/ui/Loading";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect based on auth state
    // PHASE 5: Redirect to chat (Phase 3/4 UI) as the default landing page
    if (isAuthenticated()) {
      router.replace("/chat");
    } else {
      router.replace("/login");
    }
  }, [router]);

  // Show loading while checking auth and redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading size="lg" text="Loading..." />
    </div>
  );
}
