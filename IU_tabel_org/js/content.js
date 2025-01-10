// Global variables
let rows = [];
const days = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس'];
let newTable = {};
let newTableNode;
let on = false;
let colors = ["Blue", "Black", "Crimson", "Green", "Grey", "OrangeRed", "Purple", "Red", "SpringGreen", "MediumTurquoise", "Navy", "GoldenRod"];
let subject_colors = {};
let color_index = 0;
let currentTheme = 'light';

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

                function value(t) {
                    let hour = parseInt(t.slice(0, 2), 10);
                    let minutes = parseInt(t.slice(3, 5), 10);
                    let total = (hour * 60) + minutes;

                    if (t.slice(0, 10).includes('م') && hour != 12) {
                        total += 720;
                    }

                    return total;
                }

                for (k in lecture["اليوم"]) {
                    let day = days[parseInt(lecture["اليوم"][k])-1];
                    newTable[day].push({
                        subject: rows[i]['اسم المقرر'],
                        activity: rows[i]['النشاط'],
                        time: time,
                        place: lecture['القاعة'],
                        section: rows[i]['الشعبة'],
                        value: value(time)
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
            newTable[i].sort((a, b) => a.value - b.value);
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
                let difference = uni_day[l+1].value - uni_day[l].value;
                if (difference > 60) {
                    let break_obj = {
                        subject: null,
                        activity: "break",
                        time: null,
                        place: null,
                        value: difference - 60
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
    
    const icon = getBreakIcon(hrs);
    let duration;
    
    if (hrs >= 10) {
        duration = `${Math.floor(hrs)} ساعة`;
    } else if (hrs > 2) {
        duration = `${Math.floor(hrs)} ساعات`;
    } else if (hrs == 2) {
        duration = 'ساعتين';
    } else if (hrs == 1) {
        duration = 'ساعة';
    } else {
        duration = `${Math.round(hrs * 60)} دقيقة`;
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
        background: #ffffff;
        padding: 20px 30px;
        direction: rtl;
        width: ${maxWidth}px;
        margin: 0 auto;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
    `;
    
    const summaryClone = summary.cloneNode(true);
    const tableClone = element.cloneNode(true);
    
    // Ensure summary maintains consistent width
    summaryClone.style.cssText = `
        width: ${maxWidth}px;
        margin: 0 0 20px 0;
        box-sizing: border-box;
    `;
    
    // Ensure table maintains consistent width
    tableClone.style.cssText = `
        width: ${maxWidth}px;
        margin: 0;
        box-sizing: border-box;
    `;
    
    const downloadBtn = summaryClone.querySelector('.control-button');
    if (downloadBtn) downloadBtn.remove();
    
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
    
    // Calculate optimal scale based on content size
    const targetWidth = wrapper.offsetWidth;
    const targetHeight = wrapper.offsetHeight;
    const maxDimension = Math.max(targetWidth, targetHeight);
    
    let scale = 6;
    const maxSize = 16384;
    
    if (maxDimension * scale > maxSize) {
        scale = Math.floor(maxSize / maxDimension);
    }
    
    html2canvas(wrapper, {
        backgroundColor: '#ffffff',
        scale: 2,
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
                    scale: 4,
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
    
    // Increase brightness for dark mode
    let adjustedRgb = rgb.map(value => {
        // Increase brightness but maintain color character
        let adjusted = Math.min(255, value + 40);
        return adjusted;
    });
    
    return `rgb(${adjustedRgb.join(',')})`;
} 