# Resolver

이 프로젝트에서는 모든 문서를 한 번에 읽지 않는다. 먼저 작업 유형을 고르고, 그 작업에 필요한 파일만 읽는다.

## 기본 원칙

- 하네스는 얇게 유지한다. 전역 규칙은 이 파일 하나만 둔다.
- 프로젝트 지식은 `docs/ai/profiles/`에 나눈다.
- 반복해서 검증할 수 있는 일은 모델이 아니라 스크립트로 처리한다.
- 같은 종류의 요청이 두 번 나오면 다음 번엔 문서나 스크립트로 승격할지 먼저 판단한다.

## 작업 유형별 우선 로드

### 1. UI 수정 / 화면 추가

먼저 읽을 것:

- `docs/ai/profiles/product-profile.md`
- `docs/ai/profiles/design-profile.md`

추가로 볼 것:

- `app/`
- `components/`

### 2. 업체 데이터 입력 / 정리 / 필터 문제

먼저 읽을 것:

- `docs/ai/profiles/data-profile.md`

먼저 실행할 것:

- `npm run validate:stores`

추가로 볼 것:

- `lib/stores.ts`

### 3. 지도 연동 / 검색 로직 / 리스트 동기화

먼저 읽을 것:

- `docs/ai/profiles/product-profile.md`
- `docs/ai/profiles/data-profile.md`

추가로 볼 것:

- `components/explore/ExploreClient.tsx`

### 4. 문구 / 정보 구조 / 브랜딩 정리

먼저 읽을 것:

- `docs/ai/profiles/product-profile.md`
- `docs/ai/profiles/design-profile.md`

### 5. 배포 / 환경변수 / 외부 서비스 키 연결

먼저 볼 것:

- `package.json`
- 현재 `.env` 사용 여부
- 필요한 공식 문서

## 결정론 vs 판단

다음은 코드나 스크립트로 먼저 처리한다.

- visible 업체가 주소를 갖고 있는지 확인
- 카테고리 값이 허용 목록 안에 있는지 확인
- 중복 id 확인
- 미확인 위치 업체 분리

다음은 모델이 판단한다.

- 메모 문장 정리
- 정보 구조 우선순위
- 화면 카피
- 기능 추가 시 UX 영향

## 반복 요청 승격 규칙

- 같은 형식의 데이터 정리가 두 번 나오면 템플릿 또는 스크립트로 분리한다.
- 같은 UI 패턴이 두 번 나오면 컴포넌트로 분리한다.
- 같은 설명을 두 번 하게 되면 프로파일 문서에 추가한다.

