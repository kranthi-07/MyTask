let selectedDeviceIndex = null;
const taskPopup = document.querySelector(".task-popup");
const popupInput = document.getElementById("popupTaskInput");
const saveTaskPopup = document.getElementById("saveTaskPopup");
const cancelTaskPopup = document.getElementById("cancelTaskPopup");
let touchStartIndex = null;
let currentTouchItem = null;
const taskPopupTitle = document.getElementById("taskPopupTitle");
let lastMainPage = "activePage"; // default
let devices = JSON.parse(localStorage.getItem("devices")) || [];


const isMobile = window.innerWidth <= 768;
let isIndividualTask = false;

const addTaskOverlay = document.getElementById("addTaskOverlay");
const deviceSelectOverlay = document.getElementById("deviceSelectOverlay");

const streakBox = document.getElementById("streakBox");
const streakPopup = document.getElementById("streakPopup");

streakBox.addEventListener("click", () => {
    streakPopup.classList.add("active");
});

function closeStreak() {
    document.getElementById("streakPopup").classList.remove("active");
}


const loader = document.getElementById("loader");

function showLoader() {
    loader.classList.add("active");
}

function hideLoader() {
    loader.classList.remove("active");
}



function lockScroll() {
    document.body.style.overflow = "hidden";
}

function unlockScroll() {
    document.body.style.overflow = "";
}


const calendarPopup = document.getElementById("calendarPopup");

const calendarDays = document.getElementById("calendarDays");
const monthYear = document.getElementById("monthYear");

let selectedDate = null;
let selectedTime = null;
let current = new Date();

// OPEN
openCalendar.onclick = () => {
    calendarPopup.classList.add("active");
    renderCalendar();
};

// CLOSE
calendarPopup.addEventListener("click", (e) => {
    if (e.target === calendarPopup) {
        calendarPopup.classList.remove("active");
    }
});

// RENDER CALENDAR
function renderCalendar() {
    calendarDays.innerHTML = "";

    const year = current.getFullYear();
    const month = current.getMonth();
    const today = new Date();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    monthYear.textContent =
        current.toLocaleString("default", { month: "long" }) + " " + year;

    // empty spaces
    for (let i = 0; i < firstDay; i++) {
        calendarDays.innerHTML += "<div></div>";
    }

    for (let d = 1; d <= totalDays; d++) {
        const div = document.createElement("div");
        div.className = "calendar-day";
        div.textContent = d;

        // ✅ DEFINE THIS DATE
        const thisDate = new Date(year, month, d);

        // ✅ HIGHLIGHT TODAY
        if (thisDate.toDateString() === today.toDateString()) {
            div.classList.add("today-highlight");
        }

        div.onclick = () => {
            document.querySelectorAll(".calendar-day").forEach(el =>
                el.classList.remove("selected")
            );

            div.classList.add("selected");

            selectedDate = thisDate; // ✅ use same variable
        };

        calendarDays.appendChild(div);
    }
}

// MONTH NAV
document.getElementById("prevMonth").onclick = () => {
    current.setMonth(current.getMonth() - 1);
    renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {
    current.setMonth(current.getMonth() + 1);
    renderCalendar();
};

// TIME SELECT
document.querySelectorAll(".time-buttons button").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".time-buttons button")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");
        selectedTime = btn.dataset.time;
    };
});

// SAVE
document.getElementById("saveDateTime").onclick = () => {
    if (!selectedDate) return alert("Select date");

    let display =
        selectedDate.toLocaleDateString("en-GB");

    if (selectedTime) {
        display += " • " + selectedTime;
    }

    document.getElementById("datePreview").textContent = display;

    calendarPopup.classList.remove("active");

    // 👉 STORE THIS IN YOUR TASK
    window.selectedTaskDate = selectedDate.toISOString().split("T")[0];
    window.selectedTaskTime = selectedTime;
};





function vibrate(ms = 30) {
    console.log("📳 Vibrate called:", ms);

    if (window.Android && typeof Android.vibrate === "function") {
        Android.vibrate(ms);
    } else if (navigator.vibrate) {
        navigator.vibrate(ms); // fallback (browser)
    } else {
        console.warn("❌ Vibration not supported");
    }
}

document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => vibrate(20));
});





document.querySelector(".all-tasks .add").onclick = () => {
    addTaskOverlay.classList.add("active");
};


document.getElementById("closeAddTask").onclick = () => {
    addTaskOverlay.classList.remove("active");
};

document.getElementById("closeDeviceSelect").onclick = () => {
    deviceSelectOverlay.classList.remove("active");
};

addTaskOverlay.addEventListener("click", (e) => {
    if (e.target === addTaskOverlay) {
        addTaskOverlay.classList.remove("active");
    }
});

deviceSelectOverlay.addEventListener("click", (e) => {
    if (e.target === deviceSelectOverlay) {
        deviceSelectOverlay.classList.remove("active");
    }
});


document.getElementById("addIndividualBtn").onclick = () => {
    addTaskOverlay.classList.remove("active");

    editingTaskInfo = null;
    deviceIndexForTask = null;
    isIndividualTask = true; // ✅ IMPORTANT

    popupInput.value = "";
    document.getElementById("taskDueDate").value = "";

    taskPopupTitle.textContent = "Add Individual Task";
    taskPopup.classList.add("active");
};


document.getElementById("addToDeviceBtn").onclick = () => {
    addTaskOverlay.classList.remove("active");
    isIndividualTask = false; // ✅ IMPORTANT
    openDeviceSelector();
};


function openDeviceSelector() {
    showLoader();

    setTimeout(() => {
        const list = document.getElementById("deviceList");
        list.innerHTML = "";

        if (devices.length === 0) {
            list.innerHTML = "<p>No devices available</p>";
            hideLoader();
            return;
        }

        devices.forEach((device, index) => {
            const div = document.createElement("div");
            div.className = "device-item-select";
            div.textContent = device.name;

            div.onclick = () => {
                vibrate(25);
                deviceSelectOverlay.classList.remove("active");

                deviceIndexForTask = index;

                popupInput.value = "";
                document.getElementById("taskDueDate").value = "";

                taskPopupTitle.textContent = `Add Task to ${device.name}`;
                taskPopup.classList.add("active");
            };

            list.appendChild(div);
        });

        deviceSelectOverlay.classList.add("active");
        hideLoader();
    }, 200);
}




function navigateTo(page, push = true) {

    const isMobile = window.innerWidth <= 768;

    document.querySelectorAll(".overlay, .desktop-page").forEach(p => {
        p.scrollTop = 0;
    });

    if (overlays[page]) {
        lockScroll(); // 🔥 ADD THIS
        overlays[page].classList.add("active");
    }

    if (isMobile) {
        // 📱 MOBILE → use overlays
        closeAllOverlays();

        if (page === "active") {
            setActiveFooter("activePage");
        } else if (overlays[page]) {
            overlays[page].classList.add("active");
            setActiveFooter(page + "Page");
        }


    } else {
        // 💻 DESKTOP → NO overlays
        closeAllOverlays(); // just in case

        // Show sections instead
        document.querySelectorAll(".desktop-page").forEach(p => {
            p.classList.remove("active-desktop-page");
        });

        const target = document.getElementById(page + "Desktop");

        if (target) {
            target.classList.add("active-desktop-page");
        }

        setActiveFooter(page + "Page");
    }

    // URL handling
    if (push) {
        history.pushState({ page }, "", "#" + page);
    }
}


window.addEventListener("resize", () => {
    const currentPage = window.location.hash.replace("#", "") || "active";
    navigateTo(currentPage, false);
});


const overlays = {
    home: document.getElementById("homeOverlay"),
    today: document.getElementById("todayOverlay"),
    overdue: document.getElementById("overdueOverlay"),
    important: document.getElementById("importantOverlay"),
    all: document.getElementById("allOverlay"),          // ✅ ADD
    completed: document.getElementById("completedOverlay") // ✅ ADD
};

const footerItems = document.querySelectorAll(".footer-item");

// OPEN OVERLAY / HANDLE MAIN PAGE
footerItems.forEach(item => {
    item.addEventListener("click", () => {

        vibrate(20);

        showLoader(); // ✅ ADD HERE

        setTimeout(() => {
            const page = item.dataset.page.replace("Page", "").toLowerCase();

            navigateTo(page);

            if (page === "today") loadTodayTasks();
            if (page === "overdue") loadOverdueTasks();
            if (page === "important") loadImportantTasks();
            if (page === "all") loadAllTasks();
            if (page === "home") renderHomeDashboard();
            if (page === "completed") loadCompletedTasks();

            hideLoader(); // ✅ ADD HERE
        }, 250);
    });
});

function closeAllOverlays() {
    Object.values(overlays).forEach(o => o?.classList.remove("active"));
    unlockScroll(); // 🔥 ADD THIS
}


function setActiveFooter(pageName) {
    footerItems.forEach(i => i.classList.remove("active-footer-icon"));

    document
        .querySelector(`[data-page="${pageName}"]`)
        ?.classList.add("active-footer-icon");
}





function updateFooterActive(activeItem) {
    footerItems.forEach(i => i.classList.remove("active-footer-icon"));
    activeItem.classList.add("active-footer-icon");
}

function resetFooterToHome() {
    footerItems.forEach(i => i.classList.remove("active-footer-icon"));

    document
        .querySelector('[data-page="activePage"]')
        .classList.add("active-footer-icon");
}










function openExpandedCard(type, cardElement) {
    const overlay = document.getElementById("cardExpandOverlay");
    const content = document.getElementById("expandedCardContent");

    overlay.classList.add("active");
    content.innerHTML = "";

    // Clone card
    const clonedCard = cardElement.cloneNode(true);
    clonedCard.classList.add("expanded-style");

    // 🔥 ADD CLICK NAVIGATION HERE
    clonedCard.addEventListener("click", () => {
        overlay.classList.remove("active");
        closeAllOverlays();

        if (type === "active") {
            navigateTo("active");
            highlightActiveTasks();
            setActiveFooter("activePage");
        }

        if (type === "important") {
            navigateTo("important");
            loadImportantTasks();
            setActiveFooter("importantPage");
        }

        if (type === "all") {
            navigateTo("all");
            loadAllTasks();
            setActiveFooter("homePage");
        }

        if (type === "completed") {
            navigateTo("completed");
            loadCompletedTasks();
            updateStreak();
            setActiveFooter("homePage");
        }
    });
    // COUNT LOGIC (keep your existing)
    let count = 0;

    devices.forEach(device => {
        (device.tasks || []).forEach(task => {
            if (type === "active" && !task.completed) count++;
            if (type === "important" && task.important && !task.completed) count++;
            if (type === "completed" && task.completed) count++;
            if (type === "all") count++;
        });
    });

    const message = document.createElement("p");
    message.className = "expanded-message";
    message.textContent = `Tap to view details`;

    content.appendChild(clonedCard);
    content.appendChild(message);

}



window.addEventListener("popstate", (e) => {
    const page = e.state?.page || "active";
    navigateTo(page, false);
});


window.addEventListener("load", () => {
    showLoader();

    setTimeout(() => {
    const hash = window.location.hash.replace("#", "") || "active";
    migrateOldTasks();
    navigateTo(hash, false);
    if (hash === "home") renderHomeDashboard();
    if (hash === "today") loadTodayTasks();
    if (hash === "overdue") loadOverdueTasks();
    if (hash === "important") loadImportantTasks();
    if (hash === "all") loadAllTasks();
    if (hash === "completed") loadCompletedTasks();
    updateProgressBar();
    updateStreak();
    validateStreak();
    hideLoader();
    },300);
});


function animateCount(el, target) {
    let current = 0;
    const step = Math.ceil(target / 20);

    const interval = setInterval(() => {
        current += step;

        if (current >= target) {
            current = target;
            clearInterval(interval);
        }

        el.textContent = current;
    }, 20);
}



function createPreviewItem(text) {
    const div = document.createElement("div");
    div.className = "dashboard-task";

    div.innerHTML = `
        <span>•</span>
        <span>${text}</span>
    `;

    return div;
}


function renderHomeDashboard() {
    let total = 0, active = 0, important = 0, completed = 0;

    const activeBox = document.getElementById("homeActiveTasks");
    const importantBox = document.getElementById("homeImportantTasks");
    const allBox = document.getElementById("homeAllTasks");
    const completedBox = document.getElementById("homeCompletedTasks");

    // clear old content
    activeBox.innerHTML = "";
    importantBox.innerHTML = "";
    allBox.innerHTML = "";
    completedBox.innerHTML = "";

    const activeList = [];
    const importantList = [];
    const completedList = [];
    const allList = [];

    devices.forEach(device => {
        if (!device || !Array.isArray(device.tasks)) return;

        device.tasks.forEach(task => {
            if (!task) return;

            total++;

            // ✅ ALL (limit while pushing)
            if (allList.length < 3) {
                allList.push(task.text);
            }

            if (task.completed) {
                completed++;
                if (completedList.length < 3) {
                    completedList.push(task.text);
                }
            } else {
                active++;
                if (activeList.length < 3) {
                    activeList.push(task.text);
                }

                if (task.important) {
                    important++;
                    if (importantList.length < 3) {
                        importantList.push(task.text);
                    }
                }
            }
        });
    });

    console.log("Dashboard rendering...", devices);

    // 👉 LIMIT to 3 items
    activeBox.innerHTML = `<p style="margin-left:40px;padding:6px 8px;font-size:14px;border-radius:7px;background:#010101;color:#fff;">${active} tasks</p>`;
    importantBox.innerHTML = `<p style="margin-left:40px;padding:6px 8px;font-size:14px;border-radius:7px;background:#010101;color:#fff;">${important} tasks</p>`;
    completedBox.innerHTML = `<p style="margin-left:40px;padding:6px 8px;font-size:14px;border-radius:7px;background:#010101;color:#fff;">${completed} tasks</p>`;
    allBox.innerHTML = `<p style="margin-left:40px;padding:6px 8px;font-size:14px;border-radius:7px;background:#010101;color:#fff;">${total} tasks</p>`;

    updateCounts(total, active, important, completed);
}


function updateCounts(total, active, important, completed) {
    document.getElementById("activeTasksCard").innerHTML = `${active}<br><span>Active</span>`;
    document.getElementById("importantTasksCard").innerHTML = `${important}<br><span>Important</span>`;
    document.getElementById("totalTasksCard").innerHTML = `${total}<br><span>Total</span>`;
    document.getElementById("completedTasksCard").innerHTML = `${completed}<br><span>Done</span>`;
}


function updateProgressBar() {

    let total = 0;
    let completed = 0;

    devices.forEach(device => {
        (device.tasks || []).forEach(task => {
            total++;
            if (task.completed) completed++;
        });
    });



    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    const fill = document.getElementById("taskProgressFill");
    const text = document.getElementById("taskProgressText");

    fill.style.width = percent + "%";
    text.textContent = percent + "%";
    if (percent < 40) fill.style.background = "#ef4444";      // red
    else if (percent < 70) fill.style.background = "#facc15"; // yellow
    else fill.style.background = "#22c55e";                   // green
}



document.querySelector(".progress-tasks").onclick = function () {

    let total = 0;
    let completed = 0;
    let important = 0;

    devices.forEach(device => {
        device.tasks.forEach(task => {
            total++;
            if (task.completed) completed++;
            if (task.important && !task.completed) important++;
        });
    });

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    showProgressPopup(percent, total, completed, important);
};


function showProgressPopup(percent, total, completed, important) {
    let popup = document.getElementById("progressPopup");

    // create if not exists
    if (!popup) {
        popup = document.createElement("div");
        popup.id = "progressPopup";
        popup.className = "progress-popup";

        popup.innerHTML = `
            <div class="progress-popup-box">
                <h2>Your Progress</h2>
                <div class="progress-big" id="progressPercent">${percent}%</div>
                <p style="background: linear-gradient(135deg, #3b83f696, #2564eb99);color:#000;">Total: ${total}</p>
                <p style="background: linear-gradient(135deg, #22c55ea0, #16a34a92);color:#000;">Completed: ${completed}</p>
                <p style="background: linear-gradient(135deg, #facc1596, #eab208a1);color:#000;">Important: ${important}</p>
                <button onclick="closeProgressPopup()">Close</button>
            </div>
        `;

        document.body.appendChild(popup);
    } else {
        popup.querySelector("#progressPercent").innerText = percent + "%";
    }

    popup.style.display = "flex";
}

function closeProgressPopup() {
    const popup = document.getElementById("progressPopup");
    if (popup) popup.style.display = "none";
}



function updateStreak() {
    const today = new Date().toISOString().split("T")[0];

    let totalToday = 0;
    let completedToday = 0;

    devices.forEach(device => {
        (device.tasks || []).forEach(task => {
            if (task.dueDate === today) {
                totalToday++;
                if (task.completed) completedToday++;
            }
        });
    });

    let streakData = JSON.parse(localStorage.getItem("streakData")) || {
        current: 0,
        best: 0,
        lastDate: null
    };

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yDate = yesterday.toISOString().split("T")[0];

    // ✅ Only count if all today's tasks completed
    if (totalToday > 0 && totalToday === completedToday) {

        if (streakData.lastDate === today) return;

        if (streakData.lastDate === yDate) {
            streakData.current += 1;
        } else {
            streakData.current = 1;
        }

        streakData.lastDate = today;

        if (streakData.current > streakData.best) {
            streakData.best = streakData.current;
        }

        localStorage.setItem("streakData", JSON.stringify(streakData));
    }

    renderStreakUI();
}


document.getElementById("streakBox").onclick = () => {
    vibrate(30);

    const data = JSON.parse(localStorage.getItem("streakData")) || {
        current: 0,
        best: 0
    };

    document.getElementById("streakDays").innerText =
        `🔥 ${data.current} Day Streak`;

    document.getElementById("todayCompleted").innerText =
        `✅ ${getTodayCompletedCount()} tasks completed today`;

    document.getElementById("streakPopup").classList.add("active");
};



function renderStreakUI() {
    const streakData = JSON.parse(localStorage.getItem("streakData")) || {
        current: 0,
        best: 0
    };

    const el = document.getElementById("streakBox");
    if (!el) return;

    el.innerHTML = `
        <div class="streak-card">
            🔥 <strong>${streakData.current}</strong> day streak<br>
            <span>Best: ${streakData.best}</span>
        </div>
    `;
}




let ticking = false;

window.addEventListener("scroll", () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {

            const ribbon = document.querySelector(".top-ribbon");

            if (window.scrollY > 50) {
                ribbon.classList.add("scrolled");
            } else {
                ribbon.classList.remove("scrolled");
            }

            ticking = false;
        });

        ticking = true;
    }
});





const expandOverlay = document.getElementById("cardExpandOverlay");
const expandContent = document.getElementById("expandedCardContent");

document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
        const type = card.dataset.target;

        openExpandedCard(type, card); // ONLY THIS
    });
});


function renderExpandedTasks(type) {
    const container = document.getElementById("expandedCardContent");

    devices.forEach(device => {
        (device.tasks || []).forEach(task => {

            let show = false;

            if (type === "active" && !task.completed) show = true;
            if (type === "important" && task.important && !task.completed) show = true;
            if (type === "all") show = true;
            if (type === "completed" && task.completed) show = true;

            if (show) {
                const div = document.createElement("div");
                div.className = "dashboard-task";
                div.innerHTML = `
                <strong>${device.name}</strong> - ${task.text}
                `;
                container.appendChild(div);
            }
        });
    });
}


expandOverlay.addEventListener("click", (e) => {
    if (e.target === expandOverlay) {
        expandOverlay.classList.remove("active");
    }
});

document.querySelectorAll(".dashboard-section").forEach(section => {
    section.addEventListener("click", () => {

        const title = section.querySelector("h3").textContent.toLowerCase();

        closeAllOverlays();

        if (title.includes("active")) {
            setActiveFooter("activePage");
            highlightActiveTasks();
        }

        if (title.includes("important")) {
            overlays["important"]?.classList.add("active");
            loadImportantTasks();
            setActiveFooter("importantPage")
        }

        if (title.includes("all")) {
            overlays["all"]?.classList.add("active");
            loadAllTasks();

            lastMainPage = "homePage";   // 🔥 ADD THIS
            setActiveFooter("homePage");
        }

        if (title.includes("completed")) {
            overlays["completed"]?.classList.add("active");
            loadCompletedTasks();

            lastMainPage = "homePage";   // 🔥 ADD THIS
            setActiveFooter("homePage");
        }
    });
});




let currentFilter = null;
// possible values: "today", "upcoming", "overdue", null
const importantSection = document.querySelector(".important-tasks");
const importantContainer = document.querySelector(".important-tasks .tabs");

const activeTasksBtn = document.querySelector(".active-tasks");
const myTasksSection = document.getElementById("myTasksSection");


let deviceIndexToDelete = null;

const deletePopup = document.querySelector(".delete-popup");
const deleteYesBtn = document.getElementById("deleteDeviceYes");
const deleteNoBtn = document.getElementById("deleteDeviceNo");


let editingTaskInfo = null;
let deviceIndexForTask = null;

const assignedTitle = document.getElementById("assignedTitle");

const assignedBtn = document.querySelector(".assigned-btn");
const assignedPopup = document.querySelector(".assigned-tasks-popup");
const assignedList = document.querySelector(".assigned-list");
const closeAssignedTasks = document.getElementById("closeAssignedTasks");


const addDeviceBtn = document.getElementById('addDevice');
const overlay = document.querySelector('.add-device-overlay');
const closeOverlay = document.querySelector('.close');

const deviceNameInput = document.getElementById("deviceNameInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskInput = document.getElementById("taskInput");
const saveDeviceBtn = document.getElementById("saveDeviceBtn");

const devicesContainer = document.querySelector(".devices .tabs");
const allTasksContainer = document.querySelector(".all-tasks .tabs");
const completedContainer = document.querySelector(".completed-tasks .tabs");
const activeCount = document.querySelector(".count");


let tempTasks = [];
let markTaskImportant = false;

// Open/Close overlay
addDeviceBtn.onclick = () => overlay.classList.add("active");
function resetOverlay() {
    tempTasks = [];

    deviceNameInput.value = "";
    taskInput.value = "";
    const tempDateInput = document.getElementById("tempTaskDate");
    if (tempDateInput) tempDateInput.value = "";

    assignedTitle.textContent = "Assigned Tasks (0)";
    assignedBtn.textContent = "Assigned Tasks (0)"; // ✅ RESET BUTTON LABEL
    assignedList.innerHTML = ""; // ✅ CLEAR POPUP LIST

    updateDragHint();
}


closeOverlay.onclick = () => {
    overlay.classList.remove("active");
    resetOverlay();
};





document.addEventListener("keydown", (e) => {
    if (e.key === "n") {
        addTaskOverlay.classList.add("active");
    }
});



function renderImportantTasks() {
    const container = document.getElementById("importantContent");
    container.innerHTML = "";

    devices.forEach(device => {
        device.tasks.forEach(task => {
            if (task.important && !task.completed) {
                const div = document.createElement("div");
                div.className = "dashboard-task";
                div.textContent = "⭐ " + task.text;
                container.appendChild(div);
            }
        });
    });
}











const deviceNameToast = document.getElementById("deviceNameToast");

function showDeviceNameError(message) {
    deviceNameToast.textContent = message;
    deviceNameToast.classList.add("show");

    deviceNameInput.classList.add("input-error");

    setTimeout(() => {
        deviceNameToast.classList.remove("show");
        deviceNameInput.classList.remove("input-error");
    }, 1800);
}


function showTaskDateError(message) {
    const toast = document.getElementById("taskDateToast");

    toast.textContent = message;
    toast.classList.add("show");

    // ✅ highlight calendar button instead
    const calendarBtn = document.getElementById("openCalendar");
    if (calendarBtn) {
        calendarBtn.classList.add("input-error");

        setTimeout(() => {
            calendarBtn.classList.remove("input-error");
        }, 1800);
    }

    setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}


function showAssignedToast(message) {
    const toast = document.getElementById("assignedToast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 1500);
}



function showTaskInputError(message) {
    const toast = document.getElementById("taskInputToast");

    toast.textContent = message;
    toast.classList.add("show");

    taskInput.classList.add("input-error");

    setTimeout(() => {
        toast.classList.remove("show");
        taskInput.classList.remove("input-error");
    }, 1800);
}



function addTempTask(input) {
    let text = input.value.trim();
    console.log("DATE:", window.selectedTaskDate);
    const dateValue = window.selectedTaskDate;

    if (!text) {
        showTaskInputError("Enter a task first");
        return;
    }


    if (!dateValue) {
        showTaskDateError("Select a due date");
        return;
    }



    const now = Date.now();

    let duration = 0;

    if (window.selectedTaskTime === "10 min") duration = 10 * 60 * 1000;
    if (window.selectedTaskTime === "20 min") duration = 20 * 60 * 1000;
    if (window.selectedTaskTime === "1 hr") duration = 60 * 60 * 1000;
    if (window.selectedTaskTime === "2 hr") duration = 2 * 60 * 60 * 1000;

    tempTasks.push({
        text: text.slice(0, 150),
        completed: false,
        dueDate: dateValue,
        important: markTaskImportant,
        order: Date.now(),

        // ✅ ADD THESE
        startTime: now,
        endTime: duration ? now + duration : null,
        timeLabel: window.selectedTaskTime || null
    });


    input.value = "";
    const tempDateInput = document.getElementById("tempTaskDate");
    if (tempDateInput) tempDateInput.value = "";

    addTaskBtn.textContent = "✔";
    addTaskBtn.classList.add("success");

    showAssignedToast("Successfully Added");
    updateAssignedCount();
    updateDragHint();

    window.selectedTaskDate = null;
    window.selectedTaskTime = null;

    document.getElementById("datePreview").textContent = "Select Date";
    // Reset important toggle after adding
    markTaskImportant = false;
    importantBtn.classList.remove("active-important");
    // importantBtn.textContent = "";

    input.placeholder = "Add another task...";

    setTimeout(() => {
        addTaskBtn.innerHTML = `<i class="ri-add-large-line"></i>`;
        addTaskBtn.classList.remove("success"); // ✅ remove, not add
    }, 1200);

}



// ===========================================ACTIVE TASKS HIGHLIGHT================================


function highlightActiveTasks() {
    document.querySelectorAll(".task-item").forEach(task => {
        if (!task.classList.contains("completed-task")) {
            task.classList.add("highlight-active");
        }
    });
}


function clearAllHighlights() {
    document.querySelectorAll(".task-item")
        .forEach(t => t.classList.remove("highlight-active"));
}



function removeActiveHighlight() {
    document.querySelectorAll(".task-item.highlight-active")
        .forEach(task => task.classList.remove("highlight-active"));
}

activeTasksBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    const importantCards = document.querySelectorAll(".important-tasks .task-item");
    const hasImportant = importantCards.length > 0;

    highlightActiveTasks();

    if (hasImportant) {
        // Get positions of both sections
        const impRect = importantSection.getBoundingClientRect();
        const myRect = myTasksSection.getBoundingClientRect();

        // Calculate middle point between them
        const middlePoint = (impRect.top + myRect.bottom) / 2 + window.scrollY;

        window.scrollTo({
            top: middlePoint - window.innerHeight / 2,
            behavior: "smooth"
        });
    } else {
        // No important tasks → just center My Tasks
        const myRect = myTasksSection.getBoundingClientRect();
        const centerPoint = myRect.top + window.scrollY - window.innerHeight / 2 + myRect.height / 2;

        window.scrollTo({
            top: centerPoint,
            behavior: "smooth"
        });
    }
});


//==================================================================================================

function updateActiveCountUI(count) {
    activeCount.textContent = count;

    // Bump animation
    activeCount.classList.remove("bump");
    void activeCount.offsetWidth;
    activeCount.classList.add("bump");

    // Glow effect
    if (count > 0) {
        activeTasksBtn.classList.add("has-tasks");
    } else {
        activeTasksBtn.classList.remove("has-tasks");
    }
}





const importantBtn = document.getElementById("importantBtn");
const importantToast = document.getElementById("importantToast");

importantBtn.addEventListener("click", () => {
    if (!taskInput.value.trim()) {
        showTaskInputError("Enter a task before marking important");
        return;
    }

    markTaskImportant = !markTaskImportant;

    importantBtn.classList.toggle("active-important");
    // importantBtn.textContent = markTaskImportant ? "" : "Mark as ⭐";

    importantToast.textContent = markTaskImportant
        ? "Task added as Important ⭐"
        : "Removed as Important";

    importantToast.classList.add("show");

    setTimeout(() => {
        importantToast.classList.remove("show");
    }, 2000);
});









addTaskBtn.onclick = () => {
    vibrate(30);
    addTempTask(taskInput);
};
taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault(); // stop form-like behavior
        addTempTask(taskInput);
    }
});

// Save Device
saveDeviceBtn.onclick = () => {
    vibrate(40);
    const deviceName = deviceNameInput.value.trim();

    if (!deviceName) {
        showDeviceNameError("Enter device name");
        return;
    }


    if (tempTasks.length === 0) {
        showAssignedToast("Add at least one task first");
        return;
    }


    devices.push({
        name: deviceName,
        tasks: tempTasks
    });

    overlay.classList.remove("active");
    resetOverlay(); // ✅ FULL RESET


    showAssignedToast("Device Saved ✔");

    saveAndRender();
};


// Save & render
function saveAndRender() {
    selectedDeviceIndex = null;
    localStorage.setItem("devices", JSON.stringify(devices));

    renderDevices();
    renderTasks();
    renderHomeDashboard(); // ✅ ADD THIS
    updateProgressBar();
    refreshActiveOverlay();
    updateStreak();
}


function refreshActiveOverlay() {
    if (overlays.today?.classList.contains("active")) loadTodayTasks();
    if (overlays.overdue?.classList.contains("active")) loadOverdueTasks();
    if (overlays.important?.classList.contains("active")) loadImportantTasks();
    if (overlays.all?.classList.contains("active")) loadAllTasks();
    if (overlays.completed?.classList.contains("active")) loadCompletedTasks();
}



function sortTasks(tasks) {
    const today = new Date().toISOString().split("T")[0];

    return tasks.sort((a, b) => {

        // ⭐ IMPORTANT TASKS FIRST
        if (a.important && !b.important) return -1;
        if (!a.important && b.important) return 1;

        // If both important → sort by due date ascending
        if (a.important && b.important) {
            if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            return a.order - b.order;
        }

        // Normal tasks → existing logic
        if (!a.dueDate && !b.dueDate) return a.order - b.order;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        if (a.dueDate < today && b.dueDate >= today) return -1;
        if (a.dueDate >= today && b.dueDate < today) return 1;

        return a.dueDate.localeCompare(b.dueDate);
    });
}


document.addEventListener("click", (e) => {
    if (!e.target.closest(".task-item")) {
        document.querySelectorAll(".task-item.expanded")
            .forEach(t => t.classList.remove("expanded"));

        document.body.classList.remove("tasks-blur-active");
    }
});




function getTimeBadge(task) {
    if (!task.endTime && !task.timeLabel) return "";

    return `
        <div class="time-badge" data-end="${task.endTime || ""}">
            ⏱ <span class="time-text">${task.timeLabel || ""}</span>
        </div>
    `;
}



function createTaskCard(task, numberLabel) {
    if (!task.timeLabel && task.time) {
        task.timeLabel = task.time;
    }

    const div = document.createElement("div");
    div.className = "tab task-item";
    div.dataset.id = task.order;

    const today = new Date().toISOString().split("T")[0];
    let dateClass = "";

    if (task.dueDate) {
        if (task.dueDate < today && !task.completed) dateClass = "overdue-date";
        else if (task.dueDate === today) dateClass = "today-date";
        else if (task.dueDate > today) dateClass = "upcoming-date";
    }


    const timeBadge = getTimeBadge(task);

    div.innerHTML = `
        <div class="task-inner">

            ${task.completed ? '<span class="completed-badge">✔ Done</span>' : ''}

            <span class="device-label ${task.deviceName === "Individual" ? "individual-label" : ""}">
                ${task.deviceName === "Individual" ? "⚡" : task.deviceName}
            </span>

            <span class="task-number">${numberLabel}</span>

            <div class="task-text">${task.text}</div>

            <div class="task-date ${dateClass}" data-date="${task.dueDate || ""}">
                ${task.dueDate ? "📅 " + task.dueDate : ""}
            </div>
            

            ${timeBadge}

            <span class="important-toggle ${task.important ? "active" : ""}">★</span>
            <span class="edit-task">✎</span>
            <span class="move-task">${task.completed ? "↩" : "✔"}</span>
            <span class="delete-task">−</span>

        </div>
        `;

    if (task.important) div.classList.add("important-task");

    attachTaskEvents(div, task);

    return div;
}



function animateTaskMove(oldPositions) {
    document.querySelectorAll(".task-item").forEach(el => {
        const id = el.dataset.id;
        const old = oldPositions.get(id);
        if (!old) return;

        const newPos = el.getBoundingClientRect();
        const dx = old.left - newPos.left;
        const dy = old.top - newPos.top;

        if (dx || dy) {
            el.style.transform = `translate(${dx}px, ${dy}px)`;
            el.style.transition = "transform 0s";

            requestAnimationFrame(() => {
                el.style.transform = "";
                el.style.transition = "transform 0.3s ease";
            });
        }
    });
}

let lastAction = null;

function showUndoBar(message, taskData, type) {
    const bar = document.getElementById("undoBar");
    const text = document.getElementById("undoText");

    if (!bar || !text) {
        console.warn("Undo UI missing");
        return;
    }

    text.textContent = message;
    bar.classList.add("show");

    lastAction = { taskData, type };

    clearTimeout(window.undoTimeout);

    window.undoTimeout = setTimeout(() => {
        bar.classList.remove("show");
        lastAction = null;
    }, 4000);
}


function attachTaskEvents(div, task) {

    // ================= EXPAND =================
    div.addEventListener("click", () => {
        const alreadyExpanded = div.classList.contains("expanded");

        document.querySelectorAll(".task-item").forEach(t => {
            t.classList.remove("expanded");
        });

        document.body.classList.remove("tasks-blur-active");

        if (!alreadyExpanded) {
            div.classList.add("expanded");
            document.body.classList.add("tasks-blur-active");

            setTimeout(() => {
                div.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 50);
        }
    });

    // ================= SWIPE =================
    // ================= SAFE SWIPE HANDLER =================
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let isSwiping = false;
    let ignoreSwipe = false;

    const SWIPE_THRESHOLD = 100;   // action trigger
    const DRAG_THRESHOLD = 15;     // minimum movement to start swipe

    div.addEventListener("touchstart", (e) => {

        // 🚫 Ignore swipe if touching buttons
        if (e.target.closest(".move-task, .delete-task, .important-toggle, .edit-task")) {
            ignoreSwipe = true;
            return;
        }

        ignoreSwipe = false;
        isSwiping = false;

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;

        div.style.transition = "none";
    });

    div.addEventListener("touchmove", (e) => {
        if (ignoreSwipe) return;

        const touch = e.touches[0];
        currentX = touch.clientX;

        const diffX = currentX - startX;
        const diffY = touch.clientY - startY;

        // 🚫 Ignore vertical scroll
        if (Math.abs(diffY) > Math.abs(diffX)) return;

        // ✅ Only start swipe after threshold
        if (!isSwiping && Math.abs(diffX) > DRAG_THRESHOLD) {
            isSwiping = true;
        }

        if (!isSwiping) return;

        div.style.transform = `translateX(${diffX}px)`;

        // 🎯 DYNAMIC OPACITY BASED ON SWIPE DISTANCE
        const maxDistance = window.innerWidth * 0.6; // how far before full fade
        const distance = Math.min(Math.abs(diffX), maxDistance);

        // opacity: 1 → 0.3
        const opacity = 1 - (distance / maxDistance) * 0.7;

        div.style.opacity = opacity;

        div.classList.toggle("swiping-right", diffX > 30);
        div.classList.toggle("swiping-left", diffX < -30);
    });

    div.addEventListener("touchend", () => {

        if (ignoreSwipe || !isSwiping) {
            // 👉 This was a TAP, not swipe → do nothing
            div.style.transform = "translateX(0)";
            ignoreSwipe = false;
            isSwiping = false;
            return;
        }

        const diff = currentX - startX;

        const device = devices[task.dIndex];
        if (!device) return;

        const index = device.tasks.findIndex(t => t.order === task.order);
        if (index === -1) return;

        // ✅ COMPLETE (RIGHT SWIPE)
        if (diff > SWIPE_THRESHOLD) {
            div.classList.add("complete-anim");

            const backup = { ...device.tasks[index], dIndex: task.dIndex, tIndex: index };

            setTimeout(() => {
                device.tasks[index].completed = true;
                device.tasks[index].completedDate = getTodayDate();

                saveAndRender();
                showUndoBar("Task completed", backup, "complete");
            }, 200);

            return;
        }

        // ❌ DELETE (LEFT SWIPE)
        if (diff < -SWIPE_THRESHOLD) {
            div.classList.add("delete-anim");

            const deletedTask = { ...device.tasks[index], dIndex: task.dIndex, tIndex: index };

            setTimeout(() => {
                device.tasks.splice(index, 1);
                saveAndRender();
                showUndoBar("Task deleted", deletedTask, "delete");
            }, 200);

            return;
        }

        // 🔄 RESET (small swipe)
        div.style.transition = "all 0.25s ease";
        div.style.opacity = "1";
        div.style.willChange = "transform, opacity";
        div.style.transform = "translateX(0)";
        div.classList.remove("swiping-left", "swiping-right");

        isSwiping = false;
    });

    // ================= ⭐ IMPORTANT =================
    const starBtn = div.querySelector(".important-toggle");

    starBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        const realTask = devices[task.dIndex]?.tasks?.[task.tIndex];
        if (!realTask) return;

        div.classList.add("marking-important");

        setTimeout(() => {
            realTask.important = !realTask.important;
            saveAndRender();
        }, 150);
    });


    // ================= ❌ DELETE BUTTON =================
    div.querySelector(".delete-task").addEventListener("click", (e) => {
        e.stopPropagation();

        const device = devices[task.dIndex];
        if (!device) return;

        const index = device.tasks.findIndex(t => t.order === task.order);
        if (index === -1) return;

        const deletedTask = {
            ...device.tasks[index],
            dIndex: task.dIndex,
            tIndex: index
        };

        // 🎬 DELETE ANIMATION
        div.classList.add("delete-anim");

        setTimeout(() => {
            device.tasks.splice(index, 1);
            saveAndRender();
            showUndoBar("Task deleted", deletedTask, "delete");
        }, 220);
    });


    // ================= ✔ COMPLETE BUTTON =================
    div.querySelector(".move-task").addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();

        const device = devices[task.dIndex];
        if (!device) return;

        const index = device.tasks.findIndex(t => t.order === task.order);
        if (index === -1) return;

        const realTask = device.tasks[index];

        const backup = {
            ...realTask,
            dIndex: task.dIndex,
            tIndex: index
        };

        // 🎬 ADD ANIMATION
        div.classList.add("complete-anim");

        setTimeout(() => {
            realTask.completed = !realTask.completed;

            if (realTask.completed) {
                realTask.completedDate = getTodayDate();
                showUndoBar("Task completed", backup, "complete");
            } else {
                realTask.completedDate = null;
            }

            saveAndRender();
        }, 220); // match CSS timing
    });


    // ================= ✏ EDIT =================
    div.querySelector(".edit-task").addEventListener("click", (e) => {
        e.stopPropagation();

        div.classList.add("editing-highlight");

        setTimeout(() => {
            editingTaskInfo = { deviceIndex: task.dIndex, taskIndex: task.tIndex };

            popupInput.value = task.text;
            document.getElementById("taskDueDate").value = task.dueDate || "";

            taskPopupTitle.textContent = "Edit Task";
            taskPopup.classList.add("active");
        }, 150);
    });
}




function captureTaskPositions() {
    const map = new Map();
    document.querySelectorAll(".task-item").forEach(el => {
        map.set(el.dataset.id, el.getBoundingClientRect());
    });
    return map;
}



function renderTasks() {


    setTimeout(() => {

        allTasksContainer.innerHTML = "";
        completedContainer.innerHTML = "";
        importantContainer.innerHTML = "";

        let taskNumber = 1;
        let activeTasks = 0;

        let allActiveTasks = [];
        let allCompletedTasks = [];
        let importantTasks = [];

        devices.forEach((device, dIndex) => {
            if (selectedDeviceIndex !== null && dIndex !== selectedDeviceIndex) return;

            device.tasks.forEach((task, tIndex) => {
                const taskObj = {
                    ...task,
                    dIndex,
                    tIndex,
                    deviceName: device.name
                };

                if (task.completed) {
                    allCompletedTasks.push(taskObj);
                } else {
                    allActiveTasks.push(taskObj);

                    if (task.important) {
                        importantTasks.push(taskObj);
                    }
                }
            });
        });

        const seen = new Set();
        const combinedActive = sortTasks(
            [...importantTasks, ...allActiveTasks].filter(task => {
                if (seen.has(task.order)) return false;
                seen.add(task.order);
                return true;
            })
        );

        if (combinedActive.length === 0) {
            allTasksContainer.innerHTML = `<div class="tab"><p>No Tasks Added</p></div>`;
        } else {
            combinedActive.forEach(task => {
                const div = createTaskCard(task, taskNumber++);
                allTasksContainer.appendChild(div);
            });
        }

        activeTasks = combinedActive.length;

        if (importantTasks.length === 0) {
            importantContainer.innerHTML = `<div class="tab"><p>No Important Tasks</p></div>`;
        } else {
            sortTasks(importantTasks).forEach(task => {
                const div = createTaskCard(task, "");
                importantContainer.appendChild(div);
            });
        }

        if (allCompletedTasks.length === 0) {
            completedContainer.innerHTML = `<p>No completed tasks</p>`;
        } else {
            allCompletedTasks.forEach(task => {
                const div = createTaskCard(task, "");
                div.classList.add("completed-task");
                completedContainer.appendChild(div);
            });
        }

        updateActiveCountUI(activeTasks);
        applyTaskFilter();
        updateQuickTabCounts();
        renderHomeDashboard();

    }, 300); // simulate loading
}





renderDevices();
renderTasks();
renderHomeDashboard();


function updateQuickTabCounts() {
    const today = new Date().toISOString().split("T")[0];

    let todayCount = 0,
        upcomingCount = 0,
        overdueCount = 0;

    devices.forEach(device => {
        device.tasks.forEach(task => {
            const date = task.dueDate;
            const isCompleted = task.completed;

            if (!date) return;

            if (date === today && !isCompleted) todayCount++;
            else if (date > today && !isCompleted) upcomingCount++;
            else if (date < today && !isCompleted) overdueCount++;
        });
    });

    const tEl = document.getElementById("todayCount");
    const uEl = document.getElementById("upcomingCount");
    const oEl = document.getElementById("overdueCount");

    tEl.textContent = todayCount;
    uEl.textContent = upcomingCount;
    oEl.textContent = overdueCount;

    tEl.classList.toggle("zero", todayCount === 0);
    uEl.classList.toggle("zero", upcomingCount === 0);
    oEl.classList.toggle("zero", overdueCount === 0);
}


//==========================================ASSIGNED TASKS=========================================


function animateReorder(container) {
    const items = [...container.children];
    const positions = new Map();

    items.forEach(item => {
        positions.set(item, item.getBoundingClientRect().top);
    });

    requestAnimationFrame(() => {
        items.forEach(item => {
            const newTop = item.getBoundingClientRect().top;
            const oldTop = positions.get(item);
            const delta = oldTop - newTop;

            if (delta) {
                item.style.transform = `translateY(${delta}px)`;
                item.style.transition = "transform 0s";

                requestAnimationFrame(() => {
                    item.style.transform = "";
                    item.style.transition = "transform 0.25s ease";
                });
            }
        });
    });
}


function renderAssignedTasks() {
    assignedList.innerHTML = "";
    assignedTitle.textContent = `Assigned Tasks (${tempTasks.length})`;

    if (tempTasks.length === 0) {
        assignedList.innerHTML = "<p>No tasks added yet.</p>";
        return;
    }

    tempTasks.forEach((task, index) => {
        const div = document.createElement("div");
        div.className = "assigned-task-item";
        div.draggable = true;
        div.dataset.index = index;

        div.innerHTML = `
        <span class="assigned-task-text">
            <strong>${index + 1}.</strong> 
            ${task.important ? '<span class="assigned-star">⭐</span>' : ''}
            ${task.text}
        </span>
        <span class="delete-assigned-task" data-index="${index}">−</span>
        `;


        // ✅ TOUCH DRAG START
        div.addEventListener("touchstart", () => {
            touchStartIndex = index;
            currentTouchItem = div;
            div.classList.add("dragging");
        }, { passive: true });

        // ✅ TOUCH MOVE REORDER
        div.addEventListener("touchmove", (e) => {
            const touch = e.touches[0];
            const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
            const targetItem = elementAtPoint?.closest(".assigned-task-item");

            if (!targetItem || targetItem === currentTouchItem) return;

            const targetIndex = Number(targetItem.dataset.index);

            const movedTask = tempTasks.splice(touchStartIndex, 1)[0];
            tempTasks.splice(targetIndex, 0, movedTask);

            touchStartIndex = targetIndex;
            renderAssignedTasks();
            animateReorder(assignedList);
        }, { passive: false });

        // ✅ TOUCH END
        div.addEventListener("touchend", () => {
            document.querySelectorAll(".assigned-task-item").forEach(i =>
                i.classList.remove("dragging")
            );
            updateAssignedCount();
        });

        assignedList.appendChild(div);
    });

    addAssignedDeleteEvents();
}


function updateAssignedCount() {
    assignedBtn.textContent = `Assigned Tasks (${tempTasks.length})`;
}



const dragHint = document.getElementById("dragHint");

function updateDragHint() {
    if (tempTasks.length > 1) {
        dragHint.style.display = "block";
    } else {
        dragHint.style.display = "none";
    }
}


let dragStartIndex = null;

assignedList.addEventListener("dragstart", (e) => {
    const item = e.target.closest(".assigned-task-item");
    if (!item) return;

    dragStartIndex = Number(item.dataset.index);
    item.classList.add("dragging");
});

assignedList.addEventListener("dragover", (e) => {
    e.preventDefault(); // allows drop
});

assignedList.addEventListener("drop", (e) => {
    const item = e.target.closest(".assigned-task-item");
    if (!item) return;

    const dragEndIndex = Number(item.dataset.index);

    // Swap tasks
    const movedTask = tempTasks.splice(dragStartIndex, 1)[0];
    tempTasks.splice(dragEndIndex, 0, movedTask);

    renderAssignedTasks();
    animateReorder(assignedList);
    updateAssignedCount();

});

assignedList.addEventListener("dragend", () => {
    document.querySelectorAll(".assigned-task-item").forEach(i =>
        i.classList.remove("dragging")
    );
});




function addAssignedDeleteEvents() {
    const deleteBtns = document.querySelectorAll(".delete-assigned-task");

    deleteBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.getAttribute("data-index");
            tempTasks.splice(index, 1);
            renderAssignedTasks();
            updateAssignedCount();
            updateDragHint();

        });
    });
}


assignedBtn.addEventListener("click", () => {
    renderAssignedTasks();
    assignedPopup.classList.add("active");
});

assignedPopup.addEventListener("click", (e) => {
    if (e.target === assignedPopup) {
        assignedPopup.classList.remove("active");
    }
});


closeAssignedTasks.addEventListener("click", () => {
    assignedPopup.classList.remove("active");
});

//====================================================================================================


const deviceNameField = document.getElementById("deviceNameInput");
const addDeviceName = document.getElementById('addDeviceName')
const deviceTabs = document.querySelectorAll(".device-tab");

deviceTabs.forEach(tab => {
    tab.addEventListener("click", () => {

        // Remove selection from tabs
        deviceTabs.forEach(t => t.classList.remove("selected"));
        tab.classList.add("selected");

        // Remove all previous highlight classes
        deviceNameField.classList.remove(
            "mobile-highlight",
            "tablet-highlight",
            "laptop-highlight",
            "more-highlight",
            "device-highlight"
        );

        const deviceType = tab.textContent.trim();

        if (deviceType === "More...") {
            deviceNameField.value = "";
            deviceNameField.focus();
            deviceNameField.classList.add("device-highlight", "more-highlight");
        }
        else if (deviceType === "Mobile") {
            deviceNameField.value = "Mobile";
            deviceNameField.classList.add("device-highlight", "mobile-highlight");
        }
        else if (deviceType === "Tablet") {
            deviceNameField.value = "Tablet";
            deviceNameField.classList.add("device-highlight", "tablet-highlight");
        }
        else if (deviceType === "Laptop") {
            deviceNameField.value = "Laptop";
            deviceNameField.classList.add("device-highlight", "laptop-highlight");
        }
    });
});



function renderDevices() {
    devicesContainer.innerHTML = "";

    if (devices.length === 0) {
        devicesContainer.innerHTML = `<div class="tab"><p>No Devices Added</p></div>`;
        return;
    }

    devices.forEach((device, index) => {
        if (device.name === "Individual") return;
        const div = document.createElement("div");
        div.className = "tab device-item";
        if (index === selectedDeviceIndex) div.classList.add("selected-device");

        div.innerHTML = `
            <span class="device-name">${device.name}</span>
            <span class="task-count">${device.tasks.length}</span>
            <span class="add-task" data-index="${index}">+</span>
            <span class="delete-device" data-index="${index}">−</span>
        `;



        // CLICK DEVICE TO FILTER TASKS
        div.addEventListener("click", () => {
            // If already selected → deselect
            if (selectedDeviceIndex === index) {
                selectedDeviceIndex = null;
            } else {
                selectedDeviceIndex = index;
            }

            renderDevices();
            renderTasks();
            renderHomeDashboard();
        });


        devicesContainer.appendChild(div);
    });

    addDeviceTaskEvents();

    addDeleteDeviceEvents();
}


devicesContainer.addEventListener("click", (e) => {
    // If click is NOT on a device tab or its children
    if (!e.target.closest(".device-item")) {
        selectedDeviceIndex = null;
        renderDevices();
        renderTasks();
        renderHomeDashboard();
    }
});


//=============================================DELETE POPUP LOGIC===================================







function addDeleteDeviceEvents() {
    const deleteBtns = document.querySelectorAll(".delete-device");

    deleteBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();

            deviceIndexToDelete = Number(btn.getAttribute("data-index"));
            deletePopup.classList.add("active");
        });
    });
}






deleteYesBtn.addEventListener("click", () => {
    if (deviceIndexToDelete !== null) {

        if (selectedDeviceIndex === deviceIndexToDelete) {
            selectedDeviceIndex = null;
        }

        devices.splice(deviceIndexToDelete, 1);
        deviceIndexToDelete = null;

        deletePopup.classList.remove("active");
        saveAndRender();
    }
});

deleteNoBtn.addEventListener("click", () => {
    deviceIndexToDelete = null;
    deletePopup.classList.remove("active");
});


deletePopup.addEventListener("click", (e) => {
    if (e.target === deletePopup) {
        deletePopup.classList.remove("active");
        deviceIndexToDelete = null;
    }
});


//=======================================================================================================

function addDeviceTaskEvents() {
    const addBtns = document.querySelectorAll(".add-task");

    addBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();

            editingTaskInfo = null; // new task
            deviceIndexForTask = btn.getAttribute("data-index");

            // 🔥 FULL RESET FOR NEW TASK
            popupInput.value = "";
            popupInput.placeholder = "Enter task...";
            popupInput.style.height = "auto";
            document.getElementById("taskDueDate").value = ""; // CLEAR OLD DATE

            const box = document.querySelector(".task-popup-box");
            box.classList.remove("edit-mode");

            taskPopupTitle.textContent = "Add Task";

            taskPopup.classList.add("active");
            popupInput.focus();
        });
    });
}




saveTaskPopup.addEventListener("click", () => {
    let text = popupInput.value.trim();

    if (!text) {
        showTaskFieldError("Enter a task first");
        return;
    }



    text = text.slice(0, 150);

    if (editingTaskInfo) {
        const { deviceIndex, taskIndex } = editingTaskInfo;

        devices[deviceIndex].tasks[taskIndex].text = text;
        devices[deviceIndex].tasks[taskIndex].dueDate =
            document.getElementById("taskDueDate").value || null;

        editingTaskInfo = null;
    }
    else {
        const dueDate =
            window.selectedTaskDate ||
            document.getElementById("taskDueDate").value ||
            null;

        if (isIndividualTask) {
            // ✅ Create a virtual "Individual" device
            let individualDevice = devices.find(d => d.name === "Individual");

            if (!individualDevice) {
                individualDevice = {
                    name: "Individual",
                    tasks: []
                };
                devices.push(individualDevice);
            }


            const now = Date.now();

            let duration = 0;

            if (window.selectedTaskTime === "10 min") duration = 10 * 60 * 1000;
            if (window.selectedTaskTime === "20 min") duration = 20 * 60 * 1000;
            if (window.selectedTaskTime === "1 hr") duration = 60 * 60 * 1000;
            if (window.selectedTaskTime === "2 hr") duration = 2 * 60 * 60 * 1000;


            individualDevice.tasks.push({
                text,
                completed: false,
                dueDate,
                important: false,
                order: Date.now(),
                startTime: now,
                endTime: duration ? now + duration : null,
                timeLabel: window.selectedTaskTime || null
            });
        }
        else {
            if (deviceIndexForTask === null) {
                showTaskFieldError("Please select a device");
                return;
            }

            const now = Date.now();

            let duration = 0;

            if (window.selectedTaskTime === "10 min") duration = 10 * 60 * 1000;
            if (window.selectedTaskTime === "20 min") duration = 20 * 60 * 1000;
            if (window.selectedTaskTime === "1 hr") duration = 60 * 60 * 1000;
            if (window.selectedTaskTime === "2 hr") duration = 2 * 60 * 60 * 1000;

            devices[deviceIndexForTask].tasks.push({
                text,
                completed: false,
                dueDate,
                important: false,
                order: Date.now(),

                // ✅ ADD THESE
                startTime: now,
                endTime: duration ? now + duration : null,
                timeLabel: window.selectedTaskTime || null
            });
        }
    }

    taskPopup.classList.remove("active");
    document.querySelector(".task-popup-box").classList.remove("edit-mode");
    saveAndRender();
});


taskPopup.addEventListener("click", (e) => {
    if (e.target === taskPopup) {
        popupInput.value = "";
        document.getElementById("taskDueDate").value = "";
        document.querySelector(".task-popup-box").classList.remove("edit-mode");
        editingTaskInfo = null;
        taskPopup.classList.remove("active");
    }
});

cancelTaskPopup.addEventListener("click", () => {
    popupInput.value = "";
    document.getElementById("taskDueDate").value = "";
    document.querySelector(".task-popup-box").classList.remove("edit-mode");
    editingTaskInfo = null;
    taskPopup.classList.remove("active");
});



popupInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        saveTaskPopup.click();  // triggers the same save logic
    }
});

function autoResizeTextarea(el) {
    el.style.height = "auto";            // reset
    el.style.height = el.scrollHeight + "px"; // grow to content
}

popupInput.addEventListener("input", () => {
    autoResizeTextarea(popupInput);
});




document.addEventListener("click", (e) => {
    const clickedTask = e.target.closest(".task-item");
    const clickedQuick = e.target.closest(".quick-tab");

    if (!clickedTask && !clickedQuick) {
        currentFilter = null;
        clearAllHighlights();
    }
});


const taskFieldToast = document.getElementById("taskFieldToast");

function showTaskFieldError(message) {
    taskFieldToast.textContent = message;
    taskFieldToast.classList.add("show");

    popupInput.classList.add("input-error");

    setTimeout(() => {
        taskFieldToast.classList.remove("show");
        popupInput.classList.remove("input-error");
    }, 1800);
}



//====================================================REMAINDERS============================================

function scrollToTasksAndHighlight(filterType) {
    clearAllHighlights();

    const today = new Date().toISOString().split("T")[0];
    let matchedTasks = [];

    document.querySelectorAll(".task-item").forEach(task => {
        const date = task.querySelector(".task-date")?.dataset.date;
        const isCompleted = task.classList.contains("completed-task");

        let match = false;

        if (filterType === "today" && date === today && !isCompleted) match = true;
        if (filterType === "upcoming" && date && date > today && !isCompleted) match = true;
        if (filterType === "overdue" && date && date < today && !isCompleted) match = true;

        if (match) {
            task.classList.add("highlight-active");
            matchedTasks.push(task);
        }
    });

    if (matchedTasks.length === 0) {
        showTabPopup(
            document.querySelector(`.${filterType}-tasks`),
            filterType === "today"
                ? "There are no tasks to do today"
                : filterType === "upcoming"
                    ? "No upcoming tasks scheduled"
                    : "No overdue tasks 🎉"
        );
        return;
    }

    // ⭐ CHECK IMPORTANT TASKS ONLY FOR THIS FILTER
    let hasImportantForFilter = false;

    document.querySelectorAll(".important-tasks .task-item").forEach(task => {
        const date = task.querySelector(".task-date")?.dataset.date;
        const today = new Date().toISOString().split("T")[0];

        if (
            (filterType === "today" && date === today) ||
            (filterType === "upcoming" && date && date > today) ||
            (filterType === "overdue" && date && date < today)
        ) {
            hasImportantForFilter = true;
        }
    });

    if (hasImportantForFilter) {
        // Center between Important section and My Tasks section
        const impRect = importantSection.getBoundingClientRect();
        const myRect = myTasksSection.getBoundingClientRect();

        const middlePoint = (impRect.top + myRect.bottom) / 2 + window.scrollY;

        window.scrollTo({
            top: middlePoint - window.innerHeight / 2,
            behavior: "smooth"
        });

    } else {
        // No important tasks → center My Tasks section only
        const myRect = myTasksSection.getBoundingClientRect();
        const centerPoint =
            myRect.top + window.scrollY - window.innerHeight / 2 + myRect.height / 2;

        window.scrollTo({
            top: centerPoint,
            behavior: "smooth"
        });
    }

}




//-----------------------buttons------------------

function applyTaskFilter() {
    clearAllHighlights();
    if (!currentFilter) return;

    const today = new Date().toISOString().split("T")[0];

    document.querySelectorAll(".task-item").forEach(t => {
        const date = t.querySelector(".task-date")?.dataset.date;
        const isCompleted = t.classList.contains("completed-task");

        if (currentFilter === "today" && date === today) {
            t.classList.add("highlight-active");
        }

        if (currentFilter === "upcoming" && date && date > today) {
            t.classList.add("highlight-active");
        }

        if (currentFilter === "overdue" && date && date < today && !isCompleted) {
            t.classList.add("highlight-active");
        }
    });
}


let popupTimeout;

function showTabPopup(button, message) {
    const popup = button.querySelector(".tab-popup");
    if (!popup) return;

    popup.textContent = message;
    popup.classList.add("show");

    setTimeout(() => {
        popup.classList.remove("show");
    }, 2000);
}





document.querySelector(".important-tasks-btn").onclick = function () {
    clearAllHighlights();

    const importantCards = document.querySelectorAll(".important-tasks .task-item");

    if (importantCards.length === 0) {
        showTabPopup(this, "No important tasks yet ⭐");
        return;
    }

    // Highlight all important tasks
    importantCards.forEach(card => card.classList.add("highlight-active"));

    // Scroll FIRST important task to center of screen
    const firstImportant = importantCards[0];

    setTimeout(() => {
        firstImportant.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, 100); // small delay helps after layout updates
};




document.querySelector(".today-tasks").onclick = function () {

    scrollToTasksAndHighlight('today');

};





document.querySelector(".upcoming-tasks").onclick = function () {

    scrollToTasksAndHighlight('upcoming');
};





document.querySelector(".overdue-tasks").onclick = function () {
    scrollToTasksAndHighlight('overdue');

};





function autoResize(el) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
}

taskInput.addEventListener("input", () => autoResize(taskInput));



//================================================================================================



function loadTodayTasks() {
    const today = new Date().toISOString().split("T")[0];
    const container = document.getElementById("todayContent");

    container.innerHTML = "";

    let found = false;
    let taskNumber = 1;

    devices.forEach((device, dIndex) => {
        device.tasks.forEach((task, tIndex) => {

            if (task.dueDate === today && !task.completed) {

                const taskObj = {
                    ...task,
                    dIndex,
                    tIndex,
                    deviceName: device.name
                };

                const card = createTaskCard(taskObj, taskNumber++);
                container.appendChild(card);

                found = true;
            }
        });
    });

    if (!found) showEmptyState(container, "No tasks for today 🎉");
}


function loadOverdueTasks() {
    const today = new Date().toISOString().split("T")[0];
    const container = document.getElementById("overdueContent");

    container.innerHTML = "";

    let found = false;
    let taskNumber = 1;

    devices.forEach((device, dIndex) => {
        device.tasks.forEach((task, tIndex) => {

            if (task.dueDate < today && !task.completed) {

                const taskObj = {
                    ...task,
                    dIndex,
                    tIndex,
                    deviceName: device.name
                };

                const card = createTaskCard(taskObj, taskNumber++);
                container.appendChild(card);

                found = true;
            }
        });
    });

    if (!found) showEmptyState(container, "No overdue tasks 🎉");
}


function loadAllTasks() {
    const container = document.getElementById("allContent");

    container.innerHTML = "";

    let found = false;
    let taskNumber = 1;

    devices.forEach((device, dIndex) => {
        device.tasks.forEach((task, tIndex) => {

            const taskObj = {
                ...task,
                dIndex,
                tIndex,
                deviceName: device.name
            };

            const card = createTaskCard(taskObj, taskNumber++);
            container.appendChild(card);

            found = true;
        });
    });

    if (!found) showEmptyState(container, "No tasks yet");
}

function loadCompletedTasks() {
    const container = document.getElementById("completedContent");

    container.innerHTML = "";

    let found = false;

    devices.forEach((device, dIndex) => {
        device.tasks.forEach((task, tIndex) => {

            if (task.completed) {

                const taskObj = {
                    ...task,
                    dIndex,
                    tIndex,
                    deviceName: device.name
                };

                const card = createTaskCard(taskObj, "");
                card.classList.add("completed-task");

                container.appendChild(card);

                found = true;
            }
        });
    });

    if (!found) showEmptyState(container, "No completed tasks yet");
}




function loadImportantTasks() {
    const container = document.getElementById("importantContent");

    container.innerHTML = "";

    let found = false;
    let taskNumber = 1;

    devices.forEach((device, dIndex) => {
        device.tasks.forEach((task, tIndex) => {

            if (task.important && !task.completed) {

                const taskObj = {
                    ...task,
                    dIndex,
                    tIndex,
                    deviceName: device.name
                };

                const card = createTaskCard(taskObj, taskNumber++);
                container.appendChild(card);

                found = true;
            }
        });
    });

    if (!found) showEmptyState(container, "No important tasks ⭐");
}

// function createOverlayTaskCard(task, deviceName = "") {
//     const div = document.createElement("div");
//     div.className = "task-item tab"; // ✅ SAME STYLE AS MAIN CARDS

//     const today = new Date().toISOString().split("T")[0];
//     let dateClass = "";

//     if (task.dueDate) {
//         if (task.dueDate < today && !task.completed) dateClass = "overdue-date";
//         else if (task.dueDate === today) dateClass = "today-date";
//         else if (task.dueDate > today) dateClass = "upcoming-date";
//     }

//     div.innerHTML = `
//         <span class="task-text">
//             <span class="device-label">${deviceName}</span>
//             ${task.important ? `<span class="assigned-star">⭐</span>` : ""}
//             ${task.text}
//         </span>

//         ${task.dueDate ? `
//         <div class="task-date ${dateClass}">
//             📅 ${task.dueDate}
//         </div>` : ""}

//         <span class="important-toggle ${task.important ? "active" : ""}">★</span>
//     `;

//     if (task.important) div.classList.add("important-task");
//     if (task.completed) div.classList.add("completed-task");

//     return div;
// }




function showEmptyState(container, message) {
    container.innerHTML = "";

    const div = document.createElement("div");
    div.className = "empty-state";

    div.innerHTML = `
        <p>${message}</p>
    `;

    container.appendChild(div);
}




let lastDeletedTask = null;
let undoTimeout = null;

function showUndo(task, deviceIndex, taskIndex) {
    lastDeletedTask = { task, deviceIndex, taskIndex };

    const bar = document.getElementById("undoBar");
    bar.classList.add("show");

    clearTimeout(undoTimeout);

    undoTimeout = setTimeout(() => {
        bar.classList.remove("show");
        lastDeletedTask = null;
    }, 4000);
}

document.getElementById("undoBtn").onclick = () => {
    if (!lastAction) return;

    const { taskData, type } = lastAction;

    const device = devices[taskData.dIndex];
    if (!device) return;

    if (type === "delete") {
        device.tasks.splice(taskData.tIndex, 0, taskData);
    }

    if (type === "complete") {
        const index = device.tasks.findIndex(t => t.order === taskData.order);
        if (index !== -1) {
            device.tasks[index].completed = false;
            device.tasks[index].completedDate = null;
        }
    }

    saveAndRender();

    document.getElementById("undoBar").classList.remove("show");
    lastAction = null;
};


// ===== STREAK SYSTEM =====

function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}

function getYesterdayDate() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
}

function getStreakData() {
    return JSON.parse(localStorage.getItem("streakData")) || {
        streak: 0,
        lastDate: null
    };
}

function saveStreakData(data) {
    localStorage.setItem("streakData", JSON.stringify(data));
}


function getTodayCompletedCount() {
    const today = getTodayDate();
    let count = 0;

    devices.forEach(device => {
        (device.tasks || []).forEach(task => {
            if (task.completed && task.completedDate === today) {
                count++;
            }
        });
    });

    return count;
}

function validateStreak() {
    let data = JSON.parse(localStorage.getItem("streakData")) || {
        current: 0,
        best: 0,
        lastDate: null
    };

    const today = getTodayDate();
    const yesterday = getYesterdayDate();

    if (data.lastDate && data.lastDate !== today && data.lastDate !== yesterday) {
        data.current = 0;
        localStorage.setItem("streakData", JSON.stringify(data));
    }
}


function migrateOldTasks() {
    let updated = false;

    devices.forEach(device => {
        (device.tasks || []).forEach(task => {

            // If old task (no endTime but has timeLabel)
            if (!task.endTime && task.timeLabel) {

                const duration = getDurationFromLabel(task.timeLabel);

                if (duration) {
                    const base = task.startTime || Date.now();

                    task.startTime = base;
                    task.endTime = base + duration;

                    updated = true;
                }
            }
        });
    });

    if (updated) {
        console.log("✅ Old tasks migrated");
        localStorage.setItem("devices", JSON.stringify(devices));
    }
}


setInterval(() => {
    document.querySelectorAll(".time-badge").forEach(badge => {

        // 🚫 STOP if already expired
        if (badge.classList.contains("expired")) return;

        const end = badge.dataset.end;
        if (!end) return;

        const remaining = end - Date.now();
        const textEl = badge.querySelector(".time-text");

        if (remaining <= 0) {
            textEl.textContent = "⛔ Done";
            badge.classList.add("expired");

            // ✅ REMOVE data so it won't process again
            badge.dataset.end = "";

            return;
        }

        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);

        textEl.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
    });
}, 1000);