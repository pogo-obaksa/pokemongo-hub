/* =========================================================
   오박사의 포켓몬고 허브 — 일정 데이터 (한국 시간 KST 기준)
   기준 확인일: 2026-11-25 (leekduck.com/events/ 및 각 이벤트 상세 페이지 대조)
   - 모든 시각은 한국 표준시(+09:00) 고정값입니다. 기기 시간대와 무관하게 동작합니다.
   - 이벤트가 추가/변경되면 이 파일만 고치면 됩니다.
   category: raid | spotlight | max | community | event
   pokemonId: 이벤트 주인공 포켓몬 도감번호. 있으면 카드 아이콘이 공식 일러스트로 바뀌고,
              로드에 실패하면 emoji 로 자동 폴백합니다. 메가 포켓몬은 PokeAPI 폼 번호
              (메가메타그로스 10076 · 메가야도란 10071 · 메가픽시 10278)를 씁니다.
   ========================================================= */
(function (global) {
  'use strict';

  var E = function (id, title, start, end, category, opts) {
    var o = opts || {};
    return {
      id: id,
      title: title,
      start: start,
      end: end,
      category: category,
      badge: o.badge || '',
      emoji: o.emoji || '📅',
      pokemonId: o.pokemonId || null,
      desc: o.desc || '',
      tip: o.tip || '',
      priority: o.priority || 0,
      source: o.source || 'https://leekduck.com/events/'
    };
  };

  var EVENTS = [
    // ── 진행 중 (2026-11-25 현재) ─────────────────────────────
    // ── 지난 일정 (기록용) ──────────────────────────────────
    E('cresselia-darkrai', '크레세리아 · 다크라이 5성 레이드 (종료)', null, '2026-11-24T22:00:00+09:00', 'raid', {
      badge: '5성 레이드', emoji: '🌑', pokemonId: 488, priority: 0,
      desc: '황혼의 소원 초반부 5성 레이드. 다음 재등장을 기다려야 해요.',
      source: 'https://leekduck.com/events/cresselia-darkrai-in-5-star-raid-battles-november-2026/'
    }),
    E('max-monday-espurr', '다이맥스 냐스퍼 맥스 먼데이 (종료)', null, '2026-11-23T21:00:00+09:00', 'max', {
      badge: '맥스 먼데이', emoji: '💜', pokemonId: 677, priority: 0,
      desc: '11/23 맥스 먼데이 메인 다이맥스 보스였어요.',
      source: 'https://leekduck.com/events/max-mondays-2026-11-23/'
    }),

    E('deoxys-5star', '테오키스 4폼 5성 레이드', '2026-11-25T06:00:00+09:00', '2026-12-01T22:00:00+09:00', 'raid', {
      badge: '5성 레이드', emoji: '👾', pokemonId: 386, priority: 30,
      desc: '노말·어택·디펜스·스피드 4폼이 5성 레이드에 동시 등장. 어택폼은 물몸, 디펜스폼은 방어가 매우 높아요.',
      tip: '에스퍼 단일 타입이라 악·고스트·벌레로 두들겨 패면 됩니다. 2인 클리어도 가능한 물량이에요.',
      source: 'https://leekduck.com/events/deoxys-normal-defense-attack-speed-formes-in-5-star-raid-battles-november-2026/'
    }),
    E('deoxys-raid-hour', '테오키스 레이드 아워 (오늘!)', '2026-11-25T18:00:00+09:00', '2026-11-25T19:00:00+09:00', 'raid', {
      badge: '레이드 아워', emoji: '⏰', pokemonId: 386, priority: 100,
      desc: '오늘 18:00~19:00, 모든 체육관 5성 레이드가 테오키스 4폼으로 교체됩니다.',
      tip: '무료 레이드 패스는 하루 1장씩, 전날 안 쓴 1장까지 합쳐 최대 2장이에요. 17:50까지 체육관 앞에서 대기하세요.',
      source: 'https://leekduck.com/events/raidhour20261125/'
    }),
    E('mega-metagross', '메가메타그로스 메가 레이드', '2026-11-25T06:00:00+09:00', '2026-12-01T22:00:00+09:00', 'raid', {
      badge: '메가 레이드', emoji: '🦾', pokemonId: 10076, priority: 25,
      desc: '강철·에스퍼 복합. 불꽃·땅·고스트·악이 약점이에요.',
      tip: '메가 에너지를 모아 두면 강철 타입 딜러로 오래 쓸 수 있어요.',
      source: 'https://leekduck.com/events/mega-metagross-in-mega-raids-november-2026/'
    }),
    E('twilight-wishes', '황혼의 소원 (Twilight Wishes)', '2026-11-24T10:00:00+09:00', '2026-11-30T20:00:00+09:00', 'event', {
      badge: '메인 이벤트', emoji: '🌙', pokemonId: 197, priority: 40,
      desc: '해 스카프 에브이 · 달 스카프 블래키 · 록러프가 등장하고, 별가사리와 엘리짐(Elgyem) 이로치 확률이 올라가요.',
      tip: 'GO패스 마일스톤을 채우면 교환 럭키 확률 업 + 별의모래 2배 보너스가 열립니다.',
      source: 'https://leekduck.com/events/twilight-wishes-2026/'
    }),
    E('shadow-tornadus', '그림자 토네로스 (화신 폼) 그림자 레이드', '2026-11-16T06:00:00+09:00', '2026-12-01T22:00:00+09:00', 'raid', {
      badge: '그림자 5성', emoji: '🌪️', pokemonId: 641, priority: 20,
      desc: '주말마다 5성 그림자 레이드로 등장. 비행 단일 타입.',
      tip: '그림자 포켓몬은 정화하면 능력치가 오르지만, 공격용으로는 그림자 그대로 쓰는 게 강해요.',
      source: 'https://leekduck.com/events/shadow-tornadus-incarnate-forme-in-shadow-raids-november-16-2026/'
    }),

    // ── 예정 ─────────────────────────────────────────────────
    E('noibat-spotlight', '음뱃 스포트라이트 아워', '2026-11-26T18:00:00+09:00', '2026-11-26T19:00:00+09:00', 'spotlight', {
      badge: '스포트라이트', emoji: '🦇', pokemonId: 714, priority: 60,
      desc: '18:00~19:00 음뱃 대량 발생. 음번까지 진화 사탕 400개가 필요해요.',
      tip: '파인베리를 먹여 잡으면 사탕 2배 + 진화용 사탕 모으기 최적. 이로치도 노려볼 만해요.',
      source: 'https://leekduck.com/events/pokemonspotlighthour2026-11-26/'
    }),
    E('clefable-raid-day', '메가픽시 슈퍼 메가 레이드 데이', '2026-11-28T14:00:00+09:00', '2026-11-28T17:00:00+09:00', 'raid', {
      badge: '슈퍼 메가 레이드 데이', emoji: '🌷', pokemonId: 10278, priority: 90,
      desc: '메가픽시(페어리·비행) 포켓몬 GO 첫 등장. 14:00~17:00 3시간 한정.',
      tip: '체육관 돌리기로 레이드 패스 최대 6장, 티켓 구매 시 14장. 독·강철·전기·얼음·바위가 약점이에요.',
      source: 'https://leekduck.com/events/clefable-super-mega-raid-day-2026/'
    }),
    E('max-monday-cryogonal', '다이맥스 프리지오 맥스 먼데이', '2026-11-30T06:00:00+09:00', '2026-11-30T21:00:00+09:00', 'max', {
      badge: '맥스 먼데이', emoji: '❄️', pokemonId: 615, priority: 50,
      desc: '월요일 06:00~21:00 맥스배틀 개방. 이날은 프리지오(얼음)가 메인이에요.',
      tip: '18~19시에 파워스팟이 가장 많이 열려요. 불꽃·격투·바위·강철 다이맥스를 준비하세요.',
      source: 'https://leekduck.com/events/max-mondays-2026-11-30/'
    }),
    E('twilight-trails-end', '시즌 24 「Twilight Trails」 종료', null, '2026-12-01T10:00:00+09:00', 'event', {
      badge: '시즌', emoji: '🌆', priority: 35,
      desc: '황혼 시즌이 12월 1일 10:00에 끝납니다. 시즌 리서치는 종료와 함께 사라져요.',
      tip: '시즌 리서치·GO패스 보상은 종료 전에 꼭 수령하세요. 안 받으면 그대로 사라집니다.',
      source: 'https://leekduck.com/events/season-24-twilight-trails/'
    }),
    E('daydream-destinations', '새 시즌 「Daydream Destinations」 개막', '2026-12-01T10:00:00+09:00', '2027-03-01T10:00:00+09:00', 'event', {
      badge: '새 시즌', emoji: '🌅', priority: 80,
      desc: '12월 1일 10:00부터 2027년 3월 1일 10:00까지 이어지는 새 시즌.',
      tip: '시즌 첫날은 야생·레이드 로테이션이 한 번에 바뀌니 10시 전후로 접속해 두세요.',
      source: 'https://leekduck.com/events/season-24-twilight-trails/'
    }),
    E('tropical-paradise', '트로피컬 파라다이스', '2026-12-01T10:00:00+09:00', '2026-12-07T20:00:00+09:00', 'event', {
      badge: '메인 이벤트', emoji: '🏝️', priority: 45,
      desc: '새 시즌 개막과 함께 시작되는 첫 이벤트.',
      tip: '이벤트 시작과 동시에 GO패스 12월 시즌도 열립니다.',
      source: 'https://leekduck.com/events/tropical-paradise-2026/'
    }),
    E('go-pass-dec', 'GO 패스: 12월', '2026-12-01T10:00:00+09:00', '2027-01-05T10:00:00+09:00', 'event', {
      badge: 'GO 패스', emoji: '🎟️', priority: 30,
      desc: '12월 GO 패스 진행. 매일 미션을 채워 보상 트랙을 올리세요.',
      tip: 'GO 패스 델럭스는 별의모래·XP 보너스가 붙어 육성 효율이 확 올라갑니다.',
      source: 'https://leekduck.com/events/go-pass-december-2026/'
    }),
    E('regidrago', '레지드래고 5성 레이드', '2026-12-02T06:00:00+09:00', '2026-12-08T22:00:00+09:00', 'raid', {
      badge: '5성 레이드', emoji: '🐉', pokemonId: 895, priority: 55,
      desc: '드래곤 단일 타입 5성 레이드. 얼음·드래곤·페어리가 약점.',
      tip: '체력이 높아 3인 이상 권장. 얼음 딜러를 최소 2마리 데려가세요.',
      source: 'https://leekduck.com/events/regidrago-in-5-star-raid-battles-december-2026/'
    }),
    E('regidrago-raid-hour', '레지드래고 레이드 아워', '2026-12-02T18:00:00+09:00', '2026-12-02T19:00:00+09:00', 'raid', {
      badge: '레이드 아워', emoji: '⏰', pokemonId: 895, priority: 70,
      desc: '12월 2일 18:00~19:00 전 체육관이 레지드래고로 교체.',
      tip: '레이드 아워는 1시간뿐이에요. 17:40에 체육관 3~4개를 미리 찍어 두세요.',
      source: 'https://leekduck.com/events/raidhour20261202/'
    }),
    E('mega-slowbro', '메가야도란 메가 레이드', '2026-12-02T06:00:00+09:00', '2026-12-08T22:00:00+09:00', 'raid', {
      badge: '메가 레이드', emoji: '🛡️', pokemonId: 10071, priority: 35,
      desc: '물·에스퍼 복합. 전기·풀·벌레·고스트·악이 약점.',
      tip: '전기 딜러 한 마리면 2인도 가능한 수준이에요.',
      source: 'https://leekduck.com/events/mega-slowbro-in-mega-raids-december-2026/'
    }),
    E('shadow-dialga', '그림자 디아루가 그림자 레이드', '2026-12-02T06:00:00+09:00', '2027-01-05T22:00:00+09:00', 'raid', {
      badge: '그림자 5성', emoji: '⏳', pokemonId: 483, priority: 40,
      desc: '강철·드래곤 그림자 전설. 한 달간 주말 위주로 등장.',
      tip: '격투가 2.56배로 가장 잘 꽂히고, 땅도 1.6배예요. 그림자라 받는 피해가 아프니 방어 위주로.',
      source: 'https://leekduck.com/events/shadow-dialga-in-shadow-raids-december-2026/'
    }),
    E('wimpod-spotlight', '꼬시레 스포트라이트 아워', '2026-12-03T18:00:00+09:00', '2026-12-03T19:00:00+09:00', 'spotlight', {
      badge: '스포트라이트', emoji: '🪲', pokemonId: 767, priority: 45,
      desc: '18:00~19:00 꼬시레 대량 발생 + 사탕 2배.',
      tip: '꼬시레는 도망을 잘 가니 파인베리를 꼭 먹이세요.',
      source: 'https://leekduck.com/events/pokemonspotlighthour2026-12-03/'
    }),
    E('max-battle-day', '맥스배틀 데이', '2026-12-05T14:00:00+09:00', '2026-12-05T17:00:00+09:00', 'max', {
      badge: '맥스배틀 데이', emoji: '💥', priority: 60,
      desc: '14:00~17:00 파워스팟 집중 개방. 다이맥스 보스가 몰려옵니다.',
      tip: '맥스무브 게이지를 채우려면 3마리 모두 다이맥스로 맞춰야 해요.',
      source: 'https://leekduck.com/events/max-battle-day-december-2026/'
    }),
    E('deino-max-monday', '다이맥스 모노두 맥스 먼데이', '2026-12-07T06:00:00+09:00', '2026-12-07T21:00:00+09:00', 'max', {
      badge: '맥스 먼데이', emoji: '🐲', pokemonId: 633, priority: 40,
      desc: '모노두(악·드래곤)가 맥스배틀 메인으로 등장.',
      tip: '다이맥스 삼삼드래는 악 타입 맥스무브로 레이드에서도 쓸 만해요.',
      source: 'https://leekduck.com/events/max-mondays-2026-12-07/'
    }),
    E('dec-community-day', '12월 커뮤니티 데이 2026', '2026-12-12T14:00:00+09:00', '2026-12-13T17:00:00+09:00', 'community', {
      badge: '커뮤니티 데이', emoji: '🎉', priority: 75,
      desc: '12월 12일 14:00 ~ 13일 17:00 (이틀간) 대상 포켓몬 대량 발생.',
      tip: '커뮤니티 데이 전용 기술은 진화 시간 안에만 배울 수 있어요. 놓치면 끝.',
      source: 'https://leekduck.com/events/december-communityday2026/'
    })
  ];

  global.HUB_EVENTS = EVENTS;

  global.HUB_META = {
    verifiedAt: '2026-11-25',
    verifiedFrom: 'leekduck.com/events/ (한국 시간 기준으로 변환)',
    disclaimer: '일정은 해외 공식 공지 기반을 한국 시간으로 정리한 값이에요. 게임 내 공지와 다르면 게임이 우선입니다.'
  };
})(window);
