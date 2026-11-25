# pokemongo-hub → 이사했습니다 (리다이렉트 전용)

오박사의 포켓몬고 허브는 **루트 주소**로 이사했습니다.

## 새 주소
### 👉 https://pogo-obaksa.github.io/

- 운영 저장소: [`pogo-obaksa/pogo-obaksa.github.io`](https://github.com/pogo-obaksa/pogo-obaksa.github.io) (`main` / 루트)
- 이 저장소(`pogo-obaksa/pokemongo-hub`)는 **예전에 공유된 링크를 살리기 위한 리다이렉트 전용**입니다.
  `index.html`(및 하위 경로용 `404.html`)이 방문자를 새 루트 주소로 즉시 넘기며, 쿼리스트링(`?guide=…`)과
  해시(`#guide/…`)도 그대로 유지합니다. 예: `…/pokemongo-hub/#guide/shadow-purify` → `https://pogo-obaksa.github.io/#guide/shadow-purify`
- 실제 사이트 파일(index.html·app.js·styles.css·data/)은 이 저장소에서 **제거**했습니다. 이전 버전은 git 이력에 남아 있습니다.
- 배포/수정은 새 저장소에서 하고, 이 저장소는 건드리지 않습니다. (`repos/deploy-pokemongo-hub.sh`가 새 저장소로 배포합니다.)
