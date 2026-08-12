"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      setErrorMessage("メールアドレスまたはパスワードを確認してください");
      return;
    }

    router.push("/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-8">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold">
          予約管理システム
        </h1>

        <label className="mb-2 block font-semibold">
          メールアドレス
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border px-4 py-2"
        />

        <label className="mb-2 block font-semibold">
          パスワード
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border px-4 py-2"
        />

        {errorMessage && (
          <p className="mb-4 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogin}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          ログイン
        </button>
      </div>
    </main>
  );
}