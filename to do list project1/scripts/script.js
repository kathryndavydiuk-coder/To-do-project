// Хедер
const weekdayEl = document.querySelector("#today_weekday");
const dateEl = document.querySelector("#today_date");

// Діалог
const dialog = document.querySelector("#task_dialog");
const editBtn = document.querySelector(".editIcon");
const form = document.querySelector("#task_form");

// Список задач
const list = document.querySelector(".todo__list");
const template = document.querySelector("#todo_item_template");
const emptyEl = document.querySelector(".todo__empty");

// Фільтри
const filterButtons = document.querySelectorAll(".filters button");

/* ============================================================
   2. СТАН — дані застосунку
   ============================================================ */

let tasks = [];

/* ============================================================
   3. ФУНКЦІЇ
   ============================================================ */

// Оновлення поточної дати в хедері
function updateToday() {
  const now = new Date();

  const weekdays = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];

  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  weekdayEl.textContent = weekdays[now.getDay()];
  dateEl.textContent = `${now.getDate()} ${months[now.getMonth()]}, ${now.getFullYear()}`;
  dateEl.dateTime = now.toISOString().split("T")[0];
}

// Форматування ISO-дати у людський вигляд
function formatDate(isoString) {
  if (!isoString) return "";

  const d = new Date(isoString + "T00:00:00");
  const day = d.getDate();
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  const month = months[d.getMonth()];
  return `${day} ${month}`;
}

// Рендер задачі (тільки DOM)
function renderTask(taskData) {
  const clone = template.content.cloneNode(true);

  const input = clone.querySelector(".todo__check");
  const label = clone.querySelector(".todo__body");
  const time = clone.querySelector(".todo__date");
  const text = clone.querySelector(".todo__text");

  const id = `task_${taskData.id}`;

  input.id = id;
  input.checked = taskData.done;
  label.htmlFor = id;
  time.textContent = formatDate(taskData.date);
  time.dateTime = taskData.date || "";
  text.textContent = taskData.description;

  list.appendChild(clone);

  // Повісити обробник на новий чекбокс
  attachCheckboxListeners();
}

// Додати задачу (масив + storage + DOM)
function addTask(taskData) {
  taskData.id = Date.now();
  taskData.done = false;

  tasks.push(taskData);
  saveTasks();
  renderTask(taskData);
}

// Обробник submit форми
function handleFormSubmit(event) {
  if (event.submitter.value !== "confirm") return;

  const description = form.elements.description.value.trim();
  const date = form.elements.date.value;

  if (!description) {
    alert("Введите описание задачи");
    return;
  }

  if (description.length > 200) {
    alert("Описание слишком длинное (макс. 200 символов)");
    return;
  }

  addTask({ description, date });
  form.reset();
}

// Фільтрація
function applyFilter(filter) {
  const items = document.querySelectorAll(".todo__item");
  let visibleCount = 0;

  items.forEach((item) => {
    const isDone = item.querySelector(".todo__check").checked;

    let show = true;
    if (filter === "active") show = !isDone;
    if (filter === "done") show = isDone;

    item.hidden = !show;
    if (show) visibleCount++;
  });

  emptyEl.hidden = visibleCount > 0;
}

// Обробники чекбоксів
function attachCheckboxListeners() {
  const checkboxes = document.querySelectorAll(".todo__check");

  checkboxes.forEach((checkbox) => {
    if (checkbox.dataset.hasListener) return;
    checkbox.dataset.hasListener = "true";

    checkbox.addEventListener("change", () => {
      // Оновити done в масиві
      const id = Number(checkbox.id.replace("task_", ""));
      const task = tasks.find((t) => t.id === id);
      if (task) {
        task.done = checkbox.checked;
        saveTasks();
      }

      // Перерахувати фільтр
      const activeBtn = document.querySelector(
        '.filters button[aria-pressed="true"]',
      );
      applyFilter(activeBtn.dataset.filter);
    });
  });
}

// localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem("tasks");
  if (!saved) return;

  tasks = JSON.parse(saved);
  tasks.forEach((task) => renderTask(task));
}

/* ============================================================
   4. ОБРОБНИКИ ПОДІЙ
   ============================================================ */

editBtn.addEventListener("click", () => {
  dialog.showModal();
});

form.addEventListener("submit", handleFormSubmit);

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    applyFilter(btn.dataset.filter);
  });
});

/* ============================================================
   5. СТАРТ
   ============================================================ */

updateToday();
loadTasks();
attachCheckboxListeners();
