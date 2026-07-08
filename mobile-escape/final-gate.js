(function () {
  const params = new URLSearchParams(window.location.search);
  const shouldOpen = params.get("final") === "1" || window.location.hash === "#final";
  const allData = window.SION_GAME && window.SION_GAME.finalGate;
  const role = roleFromPath();
  const data = allData && allData[role];
  let isOpen = false;
  let triggerInstalled = false;
  if (!data) return;

  function normalize(value) {
    return String(value).trim().toLowerCase().replace(/\s+/g, "");
  }

  function roleFromPath() {
    const file = window.location.pathname.split("/").pop();
    if (file === "clues.html") return "info";
    if (file === "search.html") return "search";
    return "solver";
  }

  function savedNames() {
    const key = role === "info" ? "sion-info-names" : role === "search" ? "sion-search-names" : "sion-solver-names";
    try {
      return JSON.parse(localStorage.getItem(key) || "{}");
    } catch (_) {
      return {};
    }
  }

  function finalReadyKey() {
    if (role === "info") return "sion-info-final-ready";
    if (role === "search") return "sion-search-final-ready";
    return "sion-solver-final-ready";
  }

  function isFinalReady() {
    return localStorage.getItem(finalReadyKey()) === "1";
  }

  function fill(text) {
    const names = savedNames();
    return String(text)
      .replaceAll("{main}", names.main || "문제풀이담당")
      .replaceAll("{info}", names.info || "정보수집담당")
      .replaceAll("{search1}", names.search1 || "검색담당");
  }

  function openFinalGate() {
    if (isOpen) return;
    isOpen = true;

    const modal = document.createElement("section");
    modal.className = "final-gate";
    modal.innerHTML = [
      '<form class="final-gate-panel" id="finalGateForm">',
      '<p class="kicker">HIDDEN</p>',
      '<h2></h2>',
      '<div class="final-gate-copy"></div>',
      '<div class="mission-box final-gate-mission"><span>MISSION</span><p></p></div>',
      '<p class="final-gate-question"></p>',
      '<label for="finalGateInput">최종 정답</label>',
      '<div class="answer-row">',
      '<input id="finalGateInput" autocomplete="off" inputmode="text">',
      '<button type="submit">확인</button>',
      '</div>',
      '<p class="feedback" id="finalGateFeedback" role="status"></p>',
      '</form>'
    ].join("");

    document.body.appendChild(modal);

    const form = document.getElementById("finalGateForm");
    const input = document.getElementById("finalGateInput");
    const feedback = document.getElementById("finalGateFeedback");
    form.querySelector("h2").textContent = data.title;
    form.querySelector(".final-gate-copy").innerHTML = data.text.map((line) => "<p>" + fill(line) + "</p>").join("");
    form.querySelector(".final-gate-mission p").textContent = fill(data.mission);
    form.querySelector(".final-gate-question").textContent = data.question;
    input.focus();

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const typed = normalize(input.value);
      const isCorrect = data.answer.some((answer) => normalize(answer) === typed);

      feedback.textContent = isCorrect ? data.success : data.fail;
      feedback.className = "feedback " + (isCorrect ? "good" : "warn");
      if (isCorrect) {
        input.disabled = true;
        form.querySelector("button").disabled = true;
      }
    });
  }

  function installSecretTrigger() {
    if (triggerInstalled || !isFinalReady()) return;
    triggerInstalled = true;

    const trigger = document.createElement("button");
    let taps = 0;
    let timer = null;

    trigger.className = "final-secret-trigger";
    trigger.type = "button";
    trigger.tabIndex = -1;
    trigger.setAttribute("aria-hidden", "true");

    trigger.addEventListener("click", function () {
      taps += 1;
      window.clearTimeout(timer);
      if (taps >= 5) {
        taps = 0;
        openFinalGate();
        return;
      }
      timer = window.setTimeout(function () {
        taps = 0;
      }, 2500);
    });

    document.body.appendChild(trigger);
  }

  if (shouldOpen) openFinalGate();
  installSecretTrigger();
  window.addEventListener("sion-final-ready", installSecretTrigger);
})();
