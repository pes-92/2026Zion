const SHEET_NAME = "responses";

function doPost(event) {
  const payload = JSON.parse(event.postData.contents || "{}");
  const sheet = getSheet_();
  const submissionId = Utilities.getUuid();
  const answers = Array.isArray(payload.answers) ? payload.answers : [];

  answers.forEach(function (item) {
    sheet.appendRow([
      new Date(),
      payload.eventCode || "",
      payload.participant || "",
      Number(item.questionIndex),
      item.question || "",
      item.answer || "",
      submissionId
    ]);
  });

  return json_({ ok: true, submissionId: submissionId });
}

function doGet(event) {
  const params = event.parameter || {};
  const eventCode = params.eventCode || "";
  const rows = getSheet_().getDataRange().getValues();
  const responses = rows.slice(1).filter(function (row) {
    return !eventCode || row[1] === eventCode;
  }).map(function (row, index) {
    return {
      id: [row[6], row[3], index].join("-"),
      timestamp: row[0],
      eventCode: row[1],
      participant: row[2],
      questionIndex: row[3],
      question: row[4],
      answer: row[5],
      submissionId: row[6]
    };
  }).filter(function (item) {
    return item.answer;
  });

  const data = { ok: true, responses: responses };
  if (params.callback) {
    return ContentService
      .createTextOutput(params.callback + "(" + JSON.stringify(data) + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(data);
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "timestamp",
      "eventCode",
      "participant",
      "questionIndex",
      "question",
      "answer",
      "submissionId"
    ]);
  }
  return sheet;
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
