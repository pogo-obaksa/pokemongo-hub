/* =========================================================
   오박사의 포켓몬고 허브 — app.js
   의존: data/types.js (window.PGO), data/events.js (HUB_EVENTS), data/raids.js (HUB_BOSSES, HUB_COUNTERS)
   ========================================================= */
(function () {
  'use strict';

  var PGO = window.PGO;
  var EVENTS = window.HUB_EVENTS || [];
  var BOSSES = window.HUB_BOSSES || [];
  var COUNTERS = window.HUB_COUNTERS || {};
  var MAX_TIPS = window.HUB_MAX_TIPS || {};
  var DEX = window.HUB_POKEDEX || [];
  var DEX_MOVES = window.HUB_DEX_MOVES || [];
  var GUIDES = window.HUB_GUIDES || [];

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var num = function (n) { return Number(n || 0).toLocaleString('ko-KR'); };
  var DAY = 86400000;

  /* ─────────────── GA4 이벤트 ───────────────
     gtag.js가 없거나(오프라인·광고차단) 로드에 실패해도 절대 에러가 나지 않게 감싼다. */
  function track(name, params) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    } catch (e) { /* 통계는 실패해도 화면은 그대로 둔다 */ }
  }

  /* ─────────────── 시간 유틸 (전부 KST 고정) ─────────────── */
  var KST_OFFSET = 9 * 60 * 60 * 1000;

  function parse(iso) { return iso ? new Date(iso).getTime() : null; }

  /* KST 자정 기준 날짜 키 */
  function kstDateKey(ms) {
    var d = new Date(ms + KST_OFFSET);
    return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
  }

  function kstHM(ms) {
    var d = new Date(ms + KST_OFFSET);
    return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes());
  }

  function kstMD(ms) {
    var d = new Date(ms + KST_OFFSET);
    return (d.getUTCMonth() + 1) + '/' + d.getUTCDate();
  }

  function kstClock(ms) {
    var d = new Date(ms + KST_OFFSET);
    return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
  }

  /* 남은 시간 → "3일 04:12:09" / "04:12:09" */
  function formatRemain(ms) {
    if (ms === null || ms === undefined || isNaN(ms)) return '--:--:--';
    if (ms <= 0) return '00:00:00';
    var total = Math.floor(ms / 1000);
    var d = Math.floor(total / 86400);
    var h = Math.floor((total % 86400) / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    var clock = pad(h) + ':' + pad(m) + ':' + pad(s);
    return d > 0 ? d + '일 ' + clock : clock;
  }

  /* D-day 라벨 */
  function dday(startMs) {
    if (!startMs) return '';
    var today = kstDateKey(Date.now());
    var target = kstDateKey(startMs);
    var diff = Math.round(
      (Date.UTC(Math.floor(target / 10000), Math.floor(target % 10000 / 100) - 1, target % 100) -
       Date.UTC(Math.floor(today / 10000), Math.floor(today % 10000 / 100) - 1, today % 100)) / DAY
    );
    if (diff === 0) return 'D-DAY';
    return diff > 0 ? 'D-' + diff : 'D+' + Math.abs(diff);
  }

  /* 이벤트 상태 */
  function eventState(ev, now) {
    var s = parse(ev.start), e = parse(ev.end);
    if (e !== null && now >= e) return 'past';
    if (s !== null && now < s) return 'upcoming';
    return 'ongoing';
  }

  /* ─────────────── 상단 시계 ─────────────── */
  function tickClock() {
    var el = $('#kst-clock');
    if (el) el.textContent = kstClock(Date.now()) + ' KST';
  }

  /* ─────────────── 탭 ─────────────── */
  var TABS = ['events', 'raids', 'pokedex', 'powerup', 'guide'];

  function switchTab(name, opts) {
    if (TABS.indexOf(name) < 0) name = 'events';
    TABS.forEach(function (t) {
      var btn = document.getElementById('tabbtn-' + t);
      var panel = document.getElementById('tab-' + t);
      var on = t === name;
      if (btn) {
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
        btn.tabIndex = on ? 0 : -1;
      }
      if (panel) panel.hidden = !on;
    });
    if (name === 'guide') {
      if (opts && opts.guide) openGuide(opts.guide, { nav: 'none' });
      else showGuideIndex({ nav: 'none' });
    }
    if (!opts || !opts.silent) {
      var hash = '#' + name;
      if (name === 'guide' && guideState.slug) hash = '#guide/' + guideState.slug;
      if (history.replaceState) history.replaceState(null, '', hash);
      track('tab_switch', { tab_name: name });
    }
    if (name === 'events') renderEvents();
    if (name === 'pokedex') renderDex();
    if (name === 'powerup') updatePowerUp();
  }

  function initTabs() {
    var bar = $('.tabbar');
    if (!bar) return;
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.tab');
      if (btn) switchTab(btn.getAttribute('data-tab'));
    });
    bar.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var idx = TABS.indexOf(document.querySelector('.tab.is-active').getAttribute('data-tab'));
      var next = TABS[(idx + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
      switchTab(next);
      document.getElementById('tabbtn-' + next).focus();
    });
  }

  /* ─────────────── 일정 탭 ─────────────── */
  var eventFilter = 'all';
  var renderedEventIds = {};

  /* 포켓몬이 주인공인 일정은 공식 일러스트를 아이콘으로 쓰고, 실패하면 기존 이모지로 돌아간다 */
  function eventIconHTML(ev) {
    var fallback = '<span class="event-emoji-fallback"' + (ev.pokemonId ? ' style="display:none"' : '') + '>' +
      ev.emoji + '</span>';
    if (!ev.pokemonId) return '<div class="event-emoji" aria-hidden="true">' + fallback + '</div>';
    return '<div class="event-emoji has-mon" aria-hidden="true">' +
      '<img src="' + dexArt(ev.pokemonId) + '" alt="" loading="lazy" ' +
        'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\';">' +
      fallback + '</div>';
  }

  function cardHTML(ev, now) {
    var st = eventState(ev, now);
    var s = parse(ev.start), e = parse(ev.end);
    var timeText;
    if (st === 'upcoming') timeText = kstMD(s) + ' ' + kstHM(s) + ' 시작' + (e ? ' · ' + kstMD(e) + ' ' + kstHM(e) + ' 종료' : '');
    else if (st === 'ongoing') timeText = (s ? kstMD(s) + ' ' + kstHM(s) + ' ~ ' : '') + kstMD(e) + ' ' + kstHM(e) + ' 종료';
    else timeText = kstMD(e) + ' ' + kstHM(e) + ' 종료';

    var badgeClass = st === 'ongoing' ? ' is-live' : (ev.hot ? ' is-hot' : '');
    var cardClass = 'event-card' + (st === 'ongoing' ? ' is-live' : '') + (ev.hot ? ' is-hot' : '');
    var timerAttr = st === 'upcoming' ? 'data-count-start="' + ev.start + '"' : 'data-count-end="' + ev.end + '"';
    var ddayText = st === 'upcoming' && s ? dday(s) : (st === 'ongoing' ? '진행 중' : '종료');

    return '' +
      '<article class="' + cardClass + '" data-event-id="' + ev.id + '">' +
        eventIconHTML(ev) +
        '<div class="event-body">' +
          '<div class="event-top">' +
            '<span class="event-badge' + badgeClass + '">' + (ev.badge || '일정') + '</span>' +
            '<span class="event-badge' + (st === 'ongoing' ? ' is-live' : '') + '">' + ddayText + '</span>' +
          '</div>' +
          '<h4 class="event-title">' + ev.title + '</h4>' +
          '<p class="event-desc">' + ev.desc + '</p>' +
          '<div class="event-foot">' +
            '<span class="event-time">' + timeText + '</span>' +
            '<span class="event-timer' + (st === 'ongoing' ? ' is-live' : '') + '" ' + timerAttr + '>' +
              (st === 'past' ? '종료' : '--:--:--') +
            '</span>' +
          '</div>' +
          (ev.tip ? '<p class="event-tip">💡 ' + ev.tip + '</p>' : '') +
        '</div>' +
      '</article>';
  }

  function renderEvents() {
    var now = Date.now();
    var lists = { ongoing: [], upcoming: [], past: [] };

    EVENTS.forEach(function (ev) {
      var st = eventState(ev, now);
      if (eventFilter !== 'all' && ev.category !== eventFilter && !(eventFilter === 'raid' && ev.category === 'raid')) return;
      lists[st].push(ev);
    });

    lists.ongoing.sort(function (a, b) { return parse(a.end) - parse(b.end); });
    lists.upcoming.sort(function (a, b) { return parse(a.start) - parse(b.start); });
    lists.past.sort(function (a, b) { return parse(b.end) - parse(a.end); });

    $('#ongoing-list').innerHTML = lists.ongoing.length
      ? lists.ongoing.map(function (ev) { return cardHTML(ev, now); }).join('')
      : '<p class="fineprint">이 조건에 진행 중인 일정이 없어요.</p>';
    $('#upcoming-list').innerHTML = lists.upcoming.length
      ? lists.upcoming.map(function (ev) { return cardHTML(ev, now); }).join('')
      : '<p class="fineprint">이 조건에 예정된 일정이 없어요.</p>';

    $('#ongoing-count').textContent = lists.ongoing.length;
    $('#upcoming-count').textContent = lists.upcoming.length;

    var pastWrap = $('#past-wrap');
    if (lists.past.length) {
      pastWrap.hidden = false;
      $('#past-count').textContent = '(' + lists.past.length + ')';
      $('#past-list').innerHTML = lists.past.map(function (ev) { return cardHTML(ev, now); }).join('');
    } else {
      pastWrap.hidden = true;
    }

    var meta = window.HUB_META || {};
    $('#events-fineprint').textContent = '일정 최종 확인: ' + (meta.verifiedAt || '-') + ' · 출처: ' + (meta.verifiedFrom || '') +
      '. ' + (meta.disclaimer || '');

    updateHero(now);
    updateTimers(now);
  }

  function updateHero(now) {
    var best = null;
    EVENTS.forEach(function (ev) {
      var s = parse(ev.start), e = parse(ev.end);
      var boundary, mode;
      if (s !== null && now < s) { boundary = s; mode = 'start'; }
      else if (e !== null && now < e) { boundary = e; mode = 'end'; }
      else return;
      var gap = boundary - now;
      // 20분 이내 임박 이벤트 우선, 그 외엔 가까운 순
      var score = gap - (ev.priority || 0) * 60000 * (gap < 3 * 3600000 ? 3 : 0);
      if (!best || score < best.score) best = { ev: ev, boundary: boundary, mode: mode, score: score };
    });

    if (!best) return;
    var ev = best.ev;
    var label = $('#hero-label'), title = $('#hero-title'), sub = $('#hero-sub'), bar = $('#hero-progress');
    var urgent = best.boundary - now < 3600000;

    label.textContent = best.mode === 'end' ? '⏳ 종료까지' : '🚀 시작까지';
    label.className = 'hero-label' + (best.mode === 'end' ? ' is-ongoing' : '') + (urgent ? ' is-soon' : '');
    title.textContent = ev.title;
    sub.textContent = (ev.badge ? ev.badge + ' · ' : '') +
      (parse(ev.start) ? kstMD(parse(ev.start)) + ' ' + kstHM(parse(ev.start)) + ' ~ ' : '~ ') +
      kstMD(parse(ev.end)) + ' ' + kstHM(parse(ev.end)) + ' (KST)';

    var timer = $('#hero-timer');
    timer.textContent = formatRemain(best.boundary - now);
    timer.classList.toggle('is-urgent', urgent);

    if (best.mode === 'end' && parse(ev.start)) {
      var total = parse(ev.end) - parse(ev.start);
      var done = now - parse(ev.start);
      bar.style.width = Math.max(0, Math.min(100, (done / total) * 100)).toFixed(1) + '%';
    } else {
      bar.style.width = '0%';
    }

    renderHeroNext(now, ev.id);
  }

  var heroNextSig = '';
  function renderHeroNext(now, excludeId) {
    var el = $('#hero-next');
    if (!el) return;
    var items = [];
    EVENTS.forEach(function (ev) {
      if (ev.id === excludeId) return;
      var s2 = parse(ev.start), e2 = parse(ev.end);
      if (s2 !== null && now < s2) items.push({ when: s2, ev: ev, mode: 'start' });
      else if (e2 !== null && now < e2) items.push({ when: e2, ev: ev, mode: 'end' });
    });
    items.sort(function (a, b) { return a.when - b.when; });
    items = items.slice(0, 3);
    var sig = items.map(function (it) { return it.ev.id + it.when; }).join('|');
    if (sig === heroNextSig) return;
    heroNextSig = sig;
    el.innerHTML = items.map(function (it) {
      return '<li><span class="hn-when">' + kstMD(it.when) + ' ' + kstHM(it.when) +
        '</span><span class="hn-title">' + it.ev.title + '</span></li>';
    }).join('');
  }

  function updateTimers(now) {
    now = now || Date.now();
    $$('[data-count-end]').forEach(function (el) {
      var end = parse(el.getAttribute('data-count-end'));
      var left = end - now;
      el.textContent = left > 0 ? formatRemain(left) : '종료';
    });
    $$('[data-count-start]').forEach(function (el) {
      var start = parse(el.getAttribute('data-count-start'));
      var left = start - now;
      el.textContent = left > 0 ? formatRemain(left) : '시작';
    });
    var heroTimer = $('#hero-timer');
    var heroEnd = $('#hero-timer');
    if (heroTimer) {
      // 히어로는 매초 갱신 (가장 임박한 경계 기준)
      var best = null;
      EVENTS.forEach(function (ev) {
        var s = parse(ev.start), e = parse(ev.end);
        var b = null;
        if (s !== null && now < s) b = s; else if (e !== null && now < e) b = e;
        if (b === null) return;
        var gap = b - now;
        var score = gap - (ev.priority || 0) * 60000 * (gap < 3 * 3600000 ? 3 : 0);
        if (!best || score < best.score) best = { boundary: b, score: score };
      });
      if (best) {
        heroEnd.textContent = formatRemain(best.boundary - now);
        heroEnd.classList.toggle('is-urgent', best.boundary - now < 3600000);
      }
    }
  }

  function initFilterChips() {
    var row = $('.chip-row');
    if (!row) return;
    row.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      $$('.chip', row).forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      eventFilter = chip.getAttribute('data-filter');
      renderEvents();
    });
  }

  /* ─────────────── 카운터 탭 ─────────────── */
  var activeBossId = null;
  var SPRITE = function (dex) {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + dex + '.png';
  };

  function tierWeight(tier) { return tier === 'S' ? 1 : tier === 'A' ? 0.93 : 0.86; }

  function allCounters() {
    var seen = {}, out = [];
    Object.keys(COUNTERS).forEach(function (k) {
      COUNTERS[k].forEach(function (c) {
        if (seen[c.en]) return;
        seen[c.en] = 1;
        out.push(c);
      });
    });
    return out;
  }

  var COUNTER_POOL = allCounters();

  function computeCounters(boss, limit) {
    limit = limit || 6;
    var defs = boss.types;
    var scored = COUNTER_POOL.map(function (c) {
      var effC = PGO.multi(c.charged.type, defs);
      var effF = PGO.multi(c.fast.type, defs);
      var eff = Math.max(effC, effF);
      var score = (effC * 1.0 + effF * 0.3) * tierWeight(c.tier);
      return { c: c, eff: eff, effC: effC, score: score };
    });

    var byScore = function (a, b) { return b.score - a.score; };
    var picks = [];
    var used = {};

    /* 1) 약점 타입별로 최대 2마리씩 고르게 뽑기 (상위 타입부터) */
    var weakList = PGO.weaknesses(defs).map(function (w) {
      var best = 0;
      scored.forEach(function (x) { if (x.c.charged.type === w.type && x.score > best) best = x.score; });
      return { type: w.type, best: best };
    }).sort(function (a, b) { return b.best - a.best; });

    weakList.forEach(function (w) {
      if (picks.length >= limit) return;
      var list = scored.filter(function (x) { return x.c.charged.type === w.type && x.effC >= 1.5; }).sort(byScore);
      var n = 0;
      for (var i = 0; i < list.length && n < 2; i++) {
        if (used[list[i].c.en]) continue;
        used[list[i].c.en] = 1;
        picks.push(list[i]);
        n++;
      }
    });

    /* 2) 남는 자리는 배율 높은 순으로 채우기 */
    scored.filter(function (x) { return !used[x.c.en] && x.eff >= 1.5; }).sort(byScore).forEach(function (x) {
      if (picks.length >= limit || used[x.c.en]) return;
      used[x.c.en] = 1;
      picks.push(x);
    });

    /* 3) 약점 딜러가 모자라면 중립 최상위로 채우기 */
    if (picks.length < limit) {
      scored.filter(function (x) { return !used[x.c.en] && x.eff >= 0.99 && x.eff < 1.5; })
        .sort(function (a, b) { return (b.c.tier === 'S') - (a.c.tier === 'S') || b.score - a.score; })
        .forEach(function (x) {
          if (picks.length >= limit || used[x.c.en]) return;
          used[x.c.en] = 1;
          picks.push(x);
        });
    }

    return picks.slice(0, limit).sort(byScore);
  }

  function typeChipHTML(id) {
    return '<span class="type-chip" style="background:' + PGO.typeColor(id) + ';color:' + PGO.typeText(id) + '">' +
      PGO.typeKo(id) + '</span>';
  }

  function renderBossGrid() {
    var wrap = $('#boss-grid');
    if (!wrap) return;
    wrap.innerHTML = BOSSES.map(function (b) {
      return '<button class="boss-chip' + (b.status === 'ref' ? ' is-ref' : '') + '" type="button" data-boss="' + b.id + '">' +
        '<img src="' + SPRITE(b.dex) + '" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\';">' +
        '<span class="bc-fallback" style="display:none">' + (b.types[0] === 'psychic' ? '🔮' : b.types[0] === 'ice' ? '❄️' : '⚔️') + '</span>' +
        '<span class="bc-text"><span class="bc-name">' + b.kr + '</span><span class="bc-tier">' + b.tier + '</span></span>' +
      '</button>';
    }).join('');
  }

  function selectBoss(id, opts) {
    var boss = BOSSES.filter(function (b) { return b.id === id; })[0];
    if (!boss) return;
    activeBossId = id;
    if (!opts || !opts.silent) track('boss_select', { boss_id: id, boss_name: boss.kr });

    $$('.boss-chip').forEach(function (chip) {
      chip.classList.toggle('is-active', chip.getAttribute('data-boss') === id);
    });

    $('#boss-name').textContent = boss.kr;
    $('#boss-meta').textContent = boss.en + ' · ' + boss.tier + ' · ' + boss.avail;
    $('#boss-thumb').innerHTML = '<img src="' + SPRITE(boss.dex) + '" alt="' + boss.kr + '" onerror="this.parentNode.textContent=\'👾\';">';
    $('#boss-types').innerHTML = boss.types.map(typeChipHTML).join('');
    $('#boss-note').textContent = boss.note || '';

    var weak = PGO.weaknesses(boss.types);
    $('#boss-weak').innerHTML = weak.length
      ? weak.map(function (w) {
          return '<span class="weak-chip' + (w.mult > 2.5 ? ' is-double' : '') + '">' +
            '<span class="type-chip" style="background:' + w.color + ';color:' + PGO.typeText(w.type) + '">' + w.ko + '</span>' +
            '<b>×' + w.mult.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + '</b></span>';
        }).join('')
      : '<span class="fineprint">약점이 없습니다.</span>';

    var weakIds = weak.map(function (w) { return w.type; });
    var weathers = PGO.WEATHER.map(function (w) {
      var hit = w.types.filter(function (t) { return weakIds.indexOf(t) >= 0; });
      return hit.length ? { w: w, hit: hit } : null;
    }).filter(Boolean);
    $('#boss-weather').innerHTML = weathers.length
      ? weathers.map(function (x) {
          return '<span class="weather-chip">' + x.w.icon + ' ' + x.w.ko + ' <span style="opacity:.75">' +
            PGO.typeKoList(x.hit).join('·') + ' 딜 +20%</span></span>';
        }).join('')
      : '<span class="fineprint">약점 타입을 부스트하는 날씨가 없습니다.</span>';

    var picks = computeCounters(boss, 6);
    $('#boss-counters').innerHTML = picks.map(function (p, i) {
      var c = p.c;
      var effClass = p.eff > 1.001 ? '' : ' is-normal';
      return '<div class="counter-card">' +
        '<span class="counter-rank">' + (i + 1) + '</span>' +
        '<div class="counter-info">' +
          '<p class="counter-name">' + c.kr + ' <span style="font-weight:600;color:var(--muted);font-size:11px">' + c.tier + '</span></p>' +
          '<p class="counter-moves"><em>' + c.fast.kr + '</em> / <em>' + c.charged.kr + '</em>' +
            ' <span style="opacity:.65">(' + c.fast.en + ' · ' + c.charged.en + ')</span></p>' +
        '</div>' +
        '<span class="counter-eff' + effClass + '">×' + p.eff.toFixed(2) + '</span>' +
      '</div>';
    }).join('');

    var tipEl = $('#max-tip');
    if (boss.max) {
      tipEl.hidden = false;
      var tips = boss.types.map(function (t) { return MAX_TIPS[t]; }).filter(Boolean);
      tipEl.innerHTML = '⚡ <strong>다이맥스(맥스배틀) 안내</strong> — ' +
        (tips.length ? tips.join(' ') : '맥스무브는 다이맥스 포켓몬의 타입을 따라가요. 같은 타입 다이맥스를 3마리 준비하세요.') +
        '<br>아래 카운터는 일반 레이드 기준이니, 맥스배틀에서는 참고만 하세요.';
    } else {
      tipEl.hidden = true;
      tipEl.innerHTML = '';
    }
  }

  function initBossGrid() {
    var wrap = $('#boss-grid');
    if (!wrap) return;
    wrap.addEventListener('click', function (e) {
      var chip = e.target.closest('.boss-chip');
      if (!chip) return;
      selectBoss(chip.getAttribute('data-boss'));
    });
    renderBossGrid();

    // 첫 화면: 현재 진행 중인 보스 우선
    var first = BOSSES.filter(function (b) { return b.status === 'now'; })[0] || BOSSES[0];
    if (first) selectBoss(first.id, { silent: true });
  }

  /* ─────────────── 타입 상성 계산기 ─────────────── */
  function initTypeCalc() {
    var s1 = $('#def-type-1'), s2 = $('#def-type-2');
    if (!s1 || !s2) return;
    s1.innerHTML = PGO.TYPES.map(function (t) { return '<option value="' + t.id + '">' + t.ko + ' (' + t.en + ')</option>'; }).join('');
    s2.innerHTML = '<option value="">없음 (단일 타입)</option>' +
      PGO.TYPES.map(function (t) { return '<option value="' + t.id + '">' + t.ko + ' (' + t.en + ')</option>'; }).join('');
    s1.value = 'dragon';
    s2.value = 'flying';
    s1.addEventListener('change', renderTypeCalc);
    s2.addEventListener('change', renderTypeCalc);
    renderTypeCalc();
  }

  function renderTypeCalc() {
    var s1 = $('#def-type-1'), s2 = $('#def-type-2');
    var defs = [s1.value];
    if (s2.value && s2.value !== s1.value) defs.push(s2.value);

    var table = PGO.defenseTable(defs);
    var rows = table.map(function (r) {
      var cls = r.mult > 2.5 ? 'is-double' : r.mult > 1.001 ? 'is-super' : r.mult < 0.99 ? 'is-resist' : 'is-normal';
      return '<div class="result-row ' + cls + '">' +
        '<span class="type-chip" style="background:' + r.color + ';color:' + PGO.typeText(r.type) + '">' + r.ko + '</span>' +
        '<span class="rname">' + r.en + '</span>' +
        '<span class="rlabel">' + PGO.multLabel(r.mult) + '</span>' +
        '<span class="rmult">×' + r.mult.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + '</span>' +
      '</div>';
    }).join('');

    var weak = table.filter(function (r) { return r.mult > 1.001; });
    var resist = table.filter(function (r) { return r.mult < 0.99; });
    var summary = '방어 타입 <strong>' + PGO.typeKoList(defs).join(' · ') + '</strong> — 약점 ' + weak.length + '개' +
      (weak.length ? ' (최고 ' + weak[0].ko + ' ×' + weak[0].mult.toFixed(2) + ')' : '') +
      ', 반감 ' + resist.length + '개.';

    $('#type-result').innerHTML = '<p class="result-summary">' + summary + '</p>' + rows;
  }

  /* ─────────────── 육성 계산기 ─────────────── */
  var BANDS = [
    { until: 3, dust: 200, candy: 1 },
    { until: 5, dust: 400, candy: 1 },
    { until: 7, dust: 600, candy: 1 },
    { until: 9, dust: 800, candy: 1 },
    { until: 11, dust: 1000, candy: 1 },
    { until: 13, dust: 1300, candy: 2 },
    { until: 15, dust: 1600, candy: 2 },
    { until: 17, dust: 1900, candy: 2 },
    { until: 19, dust: 2200, candy: 2 },
    { until: 21, dust: 2500, candy: 2 },
    { until: 23, dust: 3000, candy: 3 },
    { until: 25, dust: 3500, candy: 3 },
    { until: 26, dust: 4000, candy: 3 },
    { until: 27, dust: 4000, candy: 4 },
    { until: 29, dust: 4500, candy: 4 },
    { until: 31, dust: 5000, candy: 4 },
    { until: 33, dust: 6000, candy: 6 },
    { until: 35, dust: 7000, candy: 8 },
    { until: 37, dust: 8000, candy: 10 },
    { until: 39, dust: 9000, candy: 12 },
    { until: 40, dust: 10000, candy: 15 }
  ];

  /* 40 → 50 : 반 레벨 단위 모래 / XL사탕 */
  var XL_DUST = [10000, 10000, 11000, 11000, 11000, 11000, 12000, 12000, 12000, 12000,
                 13000, 13000, 13000, 13000, 14000, 14000, 14000, 14000, 15000, 15000];
  var XL_CANDY = [10, 10, 10, 10, 12, 12, 12, 12, 15, 15,
                  15, 15, 17, 17, 17, 17, 20, 20, 20, 20];

  var KIND_MULT = {
    normal: { dust: 1, candy: 1 },
    shadow: { dust: 1.2, candy: 1.2 },
    purified: { dust: 0.9, candy: 0.9 },
    lucky: { dust: 0.5, candy: 1 }
  };

  function costAt(level) {
    if (level >= 40) {
      var idx = Math.round((level - 40) * 2);
      if (idx >= XL_DUST.length) idx = XL_DUST.length - 1;
      return { dust: XL_DUST[idx], candy: 0, xl: XL_CANDY[idx] };
    }
    for (var i = 0; i < BANDS.length; i++) {
      if (level < BANDS[i].until) return { dust: BANDS[i].dust, candy: BANDS[i].candy, xl: 0 };
    }
    return { dust: 10000, candy: 15, xl: 0 };
  }

  /* from → to 비용 (강화 1회 = 0.5레벨) */
  function powerUpCost(from, to) {
    if (!(to > from)) return { raw: { dust: 0, candy: 0, xl: 0 }, dust: 0, candy: 0, xl: 0, steps: 0, rows: [] };
    var steps = Math.round((to - from) * 2);
    var raw = { dust: 0, candy: 0, xl: 0 };
    var rows = [];
    for (var i = 0; i < steps; i++) {
      var lv = from + i * 0.5;
      var c = costAt(lv);
      raw.dust += c.dust; raw.candy += c.candy; raw.xl += c.xl;
      var last = rows[rows.length - 1];
      if (last && last.dust === c.dust && last.candy === c.candy && last.xl === c.xl) {
        last.to = lv + 0.5;
      } else {
        rows.push({ from: lv, to: lv + 0.5, dust: c.dust, candy: c.candy, xl: c.xl, steps: 1 });
      }
    }
    return { raw: raw, steps: steps, rows: rows };
  }

  var kind = 'normal';

  function levelLabel(v) {
    var n = Number(v);
    return 'Lv.' + (Number.isInteger(n) ? n : n.toFixed(1));
  }

  function initPowerUp() {
    var fromSel = $('#from-level'), toSel = $('#to-level');
    if (!fromSel || !toSel) return;
    var opts = [];
    for (var l = 1; l <= 50; l += 0.5) {
      opts.push('<option value="' + l + '">' + levelLabel(l) + '</option>');
    }
    fromSel.innerHTML = opts.join('');
    toSel.innerHTML = opts.join('');
    fromSel.value = '20';
    toSel.value = '40';
    fromSel.addEventListener('change', updatePowerUp);
    toSel.addEventListener('change', updatePowerUp);

    var segs = $$('.seg');
    segs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        segs.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        kind = btn.getAttribute('data-kind');
        updatePowerUp();
      });
    });

    var presets = $('#preset-row');
    if (presets) {
      presets.addEventListener('click', function (e) {
        var b = e.target.closest('.preset');
        if (!b) return;
        fromSel.value = b.getAttribute('data-from');
        toSel.value = b.getAttribute('data-to');
        updatePowerUp();
      });
    }
    updatePowerUp();
  }

  function updatePowerUp() {
    var fromEl = $('#from-level'), toEl = $('#to-level');
    if (!fromEl || !toEl) return;
    var from = Number(fromEl.value), to = Number(toEl.value);
    var res = powerUpCost(Math.min(from, to), Math.max(from, to));
    var m = KIND_MULT[kind] || KIND_MULT.normal;
    var raw = res.raw;

    var dust = Math.round(raw.dust * m.dust);
    var candy = Math.round(raw.candy * m.candy);
    var xl = Math.round(raw.xl * m.candy);

    $('#cost-dust').textContent = num(dust);
    $('#cost-candy').textContent = num(candy);
    $('#cost-xl').textContent = num(xl);
    $('#cost-xl').classList.toggle('is-zero', xl === 0);

    var kindLabel = { normal: '일반', shadow: '그림자', purified: '정화', lucky: '럭키' }[kind];
    var line;
    if (from === to) {
      line = '현재 레벨과 목표 레벨이 같아요. 목표를 더 높게 잡아 주세요.';
    } else if (from > to) {
      line = '목표 레벨이 현재보다 낮아 계산할 수 없어요.';
    } else {
      line = '<b>' + levelLabel(from) + ' → ' + levelLabel(to) + '</b> · ' + kindLabel + ' · 강화 ' + res.steps + '회' +
        (raw.xl > 0 ? ' · 40레벨 이후 구간에 XL사탕이 포함됩니다' : '');
    }
    $('#powerup-summary').innerHTML = line;

    var rows = res.rows.map(function (r) {
      return '<tr><td>' + levelLabel(r.from) + ' → ' + levelLabel(r.to) + '</td>' +
        '<td>' + num(Math.round(r.dust * m.dust)) + '</td>' +
        '<td>' + num(Math.round(r.candy * m.candy)) + '</td>' +
        '<td>' + num(Math.round(r.xl * m.candy)) + '</td></tr>';
    }).join('');
    $('#powerup-breakdown').innerHTML =
      '<table><thead><tr><th>구간</th><th>모래</th><th>사탕</th><th>XL</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  /* ─────────────── 도감 탭 ─────────────── */
  var ART_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';

  function dexArt(id, shiny) { return ART_BASE + (shiny ? 'shiny/' : '') + id + '.png'; }
  function dexNo(id) { return '#' + (id < 1000 ? ('00' + id).slice(-3) : String(id)); }

  var CPM40 = 0.7903001, CPM50 = 0.84029999;

  /* 최대 CP (15/15/15) */
  function maxCP(p, cpm) {
    return Math.floor((p.a + 15) * Math.sqrt(p.d + 15) * Math.sqrt(p.s + 15) * cpm * cpm / 10);
  }

  /* 한글 초성 추출 — 초성 검색(ㄹㅈㅁ)용 */
  var CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  function chosung(str) {
    var out = '';
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      if (code >= 0xAC00 && code <= 0xD7A3) out += CHO[Math.floor((code - 0xAC00) / 588)];
      else out += str.charAt(i);
    }
    return out;
  }

  var dexState = { q: '', type: 'all', shinyOnly: false, shown: 0, list: [], ready: false };
  var DEX_CHUNK = 60;

  function dexPrep() {
    if (dexState.ready) return;
    DEX.forEach(function (p) {
      p._k = chosung(p.n);
      p._e = String(p.e || '').toLowerCase();
    });
    dexState.ready = true;
  }

  function dexMatch(p, raw) {
    var q = String(raw || '').trim().toLowerCase().replace(/\s+/g, '');
    if (!q) return true;
    var numq = q.replace(/^#/, '');
    if (/^\d+$/.test(numq)) {
      numq = numq.replace(/^0+(?=\d)/, '');
      return String(p.id).indexOf(numq) === 0;
    }
    if (p.n.indexOf(q) >= 0 || p._e.indexOf(q) >= 0) return true;
    /* 초성만 입력한 경우(ㄹㅈㅁ)는 이름 앞에서부터 맞춰 본다 */
    return /^[ㄱ-ㅎ]+$/.test(q) && p._k.indexOf(q) === 0;
  }

  function dexFiltered() {
    var q = dexState.q;
    return DEX.filter(function (p) {
      if (dexState.type !== 'all' && p.t.indexOf(dexState.type) < 0) return false;
      if (dexState.shinyOnly && !p.sh) return false;
      return dexMatch(p, q);
    });
  }

  function dexTypeChip(t) {
    return '<span class="type-chip" style="background:' + PGO.typeColor(t) + ';color:' + PGO.typeText(t) + '">' +
      PGO.typeKo(t) + '</span>';
  }

  function dexCardHTML(p) {
    var shiny = dexState.shinyOnly;
    return '<button class="dex-card" type="button" data-dex="' + p.id + '" aria-label="' + p.n + ' 도감 상세">' +
      '<span class="dex-no">' + dexNo(p.id) + '</span>' +
      (p.sh ? '<span class="dex-shiny" title="이로치 출시">✨</span>' : '') +
      '<span class="dex-thumb"><img src="' + dexArt(p.id, shiny) + '" alt="" loading="lazy" width="72" height="72" ' +
        'onerror="this.onerror=null;this.src=\'' + dexArt(p.id, false) + '\';"></span>' +
      '<span class="dex-name">' + p.n + '</span>' +
      '<span class="dex-types">' + p.t.map(dexTypeChip).join('') + '</span>' +
      '<span class="dex-cp">최대 CP ' + num(maxCP(p, CPM50)) + '</span>' +
    '</button>';
  }

  function renderDex() {
    if (!DEX.length) return;
    dexPrep();
    dexState.list = dexFiltered();
    if (!dexState.shown) dexState.shown = DEX_CHUNK;
    var total = dexState.list.length;
    var slice = dexState.list.slice(0, dexState.shown);

    $('#dex-grid').innerHTML = slice.map(dexCardHTML).join('');
    $('#dex-empty').hidden = total > 0;
    $('#dex-count').innerHTML = total
      ? '<b>' + total.toLocaleString('ko-KR') + '</b>마리' +
        (total > slice.length ? ' · ' + slice.length + '마리 보기' : '')
      : '검색 결과 없음';
    $('#dex-more').hidden = total <= slice.length;
    $('#dex-clear').hidden = !dexState.q;
  }

  /* ── 도감 상세 시트 ── */
  var dexSheet = { list: [], idx: 0, shiny: false };

  function moveChips(ids, cls) {
    if (!ids || !ids.length) return '';
    return ids.map(function (i) {
      return '<span class="move-chip ' + cls + '">' + (DEX_MOVES[i] || '?') + '</span>';
    }).join('');
  }

  function eliteChips(ids, cls) {
    if (!ids || !ids.length) return '';
    return ids.map(function (i) {
      return '<span class="move-chip ' + cls + '"><span class="elite">ⓔ</span>' + (DEX_MOVES[i] || '?') + '</span>';
    }).join('');
  }

  function statRow(label, value, color) {
    var pct = Math.max(4, Math.min(100, value / 300 * 100));
    return '<div class="stat-row"><span class="s-label">' + label + '</span>' +
      '<span class="stat-bar"><span style="width:' + pct.toFixed(1) + '%;background:' + color + '"></span></span>' +
      '<span class="s-val">' + value + '</span></div>';
  }

  /* 배율 표기: 0.625 · 0.391 · 1.6 · 2.56 처럼 실제 배율값 그대로 */
  function multText(m) { return String(Math.round(m * 1000) / 1000); }

  function renderDexSheet() {
    var p = dexSheet.list[dexSheet.idx];
    if (!p) return;
    $('#dex-sheet-no').textContent = dexNo(p.id);
    $('#dex-sheet-name').textContent = p.n;
    $('#dex-sheet-en').textContent = p.e;

    var weak = PGO.weaknesses(p.t);
    var resist = PGO.defenseTable(p.t).filter(function (r) { return r.mult < 0.99; });

    var weakHTML = weak.length ? weak.map(function (w) {
      return '<span class="weak-chip' + (w.mult > 2.5 ? ' is-double' : '') + '">' +
        '<span class="type-chip" style="background:' + w.color + ';color:' + PGO.typeText(w.type) + '">' + w.ko + '</span>' +
        '<b>×' + multText(w.mult) + '</b></span>';
    }).join('') : '<p class="dex-none">약점이 없어요.</p>';

    var resistHTML = resist.length ? resist.map(function (w) {
      return '<span class="weak-chip">' +
        '<span class="type-chip" style="background:' + w.color + ';color:' + PGO.typeText(w.type) + '">' + w.ko + '</span>' +
        '<b>×' + multText(w.mult) + '</b></span>';
    }).join('') : '<p class="dex-none">반감 타입이 없어요.</p>';

    $('#dex-sheet-body').innerHTML =
      '<div class="dex-hero">' +
        '<div class="dex-art">' +
          '<div class="dex-art-box"><img id="dex-art-img" src="' + dexArt(p.id, dexSheet.shiny) + '" alt="' + p.n + '"></div>' +
          '<button class="dex-shiny-btn" id="dex-shiny-toggle" type="button" aria-pressed="' + (dexSheet.shiny ? 'true' : 'false') + '">' +
            (dexSheet.shiny ? '✨ 이로치 보는 중' : '✨ 이로치 보기') + '</button>' +
        '</div>' +
        '<div class="dex-facts">' +
          '<div class="type-row">' + p.t.map(dexTypeChip).join('') + '</div>' +
          '<div class="stat-bars">' +
            statRow('공격', p.a, '#EF4444') + statRow('방어', p.d, '#2563EB') + statRow('체력', p.s, '#10B981') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="dex-cp-row">' +
        '<div class="cp-card"><span class="cp-label">최대 CP · Lv.40</span><strong>' + num(maxCP(p, CPM40)) + '</strong></div>' +
        '<div class="cp-card is-max"><span class="cp-label">최대 CP · Lv.50 (XL사탕)</span><strong>' + num(maxCP(p, CPM50)) + '</strong></div>' +
      '</div>' +
      '<div class="dex-mini">' +
        '<div class="dex-mini-item"><span>파트너 사탕 거리</span><strong>' + (p.bd ? p.bd + ' km' : '-') + '</strong></div>' +
        '<div class="dex-mini-item"><span>진화 사탕</span><strong>' + (p.ev ? p.ev + '개' : '진화 없음') + '</strong></div>' +
        '<div class="dex-mini-item"><span>이로치</span><strong>' + (p.sh ? '출시 ✨' : '정보 없음') + '</strong></div>' +
      '</div>' +
      '<h4 class="dex-h">노말 기술</h4>' +
      '<div class="dex-moves">' + (moveChips(p.f, 'is-fast') || '<p class="dex-none">정보 없음</p>') +
        eliteChips(p.ef, 'is-fast') + '</div>' +
      '<h4 class="dex-h">스페셜 기술 <span class="dex-h-sub">ⓔ = 엘리트 기술</span></h4>' +
      '<div class="dex-moves">' + (moveChips(p.c, 'is-charged') || '<p class="dex-none">정보 없음</p>') +
        eliteChips(p.ec, 'is-charged') + '</div>' +
      '<h4 class="dex-h">약점 <span class="dex-h-sub">받는 데미지 배율</span></h4>' +
      '<div class="weak-row">' + weakHTML + '</div>' +
      '<h4 class="dex-h">반감 · 무효</h4>' +
      '<div class="weak-row">' + resistHTML + '</div>';

    var img = $('#dex-art-img');
    if (img) img.addEventListener('error', function () {
      if (dexSheet.shiny) {
        dexSheet.shiny = false;
        img.src = dexArt(p.id, false);
        var btn = $('#dex-shiny-toggle');
        if (btn) { btn.setAttribute('aria-pressed', 'false'); btn.textContent = '이로치 이미지 없음'; }
      }
    });
  }

  function openDex(id) {
    dexPrep();
    var list = dexState.list.length ? dexState.list : DEX;
    var idx = -1;
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) { idx = i; break; } }
    if (idx < 0) {
      list = DEX;
      for (var j = 0; j < list.length; j++) { if (list[j].id === id) { idx = j; break; } }
    }
    if (idx < 0) return;
    dexSheet.list = list;
    dexSheet.idx = idx;
    dexSheet.shiny = false;
    track('pokedex_view', { pokemon_no: id, pokemon_name: list[idx].n });
    renderDexSheet();
    $('#dex-backdrop').hidden = false;
    document.body.style.overflow = 'hidden';
    var body = $('#dex-sheet-body');
    $('#dex-close').focus();
  }

  function closeDex() {
    $('#dex-backdrop').hidden = true;
    document.body.style.overflow = '';
  }

  function stepDex(dir) {
    var n = dexSheet.list.length;
    if (!n) return;
    dexSheet.idx = (dexSheet.idx + dir + n) % n;
    dexSheet.shiny = false;
    renderDexSheet();
    $('#dex-sheet-body').scrollTop = 0;
  }

  function initDex() {
    if (!DEX.length) return;
    dexPrep();

    var row = $('#dex-type-row');
    if (row) {
      row.innerHTML = '<button class="chip dex-type-chip is-active" type="button" data-dex-type="all">전체 타입</button>' +
        PGO.TYPES.map(function (t) {
          return '<button class="chip dex-type-chip" type="button" data-dex-type="' + t.id + '">' + t.ko + '</button>';
        }).join('');
      row.addEventListener('click', function (e) {
        var chip = e.target.closest('.dex-type-chip');
        if (!chip) return;
        var type = chip.getAttribute('data-dex-type');
        $$('.dex-type-chip', row).forEach(function (c) {
          c.classList.remove('is-active');
          c.style.background = ''; c.style.color = ''; c.style.borderColor = '';
        });
        chip.classList.add('is-active');
        if (type !== 'all') {
          chip.style.background = PGO.typeColor(type);
          chip.style.borderColor = PGO.typeColor(type);
          chip.style.color = PGO.typeText(type);
        }
        dexState.type = type;
        dexState.shown = DEX_CHUNK;
        renderDex();
        track('dex_filter', { filter_type: 'type', filter_value: type, result_count: dexState.list.length });
      });
    }

    var q = $('#dex-q');
    var searchTimer = null;
    if (q) {
      q.addEventListener('input', function () {
        dexState.q = q.value;
        dexState.shown = DEX_CHUNK;
        renderDex();
        /* 타이핑 중에는 보내지 않고, 손을 뗀 뒤 0.9초에 한 번만 */
        clearTimeout(searchTimer);
        var term = q.value.trim();
        if (!term) return;
        searchTimer = setTimeout(function () {
          track('pokedex_search', { search_term: term, result_count: dexState.list.length });
        }, 900);
      });
    }

    var clear = $('#dex-clear');
    if (clear) clear.addEventListener('click', function () {
      if (q) { q.value = ''; q.focus(); }
      dexState.q = '';
      dexState.shown = DEX_CHUNK;
      renderDex();
    });

    var shinyBtn = $('#dex-shiny-only');
    if (shinyBtn) shinyBtn.addEventListener('click', function () {
      dexState.shinyOnly = !dexState.shinyOnly;
      shinyBtn.setAttribute('aria-pressed', dexState.shinyOnly ? 'true' : 'false');
      dexState.shown = DEX_CHUNK;
      renderDex();
      track('dex_filter', { filter_type: 'shiny', filter_value: dexState.shinyOnly ? 'only' : 'all' });
    });

    var more = $('#dex-more');
    if (more) more.addEventListener('click', function () {
      dexState.shown += DEX_CHUNK * 2;
      renderDex();
    });

    var grid = $('#dex-grid');
    if (grid) grid.addEventListener('click', function (e) {
      var card = e.target.closest('.dex-card');
      if (card) openDex(Number(card.getAttribute('data-dex')));
    });

    $('#dex-close').addEventListener('click', closeDex);
    $('#dex-prev').addEventListener('click', function () { stepDex(-1); });
    $('#dex-next').addEventListener('click', function () { stepDex(1); });
    $('#dex-backdrop').addEventListener('click', function (e) {
      if (e.target === $('#dex-backdrop')) closeDex();
    });
    $('#dex-sheet-body').addEventListener('click', function (e) {
      if (e.target.closest('#dex-shiny-toggle')) {
        dexSheet.shiny = !dexSheet.shiny;
        var p = dexSheet.list[dexSheet.idx];
        var btn = $('#dex-shiny-toggle');
        var image = $('#dex-art-img');
        if (!p || !btn || !image) return;
        btn.setAttribute('aria-pressed', dexSheet.shiny ? 'true' : 'false');
        btn.textContent = dexSheet.shiny ? '✨ 이로치 보는 중' : '✨ 이로치 보기';
        image.src = dexArt(p.id, dexSheet.shiny);
      }
    });
    document.addEventListener('keydown', function (e) {
      if ($('#dex-backdrop').hidden) return;
      if (e.key === 'Escape') closeDex();
      else if (e.key === 'ArrowRight') stepDex(1);
      else if (e.key === 'ArrowLeft') stepDex(-1);
    });

    renderDex();
  }

  /* ─────────────── 가이드 탭 (멀티 글) ───────────────
     #guide            → 글 목록
     #guide/<slug>     → 개별 글 (뒤로가기·공유 가능)
     ?guide=<slug>     → 첫 진입 시 #guide/<slug> 로 바꿔 준다 */
  var guideState = { slug: null };
  var BASE_TITLE = document.title;

  function guideBySlug(slug) {
    for (var i = 0; i < GUIDES.length; i++) if (GUIDES[i].slug === slug) return GUIDES[i];
    return null;
  }

  function guidePad(n) { return (n < 10 ? '0' : '') + n; }

  function guideCardHTML(g) {
    return '<button class="guide-card" type="button" data-guide-slug="' + g.slug + '" aria-label="' + g.title + ' 읽기">' +
      '<span class="guide-card-top">' +
        '<span class="guide-num">' + guidePad(g.no) + '</span>' +
        '<span class="guide-card-emoji" aria-hidden="true">' + g.emoji + '</span>' +
        '<span class="guide-read">' + g.readMin + '분</span>' +
      '</span>' +
      '<span class="guide-card-title">' + g.title + '</span>' +
      '<span class="guide-card-kicker">' + g.kicker + '</span>' +
      '<span class="guide-card-summary">' + g.summary + '</span>' +
      '<span class="guide-card-foot">' +
        '<span class="guide-tags">' + g.tags.map(function (t) { return '<span class="guide-tag">#' + t + '</span>'; }).join('') + '</span>' +
        '<span class="guide-go">읽기 <span aria-hidden="true">→</span></span>' +
      '</span>' +
    '</button>';
  }

  function renderGuideList() {
    var el = $('#guide-list');
    if (!el) return;
    el.innerHTML = GUIDES.map(guideCardHTML).join('');
  }

  function guideTocHTML(g) {
    return '<nav class="guide-toc" aria-label="이 글의 목차">' +
      '<span class="guide-toc-title">목차</span><ol>' +
      g.sections.map(function (s) {
        return '<li><button type="button" class="guide-toc-link" data-guide-jump="' + s.id + '">' + s.h + '</button></li>';
      }).join('') +
      '</ol></nav>';
  }

  function guideToolsHTML(g) {
    if (!g.tools || !g.tools.length) return '';
    return '<section class="guide-tools" aria-labelledby="guide-tools-' + g.slug + '">' +
      '<h2 id="guide-tools-' + g.slug + '">이 글과 함께 쓰는 도구</h2>' +
      '<div class="guide-tool-grid">' +
      g.tools.map(function (t) {
        return '<button class="guide-tool" type="button" data-goto="' + t.tab + '"' +
          (t.q ? ' data-dex-q="' + t.q + '"' : '') +
          (t.boss ? ' data-boss="' + t.boss + '"' : '') +
          (t.from ? ' data-from="' + t.from + '"' : '') +
          (t.to ? ' data-to="' + t.to + '"' : '') +
          (t.kind ? ' data-kind="' + t.kind + '"' : '') + '>' +
          '<span class="guide-tool-label">' + t.label + '</span>' +
          '<span class="guide-tool-desc">' + t.desc + '</span>' +
          '<span class="guide-tool-go">바로 가기 <span aria-hidden="true">→</span></span>' +
        '</button>';
      }).join('') +
      '</div></section>';
  }

  function guidePagerHTML(g) {
    var idx = GUIDES.indexOf(g);
    if (idx < 0 || GUIDES.length < 2) return '';
    var prev = GUIDES[(idx - 1 + GUIDES.length) % GUIDES.length];
    var next = GUIDES[(idx + 1) % GUIDES.length];
    return '<nav class="guide-pager" aria-label="다른 가이드">' +
      '<button class="guide-pager-btn is-prev" type="button" data-guide-slug="' + prev.slug + '">' +
        '<span class="gp-dir">← 이전 글</span><span class="gp-title">' + prev.title + '</span></button>' +
      '<button class="guide-pager-btn is-next" type="button" data-guide-slug="' + next.slug + '">' +
        '<span class="gp-dir">다음 글 →</span><span class="gp-title">' + next.title + '</span></button>' +
    '</nav>';
  }

  function guideArticleHTML(g) {
    var secs = g.sections.map(function (s, i) {
      var html = '<section class="guide-sec" id="guide-' + g.slug + '-' + s.id + '">' +
        '<h2>' + s.h + '</h2>' + s.html + '</section>';
      /* 중간 배너는 세 번째 섹션 뒤에 끼워 넣는다 */
      if (i === 2) html += '<div class="guide-slot" data-slot="guide-mid"></div>';
      return html;
    }).join('');

    return '<header class="guide-head">' +
        '<button class="guide-back" type="button" data-guide-back>← 가이드 목록</button>' +
        '<p class="guide-eyebrow">GUIDE ' + guidePad(g.no) + ' · ' + g.tags.join(' · ') + '</p>' +
        '<h1 class="guide-title" tabindex="-1">' + g.title + '</h1>' +
        '<p class="guide-kicker">' + g.kicker + '</p>' +
        '<p class="guide-summary">' + g.summary + '</p>' +
        '<div class="guide-meta">' +
          '<span>🕒 약 ' + g.readMin + '분</span>' +
          '<span>최종 확인 ' + g.updated + '</span>' +
          '<button class="guide-share" type="button" data-guide-share>🔗 링크 복사</button>' +
        '</div>' +
      '</header>' +
      guideTocHTML(g) +
      '<div class="guide-body">' + secs + '</div>' +
      '<div class="guide-slot" data-slot="guide-bottom"></div>' +
      guideToolsHTML(g) +
      '<p class="fineprint guide-fineprint">' +
        '기준일 ' + g.updated + ' · 수치는 게임 내 표기와 진행 중인 이벤트에 따라 달라질 수 있어. ' +
        '업데이트로 내용이 바뀌면 게임 화면이 우선이야.' +
      '</p>' +
      guidePagerHTML(g);
  }

  /* 제휴 배너 노드는 항상 4개만 두고, 화면에 따라 자리만 옮긴다(중복 생성 금지) */
  function placeGuidePromos(where) {
    var mid = document.getElementById('promo-guide-mid');
    var bottom = document.getElementById('promo-guide-bottom');
    if (!mid || !bottom) return;
    if (where === 'article') {
      var slotMid = $('#guide-article .guide-slot[data-slot="guide-mid"]');
      var slotBottom = $('#guide-article .guide-slot[data-slot="guide-bottom"]');
      if (slotMid) slotMid.appendChild(mid);
      if (slotBottom) slotBottom.appendChild(bottom);
    } else {
      var homeMid = document.getElementById('guide-mid-home');
      var homeBottom = document.getElementById('guide-bottom-home');
      if (homeMid) homeMid.appendChild(mid);
      if (homeBottom) homeBottom.appendChild(bottom);
    }
  }

  function showGuideIndex(opts) {
    var idxEl = $('#guide-index'), artEl = $('#guide-article');
    if (!idxEl || !artEl) return;
    guideState.slug = null;
    /* 배너 노드를 먼저 꺼내야 innerHTML 초기화에 함께 지워지지 않는다 */
    placeGuidePromos('index');
    artEl.hidden = true;
    artEl.innerHTML = '';
    idxEl.hidden = false;
    document.title = BASE_TITLE;
    if (!opts || opts.nav !== 'none') {
      if (history.replaceState) history.replaceState(null, '', '#guide');
    }
  }

  function openGuide(slug, opts) {
    var g = guideBySlug(slug);
    if (!g) { showGuideIndex(opts); return; }
    var idxEl = $('#guide-index'), artEl = $('#guide-article');
    if (!idxEl || !artEl) return;
    guideState.slug = g.slug;
    idxEl.hidden = true;
    placeGuidePromos('index');
    artEl.hidden = false;
    artEl.innerHTML = guideArticleHTML(g);
    placeGuidePromos('article');
    document.title = g.title + ' | 오박사의 포켓몬고 허브';

    var nav = (opts && opts.nav) || 'push';
    if (nav === 'push' && history.pushState) history.pushState(null, '', '#guide/' + g.slug);
    else if (nav === 'replace' && history.replaceState) history.replaceState(null, '', '#guide/' + g.slug);

    track('guide_view', { guide_slug: g.slug, guide_title: g.title, guide_no: g.no });

    window.scrollTo(0, 0);
    var title = artEl.querySelector('.guide-title');
    if (title && title.focus) title.focus({ preventScroll: true });
  }

  function copyGuideLink() {
    var url = location.href;
    track('guide_share', { guide_slug: guideState.slug || '' });
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () { toast('이 글 링크를 복사했어요'); })
        .catch(function () { toast('주소창의 링크를 복사해 주세요'); });
    } else {
      toast('주소창의 링크를 복사해 주세요');
    }
  }

  function jumpGuideSection(id) {
    var g = guideBySlug(guideState.slug);
    if (!g) return;
    var el = document.getElementById('guide-' + g.slug + '-' + id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    track('guide_toc_click', { guide_slug: g.slug, section: id });
  }

  /* 가이드 글 안의 버튼으로 다른 탭을 바로 열기 */
  function goFromGuide(btn) {
    var tab = btn.getAttribute('data-goto');
    if (TABS.indexOf(tab) < 0) return;
    track('guide_tool_click', { guide_slug: guideState.slug || '', target_tab: tab });

    if (tab === 'pokedex') {
      var q = btn.getAttribute('data-dex-q') || '';
      var input = $('#dex-q');
      dexState.q = q;
      dexState.type = 'all';
      dexState.shinyOnly = false;
      dexState.shown = DEX_CHUNK;
      if (input) input.value = q;
      var shinyBtn = $('#dex-shiny-only');
      if (shinyBtn) shinyBtn.setAttribute('aria-pressed', 'false');
      $$('.dex-type-chip').forEach(function (c) {
        c.classList.toggle('is-active', c.getAttribute('data-dex-type') === 'all');
        c.style.background = ''; c.style.color = ''; c.style.borderColor = '';
      });
      switchTab('pokedex');
    } else if (tab === 'raids') {
      switchTab('raids');
      var boss = btn.getAttribute('data-boss');
      if (boss) selectBoss(boss);
    } else if (tab === 'powerup') {
      var f = btn.getAttribute('data-from');
      var t = btn.getAttribute('data-to');
      var k = btn.getAttribute('data-kind');
      if (f) $('#from-level').value = f;
      if (t) $('#to-level').value = t;
      if (k) {
        kind = k;
        $$('.seg').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-kind') === k); });
      }
      switchTab('powerup');
    }
    window.scrollTo(0, 0);
  }

  function initGuides() {
    if (!GUIDES.length) return;
    renderGuideList();
    var root = $('#tab-guide');
    if (!root) return;
    root.addEventListener('click', function (e) {
      var back = e.target.closest('[data-guide-back]');
      if (back) { showGuideIndex(); return; }
      var share = e.target.closest('[data-guide-share]');
      if (share) { copyGuideLink(); return; }
      var jump = e.target.closest('[data-guide-jump]');
      if (jump) { jumpGuideSection(jump.getAttribute('data-guide-jump')); return; }
      var tool = e.target.closest('[data-goto]');
      if (tool) { goFromGuide(tool); return; }
      var card = e.target.closest('[data-guide-slug]');
      if (card) { openGuide(card.getAttribute('data-guide-slug')); return; }
    });
  }

  /* 주소(#guide/<slug>)로 들어온 경우 그 글을 연다 */
  function routeFromLocation() {
    var hash = (location.hash || '').replace(/^#/, '');
    if (hash.indexOf('guide/') === 0) {
      var slug = hash.slice(6).split('/')[0];
      if (guideBySlug(slug)) { switchTab('guide', { silent: true, guide: slug }); return true; }
    }
    if (hash === 'guide') { switchTab('guide', { silent: true }); return true; }
    if (TABS.indexOf(hash) >= 0) { switchTab(hash, { silent: true }); return true; }
    return false;
  }

  /* ─────────────── 모달 ─────────────── */
  var MODALS = {
    privacy: {
      title: '개인정보처리방침',
      body:
        '<p>본 사이트(「오박사의 포켓몬고 허브」)는 이용자의 개인정보를 소중히 생각하며, 관련 법령을 준수합니다.</p>' +
        '<h3>1. 수집하는 정보</h3>' +
        '<ul>' +
        '<li>회원가입·로그인이 없는 사이트로, 이름·전화번호·주소 같은 개인정보를 직접 수집하지 않습니다.</li>' +
        '<li>다만 접속 과정에서 IP 주소, 브라우저 종류, 방문 일시, 방문 페이지 등이 자동으로 기록될 수 있습니다.</li>' +
        '<li>광고·통계 서비스(Google AdSense, Google Analytics 등)가 쿠키와 광고 식별자를 사용할 수 있습니다.</li>' +
        '</ul>' +
        '<h3>2. 이용 목적</h3>' +
        '<ul><li>서비스 이용 통계 분석과 화면 개선</li><li>맞춤형 광고 게재 및 광고 성과 측정</li></ul>' +
        '<h3>3. 쿠키 및 제3자 광고</h3>' +
        '<ul>' +
        '<li>Google을 비롯한 제3자 광고 사업자는 쿠키를 사용해 이용자의 이전 방문 기록에 기반한 광고를 게재할 수 있습니다.</li>' +
        '<li>Google의 광고 쿠키 사용으로 이용자는 Google 광고 설정(adssettings.google.com)에서 맞춤 광고를 해제할 수 있습니다.</li>' +
        '<li>브라우저 설정에서 쿠키 저장을 거부할 수 있으며, 이 경우 일부 기능 이용에 제한이 있을 수 있습니다.</li>' +
        '</ul>' +
        '<h3>4. 보관 및 파기</h3>' +
        '<p>자동 수집 정보는 목적 달성 후 지체 없이 파기하며, 법령에서 정한 기간 동안만 보관합니다.</p>' +
        '<h3>5. 이용자의 권리</h3>' +
        '<p>이용자는 언제든지 자신의 정보 처리에 관한 열람·정정·삭제를 요청할 수 있습니다.</p>' +
        '<h3>6. 문의</h3>' +
        '<p>개인정보 관련 문의는 하단 <strong>문의</strong> 메뉴를 통해 접수해 주세요.</p>' +
        '<p style="color:var(--muted)">시행일: 2026년 11월 25일</p>'
    },
    terms: {
      title: '이용약관',
      body:
        '<h3>1. 목적</h3><p>본 약관은 「오박사의 포켓몬고 허브」(이하 "사이트")가 제공하는 정보·계산 도구의 이용 조건을 정합니다.</p>' +
        '<h3>2. 서비스 내용</h3>' +
        '<ul><li>포켓몬고 이벤트 일정 및 카운트다운</li><li>레이드 보스 약점·추천 카운터 정보</li><li>타입 상성 계산기, 육성 비용 계산기</li><li>관련 가이드 콘텐츠</li></ul>' +
        '<h3>3. 정보의 정확성</h3>' +
        '<p>사이트의 일정·배율·비용 정보는 공개된 자료를 정리한 참고용 정보입니다. 게임 업데이트로 내용이 달라질 수 있으며, 최종 수치는 게임 내 표시가 우선합니다. 사이트는 정보의 완전성·최신성을 보증하지 않습니다.</p>' +
        '<h3>4. 지적재산권</h3>' +
        '<p>Pokémon 및 Pokémon GO와 관련된 명칭·이미지·상표의 권리는 Nintendo, Creatures Inc., GAME FREAK inc., Niantic, Inc.에 있습니다. 본 사이트는 비공식 팬 사이트로, 이들과 제휴하거나 후원받지 않습니다.</p>' +
        '<h3>5. 책임의 제한</h3>' +
        '<p>사이트 이용으로 발생한 게임 내 손실, 데이터 손실, 기타 손해에 대해 사이트 운영자는 책임을 지지 않습니다.</p>' +
        '<h3>6. 약관 변경</h3>' +
        '<p>약관이 변경될 경우 본 페이지에 게시하며, 게시 시점부터 효력이 발생합니다.</p>' +
        '<p style="color:var(--muted)">시행일: 2026년 11월 25일</p>'
    },
    contact: {
      title: '문의',
      body:
        '<p>일정 오류 제보, 기능 건의, 광고·제휴 문의는 아래 채널로 보내 주세요. 확인 후 순서대로 답변드립니다.</p>' +
        '<ul>' +
        '<li><strong>블로그</strong> — blog.naver.com/seopp 의 최신 글 댓글</li>' +
        '<li><strong>인스타그램</strong> — @obak.sa DM</li>' +
        '</ul>' +
        '<p style="color:var(--muted)">일정 오류를 알려주실 때는 이벤트 이름과 화면에 보이는 시각을 함께 적어 주시면 빠르게 확인할 수 있어요.</p>'
    },
    disclaimer: {
      title: '면책조항',
      body:
        '<h3>1. 정보의 성격</h3>' +
        '<p>본 사이트의 일정·배율·육성 비용·공략은 공개된 게임 정보와 게임 내 표기를 정리한 <strong>참고 자료</strong>입니다. 게임 업데이트, 이벤트, 지역에 따라 실제 수치와 조건이 달라질 수 있으며, 최종 기준은 게임 화면입니다.</p>' +
        '<h3>2. 보증하지 않는 것</h3>' +
        '<p>정보의 완전성·최신성·특정 목적 적합성을 보증하지 않습니다. 본 사이트의 정보를 이용해 내린 육성·교환·구매 등의 판단과 그 결과에 대해 운영자는 책임을 지지 않습니다.</p>' +
        '<h3>3. 상표 및 제휴</h3>' +
        '<p>Pokémon 및 Pokémon GO 관련 명칭·이미지·상표의 권리는 Nintendo, Creatures Inc., GAME FREAK inc., Niantic, Inc.에 있습니다. 본 사이트는 비공식 팬 사이트로, 이들과 제휴하거나 후원받지 않습니다.</p>' +
        '<h3>4. 제휴 링크 고지</h3>' +
        '<p>일부 배너는 쿠팡 파트너스·겜스고 등 제휴 링크이며, 이를 통해 구매가 이루어지면 운영자가 일정액의 수수료를 받을 수 있습니다. 상품의 가격·조건·품질은 판매처가 정하는 것이며, 구매 결정은 이용자에게 있습니다.</p>' +
        '<h3>5. 외부 링크</h3>' +
        '<p>사이트에 연결된 외부 페이지의 내용과 개인정보 처리에는 운영자가 관여하지 않습니다.</p>' +
        '<p style="color:var(--muted)">시행일: 2026년 11월 26일</p>'
    },
    about: {
      title: '소개',
      body:
        '<p>「오박사의 포켓몬고 허브」는 포켓몬고를 오래 즐겨 온 트레이너가 매일 쓰려고 만든 도구 모음입니다.</p>' +
        '<p>해외 일정 사이트는 시간이 현지 기준이라 매번 계산해야 하고, 카운터 정보는 여러 페이지를 오가야 했습니다. 그래서 <strong>한국 시간 기준 일정 · 약점과 카운터 · 육성 비용</strong>을 한 화면에 모았습니다.</p>' +
        '<p>광고는 서버 유지비를 위해 일정과 본문 사이의 빈 영역에만 배치하며, 콘텐츠를 가리지 원칙으로 운영합니다.</p>' +
        '<p>운영: 오박사의 포켓몬 백과사전 (blog.naver.com/seopp)</p>'
    }
  };

  function openModal(key) {
    var data = MODALS[key];
    if (!data) return;
    $('#modal-title').textContent = data.title;
    $('#modal-body').innerHTML = data.body;
    $('#modal-backdrop').hidden = false;
    document.body.style.overflow = 'hidden';
    $('#modal-close').focus();
    track('modal_open', { modal_name: key });
  }

  function closeModal() {
    $('#modal-backdrop').hidden = true;
    document.body.style.overflow = '';
  }

  function initModals() {
    $$('[data-modal]').forEach(function (btn) {
      btn.addEventListener('click', function () { openModal(btn.getAttribute('data-modal')); });
    });
    $('#modal-close').addEventListener('click', closeModal);
    $('#modal-backdrop').addEventListener('click', function (e) {
      if (e.target === $('#modal-backdrop')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('#modal-backdrop').hidden) closeModal();
    });
  }

  /* ─────────────── 공유 ─────────────── */
  function initShare() {
    var btn = $('#share-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var url = location.href;
      track('share', { method: navigator.share ? 'native' : (navigator.clipboard ? 'clipboard' : 'none') });
      if (navigator.share) {
        navigator.share({ title: '오박사의 포켓몬고 허브', url: url }).catch(function () {});
        return;
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () { toast('링크를 복사했어요'); })
          .catch(function () { toast('주소창의 링크를 복사해 주세요'); });
      } else {
        toast('주소창의 링크를 복사해 주세요');
      }
    });
  }

  /* ─────────────── 제휴 배너 (쿠팡 파트너스 · 겜스고) ───────────────
     이동은 링크 기본 동작에 맡기고, 클릭만 GA4 partner_click 으로 남긴다. */
  function initPromoBanners() {
    $$('a.promo[data-partner]').forEach(function (link) {
      link.addEventListener('click', function () {
        track('partner_click', {
          partner: link.getAttribute('data-partner'),
          slot: link.getAttribute('data-slot') || ''
        });
      });
    });
  }

  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.style.cssText = 'position:fixed;left:50%;bottom:26px;transform:translateX(-50%);background:#0F172A;color:#fff;' +
        'border:1px solid #0EA5E9;padding:10px 18px;border-radius:999px;font-size:13px;font-weight:700;z-index:120;' +
        'box-shadow:0 8px 24px rgba(0,0,0,.5);transition:opacity .25s;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.style.opacity = '0'; }, 1800);
  }

  /* ─────────────── 시작 ─────────────── */
  function boot() {
    tickClock();
    initTabs();
    initFilterChips();
    initBossGrid();
    initTypeCalc();
    initPowerUp();
    initDex();
    initModals();
    initShare();
    initPromoBanners();
    initGuides();

    window.addEventListener('popstate', routeFromLocation);
    window.addEventListener('hashchange', routeFromLocation);

    /* ?guide=<slug> 로 들어와도 해시 주소로 바꿔서 공유·뒤로가기가 되게 한다 */
    var qGuide = null;
    try { qGuide = new URLSearchParams(location.search).get('guide'); } catch (e) { qGuide = null; }
    if (qGuide && guideBySlug(qGuide)) {
      try {
        var params = new URLSearchParams(location.search);
        params.delete('guide');
        var qs = params.toString();
        if (history.replaceState) {
          history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + '#guide/' + qGuide);
        }
      } catch (e2) { /* URL API 실패 시 해시만 유지 */ }
      switchTab('guide', { silent: true, guide: qGuide });
    } else if (!routeFromLocation()) {
      switchTab('events', { silent: true });
    }
    renderEvents();

    setInterval(function () {
      tickClock();
      updateTimers();
      updateHero(Date.now());
    }, 1000);

    // 30초마다 상태(진행/예정) 재정렬
    setInterval(renderEvents, 30000);

    // 이벤트 카드 강조 표시 (오늘 이벤트)
    var now = Date.now();
    EVENTS.forEach(function (ev) {
      var s = parse(ev.start), e = parse(ev.end);
      if (s && e && now >= s && now < e && (e - s) <= 3 * 3600000) ev.hot = true;
    });
    renderEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* 테스트용 노출 */
  window.__HUB = {
    formatRemain: formatRemain,
    dday: dday,
    powerUpCost: function (f, t, k) {
      var r = powerUpCost(f, t);
      var m = KIND_MULT[k || 'normal'];
      return { dust: Math.round(r.raw.dust * m.dust), candy: Math.round(r.raw.candy * m.candy),
               xl: Math.round(r.raw.xl * m.candy), steps: r.steps, rows: r.rows };
    },
    costAt: costAt,
    computeCounters: computeCounters,
    eventState: eventState,
    kstClock: kstClock,
    selectBoss: selectBoss,
    switchTab: switchTab,
    events: EVENTS,
    bosses: BOSSES,
    dex: DEX,
    guides: GUIDES,
    openGuide: openGuide,
    showGuideIndex: showGuideIndex,
    guideState: guideState,
    maxCP: function (id) { var p = DEX.filter(function (x) { return x.id === id; })[0]; return p ? { lv40: maxCP(p, CPM40), lv50: maxCP(p, CPM50) } : null; },
    openDex: openDex,
    closeDex: closeDex
  };
})();
