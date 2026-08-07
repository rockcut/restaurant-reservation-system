"use client";

import { useState } from "react";
import DateNavigator from "@/components/DateNavigator";
import ReservationForm from "@/components/ReservationForm";

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

  const seat1Reservation = reservations.find(
    (reservation) => reservation.seat === 1
  );
  const seat2Reservation = reservations.find(
    (reservation) => reservation.seat === 2
  );
  const seat3Reservation = reservations.find(
    (reservation) => reservation.seat === 3
  );
  const seat5Reservation = reservations.find(
    (reservation) => reservation.seat === 5
  );
  const seat6Reservation = reservations.find(
    (reservation) => reservation.seat === 6
  );

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-6 text-4xl font-bold">
        飲食店予約管理システム
      </h1>
      
      <DateNavigator />


      <h2 className="mb-4 text-2xl font-semibold">
        テーブル席
      </h2>

      <div className="space-y-6">
        <div className="flex gap-4">

          <div
            onClick={() => setSelectedSeat(1)}
            className={`flex h-24 w-24 flex-col items-center justify-center rounded-lg text-white cursor-pointer ${
              selectedSeat === 1
                 ? "bg-blue-500"
                 : seat1Reservation
                  ? "bg-orange-500"
                  : "bg-green-500"
            }`}
          >
            <div className="text-lg font-bold">1</div>

            {seat1Reservation && (
              <>
                <div className="text-xs">
                  {seat1Reservation.name}
                </div>

                <div className="text-xs">
                  {seat1Reservation.time}・{seat1Reservation.people}名
                </div>
              </>
            )}
          </div>

          <div
            onClick={() => setSelectedSeat(2)}
            className={`flex h-24 w-24 flex-col items-center justify-center rounded-lg text-white cursor-pointer ${
             selectedSeat === 2
              ? "bg-blue-500"
              : seat2Reservation
                ? "bg-orange-500"
                : "bg-green-500"            }`}
          >
            <div className="text-lg font-bold">2</div>

            {seat2Reservation && (
              <>
                <div className="text-xs">
                  {seat2Reservation.name}
                </div>

                <div className="text-xs">
                  {seat2Reservation.time}・{seat2Reservation.people}名
                </div>
              </>
            )}
          </div>

          <div
            onClick={() => setSelectedSeat(3)}
            className={`flex h-24 w-24 flex-col items-center justify-center rounded-lg text-white cursor-pointer ${
             selectedSeat === 3
              ? "bg-blue-500"
              : seat3Reservation
                ? "bg-orange-500"
                : "bg-green-500"            }`}
          >
            <div className="text-lg font-bold">3</div>

            {seat3Reservation && (
              <>
                <div className="text-xs">
                  {seat3Reservation.name}
                </div>

                <div className="text-xs">
                  {seat3Reservation.time}・{seat3Reservation.people}名
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="h-24 w-24"></div>

          <div
            onClick={() => setSelectedSeat(5)}
            className={`flex h-24 w-24 flex-col items-center justify-center rounded-lg text-white cursor-pointer ${
              selectedSeat === 5
               ? "bg-blue-500"
               : seat5Reservation
                ? "bg-orange-500"
                : "bg-green-500"
            }`}
          >
            <div className="text-lg font-bold">5</div>

            {seat5Reservation && (
              <>
                <div className="text-xs">
                  {seat5Reservation.name}
                </div>

                <div className="text-xs">
                  {seat5Reservation.time}・{seat5Reservation.people}名
                </div>
              </>
            )}
          </div>


          <div
            onClick={() => setSelectedSeat(6)}
            className={`flex h-24 w-24 flex-col items-center justify-center rounded-lg text-white cursor-pointer ${
              selectedSeat === 6
               ? "bg-blue-500"
               : seat6Reservation
                ? "bg-orange-500"
                : "bg-green-500"
            }`}
          >
            <div className="text-lg font-bold">6</div>

            {seat6Reservation && (
              <>
                <div className="text-xs">
                  {seat6Reservation.name}
                </div>

                <div className="text-xs">
                  {seat6Reservation.time}・{seat6Reservation.people}名
                </div>
              </>
            )}
          </div>
        </div>
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

      <pre>
        {JSON.stringify(reservations, null, 2)}
      </pre>

    <button
        onClick={() => setShowForm(true)}
        className="rounded-lg bg-blue-600 px-6 py-3 text-lg text-white hover:bg-blue-700"
      >
        ＋予約を追加
      </button>

      {showForm && (
        <ReservationForm
          onCancel={() => setShowForm(false)}
          onSave={(data) => {
            if (selectedSeat === null) return;

            setReservations((prev) => [
              ...prev,
              {
                seat: selectedSeat,
                name: data.name,
                people: data.people,
                time: data.time,
              },
            ]);

            setShowForm(false);
          }}
        />
      )}
    </main>
  );
}