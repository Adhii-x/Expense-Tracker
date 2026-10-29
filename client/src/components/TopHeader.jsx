import React, { useState } from 'react';
import {
  Search,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bell,
  Plus,
  X,
  Command
} from 'lucide-react';
import { formatMonthYear } from '../utils';

export default function TopHeader({
  activeTab,
  selectedMonth,
  setSelectedMonth,
  availableMonths,
  searchTerm,
  setSearchTerm,
  onAddTransactionClick,
  onOpenCommandPalette
}) {
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentMonthIndex = availableMonths.indexOf(selectedMonth);

  const handlePrevMonth = () => {
    if (selectedMonth === 'All') {
      if (availableMonths.length > 0) setSelectedMonth(availableMonths[0]);
    } else if (currentMonthIndex < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[currentMonthIndex + 1]);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 'All') {
      if (availableMonths.length > 0) setSelectedMonth(availableMonths[0]);
    } else if (currentMonthIndex > 0) {
      setSelectedMonth(availableMonths[currentMonthIndex - 1]);
    }
  };

  const notifications = [
    { id: 1, title: 'AI spending insight', desc: 'Review your latest spending patterns.', time: '10m ago' },
    { id: 2, title: 'Budget check-in', desc: 'Your monthly budget is ready to review.', time: '2h ago' }
  ];

  return (
    <header className="app-header" data-active-tab={activeTab}>
      <div className="header-search">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search transactions"
          aria-label="Search transactions"
        />
        {searchTerm ? (
          <button type="button" className="search-clear" onClick={() => setSearchTerm('')} aria-label="Clear search">
            <X size={14} />
          </button>
        ) : (
          <button type="button" className="search-shortcut" onClick={onOpenCommandPalette} aria-label="Open command menu">
            <Command size={12} /><span>K</span>
          </button>
        )}
      </div>

      <div className="header-actions">
        <span className="header-language">EN <ChevronDown size={11} /></span>
        <div className="month-picker header-month-picker">
          <button type="button" className="month-arrow" onClick={handlePrevMonth} title="Previous month" aria-label="Previous month">
            <ChevronLeft size={15} />
          </button>
          <div className="month-dropdown-anchor">
            <button
              type="button"
              className="month-select"
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              aria-expanded={showMonthDropdown}
            >
              <CalendarIcon size={15} />
              <span>{selectedMonth === 'All' ? 'All months' : formatMonthYear(selectedMonth)}</span>
              <ChevronDown size={13} />
            </button>
            {showMonthDropdown && (
              <div className="header-popover month-popover">
                <button type="button" onClick={() => { setSelectedMonth('All'); setShowMonthDropdown(false); }}>
                  All months
                </button>
                {availableMonths.map((month) => (
                  <button
                    type="button"
                    key={month}
                    className={selectedMonth === month ? 'is-selected' : ''}
                    onClick={() => { setSelectedMonth(month); setShowMonthDropdown(false); }}
                  >
                    {formatMonthYear(month)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" className="month-arrow" onClick={handleNextMonth} title="Next month" aria-label="Next month">
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="notification-anchor">
          <button
            type="button"
            className="header-icon-button"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <Bell size={17} />
            <span className="notification-dot" />
          </button>
          {showNotifications && (
            <div className="header-popover notification-popover">
              <strong>Notifications</strong>
              {notifications.map((notification) => (
                <div className="notification-item" key={notification.id}>
                  <b>{notification.title}</b>
                  <span>{notification.desc}</span>
                  <small>{notification.time}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="header-add-button button-primary" onClick={onAddTransactionClick}>
          <Plus size={16} />
          <span>New</span>
        </button>
        <button type="button" className="header-avatar" title="Account profile" aria-label="Account profile">S</button>
      </div>
    </header>
  );
}
