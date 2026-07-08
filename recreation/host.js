(function () {
  const config = window.RECREATION_CONFIG;
  const connectionPanel = document.getElementById("connectionPanel");
  const responseCloud = document.getElementById("responseCloud");
  const responseCount = document.getElementById("responseCount");
  const selectedAnswer = document.getElementById("selectedAnswer");
  const guessGrid = document.getElementById("guessGrid");
  const revealButton = document.getElementById("revealButton");
  const answerCard = document.getElementById("answerCard");
  const refreshButton = document.getElementById("refreshButton");
  const shuffleButton = document.getElementById("shuffleButton");

  let responses = [];
  let order = [];
  let currentParticipant = "";
  let selectedGuess = "";
  let timer = null;

  function safe(text) {
    return String(text).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char];
    });
  }

  function jsonp(url) {
    return new Promise(function (resolve, reject) {
      const callback = "recreationCallback_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
      const script = document.createElement("script");
      const separator = url.includes("?") ? "&" : "?";
      window[callback] = function (data) {
        delete window[callback];
        script.remove();
        resolve(data);
      };
      script.onerror = function () {
        delete window[callback];
        script.remove();
        reject(new Error("JSONP failed"));
      };
      script.src = url + separator + "callback=" + encodeURIComponent(callback);
      document.body.appendChild(script);
    });
  }

  function groupedResponses() {
    const groups = new Map();
    responses.forEach(function (item) {
      const name = item.participant || "이름 없음";
      if (!groups.has(name)) {
        groups.set(name, {
          participant: name,
          answers: [],
          byQuestion: new Map()
        });
      }
      groups.get(name).byQuestion.set(String(item.questionIndex), item);
    });

    groups.forEach(function (group) {
      group.answers = Array.from(group.byQuestion.values()).sort(function (a, b) {
        return Number(a.questionIndex) - Number(b.questionIndex);
      });
    });

    return Array.from(groups.values()).sort(function (a, b) {
      return a.participant.localeCompare(b.participant, "ko");
    });
  }

  function currentGroup() {
    return groupedResponses().find((group) => group.participant === currentParticipant);
  }

  function syncOrder(groups) {
    const names = groups.map((group) => group.participant);
    order = order.filter((name) => names.includes(name));
    names.forEach(function (name) {
      if (!order.includes(name)) order.push(name);
    });
    if (!currentParticipant || !names.includes(currentParticipant)) {
      currentParticipant = order[0] || "";
    }
  }

  function renderConnection(message, type) {
    if (config.scriptUrl) {
      connectionPanel.innerHTML = '<strong>연결됨</strong><span>' + safe(message || "Google Sheets에서 응답을 불러옵니다.") + '</span>';
      connectionPanel.className = "connection-panel " + (type || "good");
      return;
    }
    connectionPanel.innerHTML = '<strong>설정 필요</strong><span>config.js에 Apps Script Web App URL을 넣으면 참여자 응답이 자동으로 모입니다.</span>';
    connectionPanel.className = "connection-panel warn";
  }

  function renderCloud() {
    const groups = groupedResponses();
    syncOrder(groups);
    const group = currentGroup();
    responseCount.textContent = groups.length + "명";
    if (!group) {
      responseCloud.innerHTML = '<div class="empty">아직 도착한 응답이 없습니다.</div>';
      renderReveal();
      return;
    }

    responseCloud.innerHTML = group.answers.map(function (item, index) {
      const weight = 1 + ((item.answer.length + index) % 5);
      return (
        '<span class="cloud-word weight-' + safe(weight) + '">' + safe(item.answer) + '</span>'
      );
    }).join("");
    renderReveal();
  }

  function renderReveal() {
    const groups = groupedResponses();
    const group = currentGroup();
    guessGrid.innerHTML = groups.map(function (item) {
      const name = item.participant;
      return '<button type="button" data-guess="' + safe(name) + '"' + (name === selectedGuess ? ' class="selected"' : "") + '>' + safe(name) + '</button>';
    }).join("");
    revealButton.disabled = !group;
    answerCard.hidden = true;
    answerCard.innerHTML = "";
    selectedAnswer.textContent = group ? "이 답변들은 누구의 답변일까요?" : "응답을 기다리는 중입니다.";
  }

  function loadResponses() {
    if (!config.scriptUrl) {
      renderConnection("", "warn");
      renderCloud();
      return Promise.resolve();
    }
    const url = config.scriptUrl + "?action=list&eventCode=" + encodeURIComponent(config.eventCode);
    return jsonp(url).then(function (data) {
      responses = Array.isArray(data.responses) ? data.responses : [];
      renderConnection("최근 응답 " + groupedResponses().length + "명분을 불러왔습니다.", "good");
      renderCloud();
    }).catch(function () {
      renderConnection("응답을 불러오지 못했습니다. Apps Script 배포 URL을 확인해주세요.", "warn");
    });
  }

  function shuffle() {
    const groups = groupedResponses();
    syncOrder(groups);
    if (!order.length) {
      renderCloud();
      return;
    }
    const available = order.filter((name) => name !== currentParticipant);
    const candidates = available.length ? available : order;
    currentParticipant = candidates[Math.floor(Math.random() * candidates.length)];
    selectedGuess = "";
    const group = currentGroup();
    if (group) {
      for (let index = group.answers.length - 1; index > 0; index -= 1) {
        const other = Math.floor(Math.random() * (index + 1));
        const temp = group.answers[index];
        group.answers[index] = group.answers[other];
        group.answers[other] = temp;
      }
    }
    renderCloud();
  }

  guessGrid.addEventListener("click", function (event) {
    const button = event.target.closest("[data-guess]");
    if (!button) return;
    selectedGuess = button.dataset.guess;
    guessGrid.querySelectorAll("button").forEach(function (item) {
      item.classList.toggle("selected", item.dataset.guess === selectedGuess);
    });
  });

  revealButton.addEventListener("click", function () {
    const group = currentGroup();
    if (!group) return;
    const correct = selectedGuess && selectedGuess === group.participant;
    answerCard.hidden = false;
    answerCard.innerHTML = [
      '<p class="' + (correct ? "correct" : "miss") + '">' + safe(selectedGuess ? "선택한 답: " + selectedGuess : "선택한 답 없음") + '</p>',
      '<dl>',
      '<dt>정답</dt><dd>' + safe(group.participant) + '</dd>',
      '</dl>',
      '<div class="answer-list">',
      group.answers.map(function (item) {
        return (
          '<section class="answer-item">' +
          '<h3>' + safe(item.question) + '</h3>' +
          '<p>' + safe(item.answer) + '</p>' +
          '</section>'
        );
      }).join(""),
      '</div>'
    ].join("");
  });

  refreshButton.addEventListener("click", loadResponses);
  shuffleButton.addEventListener("click", shuffle);

  loadResponses();
  timer = window.setInterval(loadResponses, Math.max(2, config.pollSeconds || 4) * 1000);
  window.addEventListener("beforeunload", function () {
    if (timer) window.clearInterval(timer);
  });
})();
