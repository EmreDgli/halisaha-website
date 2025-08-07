import { useEffect, useState } from "react";
import { getFieldReservations } from "@/lib/api/fields";

interface FieldAvailabilityProps {
  fieldId: string;
  date: string; // YYYY-MM-DD
  selectedTime: string;
  selectedDuration: number; // 1 veya 2
  onSelect: (time: string, duration: number) => void;
}

// Saat aralığı: 17:00 - 02:00 arası, her saat başı
const HOURS = [
  "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
  "00:00", "01:00", "02:00"
];

export default function FieldAvailability({ fieldId, date, selectedTime, selectedDuration, onSelect }: FieldAvailabilityProps) {
  const [reservedHours, setReservedHours] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fieldId || !date) {
      setReservedHours([]);
      setLoading(false);
      return;
    }
    setReservedHours([]);
    setLoading(true);
    getFieldReservations(fieldId)
      .then((reservations: any[]) => {
        const dayReservations = Array.isArray(reservations)
          ? reservations.filter((r: any) => r.start_time && r.start_time.startsWith(date))
          : [];
        const hours = dayReservations.map((r: any) => {
          const start = new Date(r.start_time);
          return start.toTimeString().slice(0, 5); // "HH:MM"
        });
        setReservedHours(hours);
      })
      .catch((err) => {
        console.error("getFieldReservations error", err);
        setReservedHours([]);
      })
      .finally(() => setLoading(false));
  }, [fieldId, date]);

  // Yardımcı: Bir saat aralığı rezerve mi?
  function isRangeReserved(startIdx: number, duration: number) {
    for (let i = 0; i < duration; i++) {
      const hour = HOURS[startIdx + i];
      if (!hour || reservedHours.includes(hour)) return true;
    }
    return false;
  }

  // Oluşturulacak aralıklar: sadece 1 saatlik (ardışık)
  const intervals: { label: string; start: string; duration: number; disabled: boolean }[] = [];
  for (let i = 0; i < HOURS.length - 1; i++) {
    if (!isRangeReserved(i, 1)) {
      intervals.push({
        label: `${HOURS[i]} - ${HOURS[i + 1]}`,
        start: HOURS[i],
        duration: 1,
        disabled: false,
      });
    }
  }

  return (
    <div className="my-4">
      <div className="font-medium text-green-800 mb-2">Saha Saat Durumu</div>
      {loading ? (
        <div className="text-green-600">Saatler yükleniyor...</div>
      ) : (
        <div className="flex flex-wrap gap-2 mb-2">
          {intervals.map((interval) => {
            const isSelected = selectedTime === interval.start && selectedDuration === interval.duration;
            return (
              <button
                key={interval.label}
                type="button"
                onClick={() => onSelect(interval.start, interval.duration)}
                className={`px-3 py-1 rounded border text-sm font-semibold
                  ${isSelected ? "bg-green-600 text-white border-green-700" :
                    interval.disabled ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed" :
                      "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"}
                `}
                disabled={interval.disabled}
              >
                {interval.label}
              </button>
            );
          })}
        </div>
      )}
      {selectedTime && (
        <div className="text-green-700 text-sm">
          Seçili aralık: {selectedTime} - {(() => {
            const idx = HOURS.indexOf(selectedTime);
            if (idx === -1) return "?";
            const endIdx = idx + selectedDuration;
            return HOURS[endIdx] || "?";
          })()} ({selectedDuration} saat)
        </div>
      )}
      <div className="text-xs text-gray-500 mt-2">Sadece tamamen boş aralıklar seçilebilir. Süre: 1 veya 2 saat.</div>
    </div>
  );
} 