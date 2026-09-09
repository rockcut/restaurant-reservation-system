"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Reservation = {
  id: number;
  seat: number;
  seats?: number[];
  name: string;
  people: number;
  time: string;
  reservation_date: string;
  course: string | null;
  allergy: string | null;
  plate: string | null;
  plate_message: string | null;
  phone: string | null;
  note: string | null;
};

// ひらがなをカタカナに変換
const normalizeKana = (text: string) => {
  return text.replace(/[\u3041-\u3096]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) + 0x60)
  );
};

export default function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Reservation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const router = useRouter();

  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const detailRef = useRef<HTMLDivElement>(null);

  const handleSearch = async () => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      setResults([]);
      setSearched(false);
      setSelectedReservation(null);
      return;
    }

    setIsSearching(true);
    setSelectedReservation(null);

    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        reservation_seats (
          seat
        )
      `)
      .order("reservation_date", { ascending: false })
      .order("time", { ascending: false });

    setIsSearching(false);
    setSearched(true);

    if (error) {
      console.error("Search error:", error.message);
      setResults([]);
      return;
    }

    const normalizedKeyword = normalizeKana(trimmedKeyword);

    const filteredData = data.filter((reservation) => {
      const normalizedName = normalizeKana(
        reservation.name ?? ""
      );

      const nameMatches =
        normalizedName.includes(normalizedKeyword);

      const phoneMatches =
        reservation.phone?.includes(trimmedKeyword) ??
        false;

      return nameMatches || phoneMatches;
    });

    const formattedResults = filteredData.map(
      (reservation) => ({
        ...reservation,
        seats: reservation.reservation_seats.map(
          (item: { seat: number }) => item.seat
        ),
      })
    );

    setResults(formattedResults);
  };

  const handleSelectReservation = (
    reservation: Reservation
  ) => {
    setSelectedReservation(reservation);

    requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const getSeatLabel = (seat: number) => {
    if (seat >= 101 && seat <= 103) {
      return `カウンター${seat - 100}`;
    }

    return `${seat}番席`;
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <button
        type="button"
        onClick={() => router.push("/")}
        className="mb-4 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
      >
        ← 予約管理に戻る
      </button>

      <h1 className="mb-6 text-3xl font-bold">
        予約検索
      </h1>

      {/* 検索欄 */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="予約者名または電話番号を入力"
          className="w-full max-w-md rounded-lg border bg-white px-4 py-3"
        />

        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSearching ? "検索中..." : "検索"}
        </button>
      </div>

      {/* 検索中 */}
      {isSearching && (
        <p className="text-gray-600">
          検索中...
        </p>
      )}

      {/* 検索結果なし */}
      {searched &&
        !isSearching &&
        results.length === 0 && (
          <p className="text-gray-600">
            該当する予約はありません
          </p>
        )}

      {/* 検索結果 */}
      {!isSearching && results.length > 0 && (
        <>
          <h2 className="mb-3 text-xl font-bold">
            検索結果（{results.length}件）
          </h2>

          <div className="space-y-3">
            {results.map((reservation) => (
              <button
                key={reservation.id}
                type="button"
                onClick={() =>
                  handleSelectReservation(reservation)
                }
                className="w-full rounded-lg bg-white p-4 text-left shadow hover:bg-gray-50"
              >
                <div className="text-lg font-bold">
                  {reservation.name}
                </div>

                <div className="mt-1 text-sm text-gray-600">
                  {reservation.reservation_date}
                  {" ・ "}
                  {reservation.time}
                  {" ・ "}
                  {reservation.people}名
                </div>

                {reservation.phone && (
                  <div className="mt-1 text-sm">
                    電話番号：{reservation.phone}
                  </div>
                )}

                <div className="mt-1 text-sm">
                  席：
                  {reservation.seats &&
                  reservation.seats.length > 0
                    ? reservation.seats
                        .slice()
                        .sort((a, b) => a - b)
                        .map((seat) =>
                          getSeatLabel(seat)
                        )
                        .join("・")
                    : getSeatLabel(
                        reservation.seat
                      )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* 選択した予約の詳細 */}
      {selectedReservation && (
        <div
          ref={detailRef}
          className="mt-8 rounded-lg bg-white p-6 shadow"
        >
          <h2 className="mb-4 text-2xl font-bold">
            予約詳細
          </h2>

          <div className="space-y-2">
            <p>
              <span className="font-semibold">
                予約者：
              </span>
              {selectedReservation.name}
            </p>

            <p>
              <span className="font-semibold">
                来店日：
              </span>
              {selectedReservation.reservation_date}
            </p>

            <p>
              <span className="font-semibold">
                時間：
              </span>
              {selectedReservation.time}
            </p>

            <p>
              <span className="font-semibold">
                人数：
              </span>
              {selectedReservation.people}名
            </p>

            <p>
              <span className="font-semibold">
                席：
              </span>
              {selectedReservation.seats &&
              selectedReservation.seats.length > 0
                ? selectedReservation.seats
                    .slice()
                    .sort((a, b) => a - b)
                    .map((seat) =>
                      getSeatLabel(seat)
                    )
                    .join("・")
                : getSeatLabel(
                    selectedReservation.seat
                  )}
            </p>

            <p>
              <span className="font-semibold">
                電話番号：
              </span>
              {selectedReservation.phone || "なし"}
            </p>

            <p>
              <span className="font-semibold">
                コース：
              </span>
              {selectedReservation.course || "なし"}
            </p>

            <p>
              <span className="font-semibold">
                アレルギー：
              </span>
              {selectedReservation.allergy || "なし"}
            </p>

            <p>
              <span className="font-semibold">
                プレート：
              </span>
              {selectedReservation.plate || "なし"}
            </p>

            <p>
              <span className="font-semibold">
                プレートメッセージ：
              </span>
              {selectedReservation.plate_message ||
                "なし"}
            </p>

            <p>
              <span className="font-semibold">
                備考：
              </span>
              {selectedReservation.note || "なし"}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}