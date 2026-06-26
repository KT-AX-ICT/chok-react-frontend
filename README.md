# Chok React Frontend

로그 분석 자동화 시스템의 Vite/React 프론트엔드 프로젝트입니다.

React 프론트엔드는 Spring Boot API에서 제공하는 BGL 로그, AI 분석 결과, 반복 패턴, 대시보드 지표를 화면에 표시합니다. BGL 로그 seed data 적재, 분석 결과 저장 및 조회, Scheduler 실행, FastAPI 호출 연동은 Spring Boot 영역입니다. AI 근거 생성과 반복 패턴 분석 로직 자체는 FastAPI/Python 영역입니다.

## 기술 스택

- React 18
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS 4
- lucide-react

## 빠른 시작

### 환경 변수 예시

공유용 환경 변수 예시는 `.env.example`에 있습니다.

```bash
.env.example
```

`.env.example`은 개발용 placeholder만 담은 파일이며 Git에 포함됩니다. 실제 개인 환경 값이 필요하면 각자 로컬에서 `.env`를 만들거나 터미널 환경 변수로 주입합니다.

주의사항:

- `.env`와 `.env.*` 파일은 Git에 올리지 않습니다.
- 실제 비밀번호, 토큰, key, secret은 `.env.example`에 넣지 않습니다.
- 팀원에게 공유해야 하는 값은 secret이 아닌 placeholder 또는 설정 이름만 공유합니다.

주요 환경 변수:

| 변수 | 기본 예시 | 설명 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Spring Boot API 서버 주소 (미지정 시 `http://localhost:8080`) |
| `VITE_USE_MOCKS` | `true` | 백엔드 API가 준비되기 전 로컬 mock data 사용 여부 (`true`일 때만 mock) |
| `VITE_MOCK_EMPTY` | `false` | mock 사용 시 대시보드를 빈 상태로 반환(빈 상태 UI 테스트용) |

### 의존성 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

기본 개발 서버:

- Frontend: `http://localhost:5173`
- Spring Boot API: `http://localhost:8080`

### 빌드

```bash
npm run build
```

### 빌드 결과 미리보기

```bash
npm run preview
```

## 프로젝트 범위

P0 범위는 다음 화면 흐름을 우선합니다.

- 대시보드에서 최근 로그/분석 현황 요약
- FATAL 로그 중 AI 분석 결과 정상/이상 로그 목록 조회
- 판정상 이상 로그의 AI 분석 결과 목록 조회
- 로그 상세에서 원본 로그, 위험도, 근거 설명, 대응 방안 확인
- 로그의 반복 패턴 클러스터 조회

정상/이상 분류는 프론트엔드가 새로 판단하지 않습니다. 프론트엔드는 이상 로그에 대한 AI 근거 설명을 표시합니다.

## 패키지 책임

| Package | 책임 |
| --- | --- |
| `src/api` | Spring Boot API client, mock/API 전환 경계, 요청 helper |
| `src/components/layout` | 애플리케이션 shell, 상단 바, 사이드 내비게이션 |
| `src/components/common` | 로딩, 에러, 필터 등 화면 공통 상태/컨트롤 |
| `src/components/domain` | 로그 라벨, 레벨, 위험도 등 도메인 표시 컴포넌트 |
| `src/domain/log` | 로그 타입과 로그 레벨 타입 |
| `src/domain/analyses` | 분석 목록/상세, 대시보드 응답 타입 |
| `src/domain/patterns` | 반복 패턴 응답 타입 |
| `src/mocks` | 백엔드 연동 전 화면 검증용 mock data |
| `src/pages` | 라우트 단위 화면 |

## 책임 경계

- React는 DB에 직접 접근하지 않습니다.
- React는 FastAPI를 직접 호출하지 않습니다.
- React는 정상/이상 여부를 새로 판단하지 않고 Spring Boot에서 제공하는 분류 결과를 사용합니다.
- 분석 결과 저장, 반복 패턴 결과 저장, Scheduler 실행은 Spring Boot 책임입니다.
- AI 근거 설명과 반복 패턴 분석 로직은 FastAPI 책임입니다.
- `src/api`는 Spring Boot API 경계만 담당하고, 화면 상태와 렌더링은 `src/pages`와 `src/components`에서 처리합니다.
- mock data는 초기 UI shell과 API 계약 검증을 위한 임시 입력이며, 실제 API가 준비되면 같은 `src/api` 함수 경계에서 교체합니다.

## 로컬 지침 파일

공유 지침 파일:

- `AGENTS.md`
- `CLAUDE.md`

개인 로컬 지침 파일은 Git에서 제외됩니다.

- `AGENTS.local.md`
- `CLAUDE.local.md`

로컬 지침 파일, `.env`, secret, credential, key, private config 파일은 커밋하거나 업로드하지 않습니다.

## 현재 초기 구성

구현됨:

- Vite/React/TypeScript 애플리케이션 shell
- Tailwind CSS 4 기반 `uiDemo` 스타일 테마
- React Router 기반 화면 라우팅
- 대시보드, 시스템 로그, 주의 로그 분석, 분석 상세, 패턴 분석 화면
- Spring Boot API client 경계
- API 준비 전 mock data fallback
- 로딩/에러 상태 표시
- 로그 라벨, 로그 레벨, 위험도 표시 컴포넌트
- 서버 페이지네이션/정렬/필터 전면 연동
- 접근성/반응형
- 도메인별 응답 DTO를 Spring API 확정 명세에 맞춰 정렬
- E2E 테스트


