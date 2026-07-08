(function () {
  const data = window.SION_GAME;
  const story = data.solverScenes;
  const progressKey = "sion-solver-progress";
  const namesKey = "sion-solver-names";
  const finalReadyKey = "sion-solver-final-ready";

  const teamLabel = document.getElementById("teamLabel");
  const sceneArt = document.getElementById("sceneArt");
  const sceneKicker = document.getElementById("sceneKicker");
  const storyNav = document.getElementById("storyNav");
  const prevSceneButton = document.getElementById("prevSceneButton");
  const nextSceneButton = document.getElementById("nextSceneButton");
  const sceneTitle = document.getElementById("sceneTitle");
  const sceneText = document.getElementById("sceneText");
  const sceneMission = document.getElementById("sceneMission");
  const progressDots = document.getElementById("progressDots");
  const answerForm = document.getElementById("answerForm");
  const answerInput = document.getElementById("answerInput");
  const answerLabel = document.getElementById("answerLabel");
  const answerRow = answerForm.querySelector(".answer-row");
  const choiceButtons = document.getElementById("choiceButtons");
  const nextButton = document.getElementById("nextButton");
  const feedback = document.getElementById("feedback");
  const resetButton = document.getElementById("resetButton");

  let index = Number(localStorage.getItem(progressKey) || 0);
  let unlockedIndex = index;
  let names = JSON.parse(localStorage.getItem(namesKey) || "{}");
  let awaitingNext = false;

  function normalize(value) {
    return String(value).trim().toLowerCase().replace(/\s+/g, "");
  }

  function safe(text) {
    return String(text).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char];
    });
  }

  function person(key, fallback) {
    return names[key] || fallback;
  }

  function fill(text) {
    return String(text)
      .replaceAll("{info}", person("info", "정보수집담당"))
      .replaceAll("{search1}", person("search1", "검색담당"));
  }

  function renderImages(images) {
    const items = (images || []).map(function (image) {
      const source = typeof image === "string" ? image : image.src;
      const alt = typeof image === "string" ? "" : (image.alt || "");
      const caption = typeof image === "string" ? "" : (image.caption || "");
      if (!source) return "";
      return (
        '<figure class="story-image">' +
        '<img src="' + safe(source) + '" alt="' + safe(alt) + '">' +
        (caption ? '<figcaption>' + safe(fill(caption)) + '</figcaption>' : "") +
        '</figure>'
      );
    }).filter(Boolean).join("");

    return items ? '<div class="story-images">' + items + '</div>' : "";
  }

  function renderParagraphs(target, value, images) {
    const lines = Array.isArray(value) ? value : [value];
    target.innerHTML = lines.map((line) => "<p>" + safe(fill(line)) + "</p>").join("") + renderImages(images);
  }

  function renderProgress() {
    progressDots.innerHTML = story.map((_, step) => (
      '<span class="' + (step <= index ? "active" : "") + '"></span>'
    )).join("");
  }

  function renderStoryNav() {
    storyNav.hidden = !names.ready;
    prevSceneButton.disabled = index <= 0;
    nextSceneButton.disabled = index >= unlockedIndex || index >= story.length - 1;
  }

  function backgroundForKicker(kicker) {
    if (kicker === "역할 확인하기") return "image/Intro.png";
    if (kicker === "네갈래의 길") return "image/back_1.png";
    if (kicker === "흩어진 종이.") return "image/back_3.png";
    return "image/back_2.png";
  }

  function setSceneBackground(kicker) {
    const background = "url('" + backgroundForKicker(kicker) + "')";
    document.body.style.setProperty("--page-bg", background);
    sceneArt.className = "scene-art custom-bg";
    sceneArt.style.setProperty("--scene-bg", background);
  }

  function renderNameSetup() {
    const intro = data.solverIntro;
    setSceneBackground(intro.kicker);
    sceneKicker.textContent = intro.kicker;
    sceneTitle.textContent = intro.title;
    renderParagraphs(sceneText, intro.text, intro.images);
    storyNav.hidden = true;
    answerForm.hidden = false;
    sceneMission.innerHTML = [
      '<label class="mini-label" for="infoName">정보수집담당</label>',
      '<input class="wide-input" id="infoName" value="' + safe(names.info || "") + '" autocomplete="off">',
      '<label class="mini-label" for="searchName1">검색담당</label>',
      '<input class="wide-input" id="searchName1" value="' + safe(names.search1 || "") + '" autocomplete="off">'
    ].join("");
    answerLabel.hidden = true;
    answerInput.hidden = true;
    answerRow.hidden = false;
    choiceButtons.hidden = true;
    choiceButtons.innerHTML = "";
    nextButton.hidden = true;
    awaitingNext = false;
    answerForm.querySelector("button").textContent = "준비 끝";
    answerForm.classList.add("ready-panel");
    progressDots.innerHTML = '<span class="active"></span>' + story.map(() => "<span></span>").join("");
  }

  function renderScene() {
    const scene = story[index];
    setSceneBackground(scene.kicker);
    sceneKicker.textContent = scene.kicker;
    sceneTitle.textContent = scene.title;
    renderParagraphs(sceneText, scene.text, scene.images);
    renderStoryNav();
    renderParagraphs(sceneMission, scene.mission);
    answerLabel.hidden = false;
    answerInput.hidden = false;
    answerRow.hidden = scene.inputType === "choice";
    choiceButtons.hidden = scene.inputType !== "choice";
    answerForm.querySelector("button").textContent = "확인";
    answerForm.classList.remove("ready-panel");
    answerForm.classList.remove("success-panel");
    answerForm.classList.remove("complete");
    answerInput.disabled = false;
    answerForm.querySelector("button").disabled = false;
    nextButton.hidden = true;
    awaitingNext = false;
    answerForm.hidden = index < unlockedIndex;
    answerLabel.textContent = scene.inputType === "choice" ? "선택" : "정답 입력";
    feedback.textContent = "";

    if (scene.inputType === "choice") {
      answerInput.removeAttribute("list");
      answerInput.placeholder = "";
      removeDatalist();
      renderChoices(scene.choices);
    } else {
      answerInput.removeAttribute("list");
      answerInput.placeholder = "";
      removeDatalist();
      choiceButtons.innerHTML = "";
    }

    answerInput.value = "";
    renderProgress();
  }

  function renderChoices(choices) {
    choiceButtons.innerHTML = choices.map((choice) => (
      '<button type="button" data-choice="' + safe(choice) + '">' + safe(choice) + '</button>'
    )).join("");
  }

  function removeDatalist() {
    const old = document.getElementById("choiceList");
    if (old) old.remove();
  }

  function render() {
    document.documentElement.style.setProperty("--team-color", data.team.color);
    teamLabel.textContent = "한 팀 · 역할 미션";
    if (!names.ready) {
      renderNameSetup();
      return;
    }
    if (Number.isNaN(index) || index < 0 || index >= story.length) index = 0;
    if (Number.isNaN(unlockedIndex) || unlockedIndex < index) unlockedIndex = index;
    renderScene();
  }

  answerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!names.ready) {
      names = {
        info: document.getElementById("infoName").value.trim(),
        search1: document.getElementById("searchName1").value.trim(),
        ready: true
      };
      localStorage.setItem(namesKey, JSON.stringify(names));
      answerInput.value = "";
      render();
      return;
    }

    const scene = story[index];
    const typed = normalize(answerInput.value);
    const isCorrect = scene.answer.some((answer) => normalize(answer) === typed);

    if (!isCorrect) {
      feedback.textContent = "아직 아니야. 역할별 화면에서 열린 단서와 팀원들의 말을 다시 맞춰보자.";
      feedback.className = "feedback warn";
      return;
    }

    feedback.textContent = scene.success;
    feedback.className = "feedback good";
    answerInput.disabled = true;
    answerForm.querySelector("button").disabled = true;
    choiceButtons.querySelectorAll("button").forEach(function (button) {
      button.disabled = true;
    });
    answerForm.classList.add("success-panel");
    awaitingNext = true;

    if (index < story.length - 1) {
      nextButton.hidden = false;
    } else {
      localStorage.setItem(finalReadyKey, "1");
      window.dispatchEvent(new CustomEvent("sion-final-ready"));
      answerForm.classList.add("complete");
    }
  });

  nextButton.addEventListener("click", function () {
    if (!awaitingNext || index >= story.length - 1) return;
    index += 1;
    unlockedIndex = Math.max(unlockedIndex, index);
    localStorage.setItem(progressKey, String(index));
    render();
  });

  prevSceneButton.addEventListener("click", function () {
    if (index <= 0) return;
    index -= 1;
    awaitingNext = false;
    render();
  });

  nextSceneButton.addEventListener("click", function () {
    if (index >= unlockedIndex || index >= story.length - 1) return;
    index += 1;
    awaitingNext = false;
    render();
  });

  choiceButtons.addEventListener("click", function (event) {
    const button = event.target.closest("[data-choice]");
    if (!button) return;
    answerInput.value = button.dataset.choice;
    answerForm.requestSubmit();
  });

  resetButton.addEventListener("click", function () {
    if (window.confirm("문제풀이 진행과 이름 기록을 처음으로 돌릴까요?")) {
      localStorage.removeItem(progressKey);
      localStorage.removeItem(namesKey);
      localStorage.removeItem(finalReadyKey);
      index = 0;
      unlockedIndex = 0;
      names = {};
      awaitingNext = false;
      answerInput.disabled = false;
      answerForm.querySelector("button").disabled = false;
      nextButton.hidden = true;
      answerForm.classList.remove("complete");
      answerForm.classList.remove("success-panel");
      render();
    }
  });

  render();
})();
