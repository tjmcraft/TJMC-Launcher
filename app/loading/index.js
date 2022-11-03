const { ipcRenderer } = require("electron");

let $ = (e) => document.querySelector(e);

function animate(element, className) {
  element.classList.add(className);
  setTimeout(() => {
    element.classList.remove(className);
    setTimeout(() => {
      animate(element, className);
    }, 500);
  }, 1250);
}

let dots = $("[data-type=preload] .dots");
animate(dots, "dots--animate");

function showLoading(status) {
  $("[data-type=preload]").classList.toggle("show", true);
  $("[data-type=status]").classList.toggle("show", false);
  $("[data-type=preload] #loading-text").innerText = status;
}

function showStatus(status) {
  $("[data-type=preload]").classList.toggle("show", false);
  $("[data-type=status]").classList.toggle("show", true);
  $("[data-type=status] #loading-text").innerText = status;
}

ipcRenderer.on("update.error", (sender, e) => {
  console.error("Update Error:", e);
  showStatus("Ошибка обновления");
});
ipcRenderer.on("update.check", (sender, e) => {
  console.debug("Checking for updates...", e);
  showLoading("Проверка обновлений");
});
ipcRenderer.on("update.available", (sender, e) => {
  console.debug("Update available:", e);
  showStatus("Доступно обновление!");
});
ipcRenderer.on("update.progress", (sender, e) => {
  console.debug("Update progress:", e)
  showLoading("Загрузка обновления");
});
ipcRenderer.on("update.downloaded", (sender, e) => {
  console.debug("Update downloaded:", e)
  showStatus("Обновление загружено!");
  ipcRenderer.send("update.install", true, true);
  showLoading("Установка обновления");
});

showLoading("Загрузка приложения");