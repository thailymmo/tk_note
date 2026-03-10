"use client";

import { useEffect, useState } from "react";
import { BarChart3, Eye, Calendar } from "lucide-react";

interface DailyView {
  date: string;
  count: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    yesterday: 0,
    week: 0,
    month: 0,
    daily: [] as DailyView[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      });
  }, []);

  const maxCount = Math.max(...stats.daily.map((d) => d.count), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const cards = [
    { label: "Cho đến nay", value: stats.total },
    { label: "Hôm nay", value: stats.today },
    { label: "Hôm qua", value: stats.yesterday },
    { label: "Trong tuần", value: stats.week },
    { label: "Trong tháng", value: stats.month },
  ];

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h1 className="text-lg sm:text-2xl font-bold">Thống kê</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-bg-secondary border border-border rounded-xl p-3 sm:p-4 text-center"
          >
            <p className="text-2xl sm:text-3xl font-bold text-primary">
              {card.value}
            </p>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Lượt xem
            </p>
            <p className="text-xs text-text-secondary mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-bg-secondary border border-border rounded-xl p-4 sm:p-6 mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Biểu đồ lượt xem (30 ngày)
        </h2>
        {stats.daily.length === 0 ? (
          <p className="text-text-secondary text-center py-8">
            Chưa có dữ liệu
          </p>
        ) : (
          <div className="flex items-end gap-1 h-40 sm:h-52">
            {stats.daily.map((d) => (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-xs text-text-secondary hidden sm:block">
                  {d.count}
                </span>
                <div
                  className="w-full bg-primary rounded-t-sm min-h-[2px]"
                  style={{
                    height: `${(d.count / maxCount) * 100}%`,
                  }}
                />
                <span className="text-[10px] text-text-secondary -rotate-45 origin-top-left hidden lg:block">
                  {d.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily table */}
      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
        <h2 className="text-base sm:text-lg font-semibold p-4 border-b border-border flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Thống kê theo ngày
        </h2>
        {stats.daily.length === 0 ? (
          <p className="text-text-secondary text-center py-8">
            Chưa có dữ liệu
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-tertiary">
                <th className="text-left p-3 font-medium">Ngày</th>
                <th className="text-right p-3 font-medium">Lượt xem</th>
              </tr>
            </thead>
            <tbody>
              {[...stats.daily].reverse().map((d) => (
                <tr
                  key={d.date}
                  className="border-t border-border"
                >
                  <td className="p-3">{d.date}</td>
                  <td className="p-3 text-right font-medium">{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
