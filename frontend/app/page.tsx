import DateNavigator from "@/components/DateNavigator";

export default function Home() {
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
          <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-green-500 text-2xl font-bold text-white">
            1
          </div>

          <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-red-500 text-2xl font-bold text-white">
            2
          </div>

          <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-green-500 text-2xl font-bold text-white">
            3
          </div>
        </div>

        <div className="flex gap-4">
          <div className="h-24 w-24"></div>

          <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-red-500 text-2xl font-bold text-white">
            5
          </div>

          <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-red-500 text-2xl font-bold text-white">
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

      <button className="rounded-lg bg-blue-600 px-6 py-3 text-lg text-white hover:bg-blue-700">
        ＋予約を追加
      </button>
    </main>
  );
}