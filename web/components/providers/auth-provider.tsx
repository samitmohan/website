"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useUserStore } from "@/stores/userStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useUserStore();

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          image: data.user.image ?? undefined,
          cohortId: (data.user as any).cohortId ?? undefined,
        });
      } else {
        setUser(null);
      }
    }).catch(() => {
      setUser(null);
    });
  }, [setUser, setLoading]);

  return <>{children}</>;
}
