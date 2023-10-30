"use strict";
/* --- SELECTORS --- */
// use getElementById
const list = document.querySelector(".todo-list");
const addBtn = document.querySelector(".add-btn");
const input = document.querySelector(".todo-input");
const filter = document.querySelector(".filter");
const removeBtn = document.querySelector(".remove-btn");
const url = "http://localhost:4730/todos";

let state = {
  todos: [],
  currentFilter: "", //implemented in old version (localStorage Version)
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
    // Show error message to user
    console.error(error);
  }
}

function renderTodos() {
  list.innerHTML = "";

  //for filter implementation:
  //const generatedTodos = getFilteredData();

  state.todos.forEach((todo) => {
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
    description: newDescription,
    done: false,
  });
  // Wait for the todo to be added and then clear the input
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

  // Vorsicht: verstecktes update von state.todos[n] über alias listElement.todoObj
  // Optimistic Update
  todo.done = checkbox.checked;

  // Normaler State Flow: Datenbank -> Javascript -> DOM
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
