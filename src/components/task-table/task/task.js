import "./task.css";
import { createNewElement } from "Project/helpers/createNewElement";
import { dateFormat } from "Project/helpers/dateFormat";
import { createIsCompleted } from "./is-completed/is-completed";
import { createText } from "./text/text";
import { createTaskDate } from "./task-date/task-date";
import { createDeleteTaskButton } from "./delete-task-button/delete-task-button";
import { collectTaskData } from "Project/helpers/collectTaskData";
import { createLoadingWindow } from "Project/helpers/createLoadingWindow";
import { showNotification } from "Project/components/notifications/notifications";
import { api } from "Project/api/api";

//Обновить задачи
export function updateTasksFromServer() {
  createLoadingWindow("on");
  let apiAnswer = {};
  const searchFilter = document.querySelector(".search-area").value;
  if (searchFilter === "") {
    apiAnswer = api.tasks.load();
  } else {
    apiAnswer = api.tasks.search(searchFilter);
  }
  //Загрузим задачи с сервера
  apiAnswer
    .then((apiAnswer) => {
      const allTasks = apiAnswer.data;
      if (document.querySelector(".edited")) {
        createLoadingWindow("off");
        return;
      }
      //Удалим все отображённые задачи;
      for (const taskElement of document.querySelectorAll(".task")) {
        taskElement.remove();
      }
      //Сообщение при отсутствии задач;
      if (allTasks.length === 0) {
        addNoTaskElement(
          "На данный момент задач нет, добавьте новую задачу, или введите другие критерии поиска."
        );
        createLoadingWindow("off");
        return;
      }
      //Вывод задач
      for (let i = 0; i < allTasks.length; i++) {
        addTaskElement(allTasks[i]);
      }
      createLoadingWindow("off");
    })
    .catch(() => {
      addNoTaskElement(
        "Нет соединения с сервером, пожалуйста, обратитесь к администратору."
      );
      createLoadingWindow("off");
      return;
    });
}

export function updateTask(currentTask) {
  const currentTaskData = collectTaskData(currentTask);
  return api.tasks.update(currentTaskData);
}

//Callback для поиска задачи
export function searchAreaInputCallback() {
  const startValue = this.value;
  if (startValue.length > 200) {
    showNotification("Строка поиска не должна включать более 200 символов");
    return;
  }
  if (this.dataset.timeoutID) {
    clearTimeout(this.dataset.timeoutID);
  }
  this.dataset.timeoutID = setTimeout(() => {
    if (startValue === this.value) {
      updateTasksFromServer();
    }
  }, 600);
}

//Добавляет задачу
function addTaskElement(taskElementFromServer) {
  const taskTableElement = document.querySelector(".task-table");
  const newTaskElement = createNewElement("div", ["task", "form", "panel"]);
  const newCheckBoxElement = createIsCompleted();
  const newTextElement = createText();
  const newDeleteElement = createDeleteTaskButton();
  const newTaskDate = createTaskDate();
  //Сохраняем данные из сервера в задачу
  newTextElement.innerHTML = taskElementFromServer.title;
  newTaskElement.id = taskElementFromServer.id;
  newTaskElement.dataset.createdTime = taskElementFromServer.createdAt;
  newTaskElement.dataset.description = taskElementFromServer.description;
  //Корректируем чекбокс для задачи
  newCheckBoxElement.type = "checkbox";
  if (taskElementFromServer.isCompleted) {
    newCheckBoxElement.checked = true;
    newTaskElement.classList.add("complete-task");
  }
  //Устанавливаем дату с сервера
  newTaskDate.innerHTML = dateFormat(taskElementFromServer.createdAt);
  //Собираем task элемент и добавляем Callback
  newTaskElement.append(newCheckBoxElement);
  newTaskElement.append(newTextElement);
  newTaskElement.append(newTaskDate);
  newTaskElement.append(newDeleteElement);
  //Добавляем задачу на экран
  taskTableElement.append(newTaskElement);
}

function addNoTaskElement(message) {
  const newNoTaskElement = createNewElement("div", [
    "form",
    "task",
    "no-tasks",
    "panel",
  ]);
  const taskTableElement = document.querySelector(".task-table");
  newNoTaskElement.textContent = message;
  taskTableElement.append(newNoTaskElement);
}
