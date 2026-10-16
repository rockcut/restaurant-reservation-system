"use client";

import { useState } from "react";

type ReservationFormProps = {
  onCancel: () => void;
  onSave: (data: {
    name: string;
    people: number;
    time: string;
    course: string;
    allergy: string;
    plate: string;
    plateMessage: string;
    phone: string;
    note: string;
  }) => void;

  initialData?: {
    name: string;
    people: number;
    time: string;
    course?: string;
    allergy?: string;
    plate?: string;
    plateMessage?: string;
    phone?: string;
    note?: string;
  };
};

export default function ReservationForm({
  onCancel,
  onSave,
  initialData,
}: ReservationFormProps) {
  const [plate, setPlate] = useState(initialData?.plate ?? "");

  const [name, setName] = useState(initialData?.name ?? "");
  const [people, setPeople] = useState(initialData?.people ?? 1);
  const [time, setTime] = useState(initialData?.time ?? "");

  const [course, setCourse] = useState(initialData?.course ?? "");
  const [allergy, setAllergy] = useState(initialData?.allergy ?? "");

  const [plateMessage, setPlateMessage] = useState(
    initialData?.plateMessage ?? ""
  );

  const [anniversaryNumber, setAnniversaryNumber] = useState("");

  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [note, setNote] = useState(initialData?.note ?? "");
  const [receivedBy, setReceivedBy] = useState("");

  const getOrdinalSuffix = (number: number) => {
    const mod100 = number % 100;

    if (mod100 >= 11 && mod100 <= 13) {
      return "th";
    }

    switch (number % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const handleAnniversaryChange = (value: string) => {
    setAnniversaryNumber(value);

    if (value === "") {
      setPlateMessage("Happy anniversary");
      return;
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return;
    }

    const suffix = getOrdinalSuffix(number);

    setPlateMessage(
      `Happy ${number}${suffix} anniversary`
    );
  };

  // 17:00〜22:00の時間を10分刻みで生成
  const timeOptions: string[] = [];

  for (let hour = 17; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 10) {
      if (hour === 22 && minute > 0) {
        break;
      }

      timeOptions.push(
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
      );
    }
  }

  return (
    <div className="mt-8 rounded-lg border bg-white p-6 shadow">
      <h2 className="mb-6 text-2xl font-bold">
        予約入力
      </h2>

      {!initialData && (
        <>
          <label className="mb-2 block font-semibold">
            受付担当者（必須）
          </label>

          <select
            value={receivedBy}
            onChange={(e) => setReceivedBy(e.target.value)}
            className="mb-4 w-full rounded-lg border px-4 py-2"
          >
            <option value="">受付担当者を選択</option>
            <option value="まゆみ">まゆみ</option>
            <option value="あずき">あずき</option>
            <option value="はるか">はるか</option>
            <option value="さくら">さくら</option>
            <option value="りゅうのすけ">りゅうのすけ</option>
            <option value="大西">大西</option>
          </select>
        </>
      )}

      <label className="mb-2 block font-semibold">
        予約者名
      </label>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 w-full rounded-lg border px-4 py-2"
      />

      <label className="mb-2 block font-semibold">
        人数
      </label>

      <select
        value={people}
        onChange={(e) => setPeople(Number(e.target.value))}
        className="mb-4 w-full rounded-lg border px-4 py-2"
      >
        <option value={1}>1人</option>
        <option value={2}>2人</option>
        <option value={3}>3人</option>
        <option value={4}>4人</option>
        <option value={5}>5人</option>
        <option value={6}>6人</option>
        <option value={7}>7人</option>
        <option value={8}>8人</option>
        <option value={9}>9人</option>
        <option value={10}>10人</option>
      </select>

      <label className="mb-2 block font-semibold">
        来店時刻
      </label>

      <select
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="mb-4 w-full rounded-lg border px-4 py-2"
      >
        <option value="">時間を選択</option>

        {timeOptions.map((timeOption) => (
          <option key={timeOption} value={timeOption}>
            {timeOption}
          </option>
        ))}
      </select>

      <label className="mb-2 block font-semibold">
        コース
      </label>

      <div className="mb-4 space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="course"
            value="5000円コース"
            checked={course === "5000円コース"}
            onChange={(e) => setCourse(e.target.value)}
          />
          5,000円コース
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="course"
            value="6000円コース"
            checked={course === "6000円コース"}
            onChange={(e) => setCourse(e.target.value)}
          />
          6,000円コース
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="course"
            value="アラカルト"
            checked={course === "アラカルト"}
            onChange={(e) => setCourse(e.target.value)}
          />
          アラカルト
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="course"
            value="検討中"
            checked={course === "検討中"}
            onChange={(e) => setCourse(e.target.value)}
          />
          検討中
        </label>
      </div>

      <label className="mb-2 block font-semibold">
        苦手なもの・アレルギー
      </label>

      <textarea
        rows={3}
        value={allergy}
        onChange={(e) => setAllergy(e.target.value)}
        placeholder="例：甲殻類アレルギー、パクチーNG"
        className="mb-4 w-full rounded-lg border px-4 py-2"
      />

      <label className="mb-2 block font-semibold">
        お祝いプレートの有無
      </label>

      <div className="mb-4 space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="plate"
            value="希望する"
            checked={plate === "希望する"}
            onChange={(e) => setPlate(e.target.value)}
          />
          希望する
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="plate"
            value="希望しない"
            checked={plate === "希望しない"}
            onChange={(e) => setPlate(e.target.value)}
          />
          希望しない
        </label>
      </div>

      {plate === "希望する" && (
        <>
          <label className="mb-2 block font-semibold">
            よく使うフレーズ
          </label>

          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setPlateMessage("Happy Birthday");
                setAnniversaryNumber("");
              }}
              className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
            >
              Happy Birthday
            </button>

            <button
              type="button"
              onClick={() => {
                setPlateMessage("Bon Mariage");
                setAnniversaryNumber("");
              }}
              className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
            >
              Bon Mariage
            </button>

            <button
              type="button"
              onClick={() => {
                setPlateMessage("Happy Wedding");
                setAnniversaryNumber("");
              }}
              className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
            >
              Happy Wedding
            </button>

            <button
              type="button"
              onClick={() => {
                setPlateMessage("Happy anniversary");
                setAnniversaryNumber("");
              }}
              className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
            >
              Anniversary
            </button>
          </div>

          {plateMessage.toLowerCase().includes("anniversary") && (
            <div className="mb-4">
              <label className="mb-2 block font-semibold">
                周年数
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={anniversaryNumber}
                  onChange={(e) =>
                    handleAnniversaryChange(e.target.value)
                  }
                  placeholder="例：10"
                  className="w-32 rounded-lg border px-4 py-2"
                />

                <span>周年</span>
              </div>
            </div>
          )}

          <label className="mb-2 block font-semibold">
            プレートメッセージ
          </label>

          <textarea
            rows={2}
            value={plateMessage}
            onChange={(e) => setPlateMessage(e.target.value)}
            placeholder="例：Happy Birthday ○○"
            className="mb-4 w-full rounded-lg border px-4 py-2"
          />
        </>
      )}

      <label className="mb-2 block font-semibold">
        電話番号
      </label>

      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="mb-4 w-full rounded-lg border px-4 py-2"
      />

      <label className="mb-2 block font-semibold">
        備考
      </label>

      <textarea
        rows={4}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="その他、お客様からのご要望など"
        className="mb-4 w-full rounded-lg border px-4 py-2"
      />

      <div className="mt-6 flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-gray-300 px-6 py-2 hover:bg-gray-400"
        >
          キャンセル
        </button>

        <button
          type="button"
          onClick={() =>
            onSave({
              name,
              people,
              time,
              course,
              allergy,
              plate,
              plateMessage,
              phone,
              note,
              receivedBy,
            })
          }

          disabled={!initialData && !receivedBy}

          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          保存
        </button>
      </div>
    </div>
  );
}