"use client";

import { useState } from "react";

export default function DateNavigator() {

  const [selectedDate, setSelectedDate] = useState("2026-07-18");

  return (
    <div className="mb-8 flex flex-col items-center gap-3">
      <div className="flex items-center gap-6">
        <button className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300">
          ◀
        </button>

        <h2 className="text-2xl font-bold">
          {selectedDate}
        </h2>

        <button className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300">
          ▶
        </button>
      </div>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="rounded-lg border px-4 py-2"
      />
    </div>
  );
}