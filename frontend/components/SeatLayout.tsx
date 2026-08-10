"use client";

type Reservation = {
  id: number;
  seat: number;
  name: string;
  people: number;
  time: string;
};

type SeatLayoutProps = {
  seats: number[];
  reservations: Reservation[];
  selectedSeat: number | null;
  onSelectSeat: (seat: number) => void;
};

export default function SeatLayout({
  seats,
  reservations,
  selectedSeat,
  onSelectSeat,
}: SeatLayoutProps) {
  return (
    <>
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
              onClick={() => onSelectSeat(seat)}
              className={`flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg text-white ${
                selectedSeat === seat
                  ? "bg-blue-500"
                  : reservation
                    ? "bg-orange-500"
                    : "bg-green-500"
              }`}
            >
              <div className="text-lg font-bold">
                {seat}
              </div>

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

      <div className="mt-6 flex gap-4">
        <div className="h-24 w-24"></div>

        {seats.slice(3).map((seat) => {
          const reservation = reservations.find(
            (reservation) => reservation.seat === seat
          );

          return (
            <div
              key={seat}
              onClick={() => onSelectSeat(seat)}
              className={`flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg text-white ${
                selectedSeat === seat
                  ? "bg-blue-500"
                  : reservation
                    ? "bg-orange-500"
                    : "bg-green-500"
              }`}
            >
              <div className="text-lg font-bold">
                {seat}
              </div>

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
    </>
  );
}