import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Filter, LayoutGrid, List } from 'lucide-react';
import PostCard from './PostCard';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';

export default function CalendarView({ posts, onSelectPost, onCreateOnDate, filterPlatform, onDeletePost }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'list'

  const filteredPosts = posts.filter(p => {
    if (filterPlatform && filterPlatform !== 'all' && p.platform !== filterPlatform) return false;
    return true;
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());

  // Month Grid Calculation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, 'yyyy-MM-dd');
      const dayPosts = filteredPosts.filter(p => p.scheduledDate === formattedDate);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, new Date());
      const cloneDay = day;

      days.push(
        <div
          key={formattedDate}
          style={{
            minHeight: '130px',
            background: isCurrentMonth ? 'rgba(18, 24, 38, 0.5)' : 'rgba(8, 11, 17, 0.4)',
            border: isToday ? '1px solid var(--primary)' : '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            opacity: isCurrentMonth ? 1 : 0.4,
            transition: 'all 0.15s ease'
          }}
        >
          {/* Day Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: isToday ? '800' : '600',
              color: isToday ? 'var(--primary)' : 'var(--text-muted)',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: isToday ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {format(day, 'd')}
            </span>

            <button
              title="Schedule post on this date"
              onClick={() => onCreateOnDate(formattedDate)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                opacity: 0.6
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.6'}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Day Posts List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '140px' }}>
            {dayPosts.map(p => (
              <PostCard key={p.id} post={p} onEdit={onSelectPost} onDelete={onDeletePost} />
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day.toString()} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {days}
      </div>
    );
    days = [];
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Calendar Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '2px' }}>
            <button className="btn btn-secondary btn-sm" onClick={prevMonth} style={{ padding: '4px 8px' }}><ChevronLeft size={16} /></button>
            <button className="btn btn-secondary btn-sm" onClick={goToday} style={{ fontSize: '0.78rem', padding: '4px 10px' }}>Today</button>
            <button className="btn btn-secondary btn-sm" onClick={nextMonth} style={{ padding: '4px 8px' }}><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* View Switches */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 22, 35, 0.8)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setViewMode('month')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'month' ? 'var(--primary)' : 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LayoutGrid size={14} /> Month View
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <List size={14} /> List View
          </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div>
          {/* Weekday Labels Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px', textAlign: 'center' }}>
            {weekDays.map(d => (
              <div key={d} style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Month Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rows}
          </div>
        </div>
      ) : (
        /* List View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredPosts.map(p => (
            <PostCard key={p.id} post={p} onEdit={onSelectPost} onDelete={onDeletePost} />
          ))}
        </div>
      )}
    </div>
  );
}
