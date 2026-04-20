'use client'
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type DTRRecord = {
  date: string;
  status: 'present' | 'absent' | 'late' | 'holiday';
  timeIn?: string;
  timeOut?: string;
  hours?: number;
}

type Props = {
  dtrData: DTRRecord[];
  onDateClick?: (date: Date) => void;
}

export default function DTRCalendar({ dtrData, onDateClick }: Props) {
  const [date, setDate] = useState(new Date());

  // Helper para sa local date YYYY-MM-DD - walang timezone bug
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const dtrMap = dtrData.reduce((acc, record) => {
    acc[record.date] = record;
    return acc;
  }, {} as Record<string, DTRRecord>);

  const tileClassName = ({ date, view }: { date: Date, view: string }) => {
    if (view!== 'month') return '';

    // FIXED: hindi na toISOString()
    const dateStr = formatLocalDate(date);
    const record = dtrMap[dateStr];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    if (isWeekend &&!record) return 'bg-gray-50 text-gray-400';
    if (!record) return 'hover:bg-blue-50 transition-colors';

    switch (record.status) {
      case 'present': return 'bg-gradient-to-br from-green-400 to-green-500 text-white font-bold hover:from-green-500 hover:to-green-600 shadow-sm hover:shadow-md transition-all';
      case 'late': return 'bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold hover:from-amber-500 hover:to-orange-600 shadow-sm hover:shadow-md transition-all';
      case 'absent': return 'bg-gradient-to-br from-red-400 to-red-500 text-white font-bold hover:from-red-500 hover:to-red-600 shadow-sm hover:shadow-md transition-all';
      case 'holiday': return 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-bold hover:from-blue-500 hover:to-indigo-600 shadow-sm hover:shadow-md transition-all';
      default: return '';
    }
  };

  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view!== 'month') return null;

    // FIXED: hindi na toISOString()
    const dateStr = formatLocalDate(date);
    const record = dtrMap[dateStr];

    if (!record) return null;

    if (record.status === 'present') return <div className="text-[8px] mt-0.5">✓</div>;
    if (record.status === 'late') return <div className="text-[8px] mt-0.5">⚠</div>;
    if (record.status === 'absent') return <div className="text-[8px] mt-0.5">✗</div>;
    if (record.status === 'holiday') return <div className="text-[8px] mt-0.5">🎉</div>;
    return null;
  };

  const handleClick = (value: Date) => {
    setDate(value);
    onDateClick?.(value);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Attendance Calendar</h2>
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded shadow-sm"></div>
            <span className="text-gray-600">Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded shadow-sm"></div>
            <span className="text-gray-600">Late</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-500 rounded shadow-sm"></div>
            <span className="text-gray-600">Absent</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
      .react-calendar {
         width: 100%;
         border: none;
         font-family: inherit;
       }
      .react-calendar__navigation {
         margin-bottom: 1rem;
       }
      .react-calendar__navigation button {
         min-width: 44px;
         background: none;
         font-size: 1rem;
         font-weight: 600;
         color: #111827;
         border-radius: 0.5rem;
         transition: all 0.2s;
       }
      .react-calendar__navigation button:hover {
         background-color: #f3f4f6;
       }
      .react-calendar__navigation button:disabled {
         background-color: transparent;
         color: #d1d5db;
       }
      .react-calendar__month-view__weekdays {
         text-transform: uppercase;
         font-weight: 700;
         font-size: 0.75rem;
         color: #6b7280;
       }
      .react-calendar__month-view__weekdays__weekday {
         padding: 0.75rem 0;
       }
      .react-calendar__month-view__weekdays__weekday abbr {
         text-decoration: none;
       }
      .react-calendar__tile {
         padding: 0.75rem 0.25rem;
         background: none;
         border-radius: 0.5rem;
         font-size: 0.875rem;
         font-weight: 500;
         transition: all 0.2s;
         position: relative;
       }
      .react-calendar__tile:enabled:hover {
         background-color: #eff6ff;
       }
      .react-calendar__tile--now {
         background: #dbeafe!important;
         font-weight: 700;
         color: #1e40af;
       }
      .react-calendar__tile--active {
         background: #3b82f6!important;
         color: white!important;
       }
      .react-calendar__month-view__days__day--neighboringMonth {
         color: #d1d5db;
       }
      `}</style>

      <Calendar
        onChange={handleClick as any}
        value={date}
        tileClassName={tileClassName}
        tileContent={tileContent}
        prev2Label={null}
        next2Label={null}
      />
    </div>
  );
}