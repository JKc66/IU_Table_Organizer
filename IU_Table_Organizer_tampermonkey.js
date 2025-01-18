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
// @version 3.0
// @icon https://www.google.com/s2/favicons?domain=sso.iu.edu.sa
// @namespace https://greasyfork.org/users/814159
// @icon https://icons.iconarchive.com/icons/fatcow/farm-fresh/32/table-icon.png
// @license Mozilla Public License 2.0
// @grant GM_addStyle
// @require https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js
// @downloadURL https://update.greasyfork.org/scripts/432219/iu-table-organizer.user.js
// @updateURL https://update.greasyfork.org/scripts/432219/iu-table-organizer.meta.js

    // ==/UserScript==



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

        // Helper function to format time
        function formatTime(hour, minute) {
            let period = 'ص';
            if (hour >= 12) {
                period = 'م';
                if (hour > 12) hour -= 12;
            }
            if (hour === 0) hour = 12;
            return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
        }

        // Parse start and end times
        const start = parseTime(startTime);
        const end = parseTime(endTime);
        
        // Calculate duration in minutes
        const duration = ((end.hour - start.hour) * 60 + (end.minute - start.minute));
        
        // Determine if it's a practical session based on duration (80 minutes)
        const isPractical = Math.abs(duration - 80) <= 5;  // Allow 5-minute flexibility

        // Theoretical lecture time mappings (exact start times)
        const theoreticalMap = {
            '08:00 ص': { hour: 10, minute: 0 },   // 10:00 - 10:35
            '09:00 ص': { hour: 10, minute: 35 },  // 10:35 - 11:10
            '10:00 ص': { hour: 11, minute: 15 },  // 11:15 - 11:50
            '11:00 ص': { hour: 11, minute: 50 },  // 11:50 - 12:25
            '12:00 م': { hour: 12, minute: 30 },  // 12:30 - 13:05
            '01:00 م': { hour: 13, minute: 30 },  // 13:30 - 14:05
            '02:00 م': { hour: 14, minute: 5 },   // 14:05 - 14:40
            '03:00 م': { hour: 14, minute: 45 },  // 14:45 - 15:20
            '04:00 م': { hour: 15, minute: 20 },  // 15:20 - 15:55
            '05:00 م': { hour: 15, minute: 55 },  // 15:55 - 16:30
            '06:00 م': { hour: 16, minute: 50 },  // 16:50 - 17:25
            '07:00 م': { hour: 17, minute: 25 },  // 17:25 - 18:00
            '08:00 م': null                       // Not in use
        };

        // Practical session time mappings (exact start times)
        const practicalMap = {
            '08:00 ص': { hour: 10, minute: 0 },   // 10:00 - 10:50
            '09:30 ص': { hour: 11, minute: 0 },   // 11:00 - 11:50
            '11:00 ص': { hour: 12, minute: 0 },   // 12:00 - 12:50
            '12:30 م': { hour: 13, minute: 10 },  // 13:10 - 14:00
            '02:00 م': { hour: 14, minute: 10 },  // 14:10 - 15:00
            '03:30 م': { hour: 15, minute: 10 },  // 15:10 - 16:00
            '05:00 م': { hour: 16, minute: 20 }   // 16:20 - 17:10
        };

        // Get the mapped time based on session type
        const timeMap = isPractical ? practicalMap : theoreticalMap;
        const mappedTime = timeMap[startTime];

        // Handle "not in use" case for evening theoretical lectures
        if (!mappedTime) {
            return 'غير مستخدم';
        }

        // Get exact session duration
        const durationInRamadan = isPractical ? 50 : 35;

        // Calculate end time with exact duration
        let endHour = mappedTime.hour;
        let endMinute = mappedTime.minute + durationInRamadan;

        // Adjust for hour overflow
        if (endMinute >= 60) {
            endHour += Math.floor(endMinute / 60);
            endMinute = endMinute % 60;
        }

        // Format times
        const convertedStart = formatTime(mappedTime.hour, mappedTime.minute);
        const convertedEnd = formatTime(endHour, endMinute);

        return `${convertedStart} - ${convertedEnd}`;
    }
    
    // Inject CSS styles from styles.css
    GM_addStyle(`
    #newTable {
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
        font-feature-settings: "kern", "liga", "clig", "calt", "arab";
        -webkit-font-feature-settings: "kern", "liga", "clig", "calt", "arab";
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
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: #1a237e;
        color: white;
        font-size: 14px;
    }
    
    .control-button:hover {
        background: #0d47a1;
        transform: translateY(-1px);
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
        background: #121212;
        border-color: #2e2e2e;
    }
    
    #newTable.theme-dark thead tr {
        background: linear-gradient(135deg, #1a2b3f 0%, #2d4258 100%);
        color: #ffffff;
        box-shadow: none;
        height: 65px;
        font-family: "Traditional Arabic", "Segoe UI", "Arial", sans-serif;
        direction: rtl;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    
    #newTable.theme-dark th {
        border-left: 1px solid rgba(255,255,255,0.08);
        color: #ffffff;
        position: relative;
        border-bottom: none;
    }
    
    #newTable.theme-dark th::after {
        background: rgba(255,255,255,0.08);
        height: 2px;
    }
    
    #newTable.theme-dark th .day-name {
        color: #ffffff !important;
        text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
        font-size: 2.1em;
        font-weight: 500;
        letter-spacing: 0;
        text-align: center;
        direction: rtl;
        font-family: "Traditional Arabic", "Segoe UI", "Arial", sans-serif;
        font-feature-settings: "kern" 1, "liga" 1, "clig" 1, "calt" 1, "arab" 1, "rlig" 1;
        -webkit-font-feature-settings: "kern" 1, "liga" 1, "clig" 1, "calt" 1, "arab" 1, "rlig" 1;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        word-spacing: normal;
    }
    
    #newTable.theme-dark th .day-name-en {
        color: rgba(255, 255, 255, 0.9);
        text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
        opacity: 0.9;
    }
    
    #newTable.theme-dark th:hover::after {
        transform: scaleX(1);
        background: rgba(255,255,255,0.15);
    }
    
    #newTable.theme-dark tbody tr {
        border-bottom: 1px solid #2e2e2e;
    }
    
    #newTable.theme-dark tbody tr:hover {
        background-color: #1e1e2e;
    }
    
    #newTable.theme-dark td {
        color: #e4e4e7;
    }
    
    #newTable.theme-dark .break-cell {
        background: #1e1e2e;
        color: #a0a0a7;
        border-color: #2e2e2e;
    }
    
    #newTable.theme-dark .lecture-cell {
        background: #1e1e2e;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    #newTable.theme-dark .lecture-hall {
        background: #1a2f3a;
        color: #8ebbff;
        border-color: #2e3f4a;
    }
    
    .schedule-summary.theme-dark {
        background: linear-gradient(45deg, #121212, #1e1e2e);
        border-color: #2e2e2e;
        color: #e4e4e7;
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
    
    /* Dark theme control buttons */
    .theme-dark .control-button {
        background: #2e3440;
        color: #e4e4e7;
    }
    
    .theme-dark .control-button:hover {
        background: #3b4252;
    }
    
    #newTable.theme-dark th.HEADING {
        background: linear-gradient(135deg, #1a2b3f 0%, #2d4258 100%) !important;
        color: #ffffff;
    }
    `);
    
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
    
    function init() {
        waitForElement('scheduleFrm:studScheduleTable', (element) => {
            try {
                initializeTableOrganizer();
            } catch (error) {
                console.error('Error initializing table organizer:', error);
            }
        });
    }
    
    function initializeTableOrganizer() {
        const originalTableNode = document.getElementById('scheduleFrm:studScheduleTable');
        if (!originalTableNode) {
            console.log('Schedule table not found');
            return;
        }
    
        // Create control button
        let button = document.createElement('span');
        let cell = document.createElement('td');
        button.classList.add("BUTTON_LINK");
        button.style.cursor = "pointer";
    
        if (on) {
            button.style.backgroundColor = "firebrick";
            button.innerHTML = "الجدول&nbspالاصلي";
            originalTableNode.style.display = 'none';   
    
            if (newTableNode) {
                newTableNode.style.display = null;
            } else {
                getTableInfo();
                getNewTable();
                appendTable();
            }
        } else {
            button.innerHTML = "نظم&nbspالجدول";
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
                button.style.backgroundColor = null;
                button.innerHTML = "نظم&nbspالجدول";
                originalTableNode.style.display = null;
                newTableNode.style.display = 'none';
                document.querySelectorAll('.schedule-summary').forEach(el => el.remove());
            } else {
                on = true;
                button.style.backgroundColor = "firebrick";
                button.innerHTML = "الجدول&nbspالاصلي";
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
    
    function endText(node) {
        if (!node.firstElementChild) {
            return node.innerHTML;
        } else {
            return endText(node.firstElementChild);
        }
    }
    
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
        
        // Create and show loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">جارٍ تحميل الصورة...</div>
                <div class="loading-subtext">يرجى الانتظار بينما نقوم بمعالجة الجدول</div>
            </div>
        `;
        
        document.body.appendChild(loadingOverlay);
        
        const element = document.getElementById('newTable');
        const summary = document.querySelector('.schedule-summary');
        
        // Calculate the maximum width needed
        const tableWidth = element.offsetWidth;
        const summaryWidth = summary.offsetWidth;
        const maxWidth = Math.max(tableWidth, summaryWidth);
        
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            background: ${currentTheme === 'dark' ? '#1a1a1a' : '#ffffff'};
            padding: 10px;
            direction: rtl;
            width: ${maxWidth}px;
            margin: 0 auto;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        `;
        
        const summaryClone = summary.cloneNode(true);
        const tableClone = element.cloneNode(true);
        
        // Remove control buttons from summary clone
        const controlButtons = summaryClone.querySelector('.control-buttons');
        if (controlButtons) controlButtons.remove();
        
        // Remove theme buttons and download button
        summaryClone.querySelectorAll('.control-button, .theme-btn').forEach(btn => btn.remove());
        
        // Ensure summary maintains consistent width
        summaryClone.style.cssText = `
            width: ${maxWidth}px;
            margin: 0;
            box-sizing: border-box;
            background: ${currentTheme === 'dark' ? '#1a1a1a' : '#ffffff'};
        `;
        
        // Ensure table maintains consistent width
        tableClone.style.cssText = `
            width: ${maxWidth}px;
            margin: 0;
            box-sizing: border-box;
            background: ${currentTheme === 'dark' ? '#1a1a1a' : '#ffffff'};
        `;
        
        wrapper.appendChild(summaryClone);
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
            backgroundColor: currentTheme === 'dark' ? '#1a1a1a' : '#ffffff',
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
            loadingOverlay.remove();
            
            try {
                const image = canvas.toDataURL('image/png', 1.0);
                const link = document.createElement('a');
                link.download = `الجدول الدراسي.png`;
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
            loadingOverlay.remove();
            
            if (error.message.includes('memory')) {
                alert('خطأ: الصورة كبيرة جداً. جاري المحاولة بجودة أقل...');
                setTimeout(() => {
                    html2canvas(wrapper, {
                        backgroundColor: currentTheme === 'dark' ? '#1a1a1a' : '#ffffff',
                        scale: 6,  
                        logging: false,
                        useCORS: true,
                        allowTaint: true,
                        width: wrapper.offsetWidth,
                        height: wrapper.offsetHeight
                    }).then(canvas => {
                        const image = canvas.toDataURL('image/png', 1.0);
                        const link = document.createElement('a');
                        link.download = `الجدول الدراسي.png`;
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
    
    function adjustColorForDarkMode(color) {
        // Convert color to RGB if it's a named color
        let tempDiv = document.createElement('div');
        tempDiv.style.color = color;
        document.body.appendChild(tempDiv);
        let rgbColor = window.getComputedStyle(tempDiv).color;
        document.body.removeChild(tempDiv);
        
        // Parse RGB values
        let rgb = rgbColor.match(/\d+/g).map(Number);
        
        // Increase brightness for dark mode
        let adjustedRgb = rgb.map(value => {
            // Increase brightness but maintain color character
            let adjusted = Math.min(255, value + 40);
            return adjusted;
        });
        
        return `rgb(${adjustedRgb.join(',')})`;
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
                <div style="display: flex; gap: 8px;">
                    <button class="control-button theme-btn" id="lightThemeBtn" style="background: ${currentTheme === 'light' ? '#4CAF50' : '#666'};">
                        ☀️ فاتح
                    </button>
                    <button class="control-button theme-btn" id="darkThemeBtn" style="background: ${currentTheme === 'dark' ? '#4CAF50' : '#666'};">
                        🌙 داكن
                    </button>
                    <button class="control-button" id="ramadanBtn" style="background: ${ramadanMode ? '#4CAF50' : '#666'};">
                        🌙 توقيت رمضان
                    </button>
                    <button class="control-button" id="downloadButton">
                        💾 تحميل كصورة
                    </button>
                </div>
            </div>
        `;
    
        setTimeout(() => {
            const downloadButton = summary.querySelector('#downloadButton');
            const lightThemeBtn = summary.querySelector('#lightThemeBtn');
            const darkThemeBtn = summary.querySelector('#darkThemeBtn');
            const ramadanBtn = summary.querySelector('#ramadanBtn');
    
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
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }