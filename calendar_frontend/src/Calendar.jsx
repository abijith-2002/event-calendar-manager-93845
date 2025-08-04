import React, { useState } from "react";
import styles from "./Calendar.module.css";

/**
 * Gets the weeks grid for the month.
 * @param {number} year
 * @param {number} month - 0-based (0=Jan)
 * @returns {Array[]} - array of weeks, where each week is an array of 7 elements (dates or empty string)
 */
function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let daysMatrix = [];
  let week = [];
  // Leading empties
  for (let i = 0; i < startDay; i++) week.push("");
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      daysMatrix.push(week);
      week = [];
    }
  }
  // Trailing empties
  if (week.length > 0) {
    while (week.length < 7) week.push("");
    daysMatrix.push(week);
  }
  return daysMatrix;
}

/**
 * Calendar months, localized.
 */
const CALENDAR_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Weekday headers: 'SAN', 'MON', ... per design.
 */
const WEEKDAYS = ["SAN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// PUBLIC_INTERFACE
function Calendar() {
  /**
   * Renders an interactive calendar. Preserves the Figma design and shows "September 2021" by default,
   * with navigation for months. The 19th date in Sep 2021 is highlighted as the Figma sample shows.
   */
  const today = new Date();
  // Initial view: September 2021
  const [viewYear, setViewYear] = useState(2021);
  const [viewMonth, setViewMonth] = useState(8); // 0-based: 8 = September

  const weeks = getMonthDays(viewYear, viewMonth);

  // PUBLIC_INTERFACE
  const handlePrev = () => {
    let prevMonth = viewMonth - 1;
    let year = viewYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      year -= 1;
    }
    setViewMonth(prevMonth);
    setViewYear(year);
  };

  // PUBLIC_INTERFACE
  const handleNext = () => {
    let nextMonth = viewMonth + 1;
    let year = viewYear;
    if (nextMonth > 11) {
      nextMonth = 0;
      year += 1;
    }
    setViewMonth(nextMonth);
    setViewYear(year);
  };

  /**
   * Returns true if this day should be highlighted as "active" (Figma demo: 19th Sep 2021)
   */
  function isActive(day, month, year) {
    return year === 2021 && month === 8 && day === 19;
  }

  /**
   * Returns true if this day is today.
   */
  function isToday(day, month, year) {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  }

  return (
    <div className={styles.calendarWrapper}>
      <div className={styles.calendarHeader}>
        <button
          className={styles.calendarNavBtn}
          onClick={handlePrev}
          aria-label="Previous month"
        >
          {/* Left Arrow SVG */}
          <svg viewBox="0 0 16 16">
            <path d="M11.09 14.01a1 1 0 0 1-1.43 0l-5.09-5.09a1 1 0 0 1 0-1.43l5.09-5.09a1 1 0 0 1 1.43 1.43L7.42 8l3.67 3.67a1 1 0 0 1 0 1.43z"/>
          </svg>
        </button>
        <span className={styles.calendarTitle} data-testid="calendar-title">
          {CALENDAR_MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          className={styles.calendarNavBtn}
          onClick={handleNext}
          aria-label="Next month"
        >
          {/* Right Arrow SVG */}
          <svg viewBox="0 0 16 16">
            <path d="M4.91 1.99a1 1 0 0 1 1.43 0l5.09 5.09a1 1 0 0 1 0 1.43l-5.09 5.09a1 1 0 1 1-1.43-1.43L8.58 8 4.91 4.33A1 1 0 0 1 4.91 1.99z"/>
          </svg>
        </button>
      </div>
      <div className={styles.calendarWeekdays}>
        {WEEKDAYS.map(label => (
          <span className={styles.calendarWeekday} key={label}>
            {label}
          </span>
        ))}
      </div>
      <div className={styles.calendarDates} id="calendar-dates">
        {weeks.map((week, rowIdx) => (
          <div className={styles.calendarDatesRow} key={`week-${rowIdx}`}>
            {week.map((day, colIdx) => {
              let cellClass = styles.calendarDate;
              if (day === "") {
                cellClass += ` ${styles.inactive}`;
              } else {
                cellClass += ` ${styles.inactive}`; // All days "inactive" by default
                // Figma: 19 Sep 2021 = active
                if (isActive(day, viewMonth, viewYear)) {
                  cellClass = `${styles.calendarDate} ${styles.active}`;
                }
                if (isToday(day, viewMonth, viewYear)) {
                  cellClass += ` ${styles.today}`;
                }
              }
              return (
                <div
                  className={cellClass}
                  key={`date-${rowIdx}-${colIdx}`}
                  data-active={isActive(day, viewMonth, viewYear) ? "true" : undefined}
                  data-today={isToday(day, viewMonth, viewYear) ? "true" : undefined}
                >
                  {day}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;
