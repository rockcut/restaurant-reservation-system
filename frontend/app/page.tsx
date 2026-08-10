"use client";

import { useEffect, useState } from "react";
import DateNavigator from "@/components/DateNavigator";
import ReservationForm from "@/components/ReservationForm";
import { supabase } from "@/lib/supabase";

type Reservation = {
  seat: number;
  name: string;
  people: number;
  time: string;
};

export default function Home() {

  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);

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

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-6 text-4xl font-bold">
        飲食店予約管理システム
      </h1>
      
      <DateNavigator />


      <h2 className="mb-4 text-2xl font-semibold">
        テーブル席
      </h2>

      <div className="space-y-6"></div>
      <div className="flex gap-4">
        {seats.slice(0, 3).map((seat) => {
          const reservation = reservations.find(
            (reservation) => reservation.seat === seat
          );

          return (
            <div
              key={seat}
              onClick={() => setSelectedSeat(seat)}
              className={`flex h-24 w-24 flex-col items-center justify-center rounded-lg text-white cursor-pointer ${
                selectedSeat === seat
                  ? "bg-blue-500"
                  : reservation
                    ? "bg-orange-500"
                    : "bg-green-500"
              }`}
            >
              <div className="text-lg font-bold">{seat}</div>

              {reservation && (
                <>
                  <div className="text-xs">
                    {reservation.name}
                  </div>

                  <div className="text-xs">
                    {reservation.time}・{reservation.people}名
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-6">
        <div className="h-24 w-24"></div>

        {seats.slice(3).map((seat) => {
          const reservation = reservations.find(
            (reservation) => reservation.seat === seat
          );

          return (
            <div
              key={seat}
              onClick={() => setSelectedSeat(seat)}
              className={`flex h-24 w-24 flex-col items-center justify-center rounded-lg text-white cursor-pointer ${
                selectedSeat === seat
                  ? "bg-blue-500"
                  : reservation
                    ? "bg-orange-500"
                    : "bg-green-500"
              }`}
            >
              <div className="text-lg font-bold">{seat}</div>

              {reservation && (
                <>
                  <div className="text-xs">
                    {reservation.name}
                  </div>

                  <div className="text-xs">
                    {reservation.time}・{reservation.people}名
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <h2 className="mt-10 mb-4 text-2xl font-semibold">
        カウンター
      </h2>

      <div className="mb-10 flex gap-4">
        <div className="h-16 w-16 rounded-full bg-green-500"></div>
        <div className="h-16 w-16 rounded-full bg-green-500"></div>
        <div className="h-16 w-16 rounded-full bg-red-500"></div>
      </div>

      <p className="mb-6 text-lg font-medium">
        選択中の席：
        {selectedSeat === null ? "なし" : `${selectedSeat}番席`}
      </p>

    <button
        onClick={() => setShowForm(true)}
        className="rounded-lg bg-blue-600 px-6 py-3 text-lg text-white hover:bg-blue-700"
      >
        ＋予約を追加
      </button>

      {showForm && (
        <ReservationForm
          onCancel={() => setShowForm(false)}
          onSave={async(data) => {
            if (selectedSeat === null) return;

            const timeValue = data.time || null;

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