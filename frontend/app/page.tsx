"use client";

import { useEffect, useState } from "react";
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

export default function Home() {

  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState("2026-07-18");
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [editingReservation, setEditingReservation] =
  useState<Reservation | null>(null);

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

  const selectedReservation =
    selectedSeat === null
      ? undefined
      : reservations.find(
          (reservation) =>
            reservation.seats?.includes(selectedSeat) ||
            reservation.seat === selectedSeat
        );

    const handleDeleteReservation = async () => {
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
        (reservation) => reservation.id !== selectedReservation.id
      )
    );
    setSelectedSeats([]);
    setSelectedSeat(null);
    };

    const handleSelectSeat = (seat: number) => {
      // カウンター席
      if (seat >= 101) {
        // 同じカウンター席をもう一度押したら解除
        if (selectedSeats.includes(seat)) {
          setSelectedSeat(null);
          setSelectedSeats([]);
          return;
        }

        // カウンター席は常に単独選択
        setSelectedSeat(seat);
        setSelectedSeats([seat]);
        return;
      }

      setSelectedSeats((prev) => {
        // カウンター席が選択中なら、テーブル席へ切り替える
        if (prev.some((selectedSeat) => selectedSeat >= 101)) {
          setSelectedSeat(seat);
          return [seat];
        }

        // 同じテーブル席をもう一度押したら解除
        if (prev.includes(seat)) {
          const nextSeats = prev.filter((s) => s !== seat);

          setSelectedSeat(
            nextSeats.length === 0
              ? null
              : nextSeats[nextSeats.length - 1]
          );

          return nextSeats;
        }

        const nextSeats = [...prev, seat].sort((a, b) => a - b);

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
              (value, index) => value === nextSeats[index]
            )
        );

        if (!isAllowed) {
          alert("この席の組み合わせでは予約できません");
          return prev;
        }

        setSelectedSeat(seat);

        return nextSeats;
      });
    };

    const getSeatLabel = (seat: number | null) => {
      if (seat === null) return "なし";

      if (seat >= 101 && seat <= 103) {
        return `カウンター${seat - 100}`;
      }

      return `${seat}番席`;
    };

    const handleDateChange = (date: string) => {
      setSelectedSeat(null);
      setSelectedSeats([]);
      setSelectedDate(date);
    };

  if (!isAuthChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>ログイン状態を確認中...</p>
      </main>
    );
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      return;
    }

    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          飲食店予約管理システム
        </h1>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
        >
          ログアウト
        </button>
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
      />

      <p className="mb-6 text-lg font-medium">
        選択中の席：
        {selectedSeats.length === 0
          ? "なし"
          : selectedSeats.map((seat) => getSeatLabel(seat)).join("・")}
      </p>

      {selectedReservation && (
        <ReservationDetails reservation={selectedReservation} />
      )}

      <div className="mb-6 flex gap-2">
        {selectedReservation && (
          <>
            <button
              onClick={handleDeleteReservation}
              className="rounded-lg bg-red-600 px-6 py-3 text-lg text-white hover:bg-red-700"
            >
              予約を削除
            </button>

            <button
              onClick={() => {
                setEditingReservation(selectedReservation);
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
      </div>

      {showForm && (
        <ReservationForm
          initialData={
            editingReservation
              ? {
                  name: editingReservation.name,
                  people: editingReservation.people,
                  time: editingReservation.time,
                  course: editingReservation.course ?? "",
                  allergy: editingReservation.allergy ?? "",
                  plate: editingReservation.plate ?? "",
                  plateMessage: editingReservation.plate_message ?? "",
                  phone: editingReservation.phone ?? "",
                  note: editingReservation.note ?? "",
                }
              : undefined
          }
          onCancel={() => setShowForm(false)}
          onSave={async (data) => {
            if (selectedSeat === null) return;

            const timeValue = data.time || null;

            // 予約変更の場合
            if (editingReservation) {
              const { error } = await supabase
                .from("reservations")
                .update({
                  name: data.name,
                  people: data.people,
                  time: timeValue,
                  course: data.course || null,
                  allergy: data.allergy || null,
                  plate: data.plate || null,
                  plate_message: data.plateMessage || null,
                  phone: data.phone || null,
                  note: data.note || null,
                })
                .eq("id", editingReservation.id);

              if (error) {
                console.error("Supabase update error:", error.message);
                console.error("Supabase update details:", error.details);
                console.error("Supabase update hint:", error.hint);
                return;
              }

            setReservations((prev) =>
              prev.map((reservation) =>
                reservation.id === editingReservation.id
                  ? {
                    ...reservation,
                    name: data.name,
                    people: data.people,
                    time: timeValue ?? "",
                    course: data.course || null,
                    allergy: data.allergy || null,
                    plate: data.plate || null,
                    plate_message: data.plateMessage || null,
                    phone: data.phone || null,
                    note: data.note || null,
                    }
                  : reservation
              )
            );

            setEditingReservation(null);
            setShowForm(false);
            return;
          }

            const conflictingReservation = reservations.find((reservation) => {
              const reservedSeats =
                reservation.seats && reservation.seats.length > 0
                  ? reservation.seats
                  : [reservation.seat];

              return selectedSeats.some((seat) =>
                reservedSeats.includes(seat)
              );
            });

            if (conflictingReservation) {
              alert("選択した席の中に既に予約されている席があります");
              return;
            }

            const { data: reservation, error } = await supabase
              .from("reservations")
              .insert({
                seat: selectedSeat,
                name: data.name,
                people: data.people,
                time: timeValue,
                course: data.course || null,
                allergy: data.allergy || null,
                plate: data.plate || null,
                plate_message: data.plateMessage || null,
                phone: data.phone || null,
                note: data.note || null,
                reservation_date: selectedDate,
              })
              .select()
              .single();

            if (error) {
              console.error("Supabase error:", error.message);
              console.error("Supabase error details:", error.details);
              console.error("Supabase error hint:", error.hint);
              return;
            }

            const seatRows = selectedSeats.map((seat) => ({
              reservation_id: reservation.id,
              seat,
            }));

            const { error: seatError } = await supabase
              .from("reservation_seats")
              .insert(seatRows);

            if (seatError) {
              console.error("Supabase seat error:", seatError.message);
              return;
            }

            setReservations((prev) => [
              ...prev,
              {
                ...reservation,
                seats: selectedSeats,
              },
            ]);

            setShowForm(false);
            setSelectedSeats([]);
            setSelectedSeat(null);
          }}
        />
      )}
    </main>
  );
}