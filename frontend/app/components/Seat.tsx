type SeatProps = {
  number: number;
  occupied: boolean;
};

export default function Seat({ number, occupied }: SeatProps) {
  return (
    <div
      className={`flex h-24 w-24 items-center justify-center rounded-lg text-2xl font-bold text-white ${
        occupied ? "bg-red-500" : "bg-green-500"
      }`}
    >
      {number}
    </div>
  );
}