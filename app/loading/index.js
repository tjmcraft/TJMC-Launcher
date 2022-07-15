
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

electron.on("error", (sender, e) => {
  console.error(e);
  showStatus("Возникла ошибка!");
});
electron.on("update.check", (sender, e) => {
  console.debug("Checking for updates...", e);
  showLoading("Проверка обновлений");
});
electron.on("update.available", (sender, e) => {
  console.debug("Update available:", e);
  showStatus("Доступно обновление!");
});
electron.on("update.progress", (sender, e) => {
  console.debug("Update progress:", e)
  showLoading("Загрузка обновления");
});
electron.on("update.downloaded", (sender, e) => {
  console.debug("Update downloaded: ", e)
  showStatus("Обновление загружено!");
});

showLoading("Загрузка приложения");