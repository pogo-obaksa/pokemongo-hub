/* =========================================================
   오박사의 포켓몬고 허브 — 레이드 보스 & 추천 카운터 데이터
   - types: PGO 타입 id 배열 (1~2개)
   - counters: 공격 타입별 추천 딜러 (tier S/A/B)
     fast/charged: { kr, en, type } — 한국어 표기 + 영문 원문 병기
   - 스킬 조합은 2026-11 기준 통용되는 레이드 세팅이며,
     게임 업데이트로 너프/변경될 수 있습니다.
   ========================================================= */
(function (global) {
  'use strict';

  var BOSSES = [
    {
      id: 'deoxys-normal', kr: '테오키스 (노말 폼)', en: 'Deoxys (Normal)', types: ['psychic'],
      tier: '5성 레이드', status: 'now', dex: 386, avail: '11/25 06:00 ~ 12/01 22:00',
      note: '에스퍼 단일. 공격·방어 밸런스형이라 4폼 중 가장 무난해요.'
    },
    {
      id: 'deoxys-attack', kr: '테오키스 (어택 폼)', en: 'Deoxys (Attack)', types: ['psychic'],
      tier: '5성 레이드', status: 'now', dex: 386, avail: '11/25 06:00 ~ 12/01 22:00',
      note: '공격력이 매우 높지만 체력이 종이. 2인 클리어도 노려볼 만해요.'
    },
    {
      id: 'deoxys-defense', kr: '테오키스 (디펜스 폼)', en: 'Deoxys (Defense)', types: ['psychic'],
      tier: '5성 레이드', status: 'now', dex: 386, avail: '11/25 06:00 ~ 12/01 22:00',
      note: '방어가 극단적으로 높아 시간이 오래 걸려요. 4인 이상 권장.'
    },
    {
      id: 'deoxys-speed', kr: '테오키스 (스피드 폼)', en: 'Deoxys (Speed)', types: ['psychic'],
      tier: '5성 레이드', status: 'now', dex: 386, avail: '11/25 06:00 ~ 12/01 22:00',
      note: '스피드 폼은 공격·방어 모두 중간값. 무난한 5성 보스예요.'
    },
    {
      id: 'mega-metagross', kr: '메가메타그로스', en: 'Mega Metagross', types: ['steel', 'psychic'],
      tier: '메가 레이드', status: 'now', dex: 376, avail: '11/25 06:00 ~ 12/01 22:00',
      note: '강철·에스퍼. 불꽃·땅·고스트·악이 1.6배로 들어가요.'
    },
    {
      id: 'mega-clefable', kr: '메가픽시', en: 'Mega Clefable', types: ['fairy', 'flying'],
      tier: '슈퍼 메가 레이드', status: 'soon', dex: 36, avail: '11/28 14:00 ~ 17:00 (레이드 데이)',
      note: '페어리·비행 첫 등장. 독이 1.6배로 가장 편하고, 전기·얼음·바위·강철도 약점이에요.'
    },
    {
      id: 'cryogonal', kr: '다이맥스 프리지오', en: 'Dynamax Cryogonal', types: ['ice'],
      tier: '다이맥스 (맥스배틀)', status: 'soon', dex: 615, avail: '11/30 06:00 ~ 21:00 (맥스 먼데이)', max: true,
      note: '맥스배틀은 일반 레이드와 계산이 달라요. 같은 타입 맥스무브를 가진 다이맥스로 맞서야 합니다.'
    },
    {
      id: 'shadow-tornadus', kr: '그림자 토네로스 (화신 폼)', en: 'Shadow Tornadus', types: ['flying'],
      tier: '그림자 5성', status: 'now', dex: 641, avail: '11/16 06:00 ~ 12/01 22:00 (주말)',
      note: '비행 단일. 전기·얼음·바위가 1.6배. 그림자라 받는 피해가 커요.'
    },
    {
      id: 'regidrago', kr: '레지드래고', en: 'Regidrago', types: ['dragon'],
      tier: '5성 레이드', status: 'soon', dex: 895, avail: '12/02 06:00 ~ 12/08 22:00',
      note: '드래곤 단일. 얼음·드래곤·페어리가 약점이고 체력이 두툼해요.'
    },
    {
      id: 'mega-slowbro', kr: '메가야도란', en: 'Mega Slowbro', types: ['water', 'psychic'],
      tier: '메가 레이드', status: 'soon', dex: 80, avail: '12/02 06:00 ~ 12/08 22:00',
      note: '물·에스퍼. 전기·풀·벌레·고스트·악이 약점.'
    },
    {
      id: 'shadow-dialga', kr: '그림자 디아루가', en: 'Shadow Dialga', types: ['steel', 'dragon'],
      tier: '그림자 5성', status: 'soon', dex: 483, avail: '12/02 06:00 ~ 2027/01/05 22:00',
      note: '강철·드래곤. 격투가 2.56배로 가장 강하고, 땅도 1.6배로 들어갑니다.'
    },
    {
      id: 'palkia', kr: '펄기아', en: 'Palkia', types: ['water', 'dragon'],
      tier: '참고 (현재 로테이션 아님)', status: 'ref', dex: 484, avail: '로테이션 대기',
      note: '물·드래곤. 드래곤과 페어리가 약점이에요. 다음 재등장 때를 대비해 두세요.'
    },
    {
      id: 'mega-dragonite', kr: '메가망나뇽', en: 'Mega Dragonite', types: ['dragon', 'flying'],
      tier: '참고 (출시 정보 미확정)', status: 'ref', dex: 149, avail: '미확정',
      note: '드래곤·비행 조합이면 얼음이 2.56배로 가장 강한 카운터가 됩니다.'
    }
  ];

  var C = function (kr, en, tier, fkr, fen, ftype, ckr, cen, ctype) {
    return {
      kr: kr, en: en, tier: tier,
      fast: { kr: fkr, en: fen, type: ftype },
      charged: { kr: ckr, en: cen, type: ctype }
    };
  };

  var COUNTERS = {
    fire: [
      C('메가리자몽 Y', 'Mega Charizard Y', 'S', '불꽃세례', 'Fire Spin', 'fire', '블러스트번', 'Blast Burn', 'fire'),
      C('메가리자몽 X', 'Mega Charizard X', 'S', '불꽃세례', 'Fire Spin', 'fire', '블러스트번', 'Blast Burn', 'fire'),
      C('리자몽', 'Charizard', 'A', '불꽃세례', 'Fire Spin', 'fire', '블러스트번', 'Blast Burn', 'fire'),
      C('레시라무', 'Reshiram', 'A', '불꽃세례', 'Fire Spin', 'fire', '오버히트', 'Overheat', 'fire'),
      C('앤테이', 'Entei', 'A', '불꽃세례', 'Fire Spin', 'fire', '오버히트', 'Overheat', 'fire'),
      C('히드런', 'Heatran', 'A', '불꽃세례', 'Fire Spin', 'fire', '마그마스톰', 'Magma Storm', 'fire')
    ],
    water: [
      C('메가대짱이', 'Mega Swampert', 'S', '물대포', 'Water Gun', 'water', '하이드로캐논', 'Hydro Cannon', 'water'),
      C('메가거북왕', 'Mega Blastoise', 'S', '물대포', 'Water Gun', 'water', '하이드로캐논', 'Hydro Cannon', 'water'),
      C('대짱이', 'Swampert', 'A', '물대포', 'Water Gun', 'water', '하이드로캐논', 'Hydro Cannon', 'water'),
      C('메가갸라도스', 'Mega Gyarados', 'S', '폭포오르기', 'Waterfall', 'water', '하이드로펌프', 'Hydro Pump', 'water'),
      C('갸라도스', 'Gyarados', 'A', '폭포오르기', 'Waterfall', 'water', '하이드로펌프', 'Hydro Pump', 'water'),
      C('펄기아', 'Palkia', 'A', '드래곤테일', 'Dragon Tail', 'dragon', '하이드로펌프', 'Hydro Pump', 'water')
    ],
    electric: [
      C('제크로무', 'Zekrom', 'S', '차지빔', 'Charge Beam', 'electric', '크로스썬더', 'Fusion Bolt', 'electric'),
      C('라이코우', 'Raikou', 'A', '전기쇼크', 'Thunder Shock', 'electric', '와일드볼트', 'Wild Charge', 'electric'),
      C('에레키블', 'Electivire', 'A', '전기쇼크', 'Thunder Shock', 'electric', '와일드볼트', 'Wild Charge', 'electric'),
      C('메가전룡', 'Mega Ampharos', 'A', '차지빔', 'Charge Beam', 'electric', '전자포', 'Zap Cannon', 'electric'),
      C('썬더 (화신)', 'Thundurus', 'A', '전기쇼크', 'Thunder Shock', 'electric', '썬더볼트', 'Thunderbolt', 'electric'),
      C('자포코일', 'Magnezone', 'B', '스파크', 'Spark', 'electric', '전자포', 'Zap Cannon', 'electric')
    ],
    grass: [
      C('메가이상해꽃', 'Mega Venusaur', 'S', '덩굴채찍', 'Vine Whip', 'grass', '프렌지플랜트', 'Frenzy Plant', 'grass'),
      C('메가나무킹', 'Mega Sceptile', 'S', '연속자르기', 'Fury Cutter', 'bug', '프렌지플랜트', 'Frenzy Plant', 'grass'),
      C('이상해꽃', 'Venusaur', 'A', '덩굴채찍', 'Vine Whip', 'grass', '프렌지플랜트', 'Frenzy Plant', 'grass'),
      C('나무킹', 'Sceptile', 'A', '연속자르기', 'Fury Cutter', 'bug', '프렌지플랜트', 'Frenzy Plant', 'grass'),
      C('로즈레이드', 'Roserade', 'A', '잎날가르기', 'Razor Leaf', 'grass', '풀묶기', 'Grass Knot', 'grass'),
      C('이상해풀', 'Ivysaur', 'B', '덩굴채찍', 'Vine Whip', 'grass', '파워휩', 'Power Whip', 'grass')
    ],
    ice: [
      C('맘모꾸리', 'Mamoswine', 'S', '눈싸라기', 'Powder Snow', 'ice', '눈사태', 'Avalanche', 'ice'),
      C('글레이시아', 'Glaceon', 'A', '얼음숨결', 'Frost Breath', 'ice', '눈사태', 'Avalanche', 'ice'),
      C('포푸니라', 'Weavile', 'A', '얼음뭉치', 'Ice Shard', 'ice', '눈사태', 'Avalanche', 'ice'),
      C('메가얼음귀신', 'Mega Glalie', 'A', '얼음숨결', 'Frost Breath', 'ice', '눈사태', 'Avalanche', 'ice'),
      C('메가눈설왕', 'Mega Abomasnow', 'B', '눈싸라기', 'Powder Snow', 'ice', '눈보라', 'Blizzard', 'ice'),
      C('레지아이스', 'Regice', 'B', '얼음숨결', 'Frost Breath', 'ice', '눈보라', 'Blizzard', 'ice')
    ],
    fighting: [
      C('메가루카리오', 'Mega Lucario', 'S', '카운터', 'Counter', 'fighting', '파동탄', 'Aura Sphere', 'fighting'),
      C('테라키온', 'Terrakion', 'S', '더블킥', 'Double Kick', 'fighting', '성검', 'Sacred Sword', 'fighting'),
      C('메가번치코', 'Mega Blaziken', 'S', '카운터', 'Counter', 'fighting', '기합구슬', 'Focus Blast', 'fighting'),
      C('루카리오', 'Lucario', 'A', '카운터', 'Counter', 'fighting', '파동탄', 'Aura Sphere', 'fighting'),
      C('괴력몬', 'Machamp', 'A', '카운터', 'Counter', 'fighting', '폭발펀치', 'Dynamic Punch', 'fighting'),
      C('노보청', 'Conkeldurr', 'A', '카운터', 'Counter', 'fighting', '폭발펀치', 'Dynamic Punch', 'fighting')
    ],
    poison: [
      C('로즈레이드', 'Roserade', 'A', '독찌르기', 'Poison Jab', 'poison', '오물폭탄', 'Sludge Bomb', 'poison'),
      C('메가독침붕', 'Mega Beedrill', 'A', '독찌르기', 'Poison Jab', 'poison', '오물폭탄', 'Sludge Bomb', 'poison'),
      C('크로뱃', 'Crobat', 'B', '독찌르기', 'Poison Jab', 'poison', '오물폭탄', 'Sludge Bomb', 'poison'),
      C('니드킹', 'Nidoking', 'B', '독찌르기', 'Poison Jab', 'poison', '오물웨이브', 'Sludge Wave', 'poison'),
      C('독개굴', 'Toxicroak', 'B', '독찌르기', 'Poison Jab', 'poison', '오물폭탄', 'Sludge Bomb', 'poison'),
      C('팬텀', 'Gengar', 'B', '핥기', 'Lick', 'ghost', '오물폭탄', 'Sludge Bomb', 'poison')
    ],
    ground: [
      C('랜드로스 (화신)', 'Landorus (Incarnate)', 'S', '진흙뿌리기', 'Mud Shot', 'ground', '지진', 'Earthquake', 'ground'),
      C('랜드로스 (영물)', 'Landorus (Therian)', 'S', '진흙뿌리기', 'Mud Shot', 'ground', '지진', 'Earthquake', 'ground'),
      C('한카리아스', 'Garchomp', 'A', '진흙뿌리기', 'Mud Shot', 'ground', '지진', 'Earthquake', 'ground'),
      C('거대코뿌리', 'Rhyperior', 'A', '진흙뿌리기', 'Mud-Slap', 'ground', '지진', 'Earthquake', 'ground'),
      C('맘모꾸리', 'Mamoswine', 'A', '진흙뿌리기', 'Mud-Slap', 'ground', '지진', 'Earthquake', 'ground'),
      C('몰드류', 'Excadrill', 'B', '진흙뿌리기', 'Mud-Slap', 'ground', '지진', 'Earthquake', 'ground')
    ],
    flying: [
      C('메가레쿠쟈', 'Mega Rayquaza', 'S', '에어슬래시', 'Air Slash', 'flying', '드래곤어센트', 'Dragon Ascent', 'flying'),
      C('레쿠쟈', 'Rayquaza', 'A', '에어슬래시', 'Air Slash', 'flying', '드래곤어센트', 'Dragon Ascent', 'flying'),
      C('메가피죤투', 'Mega Pidgeot', 'A', '돌풍', 'Gust', 'flying', '브레이브버드', 'Brave Bird', 'flying'),
      C('토네로스 (화신)', 'Tornadus (Incarnate)', 'A', '돌풍', 'Gust', 'flying', '폭풍', 'Hurricane', 'flying'),
      C('칠색조', 'Ho-Oh', 'B', '염동력', 'Extrasensory', 'psychic', '브레이브버드', 'Brave Bird', 'flying'),
      C('파이어', 'Moltres', 'B', '날개치기', 'Wing Attack', 'flying', '스카이어택', 'Sky Attack', 'flying')
    ],
    psychic: [
      C('뮤츠', 'Mewtwo', 'S', '사이코커터', 'Psycho Cut', 'psychic', '사이코버스트', 'Psystrike', 'psychic'),
      C('메가뮤츠 Y', 'Mega Mewtwo Y', 'S', '사이코커터', 'Psycho Cut', 'psychic', '사이코버스트', 'Psystrike', 'psychic'),
      C('후파 (굴레를 벗은 모습)', 'Hoopa (Unbound)', 'A', '염동력', 'Confusion', 'psychic', '사이코키네시스', 'Psychic', 'psychic'),
      C('메가가디안', 'Mega Gardevoir', 'A', '염동력', 'Confusion', 'psychic', '사이코키네시스', 'Psychic', 'psychic'),
      C('라티오스', 'Latios', 'B', '염동력', 'Confusion', 'psychic', '사이코키네시스', 'Psychic', 'psychic'),
      C('에브이', 'Espeon', 'B', '염동력', 'Confusion', 'psychic', '사이코키네시스', 'Psychic', 'psychic')
    ],
    bug: [
      C('메가독침붕', 'Mega Beedrill', 'A', '벌레먹기', 'Bug Bite', 'bug', '엑스시저', 'X-Scissor', 'bug'),
      C('볼카로나', 'Volcarona', 'A', '벌레먹기', 'Bug Bite', 'bug', '벌레의야단법석', 'Bug Buzz', 'bug'),
      C('헤라크로스', 'Heracross', 'A', '카운터', 'Counter', 'fighting', '메가혼', 'Megahorn', 'bug'),
      C('핫삼', 'Scizor', 'B', '연속자르기', 'Fury Cutter', 'bug', '엑스시저', 'X-Scissor', 'bug'),
      C('메가자리', 'Yanmega', 'B', '벌레먹기', 'Bug Bite', 'bug', '벌레의야단법석', 'Bug Buzz', 'bug'),
      C('메가핫삼', 'Mega Scizor', 'A', '연속자르기', 'Fury Cutter', 'bug', '엑스시저', 'X-Scissor', 'bug')
    ],
    rock: [
      C('거대코뿌리', 'Rhyperior', 'S', '스매시다운', 'Smack Down', 'rock', '암석포', 'Rock Wrecker', 'rock'),
      C('램펄드', 'Rampardos', 'A', '스매시다운', 'Smack Down', 'rock', '스톤샤워', 'Rock Slide', 'rock'),
      C('테라키온', 'Terrakion', 'A', '스매시다운', 'Smack Down', 'rock', '스톤샤워', 'Rock Slide', 'rock'),
      C('메가마기라스', 'Mega Tyranitar', 'A', '스매시다운', 'Smack Down', 'rock', '스톤에지', 'Stone Edge', 'rock'),
      C('마기라스', 'Tyranitar', 'A', '스매시다운', 'Smack Down', 'rock', '스톤에지', 'Stone Edge', 'rock'),
      C('기가이어스', 'Gigalith', 'B', '스매시다운', 'Smack Down', 'rock', '스톤에지', 'Stone Edge', 'rock')
    ],
    ghost: [
      C('메가팬텀', 'Mega Gengar', 'S', '핥기', 'Lick', 'ghost', '섀도볼', 'Shadow Ball', 'ghost'),
      C('기라티나 (오리진)', 'Giratina (Origin)', 'S', '섀도클로', 'Shadow Claw', 'ghost', '섀도볼', 'Shadow Ball', 'ghost'),
      C('팬텀', 'Gengar', 'A', '핥기', 'Lick', 'ghost', '섀도볼', 'Shadow Ball', 'ghost'),
      C('샹델라', 'Chandelure', 'A', '불꽃세례', 'Fire Spin', 'fire', '섀도볼', 'Shadow Ball', 'ghost'),
      C('다크펫', 'Banette', 'B', '섀도클로', 'Shadow Claw', 'ghost', '섀도볼', 'Shadow Ball', 'ghost'),
      C('기라티나 (어나더)', 'Giratina (Altered)', 'B', '섀도클로', 'Shadow Claw', 'ghost', '섀도볼', 'Shadow Ball', 'ghost')
    ],
    dark: [
      C('다크라이', 'Darkrai', 'S', '바크아웃', 'Snarl', 'dark', '악의파동', 'Dark Pulse', 'dark'),
      C('이벨타르', 'Yveltal', 'A', '바크아웃', 'Snarl', 'dark', '악의파동', 'Dark Pulse', 'dark'),
      C('메가앱솔', 'Mega Absol', 'A', '바크아웃', 'Snarl', 'dark', '악의파동', 'Dark Pulse', 'dark'),
      C('마기라스', 'Tyranitar', 'A', '바크아웃', 'Snarl', 'dark', '크런치', 'Crunch', 'dark'),
      C('포푸니라', 'Weavile', 'B', '바크아웃', 'Snarl', 'dark', '속임수', 'Foul Play', 'dark'),
      C('삼삼드래', 'Hydreigon', 'B', '바크아웃', 'Snarl', 'dark', '악의파동', 'Dark Pulse', 'dark')
    ],
    steel: [
      C('메가메타그로스', 'Mega Metagross', 'S', '불릿펀치', 'Bullet Punch', 'steel', '코멧펀치', 'Meteor Mash', 'steel'),
      C('메타그로스', 'Metagross', 'S', '불릿펀치', 'Bullet Punch', 'steel', '코멧펀치', 'Meteor Mash', 'steel'),
      C('자시안', 'Zacian', 'A', '메탈크로우', 'Metal Claw', 'steel', '아이언헤드', 'Iron Head', 'steel'),
      C('디아루가', 'Dialga', 'A', '메탈크로우', 'Metal Claw', 'steel', '아이언헤드', 'Iron Head', 'steel'),
      C('몰드류', 'Excadrill', 'A', '메탈크로우', 'Metal Claw', 'steel', '아이언헤드', 'Iron Head', 'steel'),
      C('멜메탈', 'Melmetal', 'A', '전기쇼크', 'Thunder Shock', 'electric', '더블아이언바시', 'Double Iron Bash', 'steel')
    ],
    fairy: [
      C('메가가디안', 'Mega Gardevoir', 'S', '애교부리기', 'Charm', 'fairy', '매지컬샤인', 'Dazzling Gleam', 'fairy'),
      C('가디안', 'Gardevoir', 'A', '애교부리기', 'Charm', 'fairy', '매지컬샤인', 'Dazzling Gleam', 'fairy'),
      C('토게키스', 'Togekiss', 'A', '애교부리기', 'Charm', 'fairy', '매지컬샤인', 'Dazzling Gleam', 'fairy'),
      C('자시안', 'Zacian', 'A', '메탈크로우', 'Metal Claw', 'steel', '장난치기', 'Play Rough', 'fairy'),
      C('님피아', 'Sylveon', 'B', '애교부리기', 'Charm', 'fairy', '문포스', 'Moonblast', 'fairy'),
      C('픽시', 'Clefable', 'B', '애교부리기', 'Charm', 'fairy', '문포스', 'Moonblast', 'fairy')
    ],
    dragon: [
      C('메가레쿠쟈', 'Mega Rayquaza', 'S', '드래곤테일', 'Dragon Tail', 'dragon', '역린', 'Outrage', 'dragon'),
      C('레쿠쟈', 'Rayquaza', 'S', '드래곤테일', 'Dragon Tail', 'dragon', '역린', 'Outrage', 'dragon'),
      C('펄기아', 'Palkia', 'A', '드래곤테일', 'Dragon Tail', 'dragon', '용성군', 'Draco Meteor', 'dragon'),
      C('디아루가', 'Dialga', 'A', '용의숨결', 'Dragon Breath', 'dragon', '용성군', 'Draco Meteor', 'dragon'),
      C('한카리아스', 'Garchomp', 'A', '드래곤테일', 'Dragon Tail', 'dragon', '역린', 'Outrage', 'dragon'),
      C('망나뇽', 'Dragonite', 'B', '드래곤테일', 'Dragon Tail', 'dragon', '역린', 'Outrage', 'dragon')
    ],
    normal: [
      C('메가캥카', 'Mega Kangaskhan', 'B', '할퀴기', 'Scratch', 'normal', '기가임팩트', 'Giga Impact', 'normal'),
      C('레지기가스', 'Regigigas', 'B', '짓밟기', 'Stomp', 'normal', '기가임팩트', 'Giga Impact', 'normal')
    ]
  };

  /* 다이맥스(맥스배틀) 보스용 안내 — 맥스무브는 다이맥스 포켓몬의 타입을 따름 */
  var MAX_TIPS = {
    'ice': '얼음 보스에게는 불꽃·격투·바위·강철 맥스무브가 강해요. 다이맥스 리자몽(불꽃)·다이맥스 루카리오(격투)를 추천!'
  };

  global.HUB_BOSSES = BOSSES;
  global.HUB_COUNTERS = COUNTERS;
  global.HUB_MAX_TIPS = MAX_TIPS;
})(window);
