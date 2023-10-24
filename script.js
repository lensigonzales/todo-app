"use strict";
/* --- SELECTORS --- */
const list = document.querySelector(".todo-list");
const addBtn = document.querySelector(".add-btn");
const input = document.querySelector(".todo-input");
const filter = document.querySelector(".filter");
const removeBtn = document.querySelector(".remove-btn");
const url = "http://localhost:4730/todos";

let state = {
  todos: [],
  currentFilter: "",
};

function loadData() {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      state.todos = data;
      renderTodos();
    });
}

function renderTodos() {
  input.value = "";
  list.innerHTML = "";

  //const generatedTodos = getFilteredData();

  state.todos.forEach((todo) => {
    const newTodo = document.createElement("li");
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    newTodo.innerText = todo.description;
    newTodo.id = todo.id;
    newTodo.todoObj = todo;

    newTodo.appendChild(checkbox);
    list.appendChild(newTodo);
  });
}

/* --- ADD NEW TODO --- */
addBtn.addEventListener("click", () => {
  const newDescription = input.value.trim();
  /* -- Prevent Duplicates -- */
  //Find a todo with the same description in the state
  const duplicate = state.todos.filter(
    (el) => el.description.toUpperCase() === newDescription.toUpperCase()
  );
  //Only if there is no duplicate then create a new todo and add it to the state
  if (duplicate.length === 0) {
    const newTodo = {
      id: new Date().getTime(),
      description: newDescription,
      done: false,
    };

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodo),
    })
      .then((response) => response.json())
      .then((newTodoData) => {
        state.todos.push(newTodoData);
        renderTodos();
      });
  } else {
    alert("Todo is already in the list!");
  }
});

/* --- CHECKED & UNCHECKED TODOS --- */
list.addEventListener("change", (event) => {
  const checkbox = event.target;
  const listElement = checkbox.parentElement;
  const todoId = listElement.id;
  /* const selectedTodo = state.todos.find((todo) => todo.id === todoId);
  selectedTodo.done = checkbox.checked; */

  const todo = listElement.todoObj;
  todo.done = checkbox.checked;

  fetch(`${url}/${todoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  })
    .then((response) => response.json())
    .then((updatedTodoData) => {
      renderTodos();
    });
});

/* --- REMOVE DONE TODOS --- */
//TODO: Funktioniert noch nicht

removeBtn.addEventListener("click", () => {
  const doneTodos = state.todos.filter((todo) => todo.done);

  doneTodos.forEach((todo) => {
    fetch(`${url}/${todo.id}`, { method: "DELETE" })
      .then((response) => response.json())
      .then(() => {
        loadData();
      });
  });
});

loadData();
