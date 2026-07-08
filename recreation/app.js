(function () {
  const config = window.RECREATION_CONFIG;
  const questions = window.RECREATION_QUESTIONS;
  const form = document.getElementById("surveyForm");
  const questionList = document.getElementById("questionList");
  const participantName = document.getElementById("participantName");
  const submitStatus = document.getElementById("submitStatus");

  function safe(text) {
    return String(text).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char];
    });
  }

  function questionText(question) {
    return typeof question === "string" ? question : question.text;
  }

  function renderQuestions() {
    questionList.innerHTML = questions.map(function (question, index) {
      const text = questionText(question);
      const options = Array.isArray(question.options) ? question.options : [];
      const answerName = "answer-" + index;

      if (options.length) {
        return (
          '<fieldset class="field question-field choice-field">' +
          '<legend>' + safe(index + 1) + ". " + safe(text) + '</legend>' +
          '<div class="option-grid">' +
          options.map(function (option) {
            return (
              '<label class="option-card">' +
              '<input type="radio" name="' + safe(answerName) + '" value="' + safe(option) + '" required>' +
              '<span>' + safe(option) + '</span>' +
              '</label>'
            );
          }).join("") +
          '</div>' +
          '</fieldset>'
        );
      }

      return (
        '<label class="field question-field">' +
        '<span>' + safe(index + 1) + ". " + safe(text) + '</span>' +
        '<input name="' + safe(answerName) + '" autocomplete="off" maxlength="36" required>' +
        '</label>'
      );
    }).join("");
  }

  function answerFor(index) {
    const control = form.elements["answer-" + index];
    if (!control) return "";
    if (control instanceof RadioNodeList) return control.value.trim();
    return control.value.trim();
  }

  function postSubmission(payload) {
    if (!config.scriptUrl) {
      localStorage.setItem("recreation-last-local-submission", JSON.stringify(payload));
      return Promise.resolve();
    }

    return fetch(config.scriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = participantName.value.trim();
    const missing = questions.map(function (_, index) {
      return answerFor(index) ? null : index + 1;
    }).filter(Boolean);

    if (!name) {
      submitStatus.textContent = "이름을 적어주세요.";
      submitStatus.className = "status warn";
      participantName.focus();
      return;
    }

    if (missing.length) {
      submitStatus.textContent = "아직 답하지 않은 문항이 있어요: " + missing.join(", ") + "번";
      submitStatus.className = "status warn";
      const firstMissing = form.elements["answer-" + (missing[0] - 1)];
      const target = firstMissing instanceof RadioNodeList ? firstMissing[0] : firstMissing;
      if (target && target.focus) target.focus();
      return;
    }

    const answers = questions.map(function (question, index) {
      const text = questionText(question);
      return {
        questionIndex: index,
        question: text,
        answer: answerFor(index)
      };
    });

    submitStatus.textContent = "제출 중입니다.";
    submitStatus.className = "status";
    postSubmission({
      eventCode: config.eventCode,
      participant: name,
      answers: answers,
      submittedAt: new Date().toISOString()
    }).then(function () {
      submitStatus.textContent = "제출 완료! 진행자 화면에 곧 반영됩니다.";
      submitStatus.className = "status good";
      form.reset();
      participantName.focus();
    }).catch(function () {
      submitStatus.textContent = "제출에 실패했습니다. 잠시 후 다시 시도해주세요.";
      submitStatus.className = "status warn";
    });
  });

  renderQuestions();
})();
