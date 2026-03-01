"use client";

import { useEffect, useMemo, useState } from "react";
import schedule from "@/data/ramadan-lalmonirhat-2026.json";

type DaySchedule = (typeof schedule.days)[number];
type TimerState = {
  label: string;
  timeText: string;
  remainingText: string;
  roza?: number;
};

type Props = {
  compact?: boolean;
};

const DHAKA_TIMEZONE = "Asia/Dhaka";

function pad2(value: number) {
  return value.toString().padStart(2, "0");
}

function format12Hour(hhmm: string) {
  const [hourRaw, minuteRaw] = hhmm.split(":").map(Number);
  const period = hourRaw >= 12 ? "PM" : "AM";
  const hour12 = hourRaw % 12 === 0 ? 12 : hourRaw % 12;
  return `${hour12}:${pad2(minuteRaw)} ${period}`;
}

function getDhakaNowParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DHAKA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour");
  const minute = get("minute");
  const second = get("second");
  const dateKey = `${year}-${pad2(month)}-${pad2(day)}`;
  return { dateKey, secondsOfDay: hour * 3600 + minute * 60 + second };
}

function getTimeZoneOffsetMs(timeZone: string, at: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  const y = get("year");
  const m = get("month");
  const d = get("day");
  const h = get("hour");
  const min = get("minute");
  const sec = get("second");
  const asUtc = Date.UTC(y, m - 1, d, h, min, sec);
  return asUtc - at.getTime();
}

function zonedDateTimeToUtcMs(date: string, hhmm: string, timeZone: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);
  const utcGuess = Date.UTC(y, m - 1, d, hh, mm, 0);
  const offset = getTimeZoneOffsetMs(timeZone, new Date(utcGuess));
  return utcGuess - offset;
}

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

function findTodayAndNext(todayKey: string): { today?: DaySchedule; next?: DaySchedule } {
  const idx = schedule.days.findIndex((d) => d.date === todayKey);
  if (idx < 0) return {};
  return { today: schedule.days[idx], next: schedule.days[idx + 1] };
}

function getTimerState(now: Date): TimerState {
  const dhaka = getDhakaNowParts(now);
  const { today, next } = findTodayAndNext(dhaka.dateKey);

  if (!today) return { label: "Ramadan Timer", timeText: "--:--", remainingText: "00:00:00" };

  const [iftarHour, iftarMinute] = today.iftar.split(":").map(Number);
  const iftarSeconds = iftarHour * 3600 + iftarMinute * 60;
  const isBeforeIftar = dhaka.secondsOfDay < iftarSeconds;

  if (isBeforeIftar) {
    const targetMs = zonedDateTimeToUtcMs(today.date, today.iftar, DHAKA_TIMEZONE);
    return {
      label: "Ajker Iftar",
      timeText: format12Hour(today.iftar),
      remainingText: formatRemaining(targetMs - now.getTime()),
      roza: today.roza,
    };
  }

  if (next) {
    const targetMs = zonedDateTimeToUtcMs(next.date, next.sehri_end, DHAKA_TIMEZONE);
    return {
      label: "Sehri End Time",
      timeText: format12Hour(next.sehri_end),
      remainingText: formatRemaining(targetMs - now.getTime()),
      roza: next.roza,
    };
  }

  return {
    label: "Ramadan Time Ended",
    timeText: format12Hour(today.iftar),
    remainingText: "00:00:00",
    roza: today.roza,
  };
}

export function HeaderPrayerTimer({ compact = false }: Props) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timerState = useMemo(() => getTimerState(now), [now]);

  return (
    <div
      className={`w-full rounded-xl border border-orange-200 bg-orange-50 text-center shadow-sm transition-all duration-200 ${
        compact ? "px-2 py-1.5 md:px-2.5 md:py-2" : "px-2.5 py-2 md:px-3 md:py-2.5"
      }`}
    >
      <p className={`line-clamp-1 font-semibold text-orange-700 transition-all duration-200 ${compact ? "text-[10px] md:text-[11px]" : "text-[11px] md:text-xs"}`}>
        {timerState.label}
        {timerState.roza ? ` - Roza ${timerState.roza}` : ""}
      </p>
      <div className="mt-0.5 flex items-center justify-center gap-1.5 md:gap-2">
        <span className={`font-bold text-zinc-900 transition-all duration-200 ${compact ? "text-xs md:text-sm" : "text-sm md:text-base"}`}>{timerState.timeText}</span>
        <span className={`font-mono font-semibold text-zinc-700 transition-all duration-200 ${compact ? "text-[11px] md:text-xs" : "text-xs md:text-sm"}`}>{timerState.remainingText}</span>
      </div>
    </div>
  );
}
