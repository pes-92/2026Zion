# SION Retreat Sites

두 사이트를 각각 독립 배포할 수 있도록 폴더를 분리했습니다.

## 폴더 구조

- `mobile-escape/`: 모바일 방탈출 사이트
- `recreation/`: 시작 전 라이브 레크레이션 사이트

최상위 `index.html`은 두 사이트로 들어가는 안내 화면입니다. 실제 배포할 때는 필요한 폴더 하나만 업로드하면 됩니다.

## 모바일 방탈출 배포

`mobile-escape/` 폴더 전체를 업로드합니다.

시작 파일은 `mobile-escape/index.html`입니다.

방탈출에 쓰이는 이미지는 `mobile-escape/image/` 안에 들어 있습니다.

## 시작 전 레크레이션 배포

`recreation/` 폴더 전체를 업로드합니다.

- 참여자 설문/모바일 QR용: `recreation/index.html`
- 진행자 PC용 직접 접속 주소: `recreation/host.html`
- 질문 수정: `recreation/questions.js`
- Google Sheets 연결: `recreation/config.js`
- Apps Script 코드: `recreation/apps-script.js`

참여자에게는 `recreation/index.html`만 공유하고, 진행자는 `recreation/host.html`을 직접 열면 됩니다.

Google Sheets 연결 방법은 `recreation/README.md`를 확인하면 됩니다.
