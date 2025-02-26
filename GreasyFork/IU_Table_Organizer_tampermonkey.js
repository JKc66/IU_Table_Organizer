// ==UserScript==
// @name IU Table Organizer
// @description A script to order the lectures table according to weekdays on the Islamic University website
// @name:en IU Table Organizer
// @description:en A script to order the lectures table according to weekdays on the Islamic University website
// @name:ar منظم جدول الجامعة الاسلامية
// @description:ar اضافة لتعديل مظهر الجدول بالجامعة الاسلامية الى جدول مرتب تبعا لايام الاسبوع بضغطة زر
// @include https://eduportal.iu.edu.sa/iu/ui/student/homeIndex.faces
// @include https://eduportal.iu.edu.sa/iu/ui/student/*/*/*
// @include http://eduportal.iu.edu.sa/iu/ui/student/*
// @include https://eduportal.iu.edu.sa/iu/ui/student/student_schedule/index/studentScheduleIndex.faces
// @version 4.1
// @icon https://www.google.com/s2/favicons?domain=sso.iu.edu.sa
// @namespace https://greasyfork.org/users/814159
// @icon https://icons.iconarchive.com/icons/fatcow/farm-fresh/32/table-icon.png
// @license Mozilla Public License 2.0
// @grant GM_addStyle
// @require https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js
// @downloadURL https://update.greasyfork.org/scripts/432219/iu-table-organizer.user.js
// @updateURL https://update.greasyfork.org/scripts/432219/iu-table-organizer.meta.js
// ==/UserScript==

(function() {{
    'use strict';
    
    // Add styles
    GM_addStyle(`#newTable {
    border-collapse: collapse;
    margin: 15px auto;
    font-size: 0.9em;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background: white;
    width: 98%;
    min-width: 1400px;
    table-layout: fixed;
}

#newTable thead tr {
    background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
    color: #ffffff;
    text-align: center;
    font-weight: bold;
    height: 60px;
    position: relative;
    box-shadow: 0 3px 6px rgba(0,0,0,0.1);
    font-feature-settings: "kern", "liga", "clig", "calt", "arab";
    -webkit-font-feature-settings: "kern", "liga", "clig", "calt", "arab";
    font-family: "Segoe UI", "Traditional Arabic", Tahoma, Geneva, Verdana, sans-serif;
    direction: rtl;
}

#newTable th {
    width: 20%;
    padding: 12px;
    position: relative;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    border-left: 1px solid rgba(255,255,255,0.15);
    transition: background-color 0.3s ease;
}

#newTable th:last-child {
    border-left: none;
}

#newTable th::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255,255,255,0.1);
    transform: scaleX(0.7);
    transition: transform 0.3s ease;
}

#newTable th:hover::after {
    transform: scaleX(1);
}

#newTable th .day-name {
    font-size: 1.3em;
    font-weight: 600;
    margin-bottom: 2px;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    text-align: center;
    direction: rtl;
    font-family: "Noto Kufi Arabic", "Segoe UI", sans-serif;
    font-feature-settings: "kern", "liga", "clig", "calt";
    -webkit-font-feature-settings: "kern", "liga", "clig", "calt";
}

#newTable th .day-name-en {
    font-size: 0.75em;
    opacity: 0.8;
    font-weight: normal;
    display: block;
    letter-spacing: 1px;
}

#newTable td {
    padding: 8px;
    text-align: center;
    vertical-align: middle;
    height: auto;
    width: 20%;
    font-size: 0.85em;
}

#newTable td:empty {
    padding: 0;
    height: 0;
}

#newTable tbody tr {
    border-bottom: 1px solid #e0e0e0;
    transition: background-color 0.3s ease;
}

#newTable tbody tr:hover {
    background-color: #f5f5f5;
}

.break-cell {
    background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
    color: #424242;
    font-style: italic;
    padding: 8px;
    border-radius: 6px;
    margin: 4px;
    font-size: 1.3em;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    text-align: center;
    border: 1px solid #e0e0e0;
}

.lecture-cell {
    border-left: 4px solid;
    padding: 8px;
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin: 4px;
    transition: all 0.2s ease;
}

.lecture-cell:hover {
    transform: translateX(-2px);
}

.lecture-cell strong {
    display: block;
    margin-bottom: 1px;
    font-size: 0.95em;
}

.lecture-cell div {
    margin: 0;
    line-height: 1.2;
}

.schedule-summary {
    background: linear-gradient(45deg, #f5f5f5, #fff);
    border-radius: 8px;
    padding: 20px;
    margin: 15px auto;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border: 1px solid #e0e0e0;
    width: 98%;
    box-sizing: border-box;
    min-width: 1400px;
}

.schedule-summary > div {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
    width: 100%;
    box-sizing: border-box;
}

.schedule-summary div > div {
    flex: 0 1 auto;
    min-width: fit-content;
    white-space: nowrap;
}

.control-buttons {
    display: flex;
    gap: 10px;
    margin: 10px 0;
}

.control-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    border-radius: 12px;
    font-family: "Segoe UI", "Traditional Arabic", Tahoma, Geneva, Verdana, sans-serif;
    font-size: 0.95em;
    font-weight: 600;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2),
                0 4px 8px rgba(37, 99, 235, 0.1),
                inset 0 2px 4px rgba(255, 255, 255, 0.1);
    text-decoration: none;
    margin: 4px 8px;
    min-width: 120px;
    white-space: nowrap;
    line-height: 1.5;
    cursor: pointer;
    color: white;
    position: relative;
    overflow: hidden;
}

.control-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
    opacity: 0;
    transition: opacity 0.3s ease;
}

.control-button:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3),
                0 8px 16px rgba(37, 99, 235, 0.2),
                inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.control-button:hover::before {
    opacity: 1;
}

.control-button:active {
    transform: translateY(1px) scale(0.98);
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2),
                inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-button.active {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2),
                0 4px 8px rgba(5, 150, 105, 0.1),
                inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

/* Theme buttons specific styles */
.theme-btn {
    min-width: 100px;
    backdrop-filter: blur(8px);
}

#lightThemeBtn {
    background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
    box-shadow: 0 2px 4px rgba(217, 119, 6, 0.2),
                0 4px 8px rgba(217, 119, 6, 0.1),
                inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

#lightThemeBtn:hover {
    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3),
                0 8px 16px rgba(217, 119, 6, 0.2),
                inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

#darkThemeBtn {
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
    box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2),
                0 4px 8px rgba(79, 70, 229, 0.1),
                inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

#darkThemeBtn:hover {
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3),
                0 8px 16px rgba(79, 70, 229, 0.2),
                inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

#downloadButton {
    background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
    box-shadow: 0 2px 4px rgba(13, 148, 136, 0.2),
                0 4px 8px rgba(13, 148, 136, 0.1),
                inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

#downloadButton:hover {
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3),
                0 8px 16px rgba(13, 148, 136, 0.2),
                inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

#ramadanBtn {
    background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
    box-shadow: 0 2px 4px rgba(124, 58, 237, 0.2),
                0 4px 8px rgba(124, 58, 237, 0.1),
                inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

#ramadanBtn:hover {
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3),
                0 8px 16px rgba(124, 58, 237, 0.2),
                inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

/* Dark theme support for control buttons */
.theme-dark .control-button {
    background: linear-gradient(135deg, #2d3a6a 0%, #3d4a8a 100%);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3),
                0 4px 8px rgba(0, 0, 0, 0.2),
                inset 0 1px 1px rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: #e0e0ff;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-dark .control-button:hover {
    transform: translateY(-2px) scale(1.02);
    background: linear-gradient(135deg, #3d4a8a 0%, #4d5aaa 100%);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4),
                0 8px 16px rgba(0, 0, 0, 0.3),
                inset 0 1px 2px rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
}

.theme-dark .control-button:active {
    transform: translateY(1px) scale(0.98);
    background: linear-gradient(135deg, #2d3a6a 0%, #3d4a8a 100%);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3),
                inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.theme-dark .control-button.active {
    background: linear-gradient(135deg, #2d6a3a 0%, #3d8a4a 100%);
    border-color: rgba(255, 255, 255, 0.1);
}

.theme-dark #lightThemeBtn {
    background: linear-gradient(135deg, #6a4a2d 0%, #8a5a3d 100%);
}

.theme-dark #darkThemeBtn {
    background: linear-gradient(135deg, #2d3a6a 0%, #3d4a8a 100%);
}

.theme-dark #downloadButton {
    background: linear-gradient(135deg, #2d6a6a 0%, #3d8a8a 100%);
}

.theme-dark #ramadanBtn {
    background: linear-gradient(135deg, #4a2d6a 0%, #5a3d8a 100%);
}

.schedule-organizer-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 28px;
    background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
    color: white;
    border-radius: 12px;
    font-family: "Segoe UI", "Traditional Arabic", Tahoma, Geneva, Verdana, sans-serif;
    font-size: 1.1em;
    font-weight: 600;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2),
                0 4px 8px rgba(37, 99, 235, 0.1),
                inset 0 2px 4px rgba(255, 255, 255, 0.1);
    text-decoration: none;
    margin: 6px;
    min-width: 160px;
    white-space: nowrap;
    line-height: 1.5;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.schedule-organizer-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
    opacity: 0;
    transition: opacity 0.3s ease;
}

.schedule-organizer-btn:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3),
                0 8px 16px rgba(37, 99, 235, 0.2),
                inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.schedule-organizer-btn:hover::before {
    opacity: 1;
}

.schedule-organizer-btn:active {
    transform: translateY(1px) scale(0.98);
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2),
                inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.schedule-organizer-btn.active {
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2),
                0 4px 8px rgba(220, 38, 38, 0.1),
                inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

/* Dark theme support */
.theme-dark .schedule-organizer-btn {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    box-shadow: 0 2px 4px rgba(30, 64, 175, 0.3),
                0 4px 8px rgba(30, 64, 175, 0.2),
                inset 0 2px 4px rgba(255, 255, 255, 0.05);
}

.theme-dark .schedule-organizer-btn:hover {
    box-shadow: 0 4px 12px rgba(30, 64, 175, 0.4),
                0 8px 16px rgba(30, 64, 175, 0.3),
                inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

.theme-dark .schedule-organizer-btn.active {
    background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%);
}

.lecture-hall {
    display: block;
    background: #e8f5e9;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 1.2em;
    color: #2e7d32;
    margin-top: 5px;
    font-weight: 500;
    border: 1px solid #c8e6c9;
    text-align: center;
}

/* Loading Overlay Styles */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(240, 240, 255, 0.98));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    direction: rtl;
    opacity: 0;
    animation: fadeIn 0.3s ease-out forwards;
    animation-fill-mode: forwards;
    backdrop-filter: blur(5px);
}

.loading-content {
    background: white;
    padding: 30px 40px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    transform: translateY(20px);
    animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    animation-fill-mode: forwards;
    animation-delay: 0.1s;
}

.loading-spinner {
    width: 60px;
    height: 60px;
    border: 4px solid rgba(52, 152, 219, 0.2);
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.loading-text {
    font-size: 20px;
    color: #2c3e50;
    font-weight: 500;
    animation: fadeInOut 2s ease-in-out infinite;
    animation-fill-mode: both;
}

.loading-subtext {
    font-size: 14px;
    color: #7f8c8d;
    text-align: center;
    opacity: 0.8;
    animation: fadeIn 0.5s ease-out forwards;
    animation-delay: 0.3s;
    animation-fill-mode: forwards;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes fadeInOut {
    0%, 100% {
        opacity: 0.8;
        transform: translateY(0);
    }
    50% {
        opacity: 1;
        transform: translateY(-2px);
    }
}

.schedule-summary div {
    font-size: 1.1em;
    padding: 10px 20px;
}

/* Dark Theme Styles */
#newTable.theme-dark {
    background: #1a1a2e;
    border-color: #2e2e4a;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

#newTable.theme-dark thead tr {
    background: linear-gradient(135deg, #1e2a4a 0%, #2d3a6a 100%);
    color: #ffffff;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

#newTable.theme-dark th {
    border-left: 1px solid rgba(255,255,255,0.1);
}

#newTable.theme-dark tbody tr {
    border-bottom: 1px solid #2e2e4a;
    transition: background-color 0.3s ease;
}

#newTable.theme-dark tbody tr:hover {
    background-color: #232338;
}

#newTable.theme-dark td {
    color: #e4e4e7;
}

#newTable.theme-dark .break-cell {
    background: #232338;
    color: #b0b0c0;
    border-color: #2e2e4a;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

#newTable.theme-dark .lecture-cell {
    background: #232338;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border-width: 0 0 0 4px;
}

#newTable.theme-dark .lecture-hall {
    background: #1e2a4a;
    color: #a0b8ff;
    border-color: #2e3f6a;
}

.schedule-summary.theme-dark {
    background: linear-gradient(45deg, #1a1a2e, #232338);
    border-color: #2e2e4a;
    color: #e0e0ff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

/* Dark theme loading overlay */
.theme-dark .loading-overlay {
    background: linear-gradient(135deg, rgba(18, 18, 18, 0.98), rgba(30, 30, 46, 0.98));
}

.theme-dark .loading-content {
    background: #1e1e2e;
    color: #e4e4e7;
}

.theme-dark .loading-text {
    color: #e4e4e7;
}

.theme-dark .loading-subtext {
    color: #a0a0a7;
}

#newTable.theme-dark th.HEADING {
    background: linear-gradient(135deg, #1a2b3f 0%, #2d4258 100%) !important;
    color: #ffffff;
}`);
    
// Global variables
let rows = [];
const days = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس'];
let newTable = {};
let newTableNode;
let on = false;
let ramadanMode = false;
let colors = ["Blue", "Black", "Crimson", "Green", "Grey", "OrangeRed", "Purple", "Red", "SpringGreen", "MediumTurquoise", "Navy", "GoldenRod"];
let subject_colors = {};
let color_index = 0;
let currentTheme = 'light';
let includeSummaryInDownload = false;

// Time conversion functions
function convertToRamadanTime(timeStr) {
    // Split the time range
    const [startTime, endTime] = timeStr.split(' - ');
    
    // Helper function to parse time
    function parseTime(time) {
        const [timeComponent, period] = time.trim().split(' ');
        const [hourStr, minuteStr] = timeComponent.split(':');
        let hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);
        const isPM = period === 'م';
        if (isPM && hour !== 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;
        return { hour, minute, period };
    }

    // Parse start and end times to detect practical sessions
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    
    // Determine if it's a practical session based on duration (80 minutes)
    const duration = ((end.hour - start.hour) * 60 + (end.minute - start.minute));
    const isPractical = Math.abs(duration - 80) <= 5;  // Allow 5-minute flexibility

    // Theoretical lecture time mappings
    const theoreticalMap = {
        '08:00 ص': { start: '09:30 ص', end: '10:05 ص' },
        '09:00 ص': { start: '10:10 ص', end: '10:45 ص' },
        '10:00 ص': { start: '10:50 ص', end: '11:25 ص' },
        '11:00 ص': { start: '11:30 ص', end: '12:05 م' },
        '12:00 م': { start: '12:10 م', end: '12:45 م' },
        '01:00 م': { start: '01:05 م', end: '01:40 م' },
        '02:00 م': { start: '01:45 م', end: '02:20 م' },
        '03:00 م': { start: '02:25 م', end: '03:00 م' },
        '04:00 م': { start: '03:05 م', end: '03:40 م' },
        '05:00 م': { start: '03:45 م', end: '04:20 م' },
        '06:00 م': 'غير مستخدم',
        '07:00 م': { start: '04:40 م', end: '05:15 م' }
    };

    // Practical session time mappings
    const practicalMap = {
        '08:00 ص': { start: '09:30 ص', end: '10:20 ص' },
        '09:30 ص': { start: '10:25 ص', end: '11:15 ص' },
        '11:00 ص': { start: '11:20 ص', end: '12:10 م' },
        '12:30 م': { start: '12:15 م', end: '01:05 م' },
        '02:00 م': { start: '01:30 م', end: '02:20 م' },
        '03:30 م': { start: '02:25 م', end: '03:15 م' },
        '05:00 م': { start: '03:20 م', end: '04:10 م' }
    };

    // Get the mapped time based on session type
    const timeMap = isPractical ? practicalMap : theoreticalMap;
    const mappedTime = timeMap[startTime];

    // Handle "not in use" case
    if (mappedTime === 'غير مستخدم') {
        return 'غير مستخدم';
    }

    // If no mapping found, return original time
    if (!mappedTime) {
        return timeStr;
    }

    return `${mappedTime.start} - ${mappedTime.end}`;
}

// Main initialization function
function waitForElement(selector, callback, maxTries = 100) {
    if (maxTries <= 0) {
        console.log('Element not found: ' + selector);
        return;
    }
    
    const element = document.getElementById(selector);
    if (element) {
        callback(element);
        return;
    }
    
    setTimeout(() => {
        waitForElement(selector, callback, maxTries - 1);
    }, 100);
}

// Remove the DOMContentLoaded listener and replace with this:
function init() {
    waitForElement('scheduleFrm:studScheduleTable', (element) => {
        try {
            initializeTableOrganizer();
        } catch (error) {
            console.error('Error initializing table organizer:', error);
        }
    });
}

// Add error handling to the table check
function initializeTableOrganizer() {
    const originalTableNode = document.getElementById('scheduleFrm:studScheduleTable');
    if (!originalTableNode) {
        console.log('Schedule table not found');
        return;
    }

    // Create control button
    let button = document.createElement('span');
    let cell = document.createElement('td');
    button.classList.add("schedule-organizer-btn");

    if (on) {
        button.classList.add("active");
        button.innerHTML = "الجدول الاصلي";
        originalTableNode.style.display = 'none';   

        if (newTableNode) {
            newTableNode.style.display = null;
        } else {
            getTableInfo();
            getNewTable();
            appendTable();
        }
    } else {
        button.innerHTML = "نظم الجدول";
        if (newTableNode) {
            newTableNode.style.display = 'none';
        }
    }

    cell.appendChild(button);
    const printLink = document.getElementById("scheduleFrm:printLink");
    if (printLink && printLink.parentElement && printLink.parentElement.parentElement) {
        printLink.parentElement.parentElement.appendChild(cell);
    }

    button.onclick = function() {
        if (on) {
            on = false;
            button.classList.remove("active");
            button.innerHTML = "نظم الجدول";
            originalTableNode.style.display = null;
            newTableNode.style.display = 'none';
            document.querySelectorAll('.schedule-summary').forEach(el => el.remove());
        } else {
            on = true;
            button.classList.add("active");
            button.innerHTML = "الجدول الاصلي";
            originalTableNode.style.display = 'none';
            if (newTableNode) {
                newTableNode.style.display = null;
                document.querySelectorAll('.schedule-summary').forEach(el => el.remove());
                let summary = createSummary();
                originalTableNode.insertAdjacentElement('afterend', summary);
            } else {
                if (rows.length == 0) {
                    getTableInfo();
                }
                getNewTable();
                appendTable();
            }
        }
    };
}

// Helper function to get deepest text
function endText(node) {
    if (!node.firstElementChild) {
        return node.innerHTML;
    } else {
        return endText(node.firstElementChild);
    }
}

// Get table information
function getTableInfo() {
    const row1 = document.querySelectorAll(".ROW1");
    const row2 = document.querySelectorAll(".ROW2");
    
    function processRows(nodes) {
        for (let i = 0; i < nodes.length; i++) {
            let row_obj = {};
            let row = nodes[i];
            let cells = row.children;
        
            for (let j = 0; j < cells.length; j++) {
                try {
                    if (cells[j].dataset.th.includes("القاعة")) {
                        let headers = cells[j].dataset.th.split(/\s+/);
                        let lectures = cells[j].firstElementChild.firstElementChild.children;
                        row_obj["محاضرات"] = [];
        
                        for (let k = 0; k < lectures.length; k++) {
                            let data = {};
                            for (let l = 0; l < headers.length; l++) {
                                let currentHeader = headers[l];
                                data[currentHeader] = endText(lectures[k].children[l]).trim();
                                if (data[currentHeader].includes("&nbsp")) {
                                    data[currentHeader] = data[currentHeader].split('; ')[1].trim().split(' ');
                                }
                            }
                            row_obj["محاضرات"].push(data);
                        }
                    } else {
                        let cellName = cells[j].dataset.th.trim();
                        row_obj[cellName] = endText(cells[j]).trim();
                        if (row_obj[cellName].includes("&nbsp")) {
                            row_obj[cellName] = row_obj[cellName].split('&')[0].trim();
                        }
                    }
                } catch(err) {
                    console.log(err);
                }
            }
            rows.push(row_obj);
        }    
    }

    processRows(row1);
    processRows(row2);
}

// Rest of your functions (getNewTable, appendTable, etc.) go here...
// [Previous functions remain mostly unchanged, just remove the styles injection part]

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function getNewTable() {
    try {
        // Populate the new table with the days and their lectures
        for (i in days) {
            newTable[days[i]] = [];
        }
        for (i in rows) {
            let subjectLectures = rows[i]['محاضرات'];
            for (j in subjectLectures) {
                let lecture = subjectLectures[j];
                let time = lecture['الوقت'];
                
                // Convert time to Ramadan schedule if ramadanMode is enabled
                if (ramadanMode) {
                    time = convertToRamadanTime(time);
                }

                function value(t) {
                    let hour = parseInt(t.slice(0, 2), 10);
                    let minutes = parseInt(t.slice(3, 5), 10);
                    let total = (hour * 60) + minutes;

                    if (t.slice(0, 10).includes('م') && hour != 12) {
                        total += 720;
                    }

                    return total;
                }

                function getLectureEndTime(timeStr) {
                    let parts = timeStr.split(' - ');
                    return value(parts[1]);
                }

                function getLectureStartTime(timeStr) {
                    let parts = timeStr.split(' - ');
                    return value(parts[0]);
                }

                for (k in lecture["اليوم"]) {
                    let day = days[parseInt(lecture["اليوم"][k])-1];
                    newTable[day].push({
                        subject: rows[i]['اسم المقرر'],
                        activity: rows[i]['النشاط'],
                        time: time,
                        place: lecture['القاعة'],
                        section: rows[i]['الشعبة'],
                        value: value(time),
                        endTime: getLectureEndTime(time),
                        startTime: getLectureStartTime(time)
                    });
                    if (!(rows[i]['اسم المقرر'] in subject_colors)){
                        subject_colors[rows[i]['اسم المقرر']] = colors[color_index];
                        color_index++;
                    }
                }
            }
        }

        // Sort lectures by time
        for (i in newTable) {
            newTable[i].sort((a, b) => a.startTime - b.startTime);
        }

        // Helper function to insert after index
        function insert_after(element, array, index) {
            let new_array = [];
            for (i = 0; i < array.length; i++) {
                if (i == index+1) {
                    new_array.push(element);
                }
                new_array.push(array[i]);
            }
            return new_array;
        }

        // Add breaks between lectures
        for (d = 0; d < days.length; d++) {
            let edited_day = JSON.parse(JSON.stringify(newTable[days[d]]));
            let uni_day = newTable[days[d]];
            let skip = 0;
            for (l = 0; l < uni_day.length - 1; l++) {
                let currentLectureEnd = uni_day[l].endTime;
                let nextLectureStart = uni_day[l+1].startTime;
                let breakTime = nextLectureStart - currentLectureEnd;
                
                if (breakTime > 10) {  // Only show breaks longer than 10 minutes
                    let break_obj = {
                        subject: null,
                        activity: "break",
                        time: null,
                        place: null,
                        value: breakTime
                    };
                    edited_day = insert_after(break_obj, edited_day, l+skip);
                    skip++;
                }
            }
            newTable[days[d]] = edited_day;
        }
    } catch(err) {
        console.log(err);
    }
}

function getBreakText(hrs) {
    const getBreakIcon = (hrs) => {
        if (hrs >= 2) return '☕';
        if (hrs >= 1) return '⏰';
        return '⌛';
    };
    
    // Round down if extra minutes are 10 or less
    const wholeHours = Math.floor(hrs);
    const extraMinutes = Math.round((hrs - wholeHours) * 60);
    const roundedHours = extraMinutes <= 10 ? wholeHours : hrs;
    
    const icon = getBreakIcon(roundedHours);
    let duration;
    
    if (roundedHours === 2) {
        duration = 'ساعتين';
    } else if (roundedHours > 2) {
        duration = `${Math.floor(roundedHours)} ساعات`;
    } else if (roundedHours >= 1) {
        duration = 'ساعة';
        if (roundedHours > 1) {
            const minutes = Math.round((roundedHours - 1) * 60);
            if (minutes > 10) {  // Only show minutes if more than 10
                duration += ` و ${minutes} دقيقة`;
            }
        }
    } else {
        const minutes = Math.round(roundedHours * 60);
        duration = `${minutes} دقيقة`;
    }
    
    return `<div class="break-content">${icon} ${duration} استراحة</div>`;
}

function getActivityIcon(activity) {
    if (activity.includes('عملي')) return '🔬';
    if (activity.includes('نظري')) return '📚';
    return '📖';
}

function getActivityStyle(activity) {
    if (activity.includes('عملي')) return 'background: #9c27b0; color: white; border-radius: 4px; padding: 2px 6px;';
    if (activity.includes('نظري')) return 'background: #1976d2; color: white; border-radius: 4px; padding: 2px 6px;';
    return 'background: #757575; color: white; border-radius: 4px; padding: 2px 6px;';
}

function downloadAsPNG(event) {
    if (event) {
        event.preventDefault();
    }
    
    //Create and show loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-notification';
    
    loadingOverlay.innerHTML = `
        <div class="notification-content">
            <div class="modern-spinner"></div>
            <div class="notification-text">
                <div class="notification-title">جار تحميل الصورة...</div>
                <div class="notification-subtitle">يرجى الانتظار بينما نقوم بمعالجة الجدول</div>
            </div>
        </div>
    `;
    
    // Add styles for the notification
    const style = document.createElement('style');
    style.textContent = `
        .loading-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${currentTheme === 'dark' ? '#1a1a1a' : '#ffffff'};
            border: 1px solid ${currentTheme === 'dark' ? '#333' : '#e0e0e0'};
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
            backdrop-filter: blur(10px);
        }

        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .notification-text {
            flex: 1;
        }

        .notification-title {
            color: ${currentTheme === 'dark' ? '#ffffff' : '#000000'};
            font-weight: 600;
            margin-bottom: 4px;
        }

        .notification-subtitle {
            color: ${currentTheme === 'dark' ? '#888' : '#666'};
            font-size: 0.9em;
        }

        .modern-spinner {
            width: 24px;
            height: 24px;
            border: 3px solid ${currentTheme === 'dark' ? '#333' : '#f0f0f0'};
            border-top: 3px solid ${currentTheme === 'dark' ? '#4CAF50' : '#2196F3'};
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(loadingOverlay);
    
    const element = document.getElementById('newTable');
    const summary = document.querySelector('.schedule-summary');
    
    // Create filename based on mode
    const filename = ramadanMode ? 'الجدول_الدراسي_توقيت_رمضان.png' : 'الجدول_الدراسي.png';
    
    // Calculate the maximum width needed
    const tableWidth = element.offsetWidth;
    const summaryWidth = summary ? summary.offsetWidth : 0;
    const maxWidth = Math.max(tableWidth, summaryWidth);
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        background: ${currentTheme === 'dark' ? '#1a1a1a' : '#ffffff'};
        direction: rtl;
        width: ${maxWidth}px;
        margin: 0;
        border-radius: 0;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        position: relative;
    `;
    
    // Only include summary if checkbox is checked
    if (includeSummaryInDownload && summary) {
        const summaryClone = summary.cloneNode(true);
        // Remove control buttons from summary clone
        const controlButtons = summaryClone.querySelector('.control-buttons');
        if (controlButtons) controlButtons.remove();
        
        // Remove theme buttons and download button
        summaryClone.querySelectorAll('.control-button, .theme-btn, label').forEach(btn => btn.remove());
        
        // Ensure summary maintains consistent width
        summaryClone.style.cssText = `
            width: ${maxWidth}px;
            margin: 0;
            box-sizing: border-box;
            background: ${currentTheme === 'dark' ? '#1a1a1a' : '#ffffff'};
        `;
        
        wrapper.appendChild(summaryClone);
    }
    
    const tableClone = element.cloneNode(true);
    
    // If in Ramadan mode, find a suitable cell for the indicator
    if (ramadanMode) {
        // Try to find an empty or break cell in the middle of the table
        const rows = tableClone.querySelectorAll('tbody tr');
        let indicatorPlaced = false;
        
        // Calculate middle row
        const middleRowIndex = Math.floor(rows.length / 2);
        
        // First try: Look in the middle row
        if (rows[middleRowIndex]) {
            const cells = rows[middleRowIndex].children;
            for (let cell of cells) {
                if (!cell.innerHTML.trim() || cell.innerHTML.includes('استراحة')) {
                    const ramadanIndicator = `
                        <div style="
                            background: ${currentTheme === 'dark' ? 
                                'linear-gradient(135deg, #2d1f3d 0%, #1a1a2e 100%)' : 
                                'linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%)'
                            };
                            padding: 12px 24px;
                            border-radius: 12px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 12px;
                            font-size: 1.2em;
                            box-shadow: ${currentTheme === 'dark' ? 
                                '0 4px 15px rgba(123, 97, 255, 0.2), 0 0 20px rgba(123, 97, 255, 0.1)' : 
                                '0 4px 15px rgba(156, 39, 176, 0.1), 0 0 20px rgba(156, 39, 176, 0.05)'
                            };
                            margin: 10px auto;
                            width: fit-content;
                            border: 2px solid ${currentTheme === 'dark' ? '#4a3f6b' : '#e1bee7'};
                            animation: ramadanGlow 2s ease-in-out infinite;
                        ">
                            <span style="font-size: 1.4em;">🌙</span>
                            <span style="
                                color: ${currentTheme === 'dark' ? '#fff' : '#000'};
                                font-weight: 500;
                            ">توقيت رمضان</span>
                        </div>
                        <style>
                            @keyframes ramadanGlow {
                                0%, 100% {
                                    box-shadow: ${currentTheme === 'dark' ? 
                                        '0 4px 15px rgba(123, 97, 255, 0.2), 0 0 20px rgba(123, 97, 255, 0.1)' : 
                                        '0 4px 15px rgba(156, 39, 176, 0.1), 0 0 20px rgba(156, 39, 176, 0.05)'
                                    };
                                }
                                50% {
                                    box-shadow: ${currentTheme === 'dark' ? 
                                        '0 4px 20px rgba(123, 97, 255, 0.3), 0 0 30px rgba(123, 97, 255, 0.2)' : 
                                        '0 4px 20px rgba(156, 39, 176, 0.2), 0 0 30px rgba(156, 39, 176, 0.1)'
                                    };
                                }
                            }
                        </style>
                    `;
                    cell.innerHTML = ramadanIndicator;
                    indicatorPlaced = true;
                    break;
                }
            }
        }
        
        // Second try: Look in adjacent rows if middle row didn't work
        if (!indicatorPlaced) {
            for (let offset = 1; offset <= 2; offset++) {
                const rowsToTry = [
                    rows[middleRowIndex - offset],
                    rows[middleRowIndex + offset]
                ];
                
                for (const row of rowsToTry) {
                    if (!row) continue;
                    
                    const cells = row.children;
                    for (let cell of cells) {
                        if (!cell.innerHTML.trim() || cell.innerHTML.includes('استراحة')) {
                            const ramadanIndicator = `
                                <div style="
                                    background: ${currentTheme === 'dark' ? 
                                        'linear-gradient(135deg, #2d1f3d 0%, #1a1a2e 100%)' : 
                                        'linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%)'
                                    };
                                    padding: 12px 24px;
                                    border-radius: 12px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 12px;
                                    font-size: 1.2em;
                                    box-shadow: ${currentTheme === 'dark' ? 
                                        '0 4px 15px rgba(123, 97, 255, 0.2), 0 0 20px rgba(123, 97, 255, 0.1)' : 
                                        '0 4px 15px rgba(156, 39, 176, 0.1), 0 0 20px rgba(156, 39, 176, 0.05)'
                                    };
                                    margin: 10px auto;
                                    width: fit-content;
                                    border: 2px solid ${currentTheme === 'dark' ? '#4a3f6b' : '#e1bee7'};
                                    animation: ramadanGlow 2s ease-in-out infinite;
                                ">
                                    <span style="font-size: 1.4em;">🌙</span>
                                    <span style="
                                        color: ${currentTheme === 'dark' ? '#fff' : '#000'};
                                        font-weight: 500;
                                    ">توقيت رمضان</span>
                                </div>
                                <style>
                                    @keyframes ramadanGlow {
                                        0%, 100% {
                                            box-shadow: ${currentTheme === 'dark' ? 
                                                '0 4px 15px rgba(123, 97, 255, 0.2), 0 0 20px rgba(123, 97, 255, 0.1)' : 
                                                '0 4px 15px rgba(156, 39, 176, 0.1), 0 0 20px rgba(156, 39, 176, 0.05)'
                                            };
                                        }
                                        50% {
                                            box-shadow: ${currentTheme === 'dark' ? 
                                                '0 4px 20px rgba(123, 97, 255, 0.3), 0 0 30px rgba(123, 97, 255, 0.2)' : 
                                                '0 4px 20px rgba(156, 39, 176, 0.2), 0 0 30px rgba(156, 39, 176, 0.1)'
                                            };
                                        }
                                    }
                                </style>
                            `;
                            cell.innerHTML = ramadanIndicator;
                            indicatorPlaced = true;
                            break;
                        }
                    }
                    if (indicatorPlaced) break;
                }
                if (indicatorPlaced) break;
            }
        }
    }
    
    wrapper.appendChild(tableClone);
    document.body.appendChild(wrapper);
    
    // Enhanced style preservation
    const preserveStyles = (element) => {
        const computedStyle = window.getComputedStyle(element);
        const importantStyles = [
            'font-family', 'font-size', 'font-weight', 'color', 'background',
            'padding', 'margin', 'border', 'text-align', 'direction',
            'display', 'width', 'height', 'border-radius', 'box-shadow',
            'grid-template-columns', 'gap', 'background-color', 'border-color',
            'border-width', 'border-style', 'line-height', 'letter-spacing',
            'text-decoration', 'text-transform', 'vertical-align', 'position',
            'top', 'left', 'right', 'bottom', 'z-index', 'opacity',
            'transform', 'transition', 'box-sizing', 'overflow'
        ];
        
        let styleString = importantStyles.map(property => 
            `${property}:${computedStyle.getPropertyValue(property)}`
        ).join(';');
        
        // Preserve existing inline styles
        if (element.style.cssText) {
            styleString += ';' + element.style.cssText;
        }
        
        element.style.cssText = styleString;
        Array.from(element.children).forEach(preserveStyles);
    };
    
    preserveStyles(wrapper);
    
    // Use fixed scale of 7
    const scale = 7;
    
    html2canvas(wrapper, {
        backgroundColor: '#ffffff',
        scale: scale,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: wrapper.offsetWidth,
        height: wrapper.offsetHeight,
        onclone: function(clonedDoc) {
            const clonedWrapper = clonedDoc.body.lastChild;
            preserveStyles(clonedWrapper);
        }
    }).then(canvas => {
        wrapper.remove();
        // Add slide out animation before removing
        loadingOverlay.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            loadingOverlay.remove();
            style.remove();
        }, 300);
        
        try {
            const image = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.download = filename;  // Use the new filename
            link.href = image;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error saving image:', error);
            alert('خطأ في حفظ الصورة. يرجى المحاولة مرة أخرى.');
        }
    }).catch(error => {
        console.error('Error generating PNG:', error);
        // Add slide out animation before removing
        loadingOverlay.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            loadingOverlay.remove();
            style.remove();
        }, 300);
        
        if (error.message.includes('memory')) {
            alert('خطأ: الصورة كبيرة جداً. جاري المحاولة بجودة أقل...');
            setTimeout(() => {
                html2canvas(wrapper, {
                    backgroundColor: '#ffffff',
                    scale: 6,  
                    logging: false,
                    useCORS: true,
                    allowTaint: true,
                    width: wrapper.offsetWidth,
                    height: wrapper.offsetHeight
                }).then(canvas => {
                    const image = canvas.toDataURL('image/png', 1.0);
                    const link = document.createElement('a');
                    link.download = filename;  // Use the new filename
                    link.href = image;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
            }, 100);
        } else {
            alert('حدث خطأ أثناء إنشاء الصورة. يرجى المحاولة مرة أخرى.');
        }
        wrapper.remove();
    });
}

function toggleTheme(theme) {
    currentTheme = theme;
    const table = document.getElementById('newTable');
    if (!table) return;
    
    table.classList.remove('theme-light', 'theme-dark');
    table.classList.add(`theme-${theme}`);
    
    // Update summary section theme
    const summary = document.querySelector('.schedule-summary');
    if (summary) {
        summary.classList.remove('theme-light', 'theme-dark');
        summary.classList.add(`theme-${theme}`);
    }
    
    // Apply theme-specific styles
    if (theme === 'dark') {
        table.style.backgroundColor = '#1a1a1a';
        table.style.color = '#ffffff';
    } else {
        table.style.backgroundColor = '';
        table.style.color = '';
    }
}

function createSummary() {
    let summary = document.createElement('div');
    summary.classList.add('schedule-summary', `theme-${currentTheme}`);
    
    let totalHours = 0;
    let subjectCount = new Set();
    let daysWithClasses = new Set();
    let maxLectures = 0;
    let busyDays = [];
    
    for (let day in newTable) {
        let dayLectures = newTable[day].filter(slot => slot.activity !== "break");
        if (dayLectures.length > 0) {
            daysWithClasses.add(day);
            if (dayLectures.length > maxLectures) {
                maxLectures = dayLectures.length;
                busyDays = [day];
            } else if (dayLectures.length === maxLectures) {
                busyDays.push(day);
            }
        }
        
        dayLectures.forEach(slot => {
            totalHours += (slot.time ? 1 : 0);
            subjectCount.add(slot.subject);
        });
    }
    
    summary.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 4px; background: ${currentTheme === 'dark' ? '#1a2f4d' : '#e3f2fd'}; padding: 8px 16px; border-radius: 8px;">
                <span style="font-weight: 500;">📚 المواد:</span>
                <span>${subjectCount.size}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; background: ${currentTheme === 'dark' ? '#2d1f3d' : '#f3e5f5'}; padding: 8px 16px; border-radius: 8px;">
                <span style="font-weight: 500;">⏰ الساعات:</span>
                <span>${totalHours}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; background: ${currentTheme === 'dark' ? '#1f3d2d' : '#e8f5e9'}; padding: 8px 16px; border-radius: 8px;">
                <span style="font-weight: 500;">📅 أيام الدراسة:</span>
                <span>${daysWithClasses.size}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; background: ${currentTheme === 'dark' ? '#3d2d1f' : '#fff3e0'}; padding: 8px 16px; border-radius: 8px;">
                <span style="font-weight: 500;">📊 اليوم الأكثر:</span>
                <span>${busyDays.join(', ')} (${maxLectures})</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <button class="control-button theme-btn" id="lightThemeBtn" style="background: ${currentTheme === 'light' ? '#4CAF50' : '#666'};">
                    ☀️ فاتح
                </button>
                <button class="control-button theme-btn" id="darkThemeBtn" style="background: ${currentTheme === 'dark' ? '#4CAF50' : '#666'};">
                    🌙 داكن
                </button>
                <button class="control-button" id="ramadanBtn" style="background: ${ramadanMode ? '#4CAF50' : '#666'};">
                    🕌 توقيت رمضان
                </button>
                <div class="download-group" style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: ${currentTheme === 'dark' ? '#1f1f1f' : '#f0f0f0'};
                    padding: 4px;
                    border-radius: 12px;
                    border: 1px solid ${currentTheme === 'dark' ? '#333' : '#e0e0e0'};
                ">
                    <button class="control-button" id="downloadButton" style="margin: 0;">
                        💾 تحميل كصورة
                    </button>
                    <label class="custom-checkbox-container" style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        background: ${currentTheme === 'dark' ? '#2d2d2d' : '#f5f5f5'};
                        padding: 8px 16px;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        margin: 0;
                    ">
                        <div class="checkbox-wrapper" style="position: relative; width: 18px; height: 18px;">
                            <input type="checkbox" id="includeSummaryCheckbox" ${includeSummaryInDownload ? 'checked' : ''} style="
                                position: absolute;
                                opacity: 0;
                                cursor: pointer;
                                height: 0;
                                width: 0;
                            ">
                            <span class="checkmark" style="
                                position: absolute;
                                top: 0;
                                left: 0;
                                height: 18px;
                                width: 18px;
                                background-color: ${currentTheme === 'dark' ? '#404040' : '#ffffff'};
                                border: 2px solid ${currentTheme === 'dark' ? '#666' : '#ccc'};
                                border-radius: 4px;
                                transition: all 0.2s ease;
                            "></span>
                        </div>
                        <span style="color: ${currentTheme === 'dark' ? '#fff' : '#000'}; user-select: none;">تضمين الملخص</span>
                    </label>
                </div>
                <style>
                    .custom-checkbox-container:hover .checkmark {
                        border-color: ${currentTheme === 'dark' ? '#888' : '#4CAF50'} !important;
                    }
                    .custom-checkbox-container input:checked ~ .checkmark {
                        background-color: #4CAF50 !important;
                        border-color: #4CAF50 !important;
                    }
                    .custom-checkbox-container input:checked ~ .checkmark:after {
                        content: '';
                        position: absolute;
                        left: 5px;
                        top: 2px;
                        width: 4px;
                        height: 8px;
                        border: solid white;
                        border-width: 0 2px 2px 0;
                        transform: rotate(45deg);
                    }
                    .custom-checkbox-container:hover {
                        background: ${currentTheme === 'dark' ? '#363636' : '#e8e8e8'} !important;
                    }
                    .download-group:hover {
                        border-color: ${currentTheme === 'dark' ? '#444' : '#ccc'};
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                </style>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const downloadButton = summary.querySelector('#downloadButton');
        const lightThemeBtn = summary.querySelector('#lightThemeBtn');
        const darkThemeBtn = summary.querySelector('#darkThemeBtn');
        const ramadanBtn = summary.querySelector('#ramadanBtn');
        const includeSummaryCheckbox = summary.querySelector('#includeSummaryCheckbox');
        
        if (downloadButton) {
            downloadButton.addEventListener('click', downloadAsPNG);
        }
        
        if (lightThemeBtn) {
            lightThemeBtn.addEventListener('click', () => {
                toggleTheme('light');
                appendTable();
            });
        }
        
        if (darkThemeBtn) {
            darkThemeBtn.addEventListener('click', () => {
                toggleTheme('dark');
                appendTable();
            });
        }
        
        if (ramadanBtn) {
            ramadanBtn.addEventListener('click', () => {
                ramadanMode = !ramadanMode;
                ramadanBtn.style.background = ramadanMode ? '#4CAF50' : '#666';
                getNewTable();
                appendTable();
            });
        }

        if (includeSummaryCheckbox) {
            includeSummaryCheckbox.addEventListener('change', (e) => {
                includeSummaryInDownload = e.target.checked;
            });
        }
    }, 0);
    
    return summary;
}

function appendTable() {
    // Remove any existing organized tables and summaries
    if (newTableNode) {
        newTableNode.remove();
    }
    document.querySelectorAll('.schedule-summary').forEach(el => el.remove());

    const originalTableNode = document.getElementById('scheduleFrm:studScheduleTable');
    let table = document.createElement('table');
    table.id = "newTable";
    table.classList.add('rowFlow', `theme-${currentTheme}`);
    table.width = "100%";
    table.cellPadding = '0';
    table.cellSpacing = '0';
    table.border = '1';
    
    originalTableNode.insertAdjacentElement('afterend', table);

    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody')
    table.appendChild(thead);
    table.appendChild(tbody);

    const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    days.forEach((day, i) => {
        let th = document.createElement('th');
        th.innerHTML = `
            <div class="day-name">${day}</div>
        `;
        th.classList.add('HEADING');
        th.scope = "col";
        thead.appendChild(th);
    });

    function maxDayLength(obj) {
        return Math.max(...Object.values(obj).map(day => day.length));
    }

    const maxLength = maxDayLength(newTable);

    // Create empty rows
    for (let i = 0; i < maxLength; i++) {
        let tr = document.createElement('tr');
        tbody.appendChild(tr);
        for (let j = 0; j < days.length; j++) {
            let td = document.createElement('td');
            tr.appendChild(td);
        }
    }

    let trs = tbody.children;
    days.forEach((day, i) => {
        let currentDay = newTable[day];
        currentDay.forEach((lecture, j) => {
            if (lecture.activity == "break") {
                let hrs = lecture.value/60;
                trs[j].children[i].innerHTML = `<div class="break-cell">${getBreakText(hrs)}</div>`;
            } else {
                let subjectColor = subject_colors[lecture.subject];
                // Adjust color for dark mode if needed
                if (currentTheme === 'dark') {
                    // Make the color more visible in dark mode
                    subjectColor = adjustColorForDarkMode(subjectColor);
                }
                
                let activityStyle = getActivityStyle(lecture.activity);
                if (currentTheme === 'dark') {
                    activityStyle = activityStyle.replace('background: #9c27b0', 'background: #4a1259')
                        .replace('background: #1976d2', 'background: #1a3f6b')
                        .replace('background: #757575', 'background: #3d3d3d');
                }
                
                let content = `<div style="margin-bottom: 3px;">
                    <strong style="font-size: 1.1em; color: ${currentTheme === 'dark' ? '#e4e4e7' : 'inherit'}">${lecture.subject}</strong>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                        <div style="text-align: right;">
                            <div style="${activityStyle}">
                                ${getActivityIcon(lecture.activity)} ${lecture.activity}
                            </div>
                            <div style="background: ${currentTheme === 'dark' ? '#1a2f3a' : '#e8eaf6'}; border-radius: 6px; padding: 4px 8px; color: ${currentTheme === 'dark' ? '#8ebbff' : '#283593'}; display: inline-block; margin-top: 5px;">
                                🔢 الشعبة: ${lecture.section}
                            </div>
                        </div>
                        <div style="text-align: left;">
                            <div style="font-weight: bold; color: ${currentTheme === 'dark' ? '#8ebbff' : '#1a237e'}">${lecture.time}</div>
                            <div class="lecture-hall">🏛️ ${lecture.place}</div>
                        </div>
                    </div>
                 </div>`;
                     
                trs[j].children[i].innerHTML = `<div class="lecture-cell" style="border-left-color: ${subjectColor};">${content}</div>`;
            }
        });
    });

    newTableNode = table;
    let summary = createSummary();
    originalTableNode.insertAdjacentElement('afterend', summary);
}

// Helper function to adjust colors for dark mode
function adjustColorForDarkMode(color) {
    // Convert color to RGB if it's a named color
    let tempDiv = document.createElement('div');
    tempDiv.style.color = color;
    document.body.appendChild(tempDiv);
    let rgbColor = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    
    // Parse RGB values
    let rgb = rgbColor.match(/\d+/g).map(Number);
    
    // Calculate luminance
    let luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    
    // For very dark colors (especially black or near-black)
    if (luminance < 0.2) {
        // Convert to a light gray-blue tint
        return `rgb(176, 196, 222)`; // Light steel blue
    }
    
    // For dark colors
    if (luminance < 0.5) {
        // Increase brightness more significantly
        let adjustedRgb = rgb.map(value => {
            return Math.min(255, value + 80);
        });
        return `rgb(${adjustedRgb.join(',')})`;
    }
    
    // For already light colors, just slight adjustment
    let adjustedRgb = rgb.map(value => {
        return Math.min(255, value + 40);
    });
    
    return `rgb(${adjustedRgb.join(',')})`;
}
}})();