const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeekDayPicker({
  weekStartYMD,
  setWeekStartYMD,
  dayIndex,
  setDayIndex,
}) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-sm text-white/70">Week start (Monday)</label>
          <input
            className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
            type="date"
            value={weekStartYMD}
            onChange={(e) => setWeekStartYMD(e.target.value)}
          />
          <div className="mt-1 text-xs text-white/50">
            Tip: pick any date — we auto snap it to Monday.
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm text-white/70">Day</label>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {DAY_LABELS.map((lbl, i) => (
            <button
              key={lbl}
              type="button"
              onClick={() => setDayIndex(i)}
              className={`rounded-xl border px-2 py-2 text-xs ${
                dayIndex === i
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/10 bg-black/20 text-white/70 hover:text-white"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
