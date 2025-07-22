// Simple counter demo for jsdom testing and UI interaction
let counter = 0;

function increment() {
  counter++;
  updateCounterDisplay();
}

function updateCounterDisplay() {
  const counterEl = document.getElementById("counter-value");
  if (counterEl) {
    counterEl.textContent = counter;
  }
}

// Setup counter UI event
const incBtn = document.getElementById("increment-btn");
if (incBtn) {
  incBtn.onclick = increment;
}

// Initialize display on load
updateCounterDisplay();

// Expose for testing
window.increment = increment;
window.getCounter = () => counter;
