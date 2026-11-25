/* =========================================================
   오박사의 포켓몬고 허브 — 타입/날씨 데이터
   18타입 상성표 (포켓몬 GO 기준 배율)
   - 효과가 굉장함: x1.6
   - 효과가 별로 없음: x0.625
   - 효과 없음(면역): x0.391
   - 이중 약점(복합 타입): 1.6 x 1.6 = 2.56
   ========================================================= */
(function (global) {
  'use strict';

  var TYPES = [
    { id: 'normal',   ko: '노말',  en: 'Normal',   color: '#8C8C6E' },
    { id: 'fire',     ko: '불꽃',  en: 'Fire',     color: '#E8590C' },
    { id: 'water',    ko: '물',    en: 'Water',    color: '#1C6FD4' },
    { id: 'electric', ko: '전기',  en: 'Electric', color: '#F2C200' },
    { id: 'grass',    ko: '풀',    en: 'Grass',    color: '#2F9E44' },
    { id: 'ice',      ko: '얼음',  en: 'Ice',      color: '#2E9BA6' },
    { id: 'fighting', ko: '격투',  en: 'Fighting', color: '#B0231D' },
    { id: 'poison',   ko: '독',    en: 'Poison',   color: '#8E2A8C' },
    { id: 'ground',   ko: '땅',    en: 'Ground',   color: '#A9762A' },
    { id: 'flying',   ko: '비행',  en: 'Flying',   color: '#6B63D8' },
    { id: 'psychic',  ko: '에스퍼', en: 'Psychic', color: '#D6336C' },
    { id: 'bug',      ko: '벌레',  en: 'Bug',      color: '#6E8B0F' },
    { id: 'rock',     ko: '바위',  en: 'Rock',     color: '#8A7420' },
    { id: 'ghost',    ko: '고스트', en: 'Ghost',   color: '#5B4380' },
    { id: 'dragon',   ko: '드래곤', en: 'Dragon',  color: '#4B21D6' },
    { id: 'dark',     ko: '악',    en: 'Dark',     color: '#4A3B31' },
    { id: 'steel',    ko: '강철',  en: 'Steel',    color: '#5F6E85' },
    { id: 'fairy',    ko: '페어리', en: 'Fairy',   color: '#C2409C' }
  ];

  /* 공격 타입 -> { super: [1.6배], weak: [0.625배], none: [0.391배] } */
  var CHART = {
    normal:   { super: [], weak: ['rock', 'steel'], none: ['ghost'] },
    fire:     { super: ['grass', 'ice', 'bug', 'steel'], weak: ['fire', 'water', 'rock', 'dragon'], none: [] },
    water:    { super: ['fire', 'ground', 'rock'], weak: ['water', 'grass', 'dragon'], none: [] },
    electric: { super: ['water', 'flying'], weak: ['electric', 'grass', 'dragon'], none: ['ground'] },
    grass:    { super: ['water', 'ground', 'rock'], weak: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'], none: [] },
    ice:      { super: ['grass', 'ground', 'flying', 'dragon'], weak: ['fire', 'water', 'ice', 'steel'], none: [] },
    fighting: { super: ['normal', 'ice', 'rock', 'dark', 'steel'], weak: ['poison', 'flying', 'psychic', 'bug', 'fairy'], none: [] },
    poison:   { super: ['grass', 'fairy'], weak: ['poison', 'ground', 'rock', 'ghost'], none: ['steel'] },
    ground:   { super: ['fire', 'electric', 'poison', 'rock', 'steel'], weak: ['grass', 'bug'], none: ['flying'] },
    flying:   { super: ['grass', 'fighting', 'bug'], weak: ['electric', 'rock', 'steel'], none: [] },
    psychic:  { super: ['fighting', 'poison'], weak: ['psychic', 'steel'], none: ['dark'] },
    bug:      { super: ['grass', 'psychic', 'dark'], weak: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'], none: [] },
    rock:     { super: ['fire', 'ice', 'flying', 'bug'], weak: ['fighting', 'ground', 'steel'], none: [] },
    ghost:    { super: ['psychic', 'ghost'], weak: ['dark'], none: ['normal'] },
    dragon:   { super: ['dragon'], weak: ['steel'], none: ['fairy'] },
    dark:     { super: ['psychic', 'ghost'], weak: ['fighting', 'dark', 'fairy'], none: [] },
    steel:    { super: ['ice', 'rock', 'fairy'], weak: ['fire', 'water', 'electric', 'steel'], none: [] },
    fairy:    { super: ['fighting', 'dragon', 'dark'], weak: ['fire', 'poison', 'steel'], none: [] }
  };

  /* 날씨 -> 부스트되는 타입 (해당 타입 기술 위력 1.2배) */
  var WEATHER = [
    { id: 'sunny',    ko: '맑음',       icon: '☀️', types: ['fire', 'grass', 'ground'] },
    { id: 'rainy',    ko: '비',         icon: '🌧️', types: ['water', 'electric', 'bug'] },
    { id: 'partly',   ko: '구름 조금',  icon: '⛅', types: ['normal', 'rock'] },
    { id: 'cloudy',   ko: '흐림',       icon: '☁️', types: ['fairy', 'poison', 'fighting'] },
    { id: 'windy',    ko: '바람',       icon: '💨', types: ['dragon', 'flying', 'psychic'] },
    { id: 'snow',     ko: '눈',         icon: '❄️', types: ['ice', 'steel'] },
    { id: 'fog',      ko: '안개',       icon: '🌫️', types: ['dark', 'ghost'] }
  ];

  var BY_ID = {};
  TYPES.forEach(function (t) { BY_ID[t.id] = t; });

  global.PGO = {
    TYPES: TYPES,
    BY_ID: BY_ID,
    CHART: CHART,
    WEATHER: WEATHER,
    MULT: { super: 1.6, normal: 1, weak: 0.625, none: 0.391 },
    typeKo: function (id) { return BY_ID[id] ? BY_ID[id].ko : id; },
    typeKoList: function (ids) { return (ids || []).map(function (i) { return BY_ID[i] ? BY_ID[i].ko : i; }); },
    typeColor: function (id) { return BY_ID[id] ? BY_ID[id].color : '#6B7280'; },

    /* 배경색 위에서 대비가 가장 큰 글자색 (노랑·전기처럼 밝은 타입은 진한 글자) */
    typeText: function (id) {
      var hex = (BY_ID[id] ? BY_ID[id].color : '#6B7280').replace('#', '');
      var r = parseInt(hex.substr(0, 2), 16), g = parseInt(hex.substr(2, 2), 16), b = parseInt(hex.substr(4, 2), 16);
      var chan = function (c) { c = c / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
      var lum = 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
      return lum > 0.204 ? '#111827' : '#ffffff';
    },

    /* 공격 타입 1개 -> 방어 타입 1개 배율 */
    single: function (atk, def) {
      var row = CHART[atk];
      if (!row) return 1;
      if (row.none.indexOf(def) >= 0) return 0.391;
      if (row.super.indexOf(def) >= 0) return 1.6;
      if (row.weak.indexOf(def) >= 0) return 0.625;
      return 1;
    },

    /* 공격 타입 1개 -> 방어 타입 1~2개 배율 */
    multi: function (atk, defs) {
      var m = 1;
      (defs || []).forEach(function (d) { m *= this.single(atk, d); }, this);
      return Math.round(m * 1000) / 1000;
    },

    /* 방어 타입 조합에 대해 18타입 전체 배율 목록 (높은 순) */
    defenseTable: function (defs) {
      return TYPES.map(function (t) {
        var id = t.id;
        return { type: id, ko: t.ko, en: t.en, color: t.color, mult: this.multi(id, defs) };
      }, this).sort(function (a, b) { return b.mult - a.mult || a.ko.localeCompare(b.ko, 'ko'); });
    },

    /* 방어 타입 조합의 약점만 (1.6배 이상) */
    weaknesses: function (defs) {
      return this.defenseTable(defs).filter(function (r) { return r.mult > 1.001; });
    },

    /* 어떤 약점 타입을 부스트하는 날씨 목록 */
    weatherFor: function (typeIds) {
      return WEATHER.filter(function (w) {
        return w.types.some(function (t) { return typeIds.indexOf(t) >= 0; });
      });
    },

    multLabel: function (m) {
      if (m >= 2.5) return '이중 약점';
      if (m >= 1.5) return '약점';
      if (m > 1.001) return '약점';
      if (m > 0.99) return '보통';
      if (m > 0.4) return '반감';
      return '이중 반감';
    }
  };
})(window);
