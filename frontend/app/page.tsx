"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DateNavigator from "@/components/DateNavigator";
import ReservationForm from "@/components/ReservationForm";
import SeatLayout from "@/components/SeatLayout";

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
  const [editingReservation, setEditingReservation] =
  useState<Reservation | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*");

      if (error) {
        console.error("Supabase error:", error.message);
        return;
      }

      setReservations(data);
    };

    fetchReservations();
  }, []);

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


  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-6 text-4xl font-bold">
        飲食店予約管理システム
      </h1>
      
      <DateNavigator />

      <SeatLayout
        seats={seats}
        reservations={reservations}
        selectedSeat={selectedSeat}
        onSelectSeat={setSelectedSeat}
      />

      <p className="mb-6 text-lg font-medium">
        選択中の席：
        {selectedSeat === null ? "なし" : `${selectedSeat}番席`}
      </p>

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