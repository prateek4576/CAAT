let sections = [
  {
    name: "Maths 🔢",
    questions: [
      { q: "2+2=?", options: ["3", "4", "5", "6"], answer: "4" },
      { q: "5*3=?", options: ["10", "15", "20", "25"], answer: "15" },
      { q: "10/2=?", options: ["2", "3", "5", "6"], answer: "5" },
      { q: "7+3=?", options: ["8", "9", "10", "11"], answer: "10" },
      { q: "3^2=?", options: ["6", "9", "12", "3"], answer: "9" },
    ],
  },
  {
    name: "Science 🔬",
    questions: [
      {
        q: "Water formula?",
        options: ["H2O", "CO2", "O2", "NaCl"],
        answer: "H2O",
      },
      {
        q: "Sun is a?",
        options: ["Planet", "Star", "Moon", "Asteroid"],
        answer: "Star",
      },
      {
        q: "Gas we breathe?",
        options: ["Oxygen", "Nitrogen", "CO2", "Helium"],
        answer: "Oxygen",
      },
      {
        q: "Force unit?",
        options: ["Joule", "Newton", "Watt", "Pascal"],
        answer: "Newton",
      },
      {
        q: "Earth shape?",
        options: ["Flat", "Round", "Cube", "Triangle"],
        answer: "Round",
      },
    ],
  },
  {
    name: "Aptitude 🧠",
    questions: [
      {
        q: "If a train travels 60 km in 1 hour, speed?",
        options: ["50 km/h", "60 km/h", "70 km/h", "80 km/h"],
        answer: "60 km/h",
      },
      {
        q: "Average of 2, 4, 6, 8?",
        options: ["4", "5", "6", "3"],
        answer: "5",
      },
      {
        q: "Simple interest on ₹1000 at 10% for 1 year?",
        options: ["50", "100", "150", "200"],
        answer: "100",
      },
      {
        q: "Find next: 2, 4, 8, 16, ?",
        options: ["18", "24", "32", "20"],
        answer: "32",
      },
      {
        q: "Time for 5 workers to complete work = 10 days. 1 worker?",
        options: ["10", "20", "30", "50"],
        answer: "50",
      },
    ],
  },
];

let currentSection = 0;
let currentQuestion = 0;

let studentName = "";
let studentClass = "";

let userAnswers = sections.map((sec) =>
  new Array(sec.questions.length).fill(null),
);

function startTest() {
  studentName = document.getElementById("studentName").value;
  studentClass = document.getElementById("studentClass").value;

  if (studentName === "" || studentClass === "") {
    alert("Please enter name and class");
    return;
  }

  document.getElementById("start-screen").style.display = "none";
  document.getElementById("quiz-screen").style.display = "block";
  loadQuestion();
}

function loadQuestion() {
  let sec = sections[currentSection];
  let q = sec.questions[currentQuestion];

  document.getElementById("section-title").innerText = sec.name;
  document.getElementById("question").innerText = q.q;

  document.getElementById("question-progress").innerText =
  `Question ${currentQuestion + 1} of ${sec.questions.length}`;

  let optionsHTML = "";
  q.options.forEach((opt) => {
    let checked =
      userAnswers[currentSection][currentQuestion] === opt ? "checked" : "";
    optionsHTML += `
            <label class="option">
                <input type="radio" name="option" value="${opt}" ${checked}> ${opt}
            </label>
        `;
  });

  document.getElementById("options").innerHTML = optionsHTML;
}

function saveAnswer() {
  let selected = document.querySelector('input[name="option"]:checked');
  if (selected) {
    userAnswers[currentSection][currentQuestion] = selected.value;
  }
}

function nextQuestion() {
  saveAnswer();
  if (currentQuestion < 4) {
    currentQuestion++;
    loadQuestion();
  } else {
    completeSection();
  }
}

function prevQuestion() {
  saveAnswer();
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  }
}

function completeSection() {
  document.getElementById("quiz-screen").style.display = "none";
  document.getElementById("section-complete").style.display = "block";

  if (currentSection < 2) {
    document.getElementById("section-msg").innerText =
      sections[currentSection].name + " Section Completed!";
  } else {
    document.getElementById("section-msg").innerText =
      "All Sections Completed!";
    document.querySelector("#section-complete button").innerText =
      "View Score Card 📊";
  }
}

function goToNextSection() {
  if (currentSection < 2) {
    currentSection++;
    currentQuestion = 0;

    document.getElementById("section-complete").style.display = "none";
    document.getElementById("quiz-screen").style.display = "block";

    loadQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  document.getElementById("displayName").innerText = "Name: " + studentName;
  document.getElementById("displayClass").innerText = "Class: " + studentClass;

  document.getElementById("section-complete").style.display = "none";
  document.getElementById("result-screen").style.display = "block";

  let math = calculateScore(0);
  let science = calculateScore(1);
  let aptitude = calculateScore(2);

 document.getElementById("mathScore").innerText = math + "/5";

document.getElementById("scienceScore").innerText =
  science + "/5";

document.getElementById("aptitudeScore").innerText =
  aptitude + "/5";
  document.getElementById("totalScore").innerText =
    "Total: " + (math + science + aptitude) + "/15";

  let total = math + science + aptitude;

  // Find strongest area
  let maxScore = Math.max(math, science, aptitude);
  let interest = "";

  if (maxScore === math) interest = "Maths";
  else if (maxScore === science) interest = "Science";
  else interest = "Aptitude";

  // Section suggestions
  function getFeedback(score) {
    if (score >= 4) return "Excellent";
    else if (score >= 2) return "Good";
    else return "Needs Improvement";
  }

  document.getElementById("mathFeedback").innerText =
    "Maths: " + getFeedback(math);

  document.getElementById("scienceFeedback").innerText =
    "Science: " + getFeedback(science);

  document.getElementById("aptitudeFeedback").innerText =
    "Aptitude: " + getFeedback(aptitude);

  // Overall suggestion
  let overall = "";
  if (total >= 12) overall = "Excellent Performance 🎉";
  else if (total >= 8) overall = "Good Job 👍";
  else overall = "You need more practice 📚";

  document.getElementById("overallFeedback").innerText = overall;

  // Interest area
  let recommendation = "";
  let career = "";

  // Recommendation based on weakest section
  let minScore = Math.min(math, science, aptitude);

  if (minScore === math) {
    recommendation = "Focus more on Maths to improve problem-solving skills.";
  } else if (minScore === science) {
    recommendation = "Improve your Science concepts for better understanding.";
  } else {
    recommendation = "Practice Aptitude regularly to boost reasoning skills.";
  }

  // Career suggestion logic
  if (math >= 4 && aptitude >= 4) {
    career =
      "You can consider careers in Software Engineering, Data Science or Analytics.";
  } else if (science >= 4) {
    career = "You can consider careers in Medical, Research or Science fields.";
  } else if (aptitude >= 4) {
    career =
      "You can consider careers in Management, Banking or Civil Services.";
  } else {
    career =
      "Explore different fields and improve your skills to find your best fit.";
  }

  // Display
  document.getElementById("recommendation").innerText = recommendation;
  document.getElementById("careerSuggestion").innerText = career;

  // Save to backend
  let email = localStorage.getItem("userEmail");

  fetch("/save-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,

      math: math,
      science: science,
      aptitude: aptitude,
      total: total,
    }),
  })
    .then((res) => res.text())
    .then((data) => console.log(data))
    .catch((err) => console.log(err));
}

function calculateScore(sectionIndex) {
  let score = 0;
  let sec = sections[sectionIndex];

  for (let i = 0; i < sec.questions.length; i++) {
    if (userAnswers[sectionIndex][i] === sec.questions[i].answer) {
      score++;
    }
  }
  return score;
}

// Apply saved theme automatically
if (localStorage.getItem("mode") === "dark") {
  document.body.classList.add("dark");
}