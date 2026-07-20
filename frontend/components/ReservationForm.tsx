"use client";

import { useState } from "react";

type ReservationFormProps = {
  onCancel: () => void;
};

export default function ReservationForm({
  onCancel,
}: ReservationFormProps) {
  
    const [plate, setPlate] = useState("");

    return (
    <div className="mt-8 rounded-lg border bg-white p-6 shadow">
      <h2 className="mb-6 text-2xl font-bold">
        予約入力
      </h2>

      <label className="mb-2 block font-semibold">
        予約者名
      </label>

      <input
        type="text"
        className="mb-4 w-full rounded-lg border px-4 py-2"
      />


      <label className="mb-2 block font-semibold">
        人数
      </label>

      <select
        className="mb-4 w-full rounded-lg border px-4 py-2"
      >
        <option>1人</option>
        <option>2人</option>
        <option>3人</option>
        <option>4人</option>
        <option>5人</option>
        <option>6人</option>
        <option>7人</option>
        <option>8人</option>
        <option>9人</option>
        <option>10人</option>

      </select>

      <label className="mb-2 block font-semibold">
        来店時刻
      </label>

      <input
        type="time"
        className="mb-4 w-full rounded-lg border px-4 py-2"
      />

        <label className="mb-2 block font-semibold">
          コース
        </label>

        <div className="mb-4 space-y-2">
          <label className="flex items-center gap-2">
          <input type="radio" name="course" value="5000円コース" />
          5,000円コース
          </label>

          <label className="flex items-center gap-2">
          <input type="radio" name="course" value="6000円コース" />
          6,000円コース
          </label>

          <label className="flex items-center gap-2">
          <input type="radio" name="course" value="アラカルト" />
          アラカルト
          </label>

          <label className="flex items-center gap-2">
          <input type="radio" name="course" value="アラカルト" />
          検討中
          </label>
        </div>

        <label className="mb-2 block font-semibold">
          苦手なもの・アレルギー
        </label>

        <textarea
          rows={3}
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
            onChange={(e) => setPlate(e.target.value)}
          />
          希望する
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="plate"
            value="希望しない"
            onChange={(e) => setPlate(e.target.value)}          
          />
          希望しない
          </label>
        </div>

        {plate === "希望する" && (
          <>
            <label className="mb-2 block font-semibold">
              プレートメッセージ
            </label>

            <textarea
              rows={2}
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
        className="mb-4 w-full rounded-lg border px-4 py-2"
      />

        <label className="mb-2 block font-semibold">
         備考
        </label>

        <textarea
          rows={4}
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
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            保存
          </button>
        </div>

    </div>

  );
}