// ==UserScript==
// @name منظم جدول الجامعة الاسلامية
// @description اضافة لتعديل مظهر الجدول بالجامعة الاسلامية الى جدول مرتب تبعا لايام الاسبوع بضغطة زر
// @name:en IU Table Organizer
// @description:en A script to order the lectures table according to weekdays on the Islamic University website
// @include https://eduportal.iu.edu.sa/iu/ui/student/homeIndex.faces
// @include https://eduportal.iu.edu.sa/iu/ui/student/*/*/*
// @include http://eduportal.iu.edu.sa/iu/ui/student/*
// @include https://eduportal.iu.edu.sa/iu/ui/student/student_schedule/index/studentScheduleIndex.faces
// @version 1.3.1
// @icon https://www.google.com/s2/favicons?domain=sso.iu.edu.sa
// @namespace https://greasyfork.org/users/814159
// @icon https://icons.iconarchive.com/icons/fatcow/farm-fresh/32/table-icon.png
// @license Mozilla Public License 2.0
// @downloadURL https://update.greasyfork.org/scripts/432219/%D9%85%D9%86%D8%B8%D9%85%20%D8%AC%D8%AF%D9%88%D9%84%20%D8%A7%D9%84%D8%AC%D8%A7%D9%85%D8%B9%D8%A9%20%D8%A7%D9%84%D8%A7%D8%B3%D9%84%D8%A7%D9%85%D9%8A%D8%A9.user.js
// @updateURL https://update.greasyfork.org/scripts/432219/%D9%85%D9%86%D8%B8%D9%85%20%D8%AC%D8%AF%D9%88%D9%84%20%D8%A7%D9%84%D8%AC%D8%A7%D9%85%D8%B9%D8%A9%20%D8%A7%D9%84%D8%A7%D8%B3%D9%84%D8%A7%D9%85%D9%8A%D8%A9.meta.js
// @require https://html2canvas.hertzen.com/dist/html2canvas.min.js
// @grant GM_addStyle
// ==/UserScript==

// Inject CSS styles
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
}

#newTable thead tr {
    background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
    color: #ffffff;
    text-align: center;
    font-weight: bold;
    height: 60px;
    position: relative;
    box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

#newTable th {
    width: 22%;
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
`);

// Global variables
let rows = [];
const days = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس'];
let newTable = {};
let newTableNode;
let on = false;
let colors = ["Blue", "Black", "Crimson", "Green", "Grey", "OrangeRed", "Purple", "Red", "SpringGreen", "MediumTurquoise", "Navy", "GoldenRod"];
let subject_colors = {};
let color_index = 0;

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
    } catch (error) {
        console.error('Error in getNewTable:', error);
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

function createSummary() {
    let summary = document.createElement('div');
    summary.classList.add('schedule-summary');
    
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
            <div style="display: flex; align-items: center; gap: 4px; background: #e3f2fd; padding: 8px 16px; border-radius: 8px;">
                <span style="font-weight: 500;">📚 المواد:</span>
                <span>${subjectCount.size}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; background: #f3e5f5; padding: 8px 16px; border-radius: 8px;">
                <span style="font-weight: 500;">⏰ الساعات:</span>
                <span>${totalHours}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; background: #e8f5e9; padding: 8px 16px; border-radius: 8px;">
                <span style="font-weight: 500;">📅 أيام الدراسة:</span>
                <span>${daysWithClasses.size}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; background: #fff3e0; padding: 8px 16px; border-radius: 8px;">
                <span style="font-weight: 500;">📊 اليوم الأكثر:</span>
                <span>${busyDays.join(', ')} (${maxLectures})</span>
            </div>
            <button class="control-button" id="downloadButton">
                💾 تحميل كصورة
            </button>
        </div>
    `;
    
    setTimeout(() => {
        const downloadButton = summary.querySelector('#downloadButton');
        if (downloadButton) {
            downloadButton.addEventListener('click', downloadAsPNG);
        }
    }, 0);
    
    return summary;
}

function appendTable() {
    document.querySelectorAll('.schedule-summary').forEach(el => el.remove());

    const originalTableNode = document.getElementById('scheduleFrm:studScheduleTable');
    let table = document.createElement('table');
    table.id = "newTable";
    table.classList.add('rowFlow');
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
            <div class="day-name-en">${dayNamesEn[i]}</div>
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
                let content = `<div style="margin-bottom: 3px;">
                    <strong style="font-size: 1.1em;">${lecture.subject}</strong>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                        <div style="text-align: right;">
                            <div style="${getActivityStyle(lecture.activity)}">
                                ${getActivityIcon(lecture.activity)} ${lecture.activity}
                            </div>
                            <div style="background: #e8eaf6; border-radius: 6px; padding: 4px 8px; color: #283593; display: inline-block; margin-top: 5px;">
                                🔢 الشعبة: ${lecture.section}
                            </div>
                        </div>
                        <div style="text-align: left;">
                            <div style="font-weight: bold; color: #1a237e;">${lecture.time}</div>
                            <div class="lecture-hall">🏛️ ${lecture.place}</div>
                        </div>
                    </div>
                 </div>`;
                     
                trs[j].children[i].innerHTML = `<div class="lecture-cell" style="border-left-color: ${subjectColor}">${content}</div>`;
            }
        });
    });

    newTableNode = table;
    let summary = createSummary();
    originalTableNode.insertAdjacentElement('afterend', summary);
}

function getEnglishDay(index) {
    const englishDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    return englishDays[index] || '';
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