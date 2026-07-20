"use client";

import { useState } from "react";
import DateNavigator from "@/components/DateNavigator";
import ReservationForm from "@/components/ReservationForm";

export default function Home() {

  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

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
            className={`flex h-24 w-24 items-center justify-center rounded-lg text-2xl font-bold text-white cursor-pointer ${
              selectedSeat === 1 ? "bg-blue-500" : "bg-green-500"
            }`}          
          >
            1
          </div>

          <div 
            onClick={() => setSelectedSeat(2)}
            className={`flex h-24 w-24 items-center justify-center rounded-lg text-2xl font-bold text-white cursor-pointer ${
              selectedSeat === 2 ? "bg-blue-500" : "bg-green-500"
            }`}
          >
            2
          </div>

          <div 
            onClick={() => setSelectedSeat(3)}
            className={`flex h-24 w-24 items-center justify-center rounded-lg text-2xl font-bold text-white cursor-pointer ${
              selectedSeat === 3 ? "bg-blue-500" : "bg-green-500"
            }`}          
          >
            3
          </div>
        </div>

        <div className="flex gap-4">
          <div className="h-24 w-24"></div>

          <div 
          onClick={() => setSelectedSeat(5)}
           className={`flex h-24 w-24 items-center justify-center rounded-lg text-2xl font-bold text-white cursor-pointer ${
              selectedSeat === 5 ? "bg-blue-500" : "bg-green-500"
            }`}            
          >
            5
          </div>

          <div 
          onClick={() => setSelectedSeat(6)}
           className={`flex h-24 w-24 items-center justify-center rounded-lg text-2xl font-bold text-white cursor-pointer ${
              selectedSeat === 6 ? "bg-blue-500" : "bg-green-500"
            }`}   
          >
            6
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

      <button className="rounded-lg bg-blue-600 px-6 py-3 text-lg text-white hover:bg-blue-700">
        ＋予約を追加
      </button>

      <ReservationForm />
    </main>
  );
}