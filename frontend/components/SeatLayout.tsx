"use client";

type Reservation = {
  id: number;
  seat: number;
  seats?: number[];
  name: string;
  people: number;
  time: string;
  plate: string | null;
};

type SeatLayoutProps = {
  seats: number[];
  reservations: Reservation[];
  selectedSeat: number | null;
  selectedSeats: number[];
  onSelectSeat: (seat: number) => void;

  // 席交換モード用
  isSwapMode: boolean;
  swapSeatA: number | null;
  swapSeatB: number | null;

  // カウンター表示
  showCounter?: boolean;
};

export default function SeatLayout({
  seats,
  reservations,
  selectedSeat,
  selectedSeats,
  onSelectSeat,
  isSwapMode,
  swapSeatA,
  swapSeatB,
  showCounter = true,
}: SeatLayoutProps) {
  const counterSeats = [101, 102, 103];

  const isCombinedReservation = (
    reservation: Reservation
  ) => {
    return (
      reservation.seats &&
      reservation.seats.length >= 2
    );
  };

  const getCombinedSeatLabel = (
    reservation: Reservation
  ) => {
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

    const reservationSeats = [
      ...reservation.seats,
    ].sort((a, b) => a - b);

    const sortedTargetSeats = [
      ...targetSeats,
    ].sort((a, b) => a - b);

    return (
      reservationSeats.length ===
        sortedTargetSeats.length &&
      reservationSeats.every(
        (seat, index) =>
          seat === sortedTargetSeats[index]
      )
    );
  };

  const findReservationForSeat = (
    seat: number
  ) => {
    return reservations.find((reservation) => {
      if (
        reservation.seats &&
        reservation.seats.length > 0
      ) {
        return reservation.seats.includes(seat);
      }

      return reservation.seat === seat;
    });
  };

  const isSwapSelected = (seat: number) => {
    return (
      seat === swapSeatA ||
      seat === swapSeatB
    );
  };

  const renderSingleSeat = (seat: number) => {
    const reservation =
      findReservationForSeat(seat);

    const isPlateReservation =
      reservation?.plate === "希望する";

    const isSelected = isSwapMode
      ? isSwapSelected(seat)
      : selectedSeats.includes(seat);

    return (
      <div
        key={seat}
        onClick={() => onSelectSeat(seat)}
        className={`flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg text-white ${
          isSelected
            ? "bg-blue-500"
            : reservation
              ? "bg-orange-500"
              : "bg-green-500"
        } ${
          isPlateReservation
            ? "border-4 border-red-500"
            : ""
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
              {reservation.time}・
              {reservation.people}名
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
    const combinedSeats = (
      reservation.seats ?? []
    )
      .slice()
      .sort((a, b) => a - b);
      
    const isPlateReservation =
      reservation.plate === "希望する";
      
    // ==========================
    // 席交換モード
    // ==========================
    if (isSwapMode) {
      return (
        <div
          key={reservation.id}
          className={`flex h-24 ${widthClass} overflow-hidden rounded-lg`}
        >
          {combinedSeats.map(
            (seat, index) => {
              const selected =
                isSwapSelected(seat);

              return (
                <div
                  key={seat}
                  onClick={() =>
                    onSelectSeat(seat)
                  }
                  className={`flex flex-1 cursor-pointer flex-col items-center justify-center text-white ${
                    selected
                      ? "bg-blue-500"
                      : "bg-orange-500"
                  } ${
                    index !==
                    combinedSeats.length - 1
                      ? "border-r border-orange-300"
                      : ""
                  }`}
                >
                  <div className="text-lg font-bold">
                    {seat}
                  </div>

                  <div className="text-xs">
                    {reservation.name}
                  </div>
                </div>
              );
            }
          )}
        </div>
      );
    }

    // ==========================
    // 通常モード
    // ==========================

    const isSelected =
      selectedSeat !== null &&
      combinedSeats.includes(
        selectedSeat
      );

    return (
      <div
        key={reservation.id}
        onClick={() => {
          if (combinedSeats.length > 0) {
            onSelectSeat(
              combinedSeats[0]
            );
          }
        }}

        className={`flex h-24 ${widthClass} cursor-pointer flex-col items-center justify-center rounded-lg text-white ${
          isSelected
            ? "bg-blue-500"
            : "bg-orange-500"
        } ${
          isPlateReservation
            ? "border-4 border-red-500"
            : ""
        }`}
      >
        <div className="text-lg font-bold">
          {getCombinedSeatLabel(
            reservation
          )}
        </div>

        <div className="text-sm font-semibold">
          {reservation.name}
        </div>

        <div className="text-xs">
          {reservation.time}・
          {reservation.people}名
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
          const combined123 =
            reservations.find(
              (reservation) =>
                isCombinedReservation(
                  reservation
                ) &&
                hasSameSeats(
                  reservation,
                  [1, 2, 3]
                )
            );

          const combined12 =
            reservations.find(
              (reservation) =>
                isCombinedReservation(
                  reservation
                ) &&
                hasSameSeats(
                  reservation,
                  [1, 2]
                )
            );

          const combined23 =
            reservations.find(
              (reservation) =>
                isCombinedReservation(
                  reservation
                ) &&
                hasSameSeats(
                  reservation,
                  [2, 3]
                )
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
                {renderCombinedReservation(
                  combined12,
                  "w-52"
                )}

                {renderSingleSeat(3)}
              </>
            );
          }

          if (combined23) {
            return (
              <>
                {renderSingleSeat(1)}

                {renderCombinedReservation(
                  combined23,
                  "w-52"
                )}
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
          const combined56 =
            reservations.find(
              (reservation) =>
                isCombinedReservation(
                  reservation
                ) &&
                hasSameSeats(
                  reservation,
                  [5, 6]
                )
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

      {showCounter && (
        <>
          <h2 className="mt-10 mb-4 text-2xl font-semibold">
            カウンター
          </h2>

          <div className="mb-10 flex gap-4">
            {counterSeats.map(
              (seat, index) => {
                const reservation =
                  findReservationForSeat(
                    seat
                  );

                const selected =
                  isSwapMode
                    ? isSwapSelected(
                        seat
                      )
                    : selectedSeat ===
                      seat;

                return (
                  <div
                    key={seat}
                    onClick={() =>
                      onSelectSeat(seat)
                    }
                    className={`flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-full text-white ${
                      selected
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
                        {
                          reservation.name
                        }
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </>
      )}
    </>
  );
}