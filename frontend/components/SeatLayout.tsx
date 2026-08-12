"use client";

type Reservation = {
  id: number;
  seat: number;
  seats?: number[]
  name: string;
  people: number;
  time: string;
};

type SeatLayoutProps = {
  seats: number[];
  reservations: Reservation[];
  selectedSeat: number | null;
  selectedSeats: number[];
  onSelectSeat: (seat: number) => void;
};


export default function SeatLayout({
  seats,
  reservations,
  selectedSeat,
  selectedSeats,
  onSelectSeat,
}: SeatLayoutProps) {
  const counterSeats = [101, 102, 103];

  const isCombinedReservation = (reservation: Reservation) => {
    return reservation.seats && reservation.seats.length >= 2;
  };

  const getCombinedSeatLabel = (reservation: Reservation) => {
    if (!reservation.seats) return "";

    return reservation.seats
      .slice()
      .sort((a, b) => a - b)
      .join(" + ");
  };

  const hasSameSeats = (
    reservation: Reservation,
    targetSeats: number[]
    ) => {
    if (!reservation.seats) return false;

    const reservationSeats = [...reservation.seats].sort((a, b) => a - b);
    const sortedTargetSeats = [...targetSeats].sort((a, b) => a - b);

    return (
        reservationSeats.length === sortedTargetSeats.length &&
        reservationSeats.every(
        (seat, index) => seat === sortedTargetSeats[index]
        )
    );
    };

    const findReservationForSeat = (seat: number) => {
    return reservations.find(
        (reservation) =>
        reservation.seats?.includes(seat) ||
        reservation.seat === seat
    );
    };

    const renderSingleSeat = (seat: number) => {
    const reservation = findReservationForSeat(seat);

    return (
        <div
        key={seat}
        onClick={() => onSelectSeat(seat)}
        className={`flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg text-white ${
            selectedSeats.includes(seat)
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
    };

    const renderCombinedReservation = (
    reservation: Reservation,
    widthClass: string
    ) => {
    const combinedSeats = reservation.seats ?? [];

    const isSelected =
        selectedSeat !== null &&
        combinedSeats.includes(selectedSeat);

    return (
        <div
        key={reservation.id}
        onClick={() => {
            if (combinedSeats.length > 0) {
            onSelectSeat(combinedSeats[0]);
            }
        }}
        className={`flex h-24 ${widthClass} cursor-pointer flex-col items-center justify-center rounded-lg text-white ${
            isSelected ? "bg-blue-500" : "bg-orange-500"
        }`}
        >
        <div className="text-lg font-bold">
            {getCombinedSeatLabel(reservation)}
        </div>

        <div className="text-sm font-semibold">
            {reservation.name}
        </div>

        <div className="text-xs">
            {reservation.time}・{reservation.people}名
        </div>
        </div>
    );
    };

  return (
    <>
      <h2 className="mb-4 text-2xl font-semibold">
        テーブル席
      </h2>

      <div className="space-y-6"></div>

      <div className="flex gap-4">
        {(() => {
            const combined123 = reservations.find(
            (reservation) =>
                isCombinedReservation(reservation) &&
                hasSameSeats(reservation, [1, 2, 3])
            );

            const combined12 = reservations.find(
            (reservation) =>
                isCombinedReservation(reservation) &&
                hasSameSeats(reservation, [1, 2])
            );

            const combined23 = reservations.find(
            (reservation) =>
                isCombinedReservation(reservation) &&
                hasSameSeats(reservation, [2, 3])
            );

            if (combined123) {
            return renderCombinedReservation(
                combined123,
                "w-80"
            );
            }

            if (combined12) {
            return (
                <>
                {renderCombinedReservation(combined12, "w-52")}
                {renderSingleSeat(3)}
                </>
            );
            }

            if (combined23) {
            return (
                <>
                {renderSingleSeat(1)}
                {renderCombinedReservation(combined23, "w-52")}
                </>
            );
            }

            return (
            <>
                {renderSingleSeat(1)}
                {renderSingleSeat(2)}
                {renderSingleSeat(3)}
            </>
            );
        })()}
      </div>

      <div className="mt-6 flex gap-4">
        <div className="h-24 w-24"></div>

        {(() => {
            const combined56 = reservations.find(
            (reservation) =>
                isCombinedReservation(reservation) &&
                hasSameSeats(reservation, [5, 6])
            );

            if (combined56) {
            return renderCombinedReservation(
                combined56,
                "w-52"
            );
            }

            return (
            <>
                {renderSingleSeat(5)}
                {renderSingleSeat(6)}
            </>
            );
        })()}
        </div>

      <h2 className="mt-10 mb-4 text-2xl font-semibold">
        カウンター
      </h2>

      <div className="mb-10 flex gap-4">
        {counterSeats.map((seat, index) => {
            const reservation = reservations.find(
            (reservation) => reservation.seat === seat
            );

            return (
            <div
                key={seat}
                onClick={() => onSelectSeat(seat)}
                className={`flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-full text-white ${
                selectedSeat === seat
                    ? "bg-blue-500"
                    : reservation
                    ? "bg-orange-500"
                    : "bg-green-500"
                }`}
            >
                <div className="text-sm font-bold">
                C{index + 1}
                </div>

                {reservation && (
                <div className="text-xs">
                    {reservation.name}
                </div>
                )}
            </div>
            );
          })}
        </div>
    </>
  );
}