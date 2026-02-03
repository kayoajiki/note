"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm text-neutral-500 hover:text-neutral-700"
    >
      ログアウト
    </button>
  );
}
