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

/**
 * A dialog/modal for adding events
 * @param {boolean} open
 * @param {function} onClose
 * @param {function} onSave
 * @param {object} dateObj - { year, month, day }
 */
function AddEventDialog({ open, onClose, onSave, dateObj }) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  // Reset when opened
  React.useEffect(() => {
    if (open) {
      setTitle("");
      setDetails("");
    }
  }, [open, dateObj]);

  if (!open) return null;
  const fullDate =
    dateObj && dateObj.day
      ? `${CALENDAR_MONTHS[dateObj.month]} ${dateObj.day}, ${dateObj.year}`
      : "";

  return (
    <div className={styles.modalOverlay} tabIndex={-1} aria-modal="true" role="dialog">
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Add Event</span>
          <button className={styles.modalCloseBtn} onClick={onClose} title="Close" aria-label="Close">
            ×
          </button>
        </div>
        <form
          className={styles.modalForm}
          onSubmit={e => {
            e.preventDefault();
            if (title.trim()) {
              onSave({ title: title.trim(), details: details.trim(), date: dateObj });
            }
          }}
        >
          <div className={styles.modalField}>
            <label htmlFor="event-title" className={styles.modalLabel}>Title<span style={{ color: "#f04d23" }}>*</span></label>
            <input
              id="event-title"
              className={styles.modalInput}
              type="text"
              maxLength={64}
              autoFocus
              autoComplete="off"
              value={title}
              required
              onChange={e => setTitle(e.target.value)}
              placeholder="Event title"
            />
          </div>
          <div className={styles.modalField}>
            <label htmlFor="event-details" className={styles.modalLabel}>Details</label>
            <textarea
              id="event-details"
              className={styles.modalTextarea}
              rows={3}
              maxLength={256}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Details (optional)"
              style={{ resize: "vertical" }}
            />
          </div>
          <div className={styles.modalControls}>
            <button type="button" className={styles.modalBtnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.modalBtnPrimary} disabled={!title.trim()}>
              Add Event
            </button>
          </div>
          {fullDate && (
            <div className={styles.modalDateInfo}>{fullDate}</div>
          )}
        </form>
      </div>
    </div>
  );
}

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

  // Modal state for event dialog
  const [modalOpen, setModalOpen] = useState(false);
  const [eventDate, setEventDate] = useState(null); // {year, month, day}

  // Placeholder: list of events (not displayed yet)
  const [events, setEvents] = useState([]);

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

  // Open dialog for the given date
  const handleDateClick = (day) => {
    if (!day) return;
    setEventDate({ year: viewYear, month: viewMonth, day });
    setModalOpen(true);
  };

  // Add event handler
  const handleAddEvent = (eventData) => {
    setEvents(prev => [...prev, eventData]);
    setModalOpen(false);
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
              // Add date-click handler if day is valid
              return (
                <div
                  className={cellClass}
                  key={`date-${rowIdx}-${colIdx}`}
                  data-active={isActive(day, viewMonth, viewYear) ? "true" : undefined}
                  data-today={isToday(day, viewMonth, viewYear) ? "true" : undefined}
                  tabIndex={day ? 0 : -1}
                  style={day ? { cursor: "pointer" } : {}}
                  onClick={day ? () => handleDateClick(day) : undefined}
                  onKeyDown={
                    day
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleDateClick(day);
                          }
                        }
                      : undefined
                  }
                  aria-label={day ? `Add event for ${CALENDAR_MONTHS[viewMonth]} ${day}, ${viewYear}` : undefined}
                  role={day ? "button" : undefined}
                >
                  {day}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <AddEventDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddEvent}
        dateObj={eventDate}
      />
    </div>
  );
}

export default Calendar;
