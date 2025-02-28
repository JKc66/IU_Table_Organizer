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
let githubToken = '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';

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

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
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

    // Check if mobile device
    if (isMobileDevice()) {
        // For mobile: Add mobile buttons to main content
        const mainContent = document.querySelector('.main_content.col-md-12');
        if (mainContent) {
            const mobileButtons = createMobileButtons();
            mainContent.insertBefore(mobileButtons, mainContent.firstChild);
        }
        return; // Don't add the regular organize button for mobile
    }

    // Desktop version continues with existing code
    let button = document.createElement('span');
    let cell = document.createElement('td');
    button.classList.add("schedule-organizer-btn");

    // Set initial button state
    button.innerHTML = on ? "الجدول الاصلي" : "نظم الجدول";
    if (on) {
        button.classList.add("active");
        originalTableNode.style.display = 'none';
        if (newTableNode) {
            newTableNode.style.display = null;
        } else {
            getTableInfo();
            getNewTable();
            appendTable();
        }
    } else {
        if (newTableNode) {
            newTableNode.style.display = 'none';
        }
    }

    // Append button to table
    cell.appendChild(button);
    const printLink = document.getElementById("scheduleFrm:printLink");
    if (printLink && printLink.parentElement && printLink.parentElement.parentElement) {
        printLink.parentElement.parentElement.appendChild(cell);
    } else {
        // Fallback: append to the table directly if printLink is not found
        const firstRow = originalTableNode.querySelector('tr');
        if (firstRow) {
            firstRow.appendChild(cell);
        }
    }

    // Add click handler
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
        
        // Update button states
        const lightThemeBtn = summary.querySelector('#lightThemeBtn');
        const darkThemeBtn = summary.querySelector('#darkThemeBtn');
        
        if (lightThemeBtn) {
            lightThemeBtn.classList.toggle('active', theme === 'light');
        }
        if (darkThemeBtn) {
            darkThemeBtn.classList.toggle('active', theme === 'dark');
        }
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

    // Desktop UI
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
            <div class="control-buttons">
                <button class="control-button theme-btn ${currentTheme === 'light' ? 'active' : ''}" id="lightThemeBtn">
                    ☀️ فاتح
                </button>
                <button class="control-button theme-btn ${currentTheme === 'dark' ? 'active' : ''}" id="darkThemeBtn">
                    🌙 داكن
                </button>
                <button class="control-button ${ramadanMode ? 'active' : ''}" id="ramadanBtn">
                    🕌 توقيت رمضان
                </button>
                <div class="download-group">
                    <button class="control-button" id="downloadButton">
                        💾 تحميل كصورة
                    </button>
                    <label class="custom-checkbox-container">
                        <div class="checkbox-wrapper">
                            <input type="checkbox" id="includeSummaryCheckbox" ${includeSummaryInDownload ? 'checked' : ''}>
                            <span class="checkmark"></span>
                        </div>
                        <span>تضمين الملخص</span>
                    </label>
                </div>
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
                ramadanBtn.classList.toggle('active');
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
    
    // Continue with normal table creation
    let table = document.createElement('table');
    table.id = "newTable";
    table.classList.add('rowFlow', `theme-${currentTheme}`);
    table.cellPadding = '0';
    table.cellSpacing = '0';
    table.border = '1';
    
    // Create a wrapper div for the table
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-wrapper';
    
    originalTableNode.insertAdjacentElement('afterend', tableWrapper);
    tableWrapper.appendChild(table);

    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');
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
                
                let content = `<div style="margin-bottom: 2px;">
                    <strong style="font-size: 1.05em; color: ${currentTheme === 'dark' ? '#e4e4e7' : 'inherit'}">${lecture.subject}</strong>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 6px;">
                        <div style="text-align: right;">
                            <div style="${activityStyle}">
                                ${getActivityIcon(lecture.activity)} ${lecture.activity}
                            </div>
                            <div style="background: ${currentTheme === 'dark' ? '#1a2f3a' : '#e8eaf6'}; border-radius: 6px; padding: 3px 4px; color: ${currentTheme === 'dark' ? '#8ebbff' : '#283593'}; display: inline-block; margin-top: 3px;">
                                🔢 الشعبة: ${lecture.section}
                            </div>
                        </div>
                        <div style="text-align: left;">
                            <div style="font-weight: bold; color: ${currentTheme === 'dark' ? '#8ebbff' : '#1a237e'}; white-space: nowrap; font-size: 0.95em;">${formatTimeDisplay(lecture.time)}</div>
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
    summary.style.cssText = `
        width: 100%;
        max-width: 1100px;
        margin: 5px auto;
        overflow-x: auto;
        display: block;
    `;
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

// Add this helper function before appendTable()
function formatTimeDisplay(timeStr) {
    // Split the time range
    const [startTime, endTime] = timeStr.split(' - ');
    
    // Split each time into components
    const [startTimeComponent, startPeriod] = startTime.trim().split(' ');
    const [endTimeComponent, endPeriod] = endTime.trim().split(' ');
    
    // If both periods are the same, show it only once at the end
    if (startPeriod === endPeriod) {
        return `${startTimeComponent} - ${endTimeComponent} ${startPeriod}`;
    }
    
    // If periods are different, keep both but make it more compact
    return `${startTimeComponent}${startPeriod} - ${endTimeComponent}${endPeriod}`;
}

// Add mobile detection function
function isMobileDevice() {
    return (window.innerWidth <= 768);
}

// Add notification function
function showNotification(title, subtitle, type = 'success', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'loading-notification';
    
    // Set icon based on type
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
    
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">${icon}</div>
            <div class="notification-text">
                <div class="notification-title">${title}</div>
                ${subtitle ? `<div class="notification-subtitle">${subtitle}</div>` : ''}
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

        .notification-icon {
            font-size: 24px;
            line-height: 1;
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
    document.body.appendChild(notification);
    
    // Remove notification after duration
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 300);
    }, duration);
}

// Function to delete a gist
async function deleteGist(gistId) {
    try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.status === 204) {
            console.log(`Gist ${gistId} deleted successfully`);
        } else {
            console.log(`Failed to delete gist ${gistId}`);
        }
    } catch (error) {
        console.log(`Error deleting gist: ${error}`);
    }
}

// Update copyScheduleJSON function
async function copyScheduleJSON() {
    try {
        if (rows.length === 0) {
            getTableInfo();
            getNewTable();
        }

        // Create a cleaned version of the schedule without breaks and time values
        const cleanedSchedule = {};
        for (const day in newTable) {
            cleanedSchedule[day] = newTable[day]
                .filter(lecture => lecture.activity !== "break")
                .map(lecture => ({
                    subject: lecture.subject,
                    activity: lecture.activity,
                    time: lecture.time,
                    place: lecture.place,
                    section: lecture.section
                }));
        }

        // Create the final format
        const formattedData = {
            subjects: Array.from(new Set(rows.map(row => row['اسم المقرر']).filter(Boolean))),
            days: days,
            schedule: cleanedSchedule
        };

        const scheduleData = JSON.stringify(formattedData);

        // First, try to create a gist
        try {
            if (!githubToken) {
                throw new Error('No GitHub token set');
            }

            const gistResponse = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    public: true,
                    files: {
                        'iu_schedule_app.json': {
                            content: scheduleData
                        }
                    },
                    description: 'IU Table Organizer Schedule Data (Auto-deletes in 10 minutes)'
                })
            });

            if (!gistResponse.ok) {
                const errorData = await gistResponse.json();
                throw new Error(`Gist creation failed: ${gistResponse.status}, ${JSON.stringify(errorData)}`);
            }

            const gist = await gistResponse.json();

            // Schedule gist deletion after 10 minutes
            setTimeout(() => deleteGist(gist.id), 10 * 60 * 1000);

            // Also copy to clipboard as backup
            copyToClipboard(scheduleData);
            
            // Open the website with the gist ID
            const baseUrl = 'https://jkc66.github.io/IU_Table_Organizer/cptable.html';
            window.open(`${baseUrl}?gist=${gist.id}`, '_blank');
            showNotification('تم فتح منظم الجدول! ✨', 'تم نسخ البيانات ونقلها تلقائياً', 'success');

        } catch (gistError) {
            // If gist creation fails, fall back to copy method
            fallbackCopy(scheduleData);
        }

    } catch (error) {
        showNotification('حدث خطأ في معالجة الجدول ❌', 'جاري المحاولة بطريقة بديلة...', 'error');
        fallbackCopy(scheduleData);
    }
}

// New helper function for clipboard operations
function copyToClipboard(text) {
    // Try the modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Clipboard API: Copy successful');
                return true;
            })
            .catch(err => {
                console.error('Clipboard API failed:', err);
                return fallbackCopyToClipboard(text);
            });
    } else {
        return fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        const success = document.execCommand('copy');
        console.log('Fallback copy success:', success);
        return success;
    } catch (e) {
        console.error('Fallback copy failed:', e);
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
}

// Update fallback copy to use new helper
function fallbackCopy(scheduleData) {
    console.log('Entering fallback copy with data length:', scheduleData.length);
    const success = copyToClipboard(scheduleData);
    
    if (success) {
        showNotification('تم نسخ البيانات بنجاح! ✨', 'يرجى فتح موقع منظم الجدول ولصق البيانات هناك', 'success');
    } else {
        showNotification('حدث خطأ أثناء النسخ ❌', 'يرجى المحاولة مرة أخرى لاحقاً', 'error');
    }
    
    // Open the website in a new tab
    window.open('https://jkc66.github.io/IU_Table_Organizer/cptable.html', '_blank');
}

// Add function to create mobile buttons
function createMobileButtons() {
    const mobileButtonsContainer = document.createElement('div');
    mobileButtonsContainer.className = 'mobile-buttons-container';
    mobileButtonsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 15px;
        background: #f5f5f5;
        border-radius: 12px;
        margin: 10px 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;

    // Create View Table button
    const viewTableButton = document.createElement('button');
    viewTableButton.className = 'mobile-action-button';
    viewTableButton.innerHTML = '📱 فتح منظم الجدول';
    viewTableButton.onclick = copyScheduleJSON;  // This will now handle both copying and redirecting

    mobileButtonsContainer.appendChild(viewTableButton);

    return mobileButtonsContainer;
}

