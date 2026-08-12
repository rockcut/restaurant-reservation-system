"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DateNavigator from "@/components/DateNavigator";
import ReservationForm from "@/components/ReservationForm";
import SeatLayout from "@/components/SeatLayout";
import ReservationDetails from "@/components/ReservationDetails";

type Reservation = {
  id: number;
  seat: number;
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
  const [showForm, setShowForm] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState("2026-07-18");
  const [editingReservation, setEditingReservation] =
  useState<Reservation | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("reservation_date", selectedDate);

      if (error) {
        console.error("Supabase error:", error.message);
        return;
      }

      setReservations(data);
    };

    fetchReservations();
  }, [selectedDate]);

  const seats = [1, 2, 3, 5, 6];

  const selectedReservation =
    selectedSeat === null
      ? undefined
      : reservations.find(
          (reservation) => reservation.seat === selectedSeat
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

    setSelectedSeat(null);
    };

    const getSeatLabel = (seat: number | null) => {
      if (seat === null) return "なし";

      if (seat >= 101 && seat <= 103) {
        return `カウンター${seat - 100}`;
      }

      return `${seat}番席`;
    };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-6 text-4xl font-bold">
        飲食店予約管理システム
      </h1>

      <DateNavigator
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      <SeatLayout
        seats={seats}
        reservations={reservations}
        selectedSeat={selectedSeat}
        onSelectSeat={setSelectedSeat}
      />

      <p className="mb-6 text-lg font-medium">
        選択中の席：{getSeatLabel(selectedSeat)}
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

            // 新規予約の場合
            const { data: existingReservation, error: checkError } = await supabase
              .from("reservations")
              .select("*")
              .eq("seat", selectedSeat)
              .eq("reservation_date", selectedDate)
              .maybeSingle();

            if (checkError) {
              console.error("Supabase error:", checkError.message);
              return;
            }

            if (existingReservation) {
              alert("この席は既に予約されています");
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

            setReservations((prev) => [
              ...prev,
              reservation,
            ]);

            setShowForm(false);
          }}
        />
      )}
    </main>
  );
}