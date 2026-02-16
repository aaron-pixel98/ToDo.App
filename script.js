document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("taskInput");
  const button = document.getElementById("addBtn");
  const list = document.getElementById("taskList");
  const toggle = document.getElementById("themeToggle");
  const counter = document.getElementById("taskCounter");
  const clearBtn = document.getElementById("clearCompleted");
  let draggedIndex = null;


  /* ===== detectar modo guardado o sistema ===== */
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
   document.body.classList.toggle("dark", savedTheme === "dark");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.classList.toggle("dark", prefersDark);
  }

  /* ===== botón cambiar tema ===== */
  toggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");

    localStorage.setItem("theme", isDark ? "dark" : "light");
  });


  // ===== ESTADO REAL DE LA APP =====
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let currentFilter = "all";
  
  // ===== DIBUJAR TAREAS GUARDADAS =====
  renderFilteredTasks();
  updateCounter();

  //Funcion para agregar declarada antes
  function addTask() {
    const text = input.value.trim();
    if (text === "") return input.focus();

    const newTask = {
      text: text,
      done: false,
    };

    tasks.push(newTask);
    saveTasks();
    renderFilteredTasks();
    updateCounter();

    input.value = "";
    input.focus();
  }

  // ===== AGREGAR NUEVA TAREA =====
  button.addEventListener("click", addTask);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addTask();
    }
    
  });
  // ===== FUNCIONES =====

  function renderTask(task) {
    const li = document.createElement("li");
    li.classList.add("new");
    li.draggable = true;

    li.innerHTML = `
      <label class="task">
      <input type="checkbox" class="check" ${task.done ? "checked" : ""}>
      <span class="checkmark"></span>
      <span class="text">${task.text}</span>
      </label>
      <button class="delete">✕</button>
    `;

    if (task.done) li.classList.add("done");

    // marcar completada
    li.querySelector(".check").addEventListener("change", (e) => {
      task.done = e.target.checked;
      li.classList.toggle("done", task.done);
      saveTasks();
      renderFilteredTasks();
      updateCounter();
    });

    // eliminar tarea
    li.querySelector(".delete").addEventListener("click", () => {
      li.classList.add("removing"); // inicia animación
      
      setTimeout(() => {
        tasks = tasks.filter((t) => t !== task);
        saveTasks();
        renderFilteredTasks();
        updateCounter();
      }, 300); // espera a que termine la animación
      
    });

    list.appendChild(li);
    setTimeout(() => {
      li.classList.add("show");
    }, 10);

    li.addEventListener("dragstart", () => {
      draggedIndex = tasks.indexOf(task);
      li.classList.add("dragging");
    });

    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
    });

    li.addEventListener("dragover", (e) => {
      e.preventDefault(); // necesario para permitir drop
    });
    li.addEventListener("dragenter", () => {
      li.classList.add("drag-over");
    });
    li.addEventListener("dragleave", () => {
      li.classList.remove("drag-over");
    });

    li.addEventListener("drop", () => {
    li.classList.remove("drag-over");

    const targetIndex = tasks.indexOf(task);

    const draggedTask = tasks[draggedIndex];
    tasks.splice(draggedIndex, 1);
    tasks.splice(targetIndex, 0, draggedTask);

    saveTasks();
    renderFilteredTasks();
  });
    li.addEventListener("drop", () => {
      const targetIndex = tasks.indexOf(task);

      // intercambiar posiciones en el array
      const draggedTask = tasks[draggedIndex];
      tasks.splice(draggedIndex, 1);
      tasks.splice(targetIndex, 0, draggedTask);

      saveTasks();
      renderFilteredTasks();
    });
  }

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  function renderFilteredTasks() {

    list.innerHTML = "";

    let filtered = tasks;

    if (currentFilter === "pending") {
      filtered = tasks.filter(t => !t.done);
    }

    if (currentFilter === "done") {
      filtered = tasks.filter(t => t.done);
    }

    filtered.forEach(task => renderTask(task));
  }
  document.querySelectorAll(".filters button").forEach(btn => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;

      document
        .querySelectorAll(".filters button")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");
      renderFilteredTasks();
      updateCounter();
    });
  });
  function updateCounter() {
    const remaining = tasks.filter(t => !t.done).length;
     console.log("Contador actualizado:", remaining);
    counter.textContent = `${remaining} tarea${remaining !== 1 ? "s" : ""} restante${remaining !== 1 ? "s" : ""}`;
  }
  clearBtn.addEventListener("click", () => {
    tasks = tasks.filter(t => !t.done);
    saveTasks();
    renderFilteredTasks();
    updateCounter();
  });

  

});
