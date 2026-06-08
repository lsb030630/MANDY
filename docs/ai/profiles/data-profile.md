# Data Profile

## 데이터 원칙

- 위치를 모르면 넣지 않는다
- 위치가 확인된 업체만 `isVisible: true`
- 위치가 없는 업체는 `pendingLocationStores`로 분리한다
- 추정 주소나 애매한 검색 결과는 사용하지 않는다

## 현재 저장 위치

- 노출용 데이터: `lib/stores.ts`의 `stores`
- 위치 미확인 데이터: `lib/stores.ts`의 `pendingLocationStores`

## visible 업체 필수 조건

- `isVisible: true`
- `address` 존재
- `area`가 `미확인`이 아님

## 현재 스키마

### stores

- `id`
- `type`
- `categories`
- `name`
- `area`
- `address`
- `phone`
- `extraContact`
- `description`
- `memo`
- `tags`
- `verifiedAt`
- `isVisible`

### pendingLocationStores

- `name`
- `area`
- `phone`
- `reason`

## 데이터 받을 때 원하는 최소 형식

- 업체명
- 지역
- 정확한 주소
- 전화번호
- 카테고리

## 검증

다음 명령으로 현재 데이터 규칙을 확인한다.

- `npm run validate:stores`

