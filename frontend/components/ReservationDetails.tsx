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

type ReservationDetailsProps = {
  reservation: Reservation;
};

export default function ReservationDetails({
  reservation,
}: ReservationDetailsProps) {
  return (
    <div className="mb-6 rounded-lg border bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-bold">
        予約詳細
      </h2>

      <p>予約者名：{reservation.name}</p>
      <p>人数：{reservation.people}名</p>
      <p>来店時刻：{reservation.time}</p>
      <p>コース：{reservation.course || "未設定"}</p>
      <p>
        苦手なもの・アレルギー：
        {reservation.allergy || "なし"}
      </p>
      <p>お祝いプレート：{reservation.plate || "未設定"}</p>

      {reservation.plate === "希望する" && (
        <p>
          プレートメッセージ：
          {reservation.plate_message || "未設定"}
        </p>
      )}

      <p>電話番号：{reservation.phone || "未設定"}</p>
      <p>備考：{reservation.note || "なし"}</p>
    </div>
  );
}