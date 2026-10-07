# Concrete Jungle Archive

Next.js + Firebase로 만든 아카이브 사이트예요. 게시물·이미지·관리자 로그인은 Firebase가 처리하고, 사이트는 Vercel에 배포해요.

## 페이지 구성

| 주소 | 내용 |
| --- | --- |
| `/` | 메인. Members 탭(기본) / News 탭(`/?tab=news`) |
| `/artists/[slug]` | 아티스트 페이지 (이름, 대표 유튜브 영상, 게시물 3열 그리드) |
| `/posts/[id]` | 게시물 (뒤로가기, News는 이전글/다음글) |
| `/admin` | 관리자 페이지 (글 목록 · 새 글 쓰기 · 아티스트 설정) |

관리자 페이지는 사이트 어디에도 링크가 없어서 주소창에 `/admin`을 직접 입력해 들어가요.

### 자주 바꾸는 파일

- 로고: `public/logo.svg`를 실제 로고로 교체해요. PNG 등 다른 형식이면 `src/lib/site.ts`의 `logo` 경로도 바꿔 주세요.
- 파비콘(브라우저 탭 아이콘): `src/app/icon.svg`
- 연락처, 아티스트 이름과 순서: `src/lib/site.ts`

## 1. Firebase 설정 (처음 한 번)

1. [Firebase 콘솔](https://console.firebase.google.com)에서 **프로젝트 추가**를 눌러요. Google 애널리틱스는 꺼도 돼요.
2. **요금제를 Blaze로 업그레이드**해요. 이미지 저장(Storage)에 필요해요. 무료 사용량 안에서는 요금이 나오지 않아요.
   - 꼭 **예산 알림**을 설정하세요. Google Cloud 콘솔 > 결제 > 예산 및 알림에서 예를 들어 월 5,000원으로 설정하면, 넘을 때 메일이 와요.
3. **웹 앱 등록**: 프로젝트 개요 > 앱 추가 > 웹(`</>`)을 눌러요. 화면에 나오는 `firebaseConfig` 값을 `.env.local`에 넣어요(아래 2번 참고).
4. **Authentication**
   - 로그인 방법 탭에서 **이메일/비밀번호**를 사용 설정해요.
   - 사용자 탭 > **사용자 추가**에서 관리자 이메일과 비밀번호를 만들고, 생성된 **사용자 UID**를 복사해요.
   - (선택) 설정 탭 > 사용자 작업에서 가입(생성) 허용을 끄면 외부인이 계정을 만드는 것도 막을 수 있어요. 끄지 않아도 관리자로 등록되지 않은 계정은 아무것도 수정할 수 없어요.
5. **Firestore Database**
   - 데이터베이스 만들기 → 위치는 `asia-northeast3 (서울)`, **프로덕션 모드**로 만들어요.
   - 규칙 탭에 이 폴더의 `firestore.rules` 내용을 붙여넣고 **게시**해요.
   - 데이터 탭 > 컬렉션 시작 → 컬렉션 ID `admins`, **문서 ID에 4번에서 복사한 UID**를 넣고, 필드는 아무거나 하나 넣어요(예: `name` = 이름).
6. **Storage**
   - 시작하기 → 위치는 **`us-central1`, `us-east1`, `us-west1` 중 하나**로 골라요. 이 세 지역에서만 무료 사용량(저장 5GB 등)이 적용돼요.
   - 규칙 탭에 `storage.rules` 내용을 붙여넣고 **게시**해요. Firestore 접근 권한을 허용할지 물으면 허용해요. 관리자 확인에 필요해요.

### 관리자 추가 / 삭제

- 추가: Authentication에서 사용자를 만들고, Firestore `admins` 컬렉션에 그 UID로 문서를 만들어요.
- 삭제: `admins`에서 해당 문서를 지우면 그 계정은 바로 수정 권한을 잃어요.

## 2. 내 컴퓨터에서 실행

```bash
npm install
cp .env.local.example .env.local   # 열어서 Firebase 값 6개를 채워요
npm run dev                        # http://localhost:3000
```

> glibc 2.28 이하의 오래된 Linux(예: RHEL 8)에서는 기본 번들러가 동작하지 않으니 `npm run dev -- --webpack`으로 실행하세요.

## 3. Vercel 배포

1. 이 폴더를 GitHub 저장소에 올려요. `.env.local`은 `.gitignore`에 들어 있어서 올라가지 않아요.
2. [vercel.com](https://vercel.com)에서 **Add New → Project**를 눌러 저장소를 가져와요.
3. **Environment Variables**에 `.env.local`의 `NEXT_PUBLIC_FIREBASE_...` 값 6개를 넣어요. `NEXT_PUBLIC_USE_FIREBASE_EMULATORS`는 넣지 않아요.
4. **Deploy**를 눌러요. 서버 지역은 `vercel.json`에서 서울(`icn1`)로 지정돼 있어요. 배포 후 Vercel 프로젝트 설정 > Functions에서 지역이 서울로 잡혔는지 확인하세요.

## 글쓰기 안내

- **News**: 날짜, 제목, 대표 이미지, 내용
- **아티스트**: 제목, 이미지(여러 장 가능, 첫 장이 썸네일), 내용, 관련 링크
- 사진은 업로드할 때 긴 변 2000px JPEG로 자동으로 줄어들어요. GIF는 원본 그대로 올라가요.
- 본문의 줄바꿈은 그대로 보이고, 본문에 쓴 `https://` 주소는 자동으로 링크가 돼요.
- 저장하면 사이트에 바로 반영돼요. 방문할 때마다 최신 글을 읽어요.
