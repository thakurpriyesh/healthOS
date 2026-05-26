import { useState, useEffect, useMemo, useRef } from "react";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* Override local environment defaults (like Vite) that cause unwanted centering */
  html, body {
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
    overflow-x: hidden !important;
  }

  #root {
    width: 100% !important;
    min-height: 100vh !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
    text-align: left !important;
  }

  :root {
    --bg: #F8F9FA;
    --surface: #FFFFFF;
    --surface2: #F1F3F5;
    --border: rgba(0,0,0,0.08);
    --border2: rgba(0,0,0,0.15);
    --text: #212529;
    --text2: #495057;
    --text3: #868E96;
    --accent: #0CA678;
    --accent2: #087F5B;
    --accent-bg: #E6FCF5;
    --danger: #E03131;
    --danger-bg: #FFF5F5;
    --warn: #F08C00;
    --warn-bg: #FFF9DB;
    --info: #1C7ED6;
    --info-bg: #E7F5FF;
    --purple: #7048E8;
    --purple-bg: #F3F0FF;
    --r: 16px;
    --r-sm: 8px;
    --sh: 0 4px 20px rgba(0,0,0,0.05);
    --sh-hover: 0 8px 30px rgba(0,0,0,0.08);
    --font: 'DM Sans', system-ui, sans-serif;
    --font-serif: 'DM Serif Display', serif;
  }

  body { background: var(--bg); font-family: var(--font); color: var(--text); text-align: left; }

  .app {
    display: flex; min-height: 100vh;
    background: var(--bg);
    font-family: var(--font);
    text-align: left;
    width: 100%; /* Ensure app takes full width */
  }

  /* Protect buttons and inputs from local CSS theme overrides */
  button, input, textarea, select { font-family: inherit; }

  /* Sidebar */
  .sidebar {
    width: 240px; flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    padding: 24px 0;
    position: sticky; top: 0; height: 100vh;
    overflow-y: auto;
  }

  .sidebar-logo {
    padding: 0 20px 24px;
    border-bottom: 1px solid var(--border);
  }
  .sidebar-logo h1 {
    font-family: var(--font-serif);
    font-size: 22px; font-weight: 400;
    color: var(--accent);
    letter-spacing: -0.5px;
  }
  .sidebar-logo span { font-size: 11px; color: var(--text3); letter-spacing: 1px; text-transform: uppercase; }

  .sidebar-nav { padding: 16px 12px; flex: 1; }
  .sidebar-section-label {
    font-size: 10px; font-weight: 600; color: var(--text3);
    letter-spacing: 1.2px; text-transform: uppercase;
    padding: 0 8px; margin: 16px 0 6px;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: var(--r-sm);
    cursor: pointer; font-size: 14px; font-weight: 500; color: var(--text2);
    border: none; background: none; width: 100%; text-align: left;
    transition: var(--transition);
    margin-bottom: 4px;
  }
  .nav-item:hover { background: var(--surface2); color: var(--text); transform: translateX(4px); }
  .nav-item.active { background: var(--accent-bg); color: var(--accent); font-weight: 600; }
  .nav-item .icon { font-size: 16px; width: 20px; text-align: center; }

  .sidebar-footer { padding: 16px 20px; border-top: 1px solid var(--border); }
  .user-pill {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: var(--r-sm);
    background: var(--surface2); cursor: pointer;
  }
  .avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--accent); color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600; flex-shrink: 0;
  }
  .user-info { flex: 1; min-width: 0; overflow: hidden; }
  .user-name,
  .user-meta {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .user-name { font-size: 13px; font-weight: 500; color: var(--text); }
  .user-meta { font-size: 11px; color: var(--text3); max-width: 100%; display: block; }

  /* Main content */
  .main { flex: 1; min-width: 0; overflow-x: hidden; display: flex; flex-direction: column; }

  .page-header {
    padding: 28px 36px 20px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px;
    position: sticky; top: 0; z-index: 20;
  }
  .page-title { font-size: 20px; font-weight: 500; color: var(--text); }
  .page-subtitle { font-size: 13px; color: var(--text3); margin-top: 2px; }

  .page-body { padding: 28px 36px; flex: 1; }

  /* Cards */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 24px;
    box-shadow: var(--sh);
    transition: var(--transition);
  }
  .card:hover { box-shadow: var(--sh-hover); }
  .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .card-title { font-size: 15px; font-weight: 500; }
  .card-subtitle { font-size: 12px; color: var(--text3); margin-top: 2px; }

  /* Grid layouts */
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .grid-main { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }

  /* Metric card */
  .metric {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 20px 24px;
    box-shadow: var(--sh);
    transition: var(--transition);
    height: 100%;
  }
  .metric:hover { transform: translateY(-4px); box-shadow: var(--sh-hover); }
  .metric-label { font-size: 11px; font-weight: 600; color: var(--text3); letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 8px; }
  .metric-value { font-size: 28px; font-weight: 300; color: var(--text); line-height: 1; }
  .metric-unit { font-size: 13px; color: var(--text3); margin-left: 3px; }
  .metric-change { font-size: 12px; margin-top: 6px; }
  .metric-change.up { color: var(--accent2); }
  .metric-change.down { color: var(--danger); }
  .metric-change.neutral { color: var(--text3); }
  .metric-icon { font-size: 24px; margin-bottom: 8px; }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--r-sm);
    font-size: 13px; font-weight: 500; cursor: pointer;
    border: 1px solid transparent; transition: all 0.15s;
    white-space: nowrap;
  }
  .btn-primary {
    background: var(--accent); color: white; border-color: var(--accent);
  }
  .btn-primary:hover { background: var(--accent2); border-color: var(--accent2); }

  .btn-ghost {
    background: transparent; color: var(--text2); border-color: var(--border2);
  }
  .btn-ghost:hover { background: var(--surface2); color: var(--text); }

  .btn-danger {
    background: var(--danger-bg); color: var(--danger); border-color: transparent;
  }
  .btn-danger:hover { background: #fad7d4; }

  .btn-sm { padding: 5px 10px; font-size: 12px; }

  /* Inputs */
  .input-group { margin-bottom: 16px; }
  .input-label { font-size: 12px; font-weight: 500; color: var(--text2); margin-bottom: 5px; display: block; }
  .input {
    width: 100%; padding: 9px 12px; font-size: 14px;
    border: 1px solid var(--border2); border-radius: var(--r-sm);
    background: var(--surface); color: var(--text);
    outline: none; transition: border-color 0.15s;
    font-family: var(--font);
  }
  .input:focus { border-color: var(--accent); }
  .input-row { display: grid; gap: 12px; }
  .input-row-2 { grid-template-columns: 1fr 1fr; }
  .input-row-3 { grid-template-columns: 1fr 1fr 1fr; }
  .input-error { font-size: 12px; color: var(--danger); margin-top: 6px; }

  .auth-shell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(340px, 440px);
    background: var(--surface);
  }
  .auth-panel {
    padding: 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: var(--bg);
    border-right: 1px solid var(--border);
  }
  .auth-brand {
    font-family: var(--font-serif);
    font-size: 48px;
    line-height: 1;
    color: var(--accent);
    margin-bottom: 18px;
  }
  .auth-copy {
    max-width: 560px;
    color: var(--text2);
    font-size: 18px;
    line-height: 1.6;
  }
  .auth-points {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 34px;
    max-width: 760px;
  }
  .auth-point {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
    padding: 16px;
    min-height: 118px;
  }
  .auth-point strong { display: block; color: var(--text); font-size: 14px; margin: 10px 0 4px; }
  .auth-point span { color: var(--text3); font-size: 12px; line-height: 1.45; display: block; }
  .auth-card-wrap { padding: 32px; display: flex; align-items: center; justify-content: center; }
  .auth-card { width: 100%; max-width: 380px; }
  .auth-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    padding: 4px;
    background: var(--surface2);
    border-radius: var(--r-sm);
    margin-bottom: 20px;
  }
  .auth-tab {
    border: 0;
    border-radius: 6px;
    padding: 9px 12px;
    cursor: pointer;
    background: transparent;
    color: var(--text2);
    font-weight: 600;
  }
  .auth-tab.active { background: var(--surface); color: var(--accent); box-shadow: var(--sh); }
  .sync-status { font-size: 12px; color: var(--text3); }

  select.input { cursor: pointer; }

  /* Tags / badges */
  .badge {
    display: inline-flex; align-items: center;
    padding: 2px 8px; border-radius: 100px;
    font-size: 11px; font-weight: 500;
  }
  .badge-green { background: var(--accent-bg); color: var(--accent); }
  .badge-red { background: var(--danger-bg); color: var(--danger); }
  .badge-yellow { background: var(--warn-bg); color: var(--warn); }
  .badge-blue { background: var(--info-bg); color: var(--info); }
  .badge-purple { background: var(--purple-bg); color: var(--purple); }
  .badge-gray { background: var(--surface2); color: var(--text2); }

  /* Table */
  .table-wrap { overflow-x: auto; width: 100%; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead th {
    text-align: left; padding: 8px 12px;
    font-size: 11px; font-weight: 600; color: var(--text3);
    letter-spacing: 0.6px; text-transform: uppercase;
    border-bottom: 1px solid var(--border);
  }
  tbody tr { border-bottom: 1px solid var(--border); }
  tbody tr:last-child { border-bottom: none; }
  tbody td { padding: 11px 12px; color: var(--text2); }
  tbody tr:hover td { background: var(--surface2); }

  /* Log list */
  .log-item {
    display: flex; gap: 14px; align-items: flex-start;
    padding: 12px 0; border-bottom: 1px solid var(--border);
  }
  .log-item:last-child { border-bottom: none; }
  .log-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }

  /* Progress bar */
  .progress-bar { height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden; width: 100%; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }

  /* Tabs */
  .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border); margin-bottom: 20px; }
  .tab {
    padding: 10px 16px; font-size: 13px; font-weight: 500; color: var(--text3);
    border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent;
    margin-bottom: -1px; transition: all 0.15s;
  }
  .tab:hover { color: var(--text); }
  .tab.active { color: var(--accent); border-bottom-color: var(--accent); }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; padding: 20px;
  }
  .modal {
    background: var(--surface); border-radius: var(--r);
    width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }
  .modal-header {
    padding: 20px 24px 0;
    display: flex; align-items: center; justify-content: space-between;
  }
  .modal-body { padding: 20px 24px; }
  .modal-footer { padding: 0 24px 20px; display: flex; gap: 10px; justify-content: flex-end; }
  .modal-title { font-size: 17px; font-weight: 500; }
  .modal-close {
    width: 28px; height: 28px; border-radius: 50%; border: none;
    background: var(--surface2); cursor: pointer; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    color: var(--text2);
  }
  .modal-close:hover { background: var(--border2); }

  /* AI Chat */
  .chat-container { display: flex; flex-direction: column; height: calc(100vh - 200px); }
  .chat-messages { flex: 1; overflow-y: auto; padding: 20px 0; display: flex; flex-direction: column; gap: 16px; }
  .chat-bubble { max-width: 80%; }
  .chat-bubble.user { align-self: flex-end; }
  .chat-bubble.ai { align-self: flex-start; }
  .chat-bubble-inner {
    padding: 12px 16px; border-radius: var(--r);
    font-size: 14px; line-height: 1.6;
    text-align: left;
  }
  .chat-bubble.user .chat-bubble-inner { background: var(--accent); color: white; border-radius: var(--r) var(--r) 2px var(--r); }
  .chat-bubble.ai .chat-bubble-inner { background: var(--surface2); color: var(--text); border-radius: var(--r) var(--r) var(--r) 2px; border: 1px solid var(--border); }
  .chat-meta { font-size: 11px; color: var(--text3); margin-top: 4px; }
  .chat-bubble.user .chat-meta { text-align: right; }
  .chat-input-row { display: flex; gap: 10px; padding-top: 16px; border-top: 1px solid var(--border); }
  .chat-input { flex: 1; }
  .typing-indicator { display: flex; gap: 4px; padding: 8px; }
  .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text3); animation: bounce 1.2s infinite; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%,80%,100% { transform: scale(0.8); opacity: 0.5; } 40% { transform: scale(1.2); opacity: 1; } }

  /* Mini chart (SVG-based bar chart) */
  .mini-chart { width: 100%; }

  /* Section divider */
  .section-gap { height: 20px; }

  /* Ring chart */
  .ring-wrap { display: flex; align-items: center; gap: 20px; }
  .ring-legend { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .ring-legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
  .ring-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

  /* Symptom tracker */
  .sym-grid { display: flex; flex-wrap: wrap; gap: 10px; }
  .sym-chip {
    padding: 8px 14px; border-radius: var(--r-sm); border: 1.5px solid var(--border2);
    background: var(--surface); color: var(--text2); font-size: 13px; font-weight: 500;
    cursor: pointer; text-align: center; transition: all 0.15s;
  }
  .sym-chip.selected { border-color: var(--accent); background: var(--accent-bg); color: var(--accent); }

  /* Vitals gauge strip */
  .vital-strip {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; background: var(--surface2);
    border-radius: var(--r-sm); margin-bottom: 10px;
  }
  .vital-icon { font-size: 20px; width: 28px; text-align: center; }
  .vital-name { font-size: 12px; color: var(--text3); }
  .vital-val { font-size: 18px; font-weight: 500; flex: 1; }
  .vital-val small { font-size: 12px; font-weight: 400; color: var(--text3); }

  /* Meal entry */
  .meal-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .meal-row:last-child { border-bottom: none; }
  .meal-kcal { font-size: 13px; font-weight: 600; color: var(--accent); min-width: 60px; text-align: right; }

  /* Sleep bar */
  .sleep-bar { display: flex; height: 32px; border-radius: var(--r-sm); overflow: hidden; margin-bottom: 8px; }
  .sleep-seg { display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 500; color: white; }

  /* Notification dot */
  .notif-dot {
    width: 7px; height: 7px; border-radius: 50%; background: var(--danger);
    position: absolute; top: 0; right: 0;
  }

  /* Separator */
  .sep { border: none; border-top: 1px solid var(--border); margin: 20px 0; }

  /* Empty state */
  .empty { text-align: center; padding: 40px 20px; color: var(--text3); }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .empty h3 { font-size: 15px; font-weight: 500; color: var(--text2); margin-bottom: 6px; }
  .empty p { font-size: 13px; }

  /* Animation */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.25s ease-out; width: 100%; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }

  /* Health score ring */
  .score-circle { position: relative; display: inline-flex; align-items: center; justify-content: center; }
  .score-label { position: absolute; text-align: center; }
  .score-num { font-size: 32px; font-weight: 300; color: var(--text); line-height: 1; }
  .score-sub { font-size: 11px; color: var(--text3); }

  /* Responsive tweaks for narrow embed */
  .menu-btn { display: none; background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text); }
  .mobile-overlay { display: none; }

  @media (max-width: 1024px) {
    .grid-main { grid-template-columns: 1fr; } /* Stack columns earlier for better use of space */
  }

  @media (max-width: 860px) {
    .auth-shell { grid-template-columns: 1fr; }
    .auth-panel { padding: 32px 22px; border-right: 0; border-bottom: 1px solid var(--border); }
    .auth-brand { font-size: 36px; }
    .auth-copy { font-size: 15px; }
    .auth-points { grid-template-columns: 1fr; margin-top: 22px; }
    .auth-point { min-height: 0; }
    .auth-card-wrap { padding: 24px 20px 36px; align-items: flex-start; }
    .menu-btn { display: block; margin-right: 8px; }
    .grid-4 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: 1fr; }
    .grid-2 { grid-template-columns: 1fr; }
    
    .sidebar { 
      position: fixed; 
      left: -280px; 
      width: 280px; 
      z-index: 1000; 
      transition: left 0.3s ease; 
      box-shadow: var(--sh-hover);
    }
    .sidebar.open { left: 0; }
    
    .mobile-overlay.open {
      display: block;
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 999;
      backdrop-filter: blur(2px);
    }
    
    .page-body, .page-header { padding-left: 20px; padding-right: 20px; }
  }
  @media (max-width: 600px) {
    .grid-4 { grid-template-columns: 1fr; }
    .input-row-2 { grid-template-columns: 1fr; }
    .metric-value { font-size: 24px; }
  }
`;

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length > 0) return parts[0].substring(0, 2).toUpperCase();
  return "??";
};

const INIT_PROFILE = {
  name: "Rachana", age: 34, gender: "Female", height: 163,
  bloodType: "B+", allergies: "Dust",
  conditions: "Migraine", emergencyName: "Priyesh",
  emergencyPhone: "+91 7061449907", emergencyRel: "Boyfriend",
  doctor: "Dr. James Patel", clinic: "Metro Health Center"
};

const INIT_VITALS = [
  { date: "Today", hr: 72, bp: "118/76", spo2: 98, temp: 36.6, rr: 14, weight: 65.2 },
  { date: "Yesterday", hr: 75, bp: "120/78", spo2: 97, temp: 36.8, rr: 15, weight: 65.4 },
  { date: "2d ago", hr: 68, bp: "115/72", spo2: 98, temp: 36.5, rr: 13, weight: 65.0 },
];

const INIT_MEDS = [
  { id: 1, name: "Metformin", dose: "500mg", freq: "Twice daily", time: "8:00 AM / 8:00 PM", taken: true, category: "Diabetes" },
  { id: 2, name: "Lisinopril", dose: "10mg", freq: "Once daily", time: "8:00 AM", taken: false, category: "Hypertension" },
  { id: 3, name: "Vitamin D3", dose: "1000 IU", freq: "Once daily", time: "Morning", taken: true, category: "Supplement" },
  { id: 4, name: "Omega-3", dose: "1000mg", freq: "Once daily", time: "With meal", taken: false, category: "Supplement" },
];

const INIT_APPOINTMENTS = [
  { id: 1, doctor: "Dr. Sarah Chen", specialty: "Cardiologist", date: "2026-05-18", time: "10:30 AM", type: "Follow-up", location: "City Heart Clinic", notes: "" },
  { id: 2, doctor: "Dr. James Patel", specialty: "General Physician", date: "2026-05-25", time: "2:00 PM", type: "Routine Checkup", location: "Metro Health Center", notes: "Bring blood reports" },
  { id: 3, doctor: "Dr. Lisa Torres", specialty: "Endocrinologist", date: "2026-06-10", time: "11:00 AM", type: "Consultation", location: "Hormone Health Clinic", notes: "" },
];

const INIT_MEALS = [
  { id: 1, name: "Oatmeal + Banana", type: "Breakfast", kcal: 320, protein: 9, carbs: 58, fat: 6, time: "7:45 AM" },
  { id: 2, name: "Grilled Chicken Salad", type: "Lunch", kcal: 480, protein: 38, carbs: 22, fat: 18, time: "12:30 PM" },
  { id: 3, name: "Greek Yogurt", type: "Snack", kcal: 150, protein: 12, carbs: 16, fat: 3, time: "3:30 PM" },
];

const INIT_EXERCISE = [
  { id: 1, type: "Running", duration: 35, kcal: 290, date: "Today", intensity: "Moderate" },
  { id: 2, type: "Yoga", duration: 45, kcal: 160, date: "Yesterday", intensity: "Low" },
  { id: 3, type: "Cycling", duration: 60, kcal: 420, date: "2d ago", intensity: "High" },
];

const INIT_SYMPTOMS = [
  { date: "May 8", symptoms: ["Headache", "Fatigue"], severity: 4, notes: "After long work day" },
  { date: "May 6", symptoms: ["Back Pain"], severity: 2, notes: "Morning stiffness" },
];

const DEFAULT_HEALTH_DATA = {
  profile: INIT_PROFILE,
  vitals: INIT_VITALS,
  meds: INIT_MEDS,
  appointments: INIT_APPOINTMENTS,
  meals: INIT_MEALS,
  exercise: INIT_EXERCISE,
  symptoms: INIT_SYMPTOMS,
};

const TOKEN_KEY = "health-manager-token";

const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return "";
  }
};

const setStoredToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage can be unavailable in private browsing; the session still works in memory.
  }
};

async function apiRequest(path, { token, ...options } = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

const SYMPTOMS_LIST = ["Headache","Fatigue","Nausea","Dizziness","Chest Pain","Shortness of Breath","Back Pain","Joint Pain","Fever","Cough","Sore Throat","Insomnia"];

const WEEK_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const WEEK_STEPS = [7200, 9800, 6500, 11000, 8400, 12500, 7800];
const WEEK_SLEEP = [6.5, 7.2, 5.8, 7.5, 7.0, 8.2, 6.8];

function BarChart({ data, labels, color = "#2D6A4F", height = 80, unit = "" }) {
  const max = Math.max(...data);
  const w = 680; const bw = Math.floor(w / data.length) - 8;
  return (
    <svg viewBox={`0 0 ${w} ${height + 30}`} width="100%" style={{ display: "block" }}>
      {data.map((v, i) => {
        const bh = max > 0 ? (v / max) * height : 0;
        const x = i * (w / data.length) + 4;
        const y = height - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx={3} fill={color} opacity={0.75} />
            <text x={x + bw / 2} y={height + 18} textAnchor="middle" fontSize={11} fill="#A09C96">{labels[i]}</text>
            <title>{labels[i]}: {v}{unit}</title>
          </g>
        );
      })}
    </svg>
  );
}

function DonutRing({ value, max = 100, size = 100, stroke = 10, color = "#2D6A4F", bg = "#F0EDE6", label, sublabel }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = pct * circ;
  return (
    <div className="score-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="score-label">
        <div className="score-num">{label}</div>
        {sublabel && <div className="score-sub">{sublabel}</div>}
      </div>
    </div>
  );
}

function LineChart({ data, color = "#2D6A4F", height = 100 }) {
  if (!data.length) return null;
  const w = 640; const pad = 8;
  const min = Math.min(...data) - 2; const max = Math.max(...data) + 2;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = height - pad - ((v - min) / (max - min)) * (height - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = height - pad - ((v - min) / (max - min)) * (height - pad * 2);
        return <circle key={i} cx={x} cy={y} r={4} fill={color} />;
      })}
    </svg>
  );
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in" style={{ width: 'auto' }}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = mode === "register"
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };
      const data = await apiRequest(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStoredToken(data.token);
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLE}</style>
      <div className="auth-shell">
        <section className="auth-panel">
          <div className="auth-brand">HealthOS</div>
          <p className="auth-copy">
            Your health logs, appointments, medications, meals, and profile now live in your account,
            so they come back after sign-out and can follow you across devices.
          </p>
          <div className="auth-points">
            {[
              ["🔐", "Private account", "Register once, then sign in with your email and password."],
              ["☁️", "Server saved", "Health data is stored on the backend, not only in this browser."],
              ["📱", "Any device", "Use the same account on another device to pick up where you left off."],
            ].map(([icon, title, copy]) => (
              <div className="auth-point" key={title}>
                <div style={{ fontSize: 22 }}>{icon}</div>
                <strong>{title}</strong>
                <span>{copy}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="auth-card-wrap">
          <form className="auth-card card" onSubmit={submit}>
            <div className="auth-tabs">
              <button type="button" className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setError(""); }}>
                Sign in
              </button>
              <button type="button" className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => { setMode("register"); setError(""); }}>
                Register
              </button>
            </div>
            <div className="card-title" style={{ marginBottom: 6 }}>
              {mode === "login" ? "Welcome back" : "Create your account"}
            </div>
            <div className="card-subtitle" style={{ marginBottom: 18 }}>
              {mode === "login" ? "Sign in to load your saved health data." : "Your password must be at least 8 characters."}
            </div>
            <div className="badge badge-green" style={{ marginBottom: 18 }}>
              Demo: demo@healthos.test / password123
            </div>

            {mode === "register" && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoComplete="name" />
              </div>
            )}
            <div className="input-group">
              <label className="input-label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} autoComplete="email" />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} autoComplete={mode === "login" ? "current-password" : "new-password"} />
              {error && <div className="input-error">{error}</div>}
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}

function Dashboard({ vitals, meds, meals, appointments, onNavigate }) {
  const today = vitals[0] || {};
  const totalKcal = meals.reduce((a, m) => a + m.kcal, 0);
  const medsTaken = meds.filter(m => m.taken).length;
  const healthScore = Math.round(((medsTaken / meds.length) * 25) + (today.spo2 > 95 ? 25 : 10) + (today.hr < 80 ? 25 : 10) + (WEEK_STEPS[6] > 7000 ? 25 : 10));

  return (
    <div className="fade-in">
      {/* Metrics row */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="metric">
          <div className="metric-label">Heart Rate</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <div className="metric-value">{today.hr || "—"}</div>
            <div className="metric-unit">bpm</div>
          </div>
          <div className="metric-change neutral">Resting • Normal</div>
        </div>
        <div className="metric">
          <div className="metric-label">Blood Pressure</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <div className="metric-value" style={{ fontSize: 22 }}>{today.bp || "—"}</div>
            <div className="metric-unit">mmHg</div>
          </div>
          <div className="metric-change up">↑ Slightly above ideal</div>
        </div>
        <div className="metric">
          <div className="metric-label">SpO₂</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <div className="metric-value">{today.spo2 || "—"}</div>
            <div className="metric-unit">%</div>
          </div>
          <div className="metric-change up">↑ Normal range</div>
        </div>
        <div className="metric">
          <div className="metric-label">Weight</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <div className="metric-value">{today.weight || "—"}</div>
            <div className="metric-unit">kg</div>
          </div>
          <div className="metric-change down">↓ 0.2 from yesterday</div>
        </div>
      </div>

      <div className="grid-main">
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Steps chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Daily Steps</div>
                <div className="card-subtitle">This week • Goal: 10,000</div>
              </div>
            </div>
            <BarChart data={WEEK_STEPS} labels={WEEK_LABELS} color="var(--accent)" height={80} />
          </div>

          {/* Sleep */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Sleep Quality</div>
                <div className="card-subtitle">Hours per night this week</div>
              </div>
            </div>
            <BarChart data={WEEK_SLEEP} labels={WEEK_LABELS} color="var(--info)" height={60} unit="h" />
            <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 12, color: "var(--text3)", flexWrap: 'wrap' }}>
              <span>😴 Deep sleep <strong style={{ color: "var(--text2)" }}>2.1h</strong></span>
              <span>💤 REM <strong style={{ color: "var(--text2)" }}>1.8h</strong></span>
              <span>☁️ Light <strong style={{ color: "var(--text2)" }}>3.8h</strong></span>
            </div>
          </div>

          {/* Today's meals */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Nutrition Today</div>
                <div className="card-subtitle">{totalKcal} / 2000 kcal</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("nutrition")}>View All</button>
            </div>
            <div className="progress-bar" style={{ marginBottom: 12 }}>
              <div className="progress-fill" style={{ width: `${Math.min((totalKcal / 2000) * 100, 100)}%`, background: "var(--accent)" }} />
            </div>
            <div style={{ display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap", justifyContent: "space-around" }}>
              {[["Protein", meals.reduce((a, m) => a + m.protein, 0), "g", "var(--accent)"],
                ["Carbs", meals.reduce((a, m) => a + m.carbs, 0), "g", "var(--info)"],
                ["Fat", meals.reduce((a, m) => a + m.fat, 0), "g", "var(--warn)"]].map(([k, v, u, c]) => (
                <div key={k} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 300, color: c }}>{v}<small style={{ fontSize: 12, color: "var(--text3)" }}>{u}</small></div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{k}</div>
                </div>
              ))}
            </div>
            {meals.slice(0, 3).map(m => (
              <div className="meal-row" key={m.id}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{m.type} • {m.time}</div>
                </div>
                <div className="meal-kcal">{m.kcal} kcal</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Health Score */}
          <div className="card" style={{ textAlign: "center" }}>
            <div className="card-title" style={{ marginBottom: 16 }}>Health Score</div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <DonutRing value={healthScore} max={100} size={120} stroke={12}
                color="var(--accent)" bg="var(--surface2)" label={healthScore} sublabel="/100" />
            </div>
            <span className="badge badge-green">Good</span>
            <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 12, lineHeight: 1.5 }}>
              Based on vitals, medication adherence, sleep & activity.
            </p>
          </div>

          {/* Medications today */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Medications</div>
              <span style={{ fontSize: 12, color: "var(--text3)" }}>{medsTaken}/{meds.length} taken</span>
            </div>
            {meds.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 18 }}>{m.taken ? "✅" : "⬜️"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name} <small style={{ fontWeight: 400, color: "var(--text3)" }}>{m.dose}</small></div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{m.time}</div>
                </div>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 12, width: "100%" }} onClick={() => onNavigate("medications")}>
              Manage medications
            </button>
          </div>

          {/* Upcoming appointments */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Upcoming</div>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("appointments")}>All</button>
            </div>
            {appointments.slice(0, 2).map(a => (
              <div key={a.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{a.doctor}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>{a.specialty}</div>
                <div style={{ fontSize: 12, color: "var(--info)", marginTop: 4 }}>📅 {a.date} at {a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VitalsPage({ vitals, setVitals }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: "Today", hr: "", bp: "", spo2: "", temp: "", rr: "", weight: "" });

  const save = () => {
    setVitals(prev => [{ ...form }, ...prev]);
    setShowModal(false);
    setForm({ date: "Today", hr: "", bp: "", spo2: "", temp: "", rr: "", weight: "" });
  };

  const hrData = vitals.map(v => v.hr).reverse();
  const weightData = vitals.map(v => v.weight).reverse();

  return (
    <div className="fade-in">
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {vitals.length > 0 && [
          { label: "Heart Rate", val: vitals[0].hr, unit: "bpm", icon: "❤️", status: vitals[0].hr < 80 ? "good" : "warn" },
          { label: "Blood Pressure", val: vitals[0].bp, unit: "mmHg", icon: "🩺", status: "good" },
          { label: "SpO₂", val: vitals[0].spo2, unit: "%", icon: "🫁", status: vitals[0].spo2 >= 95 ? "good" : "danger" },
          { label: "Temperature", val: vitals[0].temp, unit: "°C", icon: "🌡️", status: "good" },
          { label: "Resp. Rate", val: vitals[0].rr, unit: "/min", icon: "💨", status: "good" },
          { label: "Weight", val: vitals[0].weight, unit: "kg", icon: "⚖️", status: "neutral" },
        ].map(({ label, val, unit, icon, status }) => (
          <div key={label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "14px 18px", flex: "1 1 130px", minWidth: 130, boxShadow: "var(--sh)" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 300, marginTop: 4 }}>{val} <small style={{ fontSize: 12, color: "var(--text3)" }}>{unit}</small></div>
            <span className={`badge ${status === "good" ? "badge-green" : status === "warn" ? "badge-yellow" : status === "danger" ? "badge-red" : "badge-gray"}`} style={{ marginTop: 6 }}>
              {status === "good" ? "Normal" : status === "warn" ? "Elevated" : status === "danger" ? "Low" : "—"}
            </span>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Heart Rate Trend</div><span className="badge badge-green">Normal</span></div>
          <LineChart data={hrData} color="var(--accent)" height={100} />
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Weight Trend</div><span className="badge badge-blue">Tracking</span></div>
          <LineChart data={weightData} color="var(--info)" height={100} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Vitals History</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Log Vitals</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Heart Rate</th><th>Blood Pressure</th><th>SpO₂</th><th>Temp</th><th>Resp. Rate</th><th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {vitals.map((v, i) => (
                <tr key={i}>
                  <td><strong>{v.date}</strong></td>
                  <td>{v.hr} bpm</td>
                  <td>{v.bp} mmHg</td>
                  <td>{v.spo2}%</td>
                  <td>{v.temp}°C</td>
                  <td>{v.rr}/min</td>
                  <td>{v.weight} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="Log Vitals" onClose={() => setShowModal(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <div className="input-row input-row-2">
            {[["Heart Rate (bpm)", "hr", "number"], ["SpO₂ (%)", "spo2", "number"],
              ["Blood Pressure", "bp", "text"], ["Temperature (°C)", "temp", "number"],
              ["Resp. Rate (/min)", "rr", "number"], ["Weight (kg)", "weight", "number"]].map(([label, key, type]) => (
              <div className="input-group" key={key}>
                <label className="input-label">{label}</label>
                <input className="input" type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function MedicationsPage({ meds, setMeds }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", dose: "", freq: "", time: "", category: "Other" });

  const toggleTaken = id => setMeds(prev => prev.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  const deleteMed = id => setMeds(prev => prev.filter(m => m.id !== id));

  const save = () => {
    setMeds(prev => [...prev, { ...form, id: Date.now(), taken: false }]);
    setShowModal(false);
    setForm({ name: "", dose: "", freq: "", time: "", category: "Other" });
  };

  const cats = [...new Set(meds.map(m => m.category))];

  return (
    <div className="fade-in">
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="metric">
          <div className="metric-label">Total Medications</div>
          <div className="metric-value">{meds.length}</div>
          <div className="metric-change neutral">Active prescriptions</div>
        </div>
        <div className="metric">
          <div className="metric-label">Taken Today</div>
          <div className="metric-value">{meds.filter(m => m.taken).length}</div>
          <div className="metric-change up">of {meds.length} scheduled</div>
        </div>
        <div className="metric">
          <div className="metric-label">Adherence</div>
          <div className="metric-value">{meds.length ? Math.round((meds.filter(m => m.taken).length / meds.length) * 100) : 0}<span className="metric-unit">%</span></div>
          <div className="metric-change up">↑ This week</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: 20 }}>
      {cats.map(cat => (
        <div className="card" key={cat}>
          <div className="card-header">
            <div className="card-title">{cat}</div>
            <span className="badge badge-gray">{meds.filter(m => m.category === cat).length} items</span>
          </div>
          {meds.filter(m => m.category === cat).map(med => (
            <div key={med.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <button onClick={() => toggleTaken(med.id)} style={{ fontSize: 22, background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>
                {med.taken ? "✅" : "⬜️"}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{med.name}</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>{med.dose} · {med.freq} · {med.time}</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => deleteMed(med.id)}>Remove</button>
            </div>
          ))}
        </div>
      ))}
      </div>

      <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Medication</button>

      {showModal && (
        <Modal title="Add Medication" onClose={() => setShowModal(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Add</button></>}>
          {[["Medication Name", "name", "text"], ["Dosage (e.g. 500mg)", "dose", "text"],
            ["Frequency", "freq", "text"], ["Time", "time", "text"]].map(([label, key, type]) => (
            <div className="input-group" key={key}>
              <label className="input-label">{label}</label>
              <input className="input" type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="input-group">
            <label className="input-label">Category</label>
            <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {["Diabetes", "Hypertension", "Heart", "Supplement", "Antibiotic", "Pain Relief", "Other"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AppointmentsPage({ appointments, setAppointments }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ doctor: "", specialty: "", date: "", time: "", type: "Routine Checkup", location: "", notes: "" });

  const save = () => {
    setAppointments(prev => [...prev, { ...form, id: Date.now() }]);
    setShowModal(false);
    setForm({ doctor: "", specialty: "", date: "", time: "", type: "Routine Checkup", location: "", notes: "" });
  };

  const del = id => setAppointments(prev => prev.filter(a => a.id !== id));

  return (
    <div className="fade-in">
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Upcoming Appointments</div>
            <div className="card-subtitle">{appointments.length} scheduled</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Book</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Doctor</th><th>Specialty</th><th>Date & Time</th><th>Type</th><th>Location</th><th>Notes</th><th></th></tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.doctor}</strong></td>
                  <td>{a.specialty}</td>
                  <td style={{ color: "var(--info)", whiteSpace: 'nowrap' }}>{a.date} {a.time}</td>
                  <td><span className="badge badge-blue">{a.type}</span></td>
                  <td>{a.location}</td>
                  <td style={{ maxWidth: 200 }}>{a.notes || "—"}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => del(a.id)}>Cancel</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="Book Appointment" onClose={() => setShowModal(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Book</button></>}>
          <div className="input-row input-row-2">
            <div className="input-group">
              <label className="input-label">Doctor Name</label>
              <input className="input" value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Specialty</label>
              <input className="input" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Time</label>
              <input className="input" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>
          </div>
          <div className="input-row input-row-2">
            <div className="input-group">
              <label className="input-label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {["Routine Checkup", "Follow-up", "Consultation", "Emergency", "Lab Work", "Vaccination"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Location / Clinic</label>
              <input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: "vertical" }} />
          </div>
        </Modal>
      )}
    </div>
  );
}

function NutritionPage({ meals, setMeals }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Breakfast", kcal: "", protein: "", carbs: "", fat: "", time: "" });
  const [tab, setTab] = useState("Today");

  const save = () => {
    setMeals(prev => [...prev, { ...form, id: Date.now(), kcal: +form.kcal, protein: +form.protein, carbs: +form.carbs, fat: +form.fat }]);
    setShowModal(false);
    setForm({ name: "", type: "Breakfast", kcal: "", protein: "", carbs: "", fat: "", time: "" });
  };

  const totalKcal = meals.reduce((a, m) => a + m.kcal, 0);
  const GOAL = 2000;

  return (
    <div className="fade-in">
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[["Calories", totalKcal, "kcal", "#2D6A4F", GOAL],
          ["Protein", meals.reduce((a, m) => a + m.protein, 0), "g", "#1A6EA8", 80],
          ["Carbs", meals.reduce((a, m) => a + m.carbs, 0), "g", "#B7791F", 250],
          ["Fat", meals.reduce((a, m) => a + m.fat, 0), "g", "#5E35B1", 65]
        ].map(([label, val, unit, color, goal]) => (
          <div className="metric" key={label}>
            <div className="metric-label">{label}</div>
            <div style={{ fontSize: 24, fontWeight: 300, color }}>{val}<small style={{ fontSize: 12, color: "var(--text3)" }}> {unit}</small></div>
            <div className="progress-bar" style={{ marginTop: 8 }}>
              <div className="progress-fill" style={{ width: `${Math.min((val / goal) * 100, 100)}%`, background: color }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{val} / {goal}{unit}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Food Log</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Log Meal</button>
        </div>
        <div className="tabs">
          {["Breakfast", "Lunch", "Snack", "Dinner"].map(t => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        {meals.filter(m => m.type === tab).length === 0
          ? <div className="empty"><div className="empty-icon">🍽️</div><h3>No {tab} logged yet</h3><p>Tap "Log Meal" to add your first entry.</p></div>
          : meals.filter(m => m.type === tab).map(m => (
            <div className="meal-row" key={m.id}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>
                  P: {m.protein}g · C: {m.carbs}g · F: {m.fat}g · {m.time}
                </div>
              </div>
              <div className="meal-kcal">{m.kcal} kcal</div>
              <button className="btn btn-danger btn-sm" onClick={() => setMeals(prev => prev.filter(x => x.id !== m.id))}>✕</button>
            </div>
          ))
        }
      </div>

      {showModal && (
        <Modal title="Log Meal" onClose={() => setShowModal(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Log</button></>}>
          <div className="input-group">
            <label className="input-label">Food Name</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Grilled Salmon" />
          </div>
          <div className="input-row input-row-2">
            <div className="input-group">
              <label className="input-label">Meal Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {["Breakfast", "Lunch", "Dinner", "Snack"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Time</label>
              <input className="input" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>
          </div>
          <div className="input-row input-row-2">
            {[["Calories (kcal)", "kcal"], ["Protein (g)", "protein"], ["Carbs (g)", "carbs"], ["Fat (g)", "fat"]].map(([label, key]) => (
              <div className="input-group" key={key}>
                <label className="input-label">{label}</label>
                <input className="input" type="number" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function ExercisePage({ exercise, setExercise }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "", duration: "", kcal: "", date: "Today", intensity: "Moderate", notes: "" });

  const save = () => {
    setExercise(prev => [...prev, { ...form, id: Date.now(), duration: +form.duration, kcal: +form.kcal }]);
    setShowModal(false);
    setForm({ type: "", duration: "", kcal: "", date: "Today", intensity: "Moderate", notes: "" });
  };

  const totalMins = exercise.filter(e => e.date === "Today").reduce((a, e) => a + e.duration, 0);
  const totalKcal = exercise.filter(e => e.date === "Today").reduce((a, e) => a + e.kcal, 0);

  const ACTIVITIES = ["Running", "Walking", "Cycling", "Swimming", "Yoga", "Weight Training", "HIIT", "Pilates", "Dancing", "Hiking", "Rock Climbing", "Tennis"];

  return (
    <div className="fade-in">
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="metric">
          <div className="metric-label">Active Minutes Today</div>
          <div className="metric-value">{totalMins}<span className="metric-unit"> min</span></div>
          <div className="progress-bar" style={{ marginTop: 8 }}>
            <div className="progress-fill" style={{ width: `${Math.min((totalMins / 60) * 100, 100)}%`, background: "var(--accent)" }} />
          </div>
          <div className="metric-change neutral">{totalMins}/60 min goal</div>
        </div>
        <div className="metric">
          <div className="metric-label">Calories Burned</div>
          <div className="metric-value">{totalKcal}<span className="metric-unit"> kcal</span></div>
          <div className="metric-change up">↑ Active sessions</div>
        </div>
        <div className="metric">
          <div className="metric-label">Weekly Streak</div>
          <div className="metric-value">5<span className="metric-unit"> days</span></div>
          <div className="metric-change up">🔥 Keep it up!</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Activity Log</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Log Activity</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Activity</th><th>Date</th><th>Duration</th><th>Calories</th><th>Intensity</th><th>Notes</th></tr></thead>
            <tbody>
              {exercise.map(e => (
                <tr key={e.id}>
                  <td><strong>🏃 {e.type}</strong></td>
                  <td>{e.date}</td>
                  <td>{e.duration} min</td>
                  <td>{e.kcal} kcal</td>
                  <td><span className={`badge ${e.intensity === "High" ? "badge-red" : e.intensity === "Moderate" ? "badge-yellow" : "badge-green"}`}>{e.intensity}</span></td>
                  <td>{e.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="Log Activity" onClose={() => setShowModal(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <div className="input-group">
            <label className="input-label">Activity Type</label>
            <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="">Select activity...</option>
              {ACTIVITIES.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="input-row input-row-2">
            <div className="input-group">
              <label className="input-label">Duration (minutes)</label>
              <input className="input" type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Calories Burned</label>
              <input className="input" type="number" value={form.kcal} onChange={e => setForm(f => ({ ...f, kcal: e.target.value }))} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Intensity</label>
            <select className="input" value={form.intensity} onChange={e => setForm(f => ({ ...f, intensity: e.target.value }))}>
              {["Low", "Moderate", "High"].map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Notes (optional)</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: "vertical" }} />
          </div>
        </Modal>
      )}
    </div>
  );
}

function SymptomsPage({ symptoms, setSymptoms }) {
  const [selected, setSelected] = useState([]);
  const [severity, setSeverity] = useState(3);
  const [notes, setNotes] = useState("");

  const toggleSym = s => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const log = () => {
    if (!selected.length) return;
    setSymptoms(prev => [{ date: "Today", symptoms: selected, severity, notes }, ...prev]);
    setSelected([]); setSeverity(3); setNotes("");
  };

  return (
    <div className="fade-in">
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title" style={{ marginBottom: 16 }}>Log Today's Symptoms</div>
        <div className="sym-grid">
          {SYMPTOMS_LIST.map(s => (
            <button key={s} className={`sym-chip ${selected.includes(s) ? "selected" : ""}`} onClick={() => toggleSym(s)}>{s}</button>
          ))}
        </div>
        <div style={{ marginTop: 20 }}>
          <label className="input-label">Severity: {severity}/10</label>
          <input type="range" min={1} max={10} value={severity} onChange={e => setSeverity(+e.target.value)}
            style={{ width: "100%", accentColor: "var(--accent)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
            <span>Mild</span><span>Moderate</span><span>Severe</span>
          </div>
        </div>
        <div className="input-group" style={{ marginTop: 16 }}>
          <label className="input-label">Notes</label>
          <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional context..." style={{ resize: "vertical" }} />
        </div>
        <button className="btn btn-primary" onClick={log} disabled={!selected.length}>
          {selected.length ? `Log ${selected.length} symptom${selected.length > 1 ? "s" : ""}` : "Select symptoms above"}
        </button>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Symptom History</div>
        {symptoms.map((log, i) => (
          <div className="log-item" key={i}>
            <div className="log-dot" style={{ background: log.severity > 6 ? "var(--danger)" : log.severity > 3 ? "var(--warn)" : "var(--accent)" }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                {log.symptoms.map(s => <span key={s} className="badge badge-gray">{s}</span>)}
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>
                Severity {log.severity}/10 · {log.date}
                {log.notes && ` · "${log.notes}"`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsPage({ vitals, exercise, meds, profile }) {
  const heightM = (profile?.height || 168) / 100;
  const weight = vitals[0]?.weight || 65.2;
  const bmi = (weight / (heightM * heightM)).toFixed(1);
  return (
    <div className="fade-in">
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>BMI Calculator</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <DonutRing value={+bmi} max={40} size={100} stroke={10} color={+bmi < 25 ? "var(--accent)" : "var(--warn)"} bg="var(--surface2)" label={bmi} sublabel="BMI" />
            <div>
              <div style={{ fontSize: 20, fontWeight: 300 }}>{bmi}</div>
              <div style={{ fontSize: 13, color: "var(--text3)" }}>Normal weight</div>
              <div style={{ marginTop: 8, fontSize: 12 }}>
                <div>Height: {profile?.height || 168} cm</div>
                <div>Weight: {weight} kg</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            {[["Underweight", "< 18.5", "#1A6EA8"], ["Normal", "18.5 – 24.9", "#2D6A4F"], ["Overweight", "25 – 29.9", "#B7791F"], ["Obese", "≥ 30", "#C0392B"]].map(([label, range, color]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, borderBottom: "1px solid var(--border)" }}>
                <span style={{ color }}>{label}</span><span style={{ color: "var(--text3)" }}>{range}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Weekly Summary</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["🏃 Exercise sessions", exercise.length, "sessions", "#2D6A4F"],
              ["🔥 Calories burned", exercise.reduce((a, e) => a + e.kcal, 0), "kcal", "#B7791F"],
              ["💊 Med adherence", `${meds.length ? Math.round((meds.filter(m => m.taken).length / meds.length) * 100) : 0}%`, "", "#5E35B1"],
              ["😴 Avg sleep", `${(WEEK_SLEEP.reduce((a, b) => a + b, 0) / 7).toFixed(1)}h`, "", "#1A6EA8"],
              ["👣 Avg steps", Math.round(WEEK_STEPS.reduce((a, b) => a + b, 0) / 7).toLocaleString(), "steps/day", "#2D6A4F"],
            ].map(([label, val, unit, color]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color }}>{val} <small style={{ color: "var(--text3)", fontWeight: 400 }}>{unit}</small></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Health Insights</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { icon: "✅", color: "var(--accent)", title: "Blood pressure trending stable", desc: "Your BP has stayed within 115–120 mmHg systolic over the last 3 days." },
            { icon: "⚠️", color: "var(--warn)", title: "Hydration reminder", desc: "Based on your logged meals, estimated water intake may be below daily goal." },
            { icon: "✅", color: "var(--accent)", title: "SpO₂ within normal range", desc: "Oxygen saturation consistently ≥ 97% this week." },
            { icon: "💡", color: "var(--info)", title: "Schedule your dental checkup", desc: "You haven't logged a dental appointment in the past 6 months." },
          ].map(({ icon, color, title, desc }) => (
            <div key={title} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color }}>{title}</div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FORMATTED MESSAGE (Markdown Renderer)
// ============================================================
function FormattedMessage({ text }) {
  const lines = text.split('\n');
  
  const formatInline = (str) => {
    // Match both **bold** and *italic* markdown tags
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: "inherit" }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} style={{ fontStyle: "italic", color: "inherit" }}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: 4 }} />;
        
        // Handle list items
        if (trimmed.startsWith('- ') || (trimmed.startsWith('* ') && !trimmed.endsWith('*'))) {
          return (
            <div key={i} style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
              <span style={{ color: "var(--accent)" }}>•</span>
              <span>{formatInline(trimmed.substring(2))}</span>
            </div>
          );
        }
        
        // Handle headings
        if (trimmed.startsWith('### ')) {
          return <div key={i} style={{ fontSize: '15px', fontWeight: 600, marginTop: '8px', color: "inherit" }}>{formatInline(trimmed.substring(4))}</div>;
        }
        if (trimmed.startsWith('## ')) {
          return <div key={i} style={{ fontSize: '17px', fontWeight: 600, marginTop: '10px', color: "inherit" }}>{formatInline(trimmed.substring(3))}</div>;
        }
        
        // Handle standard text
        return <div key={i} style={{ lineHeight: 1.6 }}>{formatInline(line)}</div>;
      })}
    </div>
  );
}

// ============================================================
// AI HEALTH ASSISTANT
// ============================================================
function AIAssistant({ vitals, meds, meals, exercise, profile }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: "Hello! I'm your AI Health Assistant powered by Gemini. I can answer questions about your health data, explain medical terms, give wellness tips, or help you understand your vitals and trends. How can I help you today?",
      time: "Now"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildContext = () => {
    const v = vitals[0] || {};
    return `User health context (today):
- Heart Rate: ${v.hr} bpm
- Blood Pressure: ${v.bp} mmHg
- SpO₂: ${v.spo2}%
- Temperature: ${v.temp}°C
- Weight: ${v.weight} kg
- Medications: ${meds.map(m => `${m.name} ${m.dose}`).join(", ")}
- Today's meals: ${meals.map(m => `${m.name} (${m.kcal} kcal)`).join(", ")}
- Today's exercise: ${exercise.filter(e => e.date === "Today").map(e => `${e.type} ${e.duration}min`).join(", ")}
- Patient: ${profile?.name || "User"}, age ${profile?.age || 30}, height ${profile?.height || 168}cm`;
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim(), time: "Now" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const systemPrompt = `You are a knowledgeable, empathetic AI Health Assistant integrated into a personal health management system. You have access to the user's current health data. Be helpful, concise, and always remind users to consult their doctor for medical decisions. Never diagnose. Provide clear, brief answers with occasional bullet points for readability. Avoid complex markdown elements like tables. ${buildContext()}`;

      // Map local message history to Gemini API format
      const geminiHistory = messages.map(m => ({
        role: m.role === "ai" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
      geminiHistory.push({ role: "user", parts: [{ text: userMsg.content }] });

      const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: geminiHistory,
      };

      const apiKey = "AIzaSyAolBjYjhqjWxUypZ18t2FMHSy6sRRgat4"; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      // Parse Gemini response structure
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that. Please try again.";
      
      setMessages(prev => [...prev, { role: "ai", content: text, time: "Now" }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.", time: "Now" }]);
    }
    setLoading(false);
  };

  const QUICK = ["Summarize my health today", "Is my heart rate normal?", "What should I eat more of?", "Explain my blood pressure reading", "How much sleep do I need?"];

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {QUICK.map(q => (
          <button key={q} className="btn btn-ghost btn-sm" onClick={() => { setInput(q); }}>💡 {q}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, paddingBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>
            <div className="chat-bubble-inner">
              <FormattedMessage text={m.content} />
            </div>
            <div className="chat-meta">{m.role === "ai" ? "🩺 Health AI" : "You"} · {m.time}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble ai">
            <div className="chat-bubble-inner">
              <div className="typing-indicator">
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <input className="input chat-input" placeholder="Ask about your health, vitals, medications..."
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} />
        <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()}>Send</button>
      </div>
    </div>
  );
}

function ProfilePage({ profile: globalProfile, setGlobalProfile }) {
  const [profile, setProfile] = useState(globalProfile || INIT_PROFILE);
  const [saved, setSaved] = useState(false);
  const [patientId] = useState(() => `HMS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);

  const save = () => { 
    if (setGlobalProfile) setGlobalProfile(profile);
    setSaved(true); 
    setTimeout(() => setSaved(false), 2000); 
  };

  return (
    <div className="fade-in">
      <div className="grid-2">
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 600 }}>
                {getInitials(profile.name)}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 500 }}>{profile.name}</div>
                <div style={{ fontSize: 13, color: "var(--text3)" }}>Patient ID: {patientId}</div>
                <span className="badge badge-green" style={{ marginTop: 4 }}>Active</span>
              </div>
            </div>
            <div className="card-title" style={{ marginBottom: 12 }}>Personal Information</div>
            <div className="input-row input-row-2">
              {[["Full Name", "name"], ["Age", "age"], ["Gender", "gender"], ["Height (cm)", "height"],
                ["Blood Type", "bloodType"]].map(([label, key]) => (
                <div className="input-group" key={key}>
                  <label className="input-label">{label}</label>
                  <input className="input" value={profile[key]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="input-group">
              <label className="input-label">Known Allergies</label>
              <input className="input" value={profile.allergies} onChange={e => setProfile(p => ({ ...p, allergies: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Chronic Conditions</label>
              <textarea className="input" rows={2} value={profile.conditions} onChange={e => setProfile(p => ({ ...p, conditions: e.target.value }))} style={{ resize: "vertical" }} />
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Primary Physician</div>
            <div className="input-row input-row-2">
              <div className="input-group">
                <label className="input-label">Doctor Name</label>
                <input className="input" value={profile.doctor} onChange={e => setProfile(p => ({ ...p, doctor: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Clinic</label>
                <input className="input" value={profile.clinic} onChange={e => setProfile(p => ({ ...p, clinic: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 12 }}>Emergency Contact</div>
            {[["Name", "emergencyName"], ["Phone", "emergencyPhone"], ["Relationship", "emergencyRel"]].map(([label, key]) => (
              <div className="input-group" key={key}>
                <label className="input-label">{label}</label>
                <input className="input" value={profile[key]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 12 }}>Health Goals</div>
            {[
              { label: "Daily Steps", val: 10000, unit: "steps", current: 7800, color: "var(--accent)" },
              { label: "Calorie Intake", val: 2000, unit: "kcal", current: 1650, color: "#1A6EA8" },
              { label: "Sleep", val: 8, unit: "hours", current: 6.8, color: "#5E35B1" },
            ].map(g => (
              <div key={g.label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: "var(--text2)" }}>{g.label}</span>
                  <span style={{ fontWeight: 500, color: g.color }}>{g.current} / {g.val} {g.unit}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min((g.current / g.val) * 100, 100)}%`, background: g.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Preferences</div>
            {[["Email reminders", true], ["Medication alerts", true], ["Weekly reports", false], ["Exercise reminders", true]].map(([label, def]) => (
              <PreferenceToggle key={label} label={label} defaultOn={def} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button className="btn btn-primary" onClick={save}>
          {saved ? "✓ Saved!" : "Save Changes"}
        </button>
        <button className="btn btn-ghost">Export Health Record (PDF)</button>
      </div>
    </div>
  );
}

function PreferenceToggle({ label, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 13, color: "var(--text2)" }}>{label}</span>
      <button onClick={() => setOn(o => !o)} style={{
        width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
        background: on ? "var(--accent)" : "var(--border2)", position: "relative", transition: "background 0.2s"
      }}>
        <span style={{
          position: "absolute", top: 3, left: on ? 20 : 3,
          width: 16, height: 16, borderRadius: "50%", background: "white",
          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
        }} />
      </button>
    </div>
  );
}

const PAGES = [
  { id: "dashboard", label: "Dashboard", icon: "🏠", section: "Overview" },
  { id: "vitals", label: "Vitals", icon: "❤️", section: "Tracking" },
  { id: "medications", label: "Medications", icon: "💊", section: "Tracking" },
  { id: "nutrition", label: "Nutrition", icon: "🥗", section: "Tracking" },
  { id: "exercise", label: "Exercise", icon: "🏃", section: "Tracking" },
  { id: "symptoms", label: "Symptoms", icon: "🩺", section: "Tracking" },
  { id: "appointments", label: "Appointments", icon: "📅", section: "Care" },
  { id: "reports", label: "Reports", icon: "📊", section: "Care" },
  { id: "ai", label: "AI Assistant", icon: "🤖", section: "Care" },
  { id: "profile", label: "Profile", icon: "👤", section: "Account" },
];

const PAGE_TITLES = {
  dashboard: ["Overview", "Your health at a glance"],
  vitals: ["Vitals", "Track and monitor your vital signs"],
  medications: ["Medications", "Manage prescriptions and adherence"],
  nutrition: ["Nutrition", "Log meals and track macros"],
  exercise: ["Exercise", "Activity log and fitness tracker"],
  symptoms: ["Symptoms", "Track how you're feeling"],
  appointments: ["Appointments", "Upcoming medical visits"],
  reports: ["Reports & Insights", "Health analytics and summaries"],
  ai: ["AI Health Assistant", "Powered by Gemini — ask anything about your health"],
  profile: ["My Profile", "Personal & medical information"],
};

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [token, setToken] = useState(getStoredToken);
  const [account, setAccount] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Saved");
  const [userProfile, setUserProfile] = useState(INIT_PROFILE);
  const [vitals, setVitals] = useState(INIT_VITALS);
  const [meds, setMeds] = useState(INIT_MEDS);
  const [appointments, setAppointments] = useState(INIT_APPOINTMENTS);
  const [meals, setMeals] = useState(INIT_MEALS);
  const [exercise, setExercise] = useState(INIT_EXERCISE);
  const [symptoms, setSymptoms] = useState(INIT_SYMPTOMS);
  const hasLoadedAccount = useRef(false);

  const sections = [...new Set(PAGES.map(p => p.section))];
  const [title, subtitle] = PAGE_TITLES[page] || ["Page", ""];

  const applyHealthData = (healthData = DEFAULT_HEALTH_DATA) => {
    setUserProfile(healthData.profile || INIT_PROFILE);
    setVitals(healthData.vitals || []);
    setMeds(healthData.meds || []);
    setAppointments(healthData.appointments || []);
    setMeals(healthData.meals || []);
    setExercise(healthData.exercise || []);
    setSymptoms(healthData.symptoms || []);
  };

  const currentHealthData = useMemo(() => ({
    profile: userProfile,
    vitals,
    meds,
    appointments,
    meals,
    exercise,
    symptoms,
  }), [userProfile, vitals, meds, appointments, meals, exercise, symptoms]);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      if (!token) {
        hasLoadedAccount.current = false;
        setAuthReady(true);
        return;
      }

      try {
        const data = await apiRequest("/api/me", { token });
        if (cancelled) return;
        setAccount(data.user);
        applyHealthData(data.healthData);
        hasLoadedAccount.current = true;
      } catch {
        if (cancelled) return;
        setStoredToken("");
        setToken("");
        setAccount(null);
        hasLoadedAccount.current = false;
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !hasLoadedAccount.current) return;

    setSyncStatus("Saving...");
    const timeout = setTimeout(async () => {
      try {
        await apiRequest("/api/data", {
          method: "PUT",
          token,
          body: JSON.stringify({ healthData: currentHealthData }),
        });
        setSyncStatus("Saved");
      } catch (error) {
        setSyncStatus(error.message || "Not saved");
      }
    }, 450);

    return () => clearTimeout(timeout);
  }, [token, currentHealthData]);

  const handleAuth = (data) => {
    setToken(data.token);
    setAccount(data.user);
    applyHealthData(data.healthData);
    hasLoadedAccount.current = true;
    setAuthReady(true);
    setSyncStatus("Saved");
  };

  const logout = () => {
    setStoredToken("");
    setToken("");
    setAccount(null);
    hasLoadedAccount.current = false;
    applyHealthData(DEFAULT_HEALTH_DATA);
    setPage("dashboard");
  };

  const renderPage = () => {
    const props = { vitals, setVitals, meds, setMeds, appointments, setAppointments, meals, setMeals, exercise, setExercise, symptoms, setSymptoms, profile: userProfile };
    switch (page) {
      case "dashboard": return <Dashboard {...props} onNavigate={setPage} />;
      case "vitals": return <VitalsPage {...props} />;
      case "medications": return <MedicationsPage {...props} />;
      case "nutrition": return <NutritionPage {...props} />;
      case "exercise": return <ExercisePage {...props} />;
      case "symptoms": return <SymptomsPage {...props} />;
      case "appointments": return <AppointmentsPage {...props} />;
      case "reports": return <ReportsPage {...props} />;
      case "ai": return <AIAssistant {...props} />;
      case "profile": return <ProfilePage profile={userProfile} setGlobalProfile={setUserProfile} />;
      default: return null;
    }
  };

  if (!authReady) {
    return (
      <>
        <style>{STYLE}</style>
        <div className="app" style={{ alignItems: "center", justifyContent: "center" }}>
          <div className="card">Loading your account...</div>
        </div>
      </>
    );
  }

  if (!token || !account) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  return (
    <>
      <style>{STYLE}</style>
      <div className="app">
        <div className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
        
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">
            <h1>HealthOS</h1>
            <span>Personal Health Manager</span>
          </div>
          <nav className="sidebar-nav">
            {sections.map(section => (
              <div key={section}>
                <div className="sidebar-section-label">{section}</div>
                {PAGES.filter(p => p.section === section).map(p => (
                  <button key={p.id} className={`nav-item ${page === p.id ? "active" : ""}`} onClick={() => { setPage(p.id); setIsSidebarOpen(false); }}>
                    <span className="icon">{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="user-pill" onClick={() => setPage("profile")}>
              <div className="avatar">{getInitials(userProfile.name)}</div>
              <div className="user-info">
                <div className="user-name">{userProfile.name}</div>
                <div className="user-meta">{account.email}</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={logout} style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>
              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="page-header">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
              <div>
                <div className="page-title">{title}</div>
                {subtitle && <div className="page-subtitle">{subtitle}</div>}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="sync-status">{syncStatus}</span>
              <div style={{ fontSize: 13, color: "var(--text3)", display: 'none', '@media(minWidth: 600px)': {display: 'block'} }}>
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage("ai")}>🤖 Ask AI</button>
            </div>
          </div>
          <div className="page-body">
            {renderPage()}
          </div>
        </main>
      </div>
    </>
  );
}
