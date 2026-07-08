# 누구의 답일까? 라이브 레크레이션

무료 Google Sheets + Apps Script로 참여자 응답을 모으는 별도 레크레이션 사이트입니다.

## 화면

- `index.html`: 참여자 설문 페이지, 모바일/QR 공유용
- `host.html`: 진행자 응답 구름/정답 공개 화면, PC 직접 접속용
- `questions.js`: 질문 수정
- `config.js`: Apps Script 배포 URL 설정

## 질문 수정

주관식 질문은 문장만 적으면 됩니다.

```js
"요즘 가장 자주 쓰는 말버릇은?"
```

선택식 질문은 `text`와 `options`를 함께 적으면 됩니다.

```js
{
  text: "단체 여행에서 내가 맡을 것 같은 역할은?",
  options: ["총무", "분위기메이커", "길찾기", "사진 담당"]
}
```

## Google Sheets 연결

1. 새 Google Sheet를 만듭니다.
2. 메뉴에서 `확장 프로그램 > Apps Script`를 엽니다.
3. `apps-script.js` 내용을 붙여넣고 저장합니다.
4. `배포 > 새 배포 > 웹 앱`을 선택합니다.
5. 실행 권한은 본인, 액세스 권한은 링크가 있는 모든 사용자로 설정합니다.
6. 배포 후 나온 Web App URL을 `config.js`의 `scriptUrl`에 넣습니다.

현재 연결된 Web App URL:

```txt
https://script.google.com/macros/s/AKfycbwNCovbvePtP8F_k7CDipROxq4oG6wz4Nllvn0QZ-fbJ1VlEYyf6HLADdSzKwSwPb8/exec
```

```js
window.RECREATION_CONFIG = {
  scriptUrl: "https://script.google.com/macros/s/배포ID/exec",
  eventCode: "sion-2026",
  pollSeconds: 4
};
```

참여자에게는 `recreation/index.html`만 공유하고, 진행자는 `recreation/host.html`을 PC에서 직접 열면 됩니다.
