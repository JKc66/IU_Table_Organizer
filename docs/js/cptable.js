// Global Variables
let newTable = {};
let newTableNode;
let ramadanMode = false;
let currentTheme = 'light';
let includeSummaryInDownload = false;
let colors = ["Blue", "Black", "Crimson", "Green", "Grey", "OrangeRed", "Purple", "Red", "SpringGreen", "MediumTurquoise", "Navy", "GoldenRod"];
let subject_colors = {};
let color_index = 0;

// Notification function
function showNotification(message, type = 'success', isRamadan = false) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification-toast');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}${isRamadan ? ' ramadan' : ''}`;
    
    // Icon based on notification type and Ramadan mode
    let icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'info') icon = 'ℹ️';
    if (isRamadan) {
        if (type === 'success') icon = '🌙';
        if (type === 'info') icon = '🕌';
    }

    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
            ${isRamadan ? '<span class="notification-decoration"></span>' : ''}
        </div>
    `;

    // Add styles for the notification
    const style = document.createElement('style');
    style.textContent = `
        .notification-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            background: ${currentTheme === 'dark' ? '#1a1a1a' : '#ffffff'};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease-out;
            border: 1px solid;
            direction: rtl;
        }

        .notification-toast.ramadan {
            background: ${currentTheme === 'dark' ? 
                'linear-gradient(135deg, #1a1a1a 0%, #2d1f3d 100%)' : 
                'linear-gradient(135deg, #ffffff 0%, #f3e5f5 100%)'};
            border-width: 2px;
            border-image: linear-gradient(45deg, #9c27b0, #673ab7) 1;
            box-shadow: 0 4px 20px rgba(156, 39, 176, 0.2);
        }

        .notification-toast.success {
            border-color: #4caf50;
            color: ${currentTheme === 'dark' ? '#81c784' : '#2e7d32'};
        }

        .notification-toast.error {
            border-color: #f44336;
            color: ${currentTheme === 'dark' ? '#e57373' : '#c62828'};
        }

        .notification-toast.info {
            border-color: #2196f3;
            color: ${currentTheme === 'dark' ? '#64b5f6' : '#1565c0'};
        }

        .notification-toast.ramadan.success {
            border-image: linear-gradient(45deg, #9c27b0, #673ab7) 1;
            color: ${currentTheme === 'dark' ? '#ce93d8' : '#6a1b9a'};
        }

        .notification-toast.ramadan.info {
            border-image: linear-gradient(45deg, #673ab7, #3f51b5) 1;
            color: ${currentTheme === 'dark' ? '#9575cd' : '#4527a0'};
        }

        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
        }

        .notification-icon {
            font-size: 1.2em;
        }

        .notification-message {
            font-size: 0.95em;
            font-weight: 500;
        }

        .notification-decoration {
            position: absolute;
            left: -20px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 1em;
            opacity: 0.7;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }

        @keyframes glow {
            0%, 100% {
                box-shadow: 0 4px 20px rgba(156, 39, 176, 0.2);
            }
            50% {
                box-shadow: 0 4px 30px rgba(156, 39, 176, 0.4);
            }
        }

        .notification-toast.ramadan {
            animation: slideIn 0.3s ease-out, glow 2s ease-in-out infinite;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Remove the notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = isRamadan ? 
            'slideOut 0.3s ease-in forwards, glow 2s ease-in-out infinite' : 
            'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 300);
    }, 3000);
}

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

// Main function to generate the table
function generateTable(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        if (!data || !data.days || !data.schedule) {
            showNotification('خطأ: تنسيق JSON غير صحيح. يرجى التحقق من البيانات المدخلة.', 'error');
            return;
        }

        const days = data.days;
        const schedule = data.schedule;

        // Populate the new table with the days and their lectures
        for (i in days) {
            newTable[days[i]] = [];
        }

        // Create subject_colors mapping
        for (let day in schedule) {
            schedule[day].forEach(lecture => {
                if (!(lecture.subject in subject_colors)) {
                    subject_colors[lecture.subject] = colors[color_index % colors.length];
                    color_index++;
                }
            });
        }

        // Add lectures to the newTable structure
        for (let day in schedule) {
            schedule[day].forEach(lecture => {
                let time = lecture.time;

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


                newTable[day].push({
                    subject: lecture.subject,
                    activity: lecture.activity,
                    time: time,
                    place: lecture.place,
                    section: lecture.section,
                    value: value(time),
                    endTime: getLectureEndTime(time),
                    startTime: getLectureStartTime(time)
                });
            });
        }

        // Sort lectures by time
        for (i in newTable) {
            newTable[i].sort((a, b) => a.startTime - b.startTime);
        }

        // Helper function to insert after index
        function insert_after(element, array, index) {
            let new_array = [];
            for (i = 0; i < array.length; i++) {
                if (i == index + 1) {
                    new_array.push(element);
                }
                new_array.push(array[i]);
            }
            return new_array;
        }

        // Add breaks between lectures
        for (d = 0; d < Object.keys(newTable).length; d++) {
            let day = Object.keys(newTable)[d];
            let edited_day = JSON.parse(JSON.stringify(newTable[day]));
            let uni_day = newTable[day];
            let skip = 0;
            for (l = 0; l < uni_day.length - 1; l++) {
                let currentLectureEnd = uni_day[l].endTime;
                let nextLectureStart = uni_day[l + 1].startTime;
                let breakTime = nextLectureStart - currentLectureEnd;

                if (breakTime > 10) {  // Only show breaks longer than 10 minutes
                    let break_obj = {
                        subject: null,
                        activity: "break",
                        time: null,
                        place: null,
                        value: breakTime
                    };
                    edited_day = insert_after(break_obj, edited_day, l + skip);
                    skip++;
                }
            }
            newTable[day] = edited_day;
        }

        // Now, generate and append the table to the container
        appendTable(data.days);

        // Show success notification after table is generated
        if (ramadanMode) {
            showNotification('تم إنشاء جدول رمضان بنجاح! رمضان كريم 🌙', 'success', true);
        } else {
            showNotification('تم إنشاء الجدول بنجاح! 🎉');
        }

    } catch (error) {
        console.error('Error parsing JSON or generating table:', error);
        showNotification('خطأ: تعذر إنشاء الجدول. يرجى التحقق من صحة البيانات المدخلة.', 'error');
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

    console.log('Download initiated.');

    // Create and show loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-notification';

    loadingOverlay.innerHTML = `
        <div class="notification-content">
            <div class="modern-spinner"></div>
            <div class="notification-text">
                <div class="notification-title" style="color: ${currentTheme === 'dark' ? '#ffffff' : '#000000'};">جار تحميل الصورة...</div>
                <div class="notification-subtitle" style="color: ${currentTheme === 'dark' ? '#cccccc' : '#666666'};">يرجى الانتظار بينما نقوم بمعالجة الجدول</div>
            </div>
        </div>
    `;

    console.log('Loading overlay created.');

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
    `;

    document.head.appendChild(style);
    document.body.appendChild(loadingOverlay);

    const element = document.getElementById('newTable');
    const summary = document.querySelector('.schedule-summary');

    console.log('Element to capture:', element);

    // Create filename based on mode
    const filename = ramadanMode ? 'الجدول_الدراسي_توقيت_رمضان.png' : 'الجدول_الدراسي.png';

    // Calculate the maximum width needed
    const tableWidth = element.offsetWidth;
    const summaryWidth = summary ? summary.offsetWidth : 0;
    const maxWidth = Math.max(tableWidth, summaryWidth);

    console.log('Max width calculated:', maxWidth);

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

    console.log('Table cloned.');

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

    console.log('Wrapper appended to the document.');

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

    console.log('Starting html2canvas...');

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
        console.log('Canvas generated successfully.');
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
            console.log('Download link clicked.');
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

function createSummary(days) {
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

    // Original desktop UI
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
                            <span style="color: ${currentTheme === 'dark' ? '#e0e0e0' : '#333'};">تضمين الملخص</span>
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
                appendTable(days);
            });
        }

        if (darkThemeBtn) {
            darkThemeBtn.addEventListener('click', () => {
                toggleTheme('dark');
                appendTable(days);
            });
        }

        if (ramadanBtn) {
            ramadanBtn.addEventListener('click', () => {
                ramadanMode = !ramadanMode;
                ramadanBtn.classList.toggle('active');
                if (ramadanMode) {
                    showNotification('تم تفعيل توقيت رمضان 🌙 رمضان كريم', 'info', true);
                } else {
                    showNotification('تم إلغاء توقيت رمضان', 'info');
                }
                // Re-generate the table with the new Ramadan mode
                const userInput = document.getElementById('userInput').value;
                if (userInput.trim()) {
                    generateTable(userInput);
                }
            });
        }
        if (includeSummaryCheckbox) {
            includeSummaryCheckbox.addEventListener('change', (e) => {
                includeSummaryInDownload = e.target.checked;
            });
        }
    }, 0);
        
        return summary;}

        function appendTable(days) {
        // Remove any existing organized tables and summaries
        if (newTableNode) {
            newTableNode.remove();
        }
        document.querySelectorAll('.schedule-summary').forEach(el => el.remove());
        
        // Create and add the summary first
        let summary = createSummary(days);
        summary.style.cssText = `
            width: 100%;
            max-width: 1100px;
            margin: 5px auto;
            overflow-x: auto;
            display: block;
        `;
        const summaryContainer = document.getElementById('summaryContainer');
        summaryContainer.appendChild(summary);
        
        const tableContainer = document.getElementById('tableContainer');

        // Continue with normal table creation for desktop
        let table = document.createElement('table');
        table.id = "newTable";
        table.classList.add('rowFlow', `theme-${currentTheme}`);
        table.cellPadding = '0';
        table.cellSpacing = '0';
        table.border = '1';
        
        tableContainer.appendChild(table);
        
        let thead = document.createElement('thead');
        let tbody = document.createElement('tbody');
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
                    let hrs = lecture.value / 60;
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
        
        newTableNode = table;}

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
        
        return `rgb(${adjustedRgb.join(',')})`;}


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
        return `${startTimeComponent}${startPeriod} - ${endTimeComponent}${endPeriod}`;}

        // Function to load schedule from URL
        function loadScheduleFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            const storageKey = urlParams.get('key');
            
            if (storageKey) {
                try {
                    // Try to get data from localStorage
                    const scheduleData = localStorage.getItem(storageKey);
                    if (scheduleData) {
                        const userInput = document.getElementById('userInput');
                        if (userInput) {
                            userInput.value = scheduleData;
                            generateTable(scheduleData);
                            showNotification('تم تحميل الجدول من الرابط بنجاح', 'success', ramadanMode);
                            return true;
                        }
                    }
                } catch (e) {
                    console.error('Error loading from localStorage:', e);
                    showNotification('حدث خطأ أثناء تحميل الجدول من الرابط', 'error', ramadanMode);
                }
            }
            return false;
        }

        // Event Listeners and Initialization
        document.addEventListener('DOMContentLoaded', () => {
        const generateTableBtn = document.getElementById('generateTableBtn');
        const userInput = document.getElementById('userInput');
        const clearBtn = document.getElementById('clearBtn');

        // Try to load schedule from URL first
        const scheduleLoaded = loadScheduleFromURL();

        // Only show the paste interface if no schedule was loaded from URL
        if (!scheduleLoaded) {
            userInput.style.display = 'block';
            generateTableBtn.style.display = 'inline-block';
            clearBtn.style.display = 'inline-block';
        }

        generateTableBtn.addEventListener('click', () => {
            if (!userInput.value.trim()) {
                showNotification('يرجى إدخال بيانات الجدول أولاً.', 'info', ramadanMode);
                return;
            }
            generateTable(userInput.value);
        });

        clearBtn.addEventListener('click', () => {
            if (!userInput.value.trim() && !document.getElementById('newTable')) {
                showNotification('لا يوجد شيء للمسح.', 'info', ramadanMode);
                return;
            }
            
            userInput.value = '';
            // Clear the existing table and summary if they exist
            const tableContainer = document.getElementById('tableContainer');
            const summaryContainer = document.getElementById('summaryContainer');
            if (tableContainer) tableContainer.innerHTML = '';
            if (summaryContainer) summaryContainer.innerHTML = '';
            // Reset the newTable object and other relevant state
            newTable = {};
            subject_colors = {};
            color_index = 0;
            
            showNotification('تم مسح كل شيء بنجاح.', 'success', ramadanMode);
        });
    });

