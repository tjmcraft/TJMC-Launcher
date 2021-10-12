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