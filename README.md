# 테트리스 (교육용)

HTML, CSS, JavaScript만 사용하는 브라우저 테트리스 게임입니다.  
빌드 도구나 외부 라이브러리 없이 동작하며, 프론트엔드 입문 학습용으로 제작되었습니다.

## 프로젝트 소개

| 항목 | 내용 |
|------|------|
| 목적 | HTML / CSS / JavaScript 기초와 게임 로직 학습 |
| 보드 | 10열 × 20행 |
| 블록 | I, O, T, S, Z, J, L (7종) |
| 기술 스택 | 순수 HTML, CSS, JavaScript (Vanilla) |

플레이어는 떨어지는 블록을 이동·회전시켜 가로 줄을 채우고, 줄을 지워 점수를 올립니다. 보드가 가득 차면 게임 오버입니다.

## 실행 방법

### 로컬에서 실행

1. 저장소를 클론하거나 폴더를 엽니다.
2. `index.html`을 브라우저에서 엽니다. (더블클릭 또는 드래그)

또는 에디터의 **Live Server** 등으로 `index.html`을 열어도 됩니다.

### 온라인에서 실행 (GitHub Pages)

배포 후 아래 주소 형식으로 접속합니다.

```text
https://<GitHub-사용자명>.github.io/<저장소-이름>/
```

예: `https://ryanc110.github.io/tetris-cursor/`

## 조작법

게임 **시작** 버튼을 누른 뒤 키보드를 사용합니다.

| 키 | 동작 |
|----|------|
| `ArrowLeft` (←) | 왼쪽 이동 |
| `ArrowRight` (→) | 오른쪽 이동 |
| `ArrowDown` (↓) | 한 칸 빠르게 내리기 (Soft Drop) |
| `ArrowUp` (↑) | 블록 회전 (충돌 시 취소) |
| `Space` | 즉시 낙하 (Hard Drop) |

| 버튼 | 동작 |
|------|------|
| **시작** | 게임 시작 (자동 낙하 시작) |
| **재시작** | 보드·점수·타이머 초기화 |

## 구현 기능

- [x] 10×20 CSS Grid 게임 보드
- [x] 7종 테트로미노 정의 및 렌더링
- [x] 블록 자동 낙하 (`setInterval`, 800ms)
- [x] 충돌 판정 (`canMove`)
- [x] 키보드 이동·회전·소프트/하드 드롭
- [x] 블록 고정 및 새 블록 생성
- [x] 가득 찬 줄 삭제
- [x] 줄 수에 따른 점수 누적
- [x] 스폰 불가 시 게임 오버
- [x] 재시작 시 보드·점수·타이머·상태 초기화

### 점수 규칙

블록 고정 후 **한 번에** 지워진 줄 수에 따라 점수가 더해집니다.

| 지운 줄 수 | 점수 |
|-----------|------|
| 1줄 | 100 |
| 2줄 | 300 |
| 3줄 | 500 |
| 4줄 | 800 |

### 게임 오버

새 블록이 스폰 위치에 놓일 수 없으면 게임 오버입니다. **재시작** 후 **시작**을 눌러 다시 플레이합니다.

## 파일 구성

| 파일 | 설명 |
|------|------|
| `index.html` | 페이지 구조 (보드, 점수, 버튼, 조작법) |
| `style.css` | 레이아웃 및 스타일 |
| `script.js` | 게임 로직 전체 |
| `README.md` | 프로젝트 문서 |

## 품질 점검 방법

배포 전 아래 항목을 순서대로 확인합니다.

### 1. 기본 실행

- [ ] `index.html`을 열었을 때 보드·점수·버튼·조작법이 보인다.
- [ ] 브라우저 개발자 도구(F12) → **Console**에 에러가 없다.

### 2. 게임 플레이

- [ ] **시작** 후 블록이 자동으로 내려간다.
- [ ] 방향키로 이동·회전이 된다.
- [ ] `Space`로 하드 드롭이 된다.
- [ ] 줄을 가득 채우면 줄이 삭제되고 점수가 오른다.
- [ ] 보드가 가득 차면 게임 오버 메시지가 표시된다.
- [ ] **재시작** 후 보드와 점수가 0으로 초기화된다.

### 3. GitHub Pages 배포 후

- [ ] `https://<사용자>.github.io/<저장소>/` 에서 게임이 로드된다.
- [ ] CSS·JS가 적용된 상태로 보인다. (스타일 없는 HTML만 보이면 경로 문제)
- [ ] Console에 404 (style.css, script.js)가 없다.

### 4. 수동 QA 참고

프로젝트의 `.cursor/commands/qa-playtest.md` 커맨드로 TC별 점검 시나리오를 실행할 수 있습니다.

## GitHub Pages 배포 방법

### 사전 조건

- GitHub 저장소가 생성되어 있어야 합니다.
- 배포에 필요한 파일이 저장소 **루트**에 있어야 합니다: `index.html`, `style.css`, `script.js`

### 1. 저장소에 푸시

```bash
git init
git add index.html style.css script.js README.md .gitignore
git commit -m "Add tetris game for GitHub Pages"
git branch -M main
git remote add origin https://github.com/<사용자명>/<저장소-이름>.git
git push -u origin main
```

### 2. GitHub Pages 설정

1. GitHub 저장소 → **Settings** → **Pages**
2. **Source**: `Deploy from a branch`
3. **Branch**: `main` / **Folder**: `/ (root)`
4. **Save** 클릭

### 3. 배포 확인

- 1~2분 후 Pages URL에서 게임이 열리는지 확인합니다.
- **Actions** 탭에서 배포 상태를 확인할 수 있습니다.

### 배포 시 참고

- 이 프로젝트는 빌드 단계가 없으므로 **GitHub Actions 워크플로 없이** branch 배포만으로 충분합니다.
- `index.html`, `style.css`, `script.js`는 **상대 경로**로 연결되어 있어 서브경로(`/저장소-이름/`) 배포와 호환됩니다.
- 별도 `base` 태그나 절대 경로 변경은 필요하지 않습니다.

## 라이선스

교육용 프로젝트입니다. 자유롭게 학습·수정·배포할 수 있습니다.
