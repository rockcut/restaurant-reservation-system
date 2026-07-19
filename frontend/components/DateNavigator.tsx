"use client";

import { useState } from "react";

export default function DateNavigator() {

  const [selectedDate, setSelectedDate] = useState("2026-07-18");

  const handlePreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);

    setSelectedDate(date.toISOString().split("T")[0]);
  };
  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);

    setSelectedDate(date.toISOString().split("T")[0]);
  };

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  const week = ["日", "月", "火", "水", "木", "金", "土"];

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}（${week[date.getDay()]}）`;
};

  return (
    <div className="mb-8 flex flex-col items-center gap-3">
      <div className="flex items-center gap-6">
      <button
        onClick={handlePreviousDay}
        className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
      >
        ◀
      </button>

        <h2 className="text-2xl font-bold">
          {formatDate(selectedDate)}
        </h2>

        <button 
          onClick={handleNextDay}
          className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
        >
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