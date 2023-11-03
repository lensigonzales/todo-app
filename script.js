"use strict";
/* --- SELECTORS --- */
const list = document.getElementById("todo-list");
const addBtn = document.getElementById("add-btn");
const input = document.getElementById("add-todo");
const filterEl = document.getElementById("filter-box");
const removeBtn = document.getElementById("remove-btn");
const url = "http://localhost:4730/todos";

let state = {
  todos: [],
  currentFilter: "all",
};

//GET all todos from api
async function loadData() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    state.todos = await response.json();

    renderTodos();
  } catch (error) {
    alert(`Error: ${error}`);
  }
}

function renderTodos() {
  list.innerHTML = "";

  //for filter implementation:
  const filteredTodos = getFilteredData();

  filteredTodos.todos.forEach((todo) => {
    const newTodo = document.createElement("li");
    newTodo.innerText = todo.description;
    newTodo.id = todo.id;
    newTodo.todoObj = todo;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;

    newTodo.appendChild(checkbox);
    list.appendChild(newTodo);
  });
}
/* --- FILTERED DATA --- */
function getFilteredData() {
  let result = {};

  switch (state.currentFilter) {
    case "all":
      return (result = state);
    case "open":
      result.todos = state.todos.filter((item) => item.done === false);
      return result;
    case "done":
      result.todos = state.todos.filter((item) => item.done);
      return result;
    default:
      return (result = state);
  }
}
/* --- SET CURRENT FILTER --- */
filterEl.addEventListener("change", (event) => {
  if (event.target.checked) {
    state.currentFilter = event.target.value;
  }
  renderTodos();
});

/* --- ADD NEW TODO --- */

//POST/add todo to api state
async function addTodo(todo) {
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  });

  loadData();
}
//event listener add new todo
addBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const newDescription = input.value.trim();
  /* -- Prevent Duplicates -- */
  //Find a todo with the same description in the state
  const hasDuplicate = state.todos.some(
    (el) => el.description.toUpperCase() === newDescription.toUpperCase()
  );
  //Only if there is no duplicate then create a new todo and add it to the state
  if (hasDuplicate) {
    return;
  }

  await addTodo({
    id: new Date().getTime(),
    description: newDescription,
    done: false,
  });

  input.value = "";
});

/* --- CHECKED & UNCHECKED TODOS --- */
//PUT/update todo to api state
async function updateTodo(todo) {
  await fetch(`${url}/${todo.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  });

  loadData();
}
//event listener check and uncheck todo
list.addEventListener("change", (event) => {
  const checkbox = event.target;
  const listElement = checkbox.parentElement;
  const todo = listElement.todoObj;
  todo.done = checkbox.checked;

  updateTodo(todo);
});

/* --- REMOVE DONE TODOS --- */

removeBtn.addEventListener("click", async () => {
  const doneTodos = state.todos.filter((todo) => todo.done);

  const promisesArray = doneTodos.map((todo) =>
    fetch(`${url}/${todo.id}`, { method: "DELETE" })
  );
  //waits for all the promisses to be resolved
  await Promise.all(promisesArray);
  loadData();
});

loadData();
