"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [isAuthChecked, setIsAuthChecked] =
    useState(false);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  // ==========================
  // ログイン確認
  // ==========================

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login");
        return;
      }

      setIsAuthChecked(true);
    };

    checkUser();
  }, [router]);

  // ==========================
  // パスワード変更
  // ==========================

  const handleChangePassword = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!newPassword || !confirmPassword) {
      setErrorMessage(
        "新しいパスワードを入力してください"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        "パスワードが一致していません"
      );
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage(
        "パスワードは6文字以上で入力してください"
      );
      return;
    }

    setIsUpdating(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsUpdating(false);

    if (error) {
      console.error(
        "Password update error:",
        error.message
      );

      setErrorMessage(
        "パスワードの変更に失敗しました"
      );

      return;
    }

    setNewPassword("");
    setConfirmPassword("");

    setSuccessMessage(
      "パスワードを変更しました"
    );
  };

  if (!isAuthChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p>ログイン状態を確認中...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-8">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-6 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
        >
          ← 予約管理に戻る
        </button>

        <h1 className="mb-6 text-2xl font-bold">
          パスワード変更
        </h1>

        <label className="mb-2 block font-semibold">
          新しいパスワード
        </label>

        <input
          type="password"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
          className="mb-4 w-full rounded-lg border px-4 py-2"
        />

        <label className="mb-2 block font-semibold">
          新しいパスワード（確認）
        </label>

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleChangePassword();
            }
          }}
          className="mb-4 w-full rounded-lg border px-4 py-2"
        />

        {errorMessage && (
          <p className="mb-4 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="mb-4 text-sm text-green-600">
            {successMessage}
          </p>
        )}

        <button
          type="button"
          onClick={handleChangePassword}
          disabled={isUpdating}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUpdating
            ? "変更中..."
            : "パスワードを変更"}
        </button>
      </div>
    </main>
  );
}