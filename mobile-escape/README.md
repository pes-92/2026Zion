# SION Retreat Game

정적 웹사이트로 만든 수련회 역할 미션 초안입니다.

## 시작 파일

- `index.html`: 핸드폰 역할 선택
- `main.html`: 문제풀이담당
- `clues.html`: 정보수집담당
- `search.html`: 검색담당

## 문제풀이 정답

| 파트 | 정답 |
| --- | --- |
| 네갈래길 | `남쪽` |
| 문과 악보 | `강하고담대하라` |
| 벽화 | `여호수아` |
| 네 자리 비밀번호 | `0107` |
| 흩어진 종이 | `0713` |
| 상자 속 종이 | `시온` |

## 정보수집 입력어

`네갈래길`, `타일`, `같이보자`, `찾았어?`, `종이`, `쪽지`

## 검색담당 입력어

`지도`, `악보`, `조명`, `자물쇠`, `종이`, `실물 종이`, `네모무늬`

## 수정 위치

- 문제풀이 흐름과 정답: `game-data.js`의 `solverScenes`
- 정보수집 화면: `game-data.js`의 `infoEvents`
- 검색담당 화면: `game-data.js`의 `searchEvents`
- 사회자용 히든 최종 입력창: `game-data.js`의 `finalGate`
- 화면 색상: `game-data.js`의 `team`
- 화면 디자인: `styles.css`

문제풀이 장면에 그림을 넣으려면 해당 `solverScenes` 항목에 `images`를 추가합니다.

```js
images: [
  "image/example.png",
  { src: "image/example-2.png", caption: "짧은 설명" }
]
```

정보수집/검색담당 카드에 그림을 넣으려면 해당 `infoEvents` 또는 `searchEvents` 항목에 `image`를 추가합니다.

```js
image: "image/example.png",
```

두 장 이상 넣으려면 배열로 적습니다.

```js
image: ["image/example.png", "image/example-2.png"],
```

정보수집/검색담당 이미지는 누르면 확대해서 볼 수 있습니다.

각 역할의 진행 상태와 열린 내용은 해당 핸드폰 브라우저에 저장됩니다. 다시 처음부터 진행하려면 화면 오른쪽 위의 초기화 버튼을 누르면 됩니다.

## 히든 최종 입력창

사회자가 마지막 입력창을 열어주려면 현재 역할 화면 주소 뒤에 `?final=1`을 붙입니다.

- `main.html?final=1`
- `clues.html?final=1`
- `search.html?final=1`

주소 뒤에 `#final`을 붙여도 열립니다. 접속한 역할 화면에 따라 문제풀이담당, 정보수집담당, 검색담당용 찐찐막 문제가 각각 다르게 표시됩니다.
