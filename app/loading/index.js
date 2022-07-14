// Helper(s)
// =========
let $ = (e) => document.querySelector(e);

// Dots
// ====
let dots = $(".dots");

// Function
// ========
function animate(element, className) {
  element.classList.add(className);
  setTimeout(() => {
    element.classList.remove(className);
    setTimeout(() => {
      animate(element, className);
    }, 500);
  }, 1250);
}

// Execution
// =========
animate(dots, "dots--animate");

electron.on("error", (e) => console.error(e));
electron.on("update.check", (e) => console.debug("Checking for updates...", e));
electron.on("update.available", (e) => console.debug("Update available:", e));
electron.on("update.progress", (e) => console.debug("Update progress:", e));
electron.on("update.downloaded", (e) => console.debug("Update downloaded: ", e));