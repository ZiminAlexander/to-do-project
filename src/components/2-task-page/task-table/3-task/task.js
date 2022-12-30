import { createNewElement } from "../../../../helpers/createNewElement";
import { dateFormat } from "../../../../helpers/dateFormat";
import { createIsCompleted } from "./1-is-completed/is-completed";
import { createText } from "./2-text/text";
import { createTaskDate } from "./3-task-date/task-date";
import { createDeleteTaskButton } from "./4-delete-task-button/delete-task-button";
import "./task.css";


//Обновить задачи
export function updateTasksFromServer(){
    let urlForFetch = 'http://nkbelousov.site:3000/todos';
    const searchFilter = document.querySelector(".search-area").value;
    if (searchFilter === "") {
      urlForFetch += '/';
    } else {
      urlForFetch += '?search=' + searchFilter;
    }
    //Загрузим задачи с сервера
    fetch(urlForFetch)
    .then((response) => response.json())
    .then((allTasks) => {
      //Удалим все отображённые задачи;
      for (const taskElement of document.querySelectorAll(".task")) {
        taskElement.remove();
      }
      //Сообщение при отсутствии задач;
      if (allTasks.length === 0){
        const newTaskElement = createNewElement("div", ["form", "task"]);
        const taskTableElement = document.querySelector(".task-table");
        newTaskElement.textContent = "На данный момент задач нет, добавьте новую задачу, или введите другие критерии поиска";
        newTaskElement.classList.add("no-tasks");
        taskTableElement.append(newTaskElement);
        return;
      }
      //Вывод задач
      for (let i = 0; i < allTasks.length; i++){
        addTaskElement(allTasks[i]);
      }
    });
  }

  //Добавляет задачу 
function addTaskElement (taskElementFromServer){
    const taskTableElement = document.querySelector(".task-table");
    const newTaskElement = createNewElement("div", ["task", "form"]);
    const newCheckBoxElement = createIsCompleted();
    const newTextElement = createText();
    const newDeleteElement = createDeleteTaskButton();
    const newTaskDate = createTaskDate();
   //Сохраняем данные из сервера в задачу
    newTextElement.innerHTML = taskElementFromServer.title;
    newTaskElement.id =  taskElementFromServer.id;
    newTaskElement.dataset.createdTime = taskElementFromServer.createdAt;
    newTaskElement.dataset.description = taskElementFromServer.description;
    //Корректируем чекбокс для задачи
    newCheckBoxElement.type = "checkbox";
    if (taskElementFromServer.isCompleted){
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

//Обновить задачу 
export function updateTask(currentTask){
  const id = currentTask.id;
  const submitTaskObject = {};
  let submitString = "";
  const taskDescription = currentTask.dataset.description;
  submitTaskObject.title = currentTask.querySelector(".text").textContent;
  submitTaskObject.isCompleted = currentTask.querySelector(".is-completed").checked;
  submitTaskObject.description = taskDescription;
  submitString = JSON.stringify(submitTaskObject);
  fetch(`http://nkbelousov.site:3000/todos/${id}`, 
  { headers: {'Content-Type': 'application/json'}, 
    method: 'PUT', 
    body: submitString
    }
  )
}



