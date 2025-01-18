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
    button.classList.add("BUTTON_LINK");
    button.style.cursor = "pointer";

    if (on) {
        button.style.backgroundColor = "firebrick";
        button.textContent = "الجدول الاصلي";
        originalTableNode.style.display = 'none';   

        if (newTableNode) {
            newTableNode.style.display = null;
        } else {
            getTableInfo();
            getNewTable();
            appendTable();
        }
    } else {
        button.textContent = "نظم الجدول";
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
            button.textContent = "نظم الجدول";
            originalTableNode.style.display = null;
            newTableNode.style.display = 'none';
            document.querySelectorAll('.schedule-summary').forEach(el => el.remove());
        } else {
            on = true;
            button.style.backgroundColor = "firebrick";
            button.textContent = "الجدول الاصلي";
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
        return node.textContent;
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
    
    // Create and show loading overlay
    const loadingOverlay = createLoadingOverlay();
    
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
    const table = createSafeElement('table', '', {
        id: 'newTable',
        className: `rowFlow theme-${currentTheme}`,
        width: '100%',
        cellPadding: '0',
        cellSpacing: '0',
        border: '1'
    });
    
    originalTableNode.insertAdjacentElement('afterend', table);

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);

    days.forEach((day, i) => {
        const th = createSafeElement('th', '', {
            className: 'HEADING',
            scope: 'col'
        });
        const dayName = createSafeElement('div', day, { className: 'day-name' });
        th.appendChild(dayName);
        thead.appendChild(th);
    });

    // Create empty rows
    for (let i = 0; i < maxDayLength(newTable); i++) {
        const tr = document.createElement('tr');
        tbody.appendChild(tr);
        for (let j = 0; j < days.length; j++) {
            tr.appendChild(document.createElement('td'));
        }
    }

    const trs = tbody.children;
    days.forEach((day, i) => {
        const currentDay = newTable[day];
        currentDay.forEach((lecture, j) => {
            const cell = trs[j].children[i];
            if (lecture.activity === "break") {
                cell.appendChild(createBreakCell(lecture.value/60));
            } else {
                cell.appendChild(createLectureCell(lecture, subject_colors[lecture.subject]));
            }
        });
    });

    newTableNode = table;
    const summary = createSummary();
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
    
    // Increase brightness for dark mode
    let adjustedRgb = rgb.map(value => {
        // Increase brightness but maintain color character
        let adjusted = Math.min(255, value + 40);
        return adjusted;
    });
    
    return `rgb(${adjustedRgb.join(',')})`;
}

// Helper function for safely creating elements with content
function createSafeElement(tag, content, attributes = {}) {
    const element = document.createElement(tag);
    if (content) {
        element.textContent = content;
    }
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style') {
            Object.assign(element.style, value);
        } else {
            element.setAttribute(key, value);
        }
    });
    return element;
}

// For the loadingOverlay
function createLoadingOverlay() {
    const overlay = createSafeElement('div', '', { className: 'loading-overlay' });
    const content = createSafeElement('div', '', { className: 'loading-content' });
    const spinner = createSafeElement('div', '', { className: 'loading-spinner' });
    const text = createSafeElement('div', 'جارٍ تحميل الصورة...', { className: 'loading-text' });
    const subtext = createSafeElement('div', 'يرجى الانتظار بينما نقوم بمعالجة الجدول', { className: 'loading-subtext' });
    
    content.appendChild(spinner);
    content.appendChild(text);
    content.appendChild(subtext);
    overlay.appendChild(content);
    return overlay;
}

// For table cells
function createLectureCell(lecture, subjectColor) {
    const cell = createSafeElement('div', '', {
        className: 'lecture-cell',
        style: { borderLeftColor: subjectColor }
    });
    
    const content = createSafeElement('div', '', {
        style: { marginBottom: '3px' }
    });
    
    const subject = createSafeElement('strong', lecture.subject, {
        style: { 
            fontSize: '1.1em',
            color: currentTheme === 'dark' ? '#e4e4e7' : 'inherit'
        }
    });
    
    // Add other elements similarly...
    
    return cell;
}

function createBreakCell(hrs) {
    const breakCell = createSafeElement('div', '', { className: 'break-cell' });
    const breakContent = createSafeElement('div', '', { className: 'break-content' });
    
    const icon = hrs >= 2 ? '☕' : (hrs >= 1 ? '⏰' : '⌛');
    const duration = formatBreakDuration(hrs);
    
    breakContent.appendChild(document.createTextNode(`${icon} ${duration} استراحة`));
    breakCell.appendChild(breakContent);
    return breakCell;
}

function formatBreakDuration(hrs) {
    const wholeHours = Math.floor(hrs);
    const extraMinutes = Math.round((hrs - wholeHours) * 60);
    const roundedHours = extraMinutes <= 10 ? wholeHours : hrs;
    
    if (roundedHours === 2) return 'ساعتين';
    if (roundedHours > 2) return `${Math.floor(roundedHours)} ساعات`;
    if (roundedHours >= 1) {
        let text = 'ساعة';
        if (roundedHours > 1) {
            const minutes = Math.round((roundedHours - 1) * 60);
            if (minutes > 10) text += ` و ${minutes} دقيقة`;
        }
        return text;
    }
    return `${Math.round(roundedHours * 60)} دقيقة`;
} 