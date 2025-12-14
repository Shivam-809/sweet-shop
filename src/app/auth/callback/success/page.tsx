"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveUser } from "@/lib/store";

export default function CallbackSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session && session.user) {
        const user = {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || "User",
        };
        
        saveUser(user, session.access_token);
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 flex items-center justify-center">
      <div className="text-4xl animate-bounce">🍭</div>
    </div>
  );
}
