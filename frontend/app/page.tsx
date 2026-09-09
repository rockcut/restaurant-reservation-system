"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import DateNavigator from "@/components/DateNavigator";
import ReservationForm from "@/components/ReservationForm";
import SeatLayout from "@/components/SeatLayout";
import ReservationDetails from "@/components/ReservationDetails";

type Reservation = {
  id: number;
  seat: number;
  seats?: number[];
  name: string;
  people: number;
  time: string;
  course: string | null;
  allergy: string | null;
  plate: string | null;
  plate_message: string | null;
  phone: string | null;
  note: string | null;
};

type UserRole = "editor" | "viewer";

const getTodayString = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function Home() {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);

  // editorだけ編集可能
  const canEdit = userRole === "editor";

  // ==========================
  // 席交換モード
  // ==========================

  const [isSwapMode, setIsSwapMode] = useState(false);

  const [swapModeType, setSwapModeType] =
    useState<"single" | "double">("single");

  // 1席交換
  const [swapSeatA, setSwapSeatA] = useState<number | null>(null);
  const [swapSeatB, setSwapSeatB] = useState<number | null>(null);

  // 2席ブロック交換
  const [swapBlockA, setSwapBlockA] =
    useState<number[] | null>(null);

  const [swapBlockB, setSwapBlockB] =
    useState<number[] | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // ==========================
  // ログイン確認・権限取得
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

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error(
          "Profile fetch error:",
          profileError.message
        );

        // 権限取得に失敗した場合は
        // 安全のためviewerとして扱う
        setUserRole("viewer");
      } else {
        setUserRole(
          profile.role === "editor"
            ? "editor"
            : "viewer"
        );
      }

      setIsAuthChecked(true);
    };

    checkUser();
  }, [router]);

  // ==========================
  // フォーム表示時スクロール
  // ==========================

  useEffect(() => {
    if (!showForm) return;

    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [showForm]);

  // ==========================
  // 予約取得
  // ==========================

  useEffect(() => {
    const fetchReservations = async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          reservation_seats (
            seat
          )
        `)
        .eq("reservation_date", selectedDate);

      if (error) {
        console.error("Supabase error:", error.message);
        return;
      }

      const formattedReservations = data.map((reservation) => ({
        ...reservation,
        seats: reservation.reservation_seats.map(
          (item: { seat: number }) => item.seat
        ),
      }));

      setReservations(formattedReservations);
    };

    fetchReservations();
  }, [selectedDate]);

  const seats = [1, 2, 3, 5, 6];

  const swappableBlocks = [
    [1, 2],
    [2, 3],
    [5, 6],
  ];

  const selectedReservation =
    selectedSeat === null
      ? undefined
      : reservations.find((reservation) => {
          if (
            reservation.seats &&
            reservation.seats.length > 0
          ) {
            return reservation.seats.includes(
              selectedSeat
            );
          }

          return reservation.seat === selectedSeat;
        });

  const getSeatLabel = (seat: number | null) => {
    if (seat === null) return "なし";

    if (seat >= 101 && seat <= 103) {
      return `カウンター${seat - 100}`;
    }

    return `${seat}番席`;
  };

  // ==========================
  // 席構成チェック
  // ==========================

  const isValidSeatCombination = (seats: number[]) => {
    const sortedSeats = [...seats].sort((a, b) => a - b);

    const allowedCombinations = [
      [1],
      [2],
      [3],
      [5],
      [6],
      [1, 2],
      [2, 3],
      [1, 2, 3],
      [5, 6],
      [101],
      [102],
      [103],
    ];

    return allowedCombinations.some(
      (combination) =>
        combination.length === sortedSeats.length &&
        combination.every(
          (value, index) => value === sortedSeats[index]
        )
    );
  };

  const findReservationBySeat = (seat: number) => {
    return reservations.find((reservation) => {
      const reservationSeats =
        reservation.seats && reservation.seats.length > 0
          ? reservation.seats
          : [reservation.seat];

      return reservationSeats.includes(seat);
    });
  };

  // ==========================
  // 予約削除
  // ==========================

  const handleDeleteReservation = async () => {
    if (!canEdit) return;
    if (!selectedReservation) return;

    const confirmed = window.confirm(
      "この予約を削除しますか？"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("reservations")
      .delete()
      .eq("id", selectedReservation.id);

    if (error) {
      console.error("Supabase error:", error.message);
      return;
    }

    setReservations((prev) =>
      prev.filter(
        (reservation) =>
          reservation.id !== selectedReservation.id
      )
    );

    setSelectedSeats([]);
    setSelectedSeat(null);
  };

  // ==========================
  // 席選択
  // ==========================

  const handleSelectSeat = (seat: number) => {
    // ==========================
    // 席交換モード
    // ==========================

    if (isSwapMode) {
      if (!canEdit) return;

      // 2席交換では席UIから個別席は選択しない
      // 1+2 / 2+3 / 5+6 のボタンから選択する
      if (swapModeType === "double") {
        return;
      }

      // 1席交換

      if (swapSeatA === null) {
        setSwapSeatA(seat);
        return;
      }

      if (seat === swapSeatA && swapSeatB === null) {
        setSwapSeatA(null);
        return;
      }

      if (swapSeatB === null) {
        setSwapSeatB(seat);
        return;
      }

      if (seat === swapSeatB) {
        setSwapSeatB(null);
        return;
      }

      // すでに2席選択済みなら
      // 新しい席を交換先にする
      setSwapSeatB(seat);
      return;
    }

    // ==========================
    // 通常モード
    // ==========================

    // 予約済みの席なら、予約詳細の確認を優先する
    const reservation = findReservationBySeat(seat);

    if (reservation) {
      const reservationSeats =
        reservation.seats && reservation.seats.length > 0
          ? [...reservation.seats].sort((a, b) => a - b)
          : [reservation.seat];

      setSelectedSeat(seat);
      setSelectedSeats(reservationSeats);

      setShowForm(false);
      setEditingReservation(null);

      return;
    }

    // ==========================
    // ここから空席の選択
    // ==========================

    // カウンター席
    if (seat >= 101) {
      if (selectedSeats.includes(seat)) {
        setSelectedSeat(null);
        setSelectedSeats([]);
        setShowForm(false);
        setEditingReservation(null);
        return;
      }

      setSelectedSeat(seat);
      setSelectedSeats([seat]);
      return;
    }

    setSelectedSeats((prev) => {
      // カウンター席を選択中にテーブル席を押した場合
      if (prev.some((selectedSeat) => selectedSeat >= 101)) {
        setSelectedSeat(seat);
        return [seat];
      }

      // 選択済みの空席をもう一度押した場合は解除
      if (prev.includes(seat)) {
        const nextSeats = prev.filter((s) => s !== seat);

        setSelectedSeat(
          nextSeats.length === 0
            ? null
            : nextSeats[nextSeats.length - 1]
        );

        if (nextSeats.length === 0) {
          setShowForm(false);
          setEditingReservation(null);
        }

        return nextSeats;
      }

      const nextSeats = [...prev, seat].sort(
        (a, b) => a - b
      );

      const allowedCombinations = [
        [1],
        [2],
        [3],
        [5],
        [6],
        [1, 2],
        [2, 3],
        [1, 2, 3],
        [5, 6],
      ];

      const isAllowed = allowedCombinations.some(
        (combination) =>
          combination.length === nextSeats.length &&
          combination.every(
            (value, index) =>
              value === nextSeats[index]
          )
      );

      if (!isAllowed) {
        alert(
          "この席の組み合わせでは予約できません"
        );

        return prev;
      }

      setSelectedSeat(seat);

      return nextSeats;
    });
  };

  // ==========================
  // 1席交換
  // ==========================

  const handleConfirmSwap = async () => {
    if (!canEdit) return;

    if (swapSeatA === null || swapSeatB === null) {
      return;
    }

    const reservationA =
      findReservationBySeat(swapSeatA);

    const reservationB =
      findReservationBySeat(swapSeatB);

    const seatsA =
      reservationA?.seats &&
      reservationA.seats.length > 0
        ? [...reservationA.seats]
        : reservationA
          ? [reservationA.seat]
          : [];

    const seatsB =
      reservationB?.seats &&
      reservationB.seats.length > 0
        ? [...reservationB.seats]
        : reservationB
          ? [reservationB.seat]
          : [];

    const nextSeatsA = reservationA
      ? seatsA
          .filter((seat) => seat !== swapSeatA)
          .concat(swapSeatB)
          .sort((a, b) => a - b)
      : [];

    const nextSeatsB = reservationB
      ? seatsB
          .filter((seat) => seat !== swapSeatB)
          .concat(swapSeatA)
          .sort((a, b) => a - b)
      : [];

    if (
      reservationA &&
      reservationB &&
      reservationA.id === reservationB.id
    ) {
      alert(
        "同じ予約に含まれる席同士は交換する必要がありません"
      );
      return;
    }

    if (!reservationA && !reservationB) {
      alert("どちらの席にも予約がありません");
      return;
    }

    if (
      reservationA &&
      !isValidSeatCombination(nextSeatsA)
    ) {
      alert(
        "交換後、交換元の予約が無効な席構成になります"
      );
      return;
    }

    if (
      reservationB &&
      !isValidSeatCombination(nextSeatsB)
    ) {
      alert(
        "交換後、交換先の予約が無効な席構成になります"
      );
      return;
    }

    const confirmed = window.confirm(
      `${getSeatLabel(swapSeatA)}と${getSeatLabel(
        swapSeatB
      )}を交換しますか？`
    );

    if (!confirmed) return;

    const { error } = await supabase.rpc(
      "swap_reservation_seats",
      {
        p_reservation_a_id:
          reservationA?.id ?? null,
        p_seat_a: swapSeatA,
        p_reservation_b_id:
          reservationB?.id ?? null,
        p_seat_b: swapSeatB,
      }
    );

    if (error) {
      console.error(
        "Supabase seat swap error:",
        error.message
      );

      console.error(
        "Supabase seat swap details:",
        error.details
      );

      console.error(
        "Supabase seat swap hint:",
        error.hint
      );

      alert("席の交換に失敗しました");
      return;
    }

    setReservations((prev) =>
      prev.map((reservation) => {
        if (
          reservationA &&
          reservation.id === reservationA.id
        ) {
          return {
            ...reservation,
            seats: nextSeatsA,
          };
        }

        if (
          reservationB &&
          reservation.id === reservationB.id
        ) {
          return {
            ...reservation,
            seats: nextSeatsB,
          };
        }

        return reservation;
      })
    );

    setIsSwapMode(false);
    setSwapSeatA(null);
    setSwapSeatB(null);
    setSwapBlockA(null);
    setSwapBlockB(null);

    setSelectedSeat(null);
    setSelectedSeats([]);

    alert("席を交換しました");
  };

  // ==========================
  // 2席ブロック交換
  // ==========================

  const handleConfirmDoubleSwap = async () => {
    if (!canEdit) return;

    if (!swapBlockA || !swapBlockB) {
      return;
    }

    // 1+2 と 2+3 のような
    // 重複ブロックは2席交換では扱わない
    const overlaps = swapBlockA.some((seat) =>
      swapBlockB.includes(seat)
    );

    if (overlaps) {
      alert(
        "重なっている2席ブロック同士は交換できません。1席交換を使用してください"
      );
      return;
    }

    // 現在の各席の所属予約を取得
    const assignments =
      new Map<number, Reservation | undefined>();

    [...swapBlockA, ...swapBlockB].forEach((seat) => {
      assignments.set(
        seat,
        findReservationBySeat(seat)
      );
    });

    // まず現在の全予約の席構成をコピー
    const nextReservationSeats =
      new Map<number, number[]>();

    reservations.forEach((reservation) => {
      const currentSeats =
        reservation.seats &&
        reservation.seats.length > 0
          ? [...reservation.seats]
          : [reservation.seat];

      nextReservationSeats.set(
        reservation.id,
        currentSeats
      );
    });

    // 1↔5、2↔6 のように
    // 左右対応で仮交換
    for (let i = 0; i < 2; i++) {
      const seatA = swapBlockA[i];
      const seatB = swapBlockB[i];

      const reservationA =
        assignments.get(seatA);

      const reservationB =
        assignments.get(seatB);

      if (reservationA) {
        const current =
          nextReservationSeats.get(
            reservationA.id
          ) ?? [];

        nextReservationSeats.set(
          reservationA.id,
          current
            .filter((seat) => seat !== seatA)
            .concat(seatB)
            .sort((a, b) => a - b)
        );
      }

      if (reservationB) {
        const current =
          nextReservationSeats.get(
            reservationB.id
          ) ?? [];

        nextReservationSeats.set(
          reservationB.id,
          current
            .filter((seat) => seat !== seatB)
            .concat(seatA)
            .sort((a, b) => a - b)
        );
      }
    }

    // 交換後の全予約が
    // 有効な席構成か確認
    for (const reservation of reservations) {
      const nextSeats =
        nextReservationSeats.get(
          reservation.id
        ) ?? [];

      if (!isValidSeatCombination(nextSeats)) {
        alert(
          `${reservation.name}さんの予約が、交換後に無効な席構成になります`
        );
        return;
      }
    }

    // 4席とも空席なら交換する意味がない
    const hasReservation = [
      ...swapBlockA,
      ...swapBlockB,
    ].some(
      (seat) =>
        findReservationBySeat(seat) !==
        undefined
    );

    if (!hasReservation) {
      alert(
        "選択した2席ブロックには予約がありません"
      );
      return;
    }

    const confirmed = window.confirm(
      `${swapBlockA.join(
        " + "
      )} と ${swapBlockB.join(
        " + "
      )} を交換しますか？`
    );

    if (!confirmed) return;

    const { error: swapError } = await supabase.rpc(
      "swap_reservation_seat_blocks",
      {
        p_seat_a1: swapBlockA[0],
        p_seat_a2: swapBlockA[1],
        p_seat_b1: swapBlockB[0],
        p_seat_b2: swapBlockB[1],
      }
    );

    if (swapError) {
      console.error(
        "2席交換エラー:",
        swapError
      );

      alert(
        "2席ブロックの交換に失敗しました"
      );

      return;
    }

    // DBから最新状態を再取得
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        reservation_seats (
          seat
        )
      `)
      .eq("reservation_date", selectedDate);

    if (error) {
      console.error(
        "交換後の再取得エラー:",
        error.message
      );

      alert(
        "交換後の予約情報取得に失敗しました"
      );

      return;
    }

    const formattedReservations = data.map(
      (reservation) => ({
        ...reservation,
        seats:
          reservation.reservation_seats.map(
            (item: { seat: number }) =>
              item.seat
          ),
      })
    );

    setReservations(formattedReservations);

    setIsSwapMode(false);

    setSwapSeatA(null);
    setSwapSeatB(null);

    setSwapBlockA(null);
    setSwapBlockB(null);

    setSelectedSeat(null);
    setSelectedSeats([]);

    alert("2席ブロックを交換しました");
  };

  // ==========================
  // 日付変更
  // ==========================

  const handleDateChange = (date: string) => {
    setSelectedSeat(null);
    setSelectedSeats([]);

    setIsSwapMode(false);

    setSwapSeatA(null);
    setSwapSeatB(null);

    setSwapBlockA(null);
    setSwapBlockB(null);

    setShowForm(false);
    setEditingReservation(null);

    setSelectedDate(date);
  };

  // ==========================
  // 席交換モード開始
  // ==========================

  const handleStartSwap = () => {
    if (!canEdit) return;

    setSelectedSeat(null);
    setSelectedSeats([]);

    setShowForm(false);
    setEditingReservation(null);

    setIsSwapMode(true);
    setSwapModeType("single");

    setSwapSeatA(null);
    setSwapSeatB(null);

    setSwapBlockA(null);
    setSwapBlockB(null);
  };

  const handleCancelSwap = () => {
    setIsSwapMode(false);

    setSwapSeatA(null);
    setSwapSeatB(null);

    setSwapBlockA(null);
    setSwapBlockB(null);
  };

  // ==========================
  // ログアウト
  // ==========================

  const handleLogout = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error.message
      );

      return;
    }

    router.push("/login");
  };

  if (!isAuthChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>
          ログイン状態を確認中...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      {/* ==========================
          ヘッダー
      ========================== */}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          飲食店予約管理システム
        </h1>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              router.push("/search")
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            予約検索
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            ログアウト
          </button>
        </div>
      </div>

      <DateNavigator
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      <SeatLayout
        seats={seats}
        reservations={reservations}
        selectedSeat={selectedSeat}
        selectedSeats={selectedSeats}
        onSelectSeat={handleSelectSeat}
        isSwapMode={
          canEdit &&
          isSwapMode &&
          swapModeType === "single"
        }
        swapSeatA={swapSeatA}
        swapSeatB={swapSeatB}
      />

      {/* ==========================
          席交換モード
      ========================== */}

      {canEdit && isSwapMode && (
        <div className="mb-6 mt-6 rounded-lg border border-purple-300 bg-white p-4 shadow">

          <h2 className="mb-3 text-xl font-bold">
            席交換モード
          </h2>

          {/* 1席 / 2席切替 */}

          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSwapModeType("single");

                setSwapSeatA(null);
                setSwapSeatB(null);

                setSwapBlockA(null);
                setSwapBlockB(null);
              }}
              className={`rounded-lg px-4 py-2 ${
                swapModeType === "single"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              1席交換
            </button>

            <button
              type="button"
              onClick={() => {
                setSwapModeType("double");

                setSwapSeatA(null);
                setSwapSeatB(null);

                setSwapBlockA(null);
                setSwapBlockB(null);
              }}
              className={`rounded-lg px-4 py-2 ${
                swapModeType === "double"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              2席交換
            </button>
          </div>

          {/* ==========================
              1席交換UI
          ========================== */}

          {swapModeType === "single" && (
            <>
              <p className="mb-3 text-sm text-gray-600">
                交換する2つの席を順番に選択してください
              </p>

              <div className="space-y-1">
                <p>
                  <span className="font-semibold">
                    交換元：
                  </span>

                  {getSeatLabel(swapSeatA)}
                </p>

                <p>
                  <span className="font-semibold">
                    交換先：
                  </span>

                  {getSeatLabel(swapSeatB)}
                </p>
              </div>
            </>
          )}

          {/* ==========================
              2席交換UI
          ========================== */}

          {swapModeType === "double" && (
            <div className="mb-4">

              <p className="mb-2 font-semibold">
                交換する2席ブロックを選択してください
              </p>

              <div className="flex flex-wrap gap-2">

                {swappableBlocks.map((block) => {
                  const isBlockA =
                    swapBlockA !== null &&
                    swapBlockA[0] === block[0] &&
                    swapBlockA[1] === block[1];

                  const isBlockB =
                    swapBlockB !== null &&
                    swapBlockB[0] === block[0] &&
                    swapBlockB[1] === block[1];

                  const isSelected =
                    isBlockA || isBlockB;

                  return (
                    <button
                      key={block.join("-")}
                      type="button"

                      onClick={() => {
                        if (isBlockA) {
                          setSwapBlockA(null);
                          return;
                        }

                        if (isBlockB) {
                          setSwapBlockB(null);
                          return;
                        }

                        if (swapBlockA === null) {
                          setSwapBlockA(block);
                          return;
                        }

                        if (swapBlockB === null) {
                          const overlaps =
                            swapBlockA.some(
                              (seat) =>
                                block.includes(seat)
                            );

                          if (overlaps) {
                            alert(
                              "重なっている2席ブロック同士は交換できません。1席交換を使用してください"
                            );

                            return;
                          }

                          setSwapBlockB(block);
                          return;
                        }

                        const overlaps =
                          swapBlockA.some(
                            (seat) =>
                              block.includes(seat)
                          );

                        if (overlaps) {
                          alert(
                            "重なっている2席ブロック同士は交換できません。1席交換を使用してください"
                          );

                          return;
                        }

                        setSwapBlockB(block);
                      }}

                      className={`rounded-lg px-5 py-3 font-semibold ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {block.join(" + ")}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3">
                <p>
                  <span className="font-semibold">
                    交換元：
                  </span>

                  {swapBlockA
                    ? swapBlockA.join(" + ")
                    : "なし"}
                </p>

                <p>
                  <span className="font-semibold">
                    交換先：
                  </span>

                  {swapBlockB
                    ? swapBlockB.join(" + ")
                    : "なし"}
                </p>
              </div>
            </div>
          )}

          {/* ==========================
              キャンセル / 確定
          ========================== */}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleCancelSwap}
              className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              キャンセル
            </button>

            <button
              type="button"

              onClick={
                swapModeType === "single"
                  ? handleConfirmSwap
                  : handleConfirmDoubleSwap
              }

              disabled={
                swapModeType === "single"
                  ? swapSeatA === null ||
                    swapSeatB === null
                  : swapBlockA === null ||
                    swapBlockB === null
              }

              className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              交換を確定
            </button>
          </div>
        </div>
      )}

      {/* ==========================
          通常モード
      ========================== */}

      {!isSwapMode && (
        <>
          <p className="mb-6 text-lg font-medium">
            選択中の席：
            {selectedSeats.length === 0
              ? "なし"
              : selectedSeats
                  .map((seat) =>
                    getSeatLabel(seat)
                  )
                  .join("・")}
          </p>

          {selectedReservation && (
            <ReservationDetails
              reservation={selectedReservation}
            />
          )}

          {/* editorだけ編集ボタンを表示 */}
          {canEdit && (
            <div className="mb-6 flex gap-2">

              {selectedReservation && (
                <>
                  <button
                    onClick={
                      handleDeleteReservation
                    }
                    className="rounded-lg bg-red-600 px-6 py-3 text-lg text-white hover:bg-red-700"
                  >
                    予約を削除
                  </button>

                  <button
                    onClick={() => {
                      setEditingReservation(
                        selectedReservation
                      );

                      setShowForm(true);
                    }}
                    className="rounded-lg bg-yellow-500 px-6 py-3 text-lg text-white hover:bg-yellow-600"
                  >
                    予約を変更
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setEditingReservation(null);
                  setShowForm(true);
                }}
                className="rounded-lg bg-blue-600 px-6 py-3 text-lg text-white hover:bg-blue-700"
              >
                ＋予約を追加
              </button>

              <button
                type="button"
                onClick={handleStartSwap}
                className="rounded-lg bg-purple-600 px-6 py-3 text-lg text-white hover:bg-purple-700"
              >
                席を交換
              </button>
            </div>
          )}
        </>
      )}

      {/* ==========================
          予約フォーム
      ========================== */}

      {canEdit && showForm && !isSwapMode && (
        <div ref={formRef}>

          <ReservationForm
            initialData={
              editingReservation
                ? {
                    name:
                      editingReservation.name,

                    people:
                      editingReservation.people,

                    time:
                      editingReservation.time,

                    course:
                      editingReservation.course ??
                      "",

                    allergy:
                      editingReservation.allergy ??
                      "",

                    plate:
                      editingReservation.plate ??
                      "",

                    plateMessage:
                      editingReservation.plate_message ??
                      "",

                    phone:
                      editingReservation.phone ??
                      "",

                    note:
                      editingReservation.note ??
                      "",
                  }
                : undefined
            }

            onCancel={() =>
              setShowForm(false)
            }

            onSave={async (data) => {
              if (!canEdit) return;
              if (selectedSeat === null) return;

              const timeValue =
                data.time || null;

              // ==========================
              // 予約変更
              // ==========================

              if (editingReservation) {
                const { error } =
                  await supabase
                    .from("reservations")
                    .update({
                      name:
                        data.name,

                      people:
                        data.people,

                      time:
                        timeValue,

                      course:
                        data.course ||
                        null,

                      allergy:
                        data.allergy ||
                        null,

                      plate:
                        data.plate ||
                        null,

                      plate_message:
                        data.plateMessage ||
                        null,

                      phone:
                        data.phone ||
                        null,

                      note:
                        data.note ||
                        null,
                    })

                    .eq(
                      "id",
                      editingReservation.id
                    );

                if (error) {
                  console.error(
                    "Supabase update error:",
                    error.message
                  );

                  console.error(
                    "Supabase update details:",
                    error.details
                  );

                  console.error(
                    "Supabase update hint:",
                    error.hint
                  );

                  return;
                }

                setReservations((prev) =>
                  prev.map(
                    (reservation) =>
                      reservation.id ===
                      editingReservation.id
                        ? {
                            ...reservation,

                            name:
                              data.name,

                            people:
                              data.people,

                            time:
                              timeValue ??
                              "",

                            course:
                              data.course ||
                              null,

                            allergy:
                              data.allergy ||
                              null,

                            plate:
                              data.plate ||
                              null,

                            plate_message:
                              data.plateMessage ||
                              null,

                            phone:
                              data.phone ||
                              null,

                            note:
                              data.note ||
                              null,
                          }

                        : reservation
                  )
                );

                setEditingReservation(null);
                setShowForm(false);

                return;
              }

              // ==========================
              // 新規予約
              // ==========================

              const conflictingReservation =
                reservations.find(
                  (reservation) => {
                    const reservedSeats =
                      reservation.seats &&
                      reservation.seats
                        .length > 0

                        ? reservation.seats

                        : [
                            reservation.seat,
                          ];

                    return selectedSeats.some(
                      (seat) =>
                        reservedSeats.includes(
                          seat
                        )
                    );
                  }
                );

              if (conflictingReservation) {
                alert(
                  "選択した席の中に既に予約されている席があります"
                );

                return;
              }

              const {
                data: reservation,
                error,
              } = await supabase
                .from("reservations")
                .insert({
                  seat:
                    selectedSeat,

                  name:
                    data.name,

                  people:
                    data.people,

                  time:
                    timeValue,

                  course:
                    data.course ||
                    null,

                  allergy:
                    data.allergy ||
                    null,

                  plate:
                    data.plate ||
                    null,

                  plate_message:
                    data.plateMessage ||
                    null,

                  phone:
                    data.phone ||
                    null,

                  note:
                    data.note ||
                    null,

                  reservation_date:
                    selectedDate,
                })

                .select()
                .single();

              if (error) {
                console.error(
                  "Supabase error:",
                  error.message
                );

                console.error(
                  "Supabase error details:",
                  error.details
                );

                console.error(
                  "Supabase error hint:",
                  error.hint
                );

                return;
              }

              const seatRows =
                selectedSeats.map(
                  (seat) => ({
                    reservation_id:
                      reservation.id,

                    seat,
                  })
                );

              const {
                error: seatError,
              } = await supabase
                .from(
                  "reservation_seats"
                )
                .insert(seatRows);

              if (seatError) {
                console.error(
                  "Supabase seat error:",
                  seatError.message
                );

                return;
              }

              setReservations(
                (prev) => [
                  ...prev,
                  {
                    ...reservation,
                    seats:
                      selectedSeats,
                  },
                ]
              );

              setShowForm(false);
              setSelectedSeats([]);
              setSelectedSeat(null);
            }}
          />
        </div>
      )}
    </main>
  );
}