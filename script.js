// =========================================================
// Health Self-Check Kiosk — script
// Demonstrates: if-else, switch-case, and loop control structures
// =========================================================

// Google Apps Script Web App URL (records submissions to the Google Sheet)
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzcMvWHwxjFRcXbVpeY9zgRRCO9yzp_6swMLcqcvtlUoax1gmUvbLD-LV2W7IZT-sth/exec";

// Array holding submissions made during this session (for the history list)
const submissions = [];

const form = document.getElementById("bmiForm");
const formError = document.getElementById("formError");
const resultCard = document.getElementById("resultCard");
const resultCategory = document.getElementById("resultCategory");
const resultBmi = document.getElementById("resultBmi");
const resultMessage = document.getElementById("resultMessage");
const historyList = document.getElementById("historyList");
const resetBtn = document.getElementById("resetBtn");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  formError.textContent = "";

  const name = document.getElementById("name").value.trim();
  const age = parseFloat(document.getElementById("age").value);
  const sex = document.getElementById("sex").value;
  const weight = parseFloat(document.getElementById("weight").value);
  const heightCm = parseFloat(document.getElementById("height").value);

  // ---------------------------------------------------------
  // LOOP: check every required field in one pass
  // ---------------------------------------------------------
  const requiredFields = [
    { label: "Full Name", value: name, isValid: name.length > 0 },
    { label: "Age", value: age, isValid: !isNaN(age) && age > 0 && age <= 120 },
    { label: "Sex", value: sex, isValid: sex !== "" },
    { label: "Weight", value: weight, isValid: !isNaN(weight) && weight > 0 },
    { label: "Height", value: heightCm, isValid: !isNaN(heightCm) && heightCm > 0 }
  ];

  let firstInvalidField = null;
  for (let i = 0; i < requiredFields.length; i++) {
    if (!requiredFields[i].isValid) {
      firstInvalidField = requiredFields[i].label;
      break;
    }
  }

  // ---------------------------------------------------------
  // IF-ELSE: validate before processing
  // ---------------------------------------------------------
  if (firstInvalidField) {
    formError.textContent = "Please provide a valid " + firstInvalidField + ".";
    return;
  } else {
    formError.textContent = "";
  }

  // Compute BMI
  const heightM = heightCm / 100;
  const bmi = +(weight / (heightM * heightM)).toFixed(1);

  let category, message, cardClass;

  // ---------------------------------------------------------
  // SWITCH-CASE: classify BMI and choose recommendation
  // ---------------------------------------------------------
  switch (true) {
    case bmi < 18.5:
      category = "Underweight";
      message = "Consider a balanced, calorie-sufficient diet.";
      cardClass = "underweight";
      break;
    case bmi < 25:
      category = "Normal";
      message = "Great! Keep up your healthy habits.";
      cardClass = "normal";
      break;
    case bmi < 30:
      category = "Overweight";
      message = "Consider more physical activity and mindful eating.";
      cardClass = "overweight";
      break;
    default:
      category = "Obese";
      message = "We recommend consulting a healthcare provider.";
      cardClass = "obese";
  }

  showResult(bmi, category, message, cardClass);

  const record = { name, age, sex, weight, heightCm, bmi, category };
  submissions.push(record);
  renderHistory();
  recordSubmission(record);

  form.reset();
});

function showResult(bmi, category, message, cardClass) {
  resultCard.classList.remove("hidden", "underweight", "normal", "overweight", "obese");
  resultCard.classList.add(cardClass);
  resultCategory.textContent = category;
  resultBmi.textContent = "Your BMI is " + bmi;
  resultMessage.textContent = message;
}

resetBtn.addEventListener("click", function () {
  resultCard.classList.add("hidden");
});

// ---------------------------------------------------------
// LOOP: render the session history list with forEach
// ---------------------------------------------------------
function renderHistory() {
  historyList.innerHTML = "";
  submissions.forEach(function (record, index) {
    const li = document.createElement("li");
    li.textContent = (index + 1) + ". " + record.name + " — BMI " + record.bmi + " (" + record.category + ")";
    historyList.appendChild(li);
  });
}

// ---------------------------------------------------------
// Send the record to Google Apps Script (Google Sheet backend)
// ---------------------------------------------------------
function recordSubmission(record) {
  fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify(record)
  }).catch(function (err) {
    console.error("Could not record submission:", err);
  });
}
