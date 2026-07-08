(function () {
  const data = window.SION_GAME;
  const events = data.infoEvents;
  const storageKey = "sion-info-opened";
  const namesKey = "sion-info-names";
  const finalReadyKey = "sion-info-final-ready";

  const teamLabel = document.getElementById("teamLabel");
  const setupStage = document.getElementById("setupStage");
  const nameSetupForm = document.getElementById("nameSetupForm");
  const clueSearch = document.getElementById("clueSearch");
  const clueEntry = document.getElementById("clueEntry");
  const clueForm = document.getElementById("clueForm");
  const clueInput = document.getElementById("clueInput");
  const clueFeedback = document.getElementById("clueFeedback");
  const foundList = document.getElementById("foundList");
  const clearCluesButton = document.getElementById("clearCluesButton");
  const imageZoomModal = document.getElementById("imageZoomModal");
  const imageZoomClose = document.getElementById("imageZoomClose");
  const imageZoomViewport = document.getElementById("imageZoomViewport");
  const imageZoomTarget = document.getElementById("imageZoomTarget");

  let opened = JSON.parse(localStorage.getItem(storageKey) || "[]");
  let names = JSON.parse(localStorage.getItem(namesKey) || "{}");
  let zoomScale = 1;
  let zoomX = 0;
  let zoomY = 0;
  let lastPanPoint = null;
  let lastPinchDistance = 0;
  const activePointers = new Map();

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
      .replaceAll("{main}", person("main", "문제풀이담당"))
      .replaceAll("{info}", person("info", "정보수집담당"))
      .replaceAll("{search1}", person("search1", "검색담당"));
  }

  function eventKeys(item) {
    return [item.code].concat(item.aliases || []).map(normalize);
  }

  function findEvent(value) {
    const key = normalize(value);
    return events.find((item) => eventKeys(item).includes(key));
  }

  function save() {
    localStorage.setItem(storageKey, JSON.stringify(opened));
  }

  function setPageBackground(path) {
    document.body.style.setProperty("--page-bg", "url('" + path + "')");
  }

  function inputValue(id) {
    const input = document.getElementById(id);
    return input ? input.value.trim() : "";
  }

  function clearInput(id) {
    const input = document.getElementById(id);
    if (input) input.value = "";
  }

  function renderVisual(type) {
    if (type === "uv") {
      return '<div class="mini-visual uv-card"><button type="button" data-uv>UV램프</button><span>일반 그림</span></div>';
    }
    if (type === "dolls") {
      return '<div class="mini-visual puzzle-card"><span>점토인형 자리</span><strong>정답 확인 후 0107</strong></div>';
    }
    if (type === "castle") {
      return '<div class="mini-visual castle-card"><span>성 그림 자리</span><strong>이름을 자세히 살펴보세요</strong></div>';
    }
    return "";
  }

  function renderCard(item) {
    const paragraphs = item.text.map((line) => "<p>" + safe(fill(line)) + "</p>").join("");
    const links = (item.links || []).map((link) => (
      '<a class="inline-link" href="' + safe(link.url) + '" target="_blank" rel="noreferrer">' + safe(link.label) + '</a>'
    )).join("");
    const image = item.image ? (
      '<button class="clue-image-button" type="button" data-zoom-src="' + safe(item.image) + '">' +
      '<img class="clue-image" src="' + safe(item.image) + '" alt="">' +
      '</button>'
    ) : "";
    const background = backgroundForTags(item.tags);
    return (
      '<article class="clue-card">' +
      '<div class="clue-card-art" style="--scene-bg: url(\'' + background + '\')"></div>' +
      '<div class="clue-tags">' + item.tags.map((tag) => '<span>' + safe(tag) + '</span>').join("") + '</div>' +
      '<h3>' + safe(item.title) + '</h3>' +
      image +
      paragraphs +
      renderVisual(item.visual) +
      (item.tell ? '<div class="tell-box">' + safe(fill(item.tell)) + '</div>' : "") +
      links +
      '</article>'
    );
  }

  function backgroundForTags(tags) {
    if ((tags || []).includes("PART 2")) return "image/back_1.png";
    if ((tags || []).includes("PART 6")) return "image/back_3.png";
    return "image/back_2.png";
  }

  function render() {
    document.documentElement.style.setProperty("--team-color", data.team.color);
    teamLabel.textContent = "한 팀 · 역할 미션";
    setupStage.hidden = Boolean(names.ready);
    nameSetupForm.hidden = Boolean(names.ready);
    clueSearch.hidden = !names.ready;
    foundList.hidden = !names.ready;
    clueEntry.hidden = false;

    if (!names.ready) {
      setPageBackground("image/Intro.png");
      foundList.innerHTML = "";
      return;
    }

    const openedEvents = opened
      .map((code) => events.find((item) => item.code === code))
      .filter(Boolean);

    if (!openedEvents.length) {
      setPageBackground("image/back_2.png");
      foundList.innerHTML = '<div class="empty-state">' + safe(data.infoIntro.text) + '<br>' + safe(data.infoIntro.prompt) + '</div>';
      return;
    }

    setPageBackground(backgroundForTags(openedEvents[0].tags));
    foundList.innerHTML = openedEvents.map(renderCard).join("");
  }

  nameSetupForm.addEventListener("submit", function (event) {
    event.preventDefault();
    names = {
      main: inputValue("mainName"),
      info: inputValue("infoName"),
      search1: inputValue("searchName1"),
      ready: true
    };
    localStorage.setItem(namesKey, JSON.stringify(names));
    render();
  });

  clueForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const item = findEvent(clueInput.value);

    if (!item) {
      clueFeedback.textContent = "아직 열 수 있는 내용이 없어. 전달받은 말을 다시 확인해봐.";
      clueFeedback.className = "feedback warn";
      return;
    }

    if (!opened.includes(item.code)) {
      opened.unshift(item.code);
      save();
    }

    if (item.code === events[events.length - 1].code) {
      localStorage.setItem(finalReadyKey, "1");
      window.dispatchEvent(new CustomEvent("sion-final-ready"));
    }

    clueInput.value = "";
    clueFeedback.textContent = item.title + " 내용을 열었어.";
    clueFeedback.className = "feedback good";
    render();
  });

  clearCluesButton.addEventListener("click", function () {
    if (window.confirm("정보수집 기록을 모두 지울까요?")) {
      opened = [];
      save();
      localStorage.removeItem(finalReadyKey);
      localStorage.removeItem(namesKey);
      names = {};
      clearInput("mainName");
      clearInput("infoName");
      clearInput("searchName1");
      clueFeedback.textContent = "";
      render();
    }
  });

  document.addEventListener("click", function (event) {
    if (!event.target.matches("[data-uv]")) return;
    const card = event.target.closest(".uv-card");
    card.classList.toggle("active");
    card.querySelector("span").textContent = card.classList.contains("active") ? "UV 표시" : "일반 그림";
  });

  function applyZoom() {
    imageZoomTarget.style.transform = "translate(" + zoomX + "px, " + zoomY + "px) scale(" + zoomScale + ")";
  }

  function resetZoom() {
    zoomScale = 1;
    zoomX = 0;
    zoomY = 0;
    lastPanPoint = null;
    lastPinchDistance = 0;
    activePointers.clear();
    applyZoom();
  }

  function openZoom(source) {
    imageZoomTarget.src = source;
    imageZoomModal.hidden = false;
    document.body.classList.add("zoom-open");
    resetZoom();
  }

  function closeZoom() {
    imageZoomModal.hidden = true;
    imageZoomTarget.removeAttribute("src");
    document.body.classList.remove("zoom-open");
    resetZoom();
  }

  function clampScale(value) {
    return Math.min(5, Math.max(1, value));
  }

  function distance(a, b) {
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  foundList.addEventListener("click", function (event) {
    const button = event.target.closest("[data-zoom-src]");
    if (!button) return;
    openZoom(button.dataset.zoomSrc);
  });

  imageZoomClose.addEventListener("click", closeZoom);

  imageZoomModal.addEventListener("click", function (event) {
    if (event.target === imageZoomModal) closeZoom();
  });

  imageZoomViewport.addEventListener("wheel", function (event) {
    event.preventDefault();
    const nextScale = clampScale(zoomScale + (event.deltaY < 0 ? 0.18 : -0.18));
    if (nextScale === 1) {
      zoomX = 0;
      zoomY = 0;
    }
    zoomScale = nextScale;
    applyZoom();
  });

  imageZoomViewport.addEventListener("pointerdown", function (event) {
    imageZoomViewport.setPointerCapture(event.pointerId);
    activePointers.set(event.pointerId, event);

    if (activePointers.size === 1) {
      lastPanPoint = event;
    }

    if (activePointers.size === 2) {
      const points = Array.from(activePointers.values());
      lastPinchDistance = distance(points[0], points[1]);
    }
  });

  imageZoomViewport.addEventListener("pointermove", function (event) {
    if (!activePointers.has(event.pointerId)) return;
    activePointers.set(event.pointerId, event);

    if (activePointers.size === 2) {
      const points = Array.from(activePointers.values());
      const nextDistance = distance(points[0], points[1]);
      if (lastPinchDistance) {
        zoomScale = clampScale(zoomScale * (nextDistance / lastPinchDistance));
        applyZoom();
      }
      lastPinchDistance = nextDistance;
      return;
    }

    if (activePointers.size === 1 && lastPanPoint && zoomScale > 1) {
      zoomX += event.clientX - lastPanPoint.clientX;
      zoomY += event.clientY - lastPanPoint.clientY;
      lastPanPoint = event;
      applyZoom();
    }
  });

  function endPointer(event) {
    activePointers.delete(event.pointerId);
    lastPanPoint = activePointers.size === 1 ? Array.from(activePointers.values())[0] : null;
    lastPinchDistance = 0;
  }

  imageZoomViewport.addEventListener("pointerup", endPointer);
  imageZoomViewport.addEventListener("pointercancel", endPointer);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !imageZoomModal.hidden) closeZoom();
  });

  render();
})();
