const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const keys = document.querySelector(".keys");

const operators = ["+", "-", "*", "/", "%"];
let expression = "";
let justCalculated = false;

function formatExpression(value) {
  return value
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/-/g, "−");
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Cannot divide by 0";
  }

  return Number.parseFloat(value.toFixed(10)).toString();
}

function calculate(value) {
  if (!value || operators.includes(value.at(-1))) {
    return "";
  }

  try {
    const result = Function(`"use strict"; return (${value})`)();
    return formatNumber(result);
  } catch {
    return "";
  }
}

function updateDisplay() {
  const liveResult = calculate(expression);
  expressionDisplay.textContent = expression ? formatExpression(expression) : "0";
  resultDisplay.textContent = liveResult || "0";
}

function appendValue(value) {
  const lastCharacter = expression.at(-1);

  if (justCalculated && !operators.includes(value)) {
    expression = "";
  }

  justCalculated = false;

  if (operators.includes(value)) {
    if (!expression && value !== "-") {
      return;
    }

    if (operators.includes(lastCharacter)) {
      expression = expression.slice(0, -1) + value;
    } else {
      expression += value;
    }

    updateDisplay();
    return;
  }

  if (value === ".") {
    const currentNumber = expression.split(/[+\-*/%]/).pop();

    if (currentNumber.includes(".")) {
      return;
    }

    if (!currentNumber) {
      expression += "0";
    }
  }

  expression += value;
  updateDisplay();
}

function clearCalculator() {
  expression = "";
  justCalculated = false;
  updateDisplay();
}

function deleteLastCharacter() {
  expression = expression.slice(0, -1);
  justCalculated = false;
  updateDisplay();
}

function finalizeCalculation() {
  const result = calculate(expression);

  if (!result || result === "Cannot divide by 0") {
    resultDisplay.textContent = result || "Error";
    return;
  }

  expression = result;
  justCalculated = true;
  updateDisplay();
}

function flashKey(selector) {
  const key = document.querySelector(selector);

  if (!key) {
    return;
  }

  key.classList.add("is-active");
  window.setTimeout(() => key.classList.remove("is-active"), 120);
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  if (button.dataset.value) {
    appendValue(button.dataset.value);
  }

  if (button.dataset.action === "clear") {
    clearCalculator();
  }

  if (button.dataset.action === "delete") {
    deleteLastCharacter();
  }

  if (button.dataset.action === "calculate") {
    finalizeCalculation();
  }
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9.]$/.test(key)) {
    appendValue(key);
    flashKey(`[data-value="${key}"]`);
    return;
  }

  if (operators.includes(key)) {
    appendValue(key);
    flashKey(`[data-value="${key}"]`);
    return;
  }

  if (key === "x" || key === "X") {
    appendValue("*");
    flashKey('[data-value="*"]');
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    finalizeCalculation();
    flashKey('[data-action="calculate"]');
    return;
  }

  if (key === "Backspace") {
    deleteLastCharacter();
    flashKey('[data-action="delete"]');
    return;
  }

  if (key === "Escape" || key.toLowerCase() === "c") {
    clearCalculator();
    flashKey('[data-action="clear"]');
  }
});

updateDisplay();
