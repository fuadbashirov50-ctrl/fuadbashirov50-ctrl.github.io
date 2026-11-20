/* 2026-11-20 | v6.0 | Fuad Bashirov */
(function () {
  "use strict";

  const form = document.getElementById("contact-form");
  if (!form) return;

  const submitBtn = document.getElementById("submit-btn");
  const clearBtn = document.getElementById("clear-btn");
  const result = document.getElementById("form-result");
  const output = document.getElementById("form-output");
  const averageEl = document.getElementById("form-average");

  const fieldIds = ["firstName", "lastName", "email", "phone", "address", "q1", "q2", "q3"];
  const fields = {};
  fieldIds.forEach((id) => { fields[id] = document.getElementById(id); });

  const namePattern = /^[A-Za-zÀ-ž\s'-]+$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function phoneDigits(value) {
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("370")) digits = digits.slice(3);
    else if (digits.startsWith("8")) digits = digits.slice(1);
    return digits.slice(0, 8);
  }

  function formatPhone(value) {
    const digits = phoneDigits(value);
    if (digits.length === 0) return "";
    let text = "+370 " + digits.slice(0, 3);
    if (digits.length > 3) text += " " + digits.slice(3);
    return text;
  }

  function validateField(id) {
    const value = fields[id].value.trim();
    if (value === "") return "This field is required.";
    switch (id) {
      case "firstName":
      case "lastName":
        return namePattern.test(value) ? "" : "Use letters only.";
      case "email":
        return emailPattern.test(value) ? "" : "Enter a valid email address.";
      case "phone": {
        const digits = phoneDigits(value);
        if (digits.length !== 8) return "Enter 8 digits after +370.";
        if (digits[0] !== "6") return "Lithuanian mobile numbers start with 6.";
        return "";
      }
      case "q1":
      case "q2":
      case "q3": {
        const n = Number(value);
        return Number.isInteger(n) && n >= 1 && n <= 10 ? "" : "Enter a whole number from 1 to 10.";
      }
      default:
        return "";
    }
  }

  function showError(id, message) {
    const input = fields[id];
    const errorEl = document.getElementById(id + "-error");
    input.classList.toggle("is-invalid", message !== "");
    input.classList.toggle("is-valid", message === "" && input.value.trim() !== "");
    errorEl.textContent = message;
  }

  function updateSubmitState() {
    const allValid = fieldIds.every((id) => validateField(id) === "");
    submitBtn.disabled = !allValid;
  }

  function collectData() {
    return {
      firstName: fields.firstName.value.trim(),
      lastName: fields.lastName.value.trim(),
      email: fields.email.value.trim(),
      phone: formatPhone(fields.phone.value),
      address: fields.address.value.trim(),
      q1: Number(fields.q1.value),
      q2: Number(fields.q2.value),
      q3: Number(fields.q3.value)
    };
  }

  function calculateAverage(data) {
    return (data.q1 + data.q2 + data.q3) / 3;
  }

  function renderResult(data) {
    const rows = [
      ["First name", data.firstName],
      ["Last name", data.lastName],
      ["Email", data.email],
      ["Phone number", data.phone],
      ["Address", data.address],
      ["Question 1", data.q1],
      ["Question 2", data.q2],
      ["Question 3", data.q3]
    ];
    output.innerHTML = "";
    rows.forEach(([label, value]) => {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = label + ": ";
      p.appendChild(strong);
      p.appendChild(document.createTextNode(String(value)));
      output.appendChild(p);
    });
    const average = calculateAverage(data);
    averageEl.textContent = data.firstName + " " + data.lastName + ": " + average.toFixed(1);
    averageEl.className = "form-average " + (average >= 7 ? "avg-good" : average >= 4 ? "avg-mid" : "avg-low");
    result.hidden = false;
  }

  function clearForm() {
    form.reset();
    fieldIds.forEach((id) => {
      fields[id].classList.remove("is-invalid", "is-valid");
      document.getElementById(id + "-error").textContent = "";
    });
    output.innerHTML = "";
    averageEl.textContent = "";
    result.hidden = true;
    submitBtn.disabled = true;
  }

  fields.phone.addEventListener("input", () => {
    fields.phone.value = formatPhone(fields.phone.value);
  });

  fields.phone.addEventListener("keydown", (e) => {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  });

  fieldIds.forEach((id) => {
    fields[id].addEventListener("input", () => {
      showError(id, validateField(id));
      updateSubmitState();
    });
    fields[id].addEventListener("blur", () => {
      showError(id, validateField(id));
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const errors = fieldIds.map((id) => [id, validateField(id)]);
    errors.forEach(([id, message]) => showError(id, message));
    if (errors.some(([, message]) => message !== "")) {
      updateSubmitState();
      return;
    }
    const data = collectData();
    console.log(data);
    renderResult(data);
  });

  clearBtn.addEventListener("click", clearForm);
})();

(function () {
  "use strict";

  const STORAGE_KEY = "fb-cv-skill-board";
  const STATUSES = ["Planned", "In Progress", "Completed"];

  const initialSkills = [
    { id: 1, name: "Circuit analysis", status: "Completed", xp: 40 },
    { id: 2, name: "MATLAB plotting", status: "Completed", xp: 50 },
    { id: 3, name: "Soldering and prototyping", status: "Completed", xp: 30 },
    { id: 4, name: "Oscilloscope measurements", status: "Completed", xp: 20 },
    { id: 5, name: "KiCad PCB layout", status: "In Progress", xp: 60 },
    { id: 6, name: "Microcontroller C", status: "In Progress", xp: 70 },
    { id: 7, name: "Power electronics", status: "Planned", xp: 80 },
    { id: 8, name: "Digital signal filtering", status: "Planned", xp: 45 }
  ];

  const levels = [
    { level: 1, min: 0, next: 50, rank: "Beginner" },
    { level: 2, min: 50, next: 150, rank: "Trainee" },
    { level: 3, min: 150, next: 300, rank: "Specialist" },
    { level: 4, min: 300, next: null, rank: "Professional" }
  ];

  const columns = {
    "Planned": document.getElementById("pm-col-planned"),
    "In Progress": document.getElementById("pm-col-progress"),
    "Completed": document.getElementById("pm-col-completed")
  };
  if (!columns.Planned) return;

  const statusClass = {
    "Planned": "status-planned",
    "In Progress": "status-progress",
    "Completed": "status-completed"
  };

  let skills = loadSkills();

  function cloneInitial() {
    return initialSkills.map((skill) => ({ ...skill }));
  }

  function loadSkills() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(saved)) return cloneInitial();
      return initialSkills.map((skill) => {
        const stored = saved.find((s) => s.id === skill.id);
        const status = stored && STATUSES.includes(stored.status) ? stored.status : skill.status;
        return { ...skill, status };
      });
    } catch (e) {
      return cloneInitial();
    }
  }

  function saveSkills() {
    try {
      const state = skills.map((s) => ({ id: s.id, status: s.status }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Local Storage is not available.");
    }
  }

  function createCard(skill) {
    const card = document.createElement("div");
    card.className = "pm-card";
    card.dataset.id = skill.id;

    const title = document.createElement("h4");
    title.textContent = skill.name;

    const badge = document.createElement("span");
    badge.className = "pm-status " + statusClass[skill.status];
    badge.textContent = skill.status;

    const xp = document.createElement("span");
    xp.className = "pm-xp";
    xp.textContent = skill.xp + " XP";

    const select = document.createElement("select");
    select.className = "pm-select";
    select.setAttribute("aria-label", "Status of " + skill.name);
    STATUSES.forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      option.selected = status === skill.status;
      select.appendChild(option);
    });
    select.addEventListener("change", () => changeStatus(skill.id, select.value));

    card.append(title, badge, xp, select);
    return card;
  }

  function renderBoard() {
    Object.values(columns).forEach((col) => { col.innerHTML = ""; });
    skills.forEach((skill) => columns[skill.status].appendChild(createCard(skill)));
    Object.values(columns).forEach((col) => {
      if (!col.children.length) {
        const empty = document.createElement("p");
        empty.className = "pm-empty";
        empty.textContent = "No skills here yet.";
        col.appendChild(empty);
      }
    });
  }

  function calculateXP() {
    return skills
      .filter((s) => s.status === "Completed")
      .reduce((sum, s) => sum + s.xp, 0);
  }

  function getLevel(xp) {
    let current = levels[0];
    levels.forEach((l) => { if (xp >= l.min) current = l; });
    return current;
  }

  function updateProgressInfo() {
    const xp = calculateXP();
    const lvl = getLevel(xp);
    document.getElementById("pm-xp").textContent = xp;
    document.getElementById("pm-level").textContent = lvl.level;
    document.getElementById("pm-rank").textContent = lvl.rank;
    updateProgressBar(xp, lvl);
  }

  function updateProgressBar(xp, lvl) {
    const fill = document.getElementById("pm-bar-fill");
    const text = document.getElementById("pm-bar-text");
    let percent;
    if (lvl.next === null) {
      percent = 100;
      text.textContent = xp + " XP - maximum level";
    } else {
      percent = Math.round(((xp - lvl.min) / (lvl.next - lvl.min)) * 100);
      text.textContent = xp + " / " + lvl.next + " XP";
    }
    fill.style.width = percent + "%";
    fill.parentElement.setAttribute("aria-valuenow", percent);
  }

  function updateStatistics() {
    const total = skills.length;
    const done = skills.filter((s) => s.status === "Completed").length;
    const percent = total ? Math.round((done / total) * 100) : 0;
    document.getElementById("pm-total").textContent = total;
    document.getElementById("pm-done").textContent = done;
    document.getElementById("pm-percent").textContent = percent + "%";
  }

  function refreshModule() {
    renderBoard();
    updateProgressInfo();
    updateStatistics();
  }

  function changeStatus(id, status) {
    const skill = skills.find((s) => s.id === id);
    if (!skill || !STATUSES.includes(status)) return;
    skill.status = status;
    saveSkills();
    refreshModule();
  }

  const resetBtn = document.getElementById("pm-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      skills = cloneInitial();
      refreshModule();
    });
  }

  refreshModule();
})();
