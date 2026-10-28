export const SITE_CONFIG = {
  title: 'SILVERBHAI',
  logo: 'https://sitethemedata.com/sitethemes/silverbhai.com/front/logo.png',
  scoreboardUrl: 'wss://sportsscore24.com',
  bucketPath: 'https://sitethemedata.com/',
  dimBucketPath: 'https://cdn.926assets.com/',
  imgPath: 'https://cdn.926assets.com/g3ver/v107/static/',
  news: 'Newly Launched Matka Market In Our Exchange | 24X7 Instant Deposits & Withdrawals Available | Enjoy Best Odds On All Cricket & Live Casino Markets',
  themeType: '4',
  bgBody: '#16191C',
  bgPrimary: '#04A1A6',
  bgSecondary: '#0F696E',
  supportNo: '+91 9876543210',
  telegram: 'https://t.me/silverbhai_official',
  whatsapp: 'https://wa.me/919876543210'
};

export const NEW_EVENTS = [
  { name: 'Bangladesh v West Indies', sportId: 4, id: '710711374', lid: '710711374_4', live: true },
  { name: 'South Africa v Australia', sportId: 4, id: '795819909', lid: '795819909_4', live: true },
  { name: 'India W v Zimbabwe W', sportId: 4, id: '735447015', lid: '735447015_4', live: true },
  { name: 'A Sasnovich v Di Shnaider', sportId: 2, id: '845769665', lid: '845769665_2', live: true },
  { name: 'P Badosa v S Kraus', sportId: 2, id: '564330788', lid: '564330788_2', live: false }
];

export const SPORTS_CATEGORIES = [
  { id: 4, name: 'Cricket', icon: 'fas fa-baseball-ball', count: 18 },
  { id: 1, name: 'Football', icon: 'fas fa-futbol', count: 24 },
  { id: 2, name: 'Tennis', icon: 'fas fa-table-tennis', count: 12 },
  { id: 8, name: 'Table Tennis', icon: 'fas fa-table-tennis', count: 9 },
  { id: 7, name: 'Horse Racing', icon: 'fas fa-horse', count: 14 },
  { id: 43, name: 'Greyhound Racing', icon: 'fas fa-dog', count: 8 },
  { id: 10, name: 'Basketball', icon: 'fas fa-basketball-ball', count: 6 },
  { id: 11, name: 'Volleyball', icon: 'fas fa-volleyball-ball', count: 4 },
  { id: 12, name: 'Snooker', icon: 'fas fa-dot-circle', count: 3 },
  { id: 13, name: 'Ice Hockey', icon: 'fas fa-hockey-puck', count: 5 }
];

export const MATCHES_DATA = [
  {
    id: '710711374',
    sportId: 4,
    sportName: 'Cricket',
    tournament: 'ICC Champions Trophy 2026',
    name: 'Bangladesh v West Indies',
    date: 'In-Play',
    isInPlay: true,
    hasTv: true,
    hasFancy: true,
    hasBookmaker: true,
    team1: 'Bangladesh',
    team2: 'West Indies',
    score: 'BAN 184/5 (34.2 ov)',
    odds: {
      team1: { back: '2.14', lay: '2.18', backVol: '45.2K', layVol: '12.8K' },
      draw: { back: '-', lay: '-', backVol: '', layVol: '' },
      team2: { back: '1.82', lay: '1.85', backVol: '89.4K', layVol: '34.1K' }
    }
  },
  {
    id: '795819909',
    sportId: 4,
    sportName: 'Cricket',
    tournament: 'Australia tour of South Africa 2026',
    name: 'South Africa v Australia',
    date: 'In-Play',
    isInPlay: true,
    hasTv: true,
    hasFancy: true,
    hasBookmaker: true,
    team1: 'South Africa',
    team2: 'Australia',
    score: 'AUS 245/8 (50 ov) | SA 88/2 (16.1 ov)',
    odds: {
      team1: { back: '1.75', lay: '1.78', backVol: '112.5K', layVol: '56.3K' },
      draw: { back: '-', lay: '-', backVol: '', layVol: '' },
      team2: { back: '2.28', lay: '2.32', backVol: '94.1K', layVol: '48.9K' }
    }
  },
  {
    id: '735447015',
    sportId: 4,
    sportName: 'Cricket',
    tournament: 'Women ODI Tri-Series',
    name: 'India W v Zimbabwe W',
    date: 'In-Play',
    isInPlay: true,
    hasTv: true,
    hasFancy: true,
    hasBookmaker: true,
    team1: 'India W',
    team2: 'Zimbabwe W',
    score: 'ZIM W 142/10 (41.4 ov) | IND W 45/0 (6.2 ov)',
    odds: {
      team1: { back: '1.04', lay: '1.05', backVol: '540.2K', layVol: '210.0K' },
      draw: { back: '-', lay: '-', backVol: '', layVol: '' },
      team2: { back: '22.0', lay: '26.0', backVol: '12.4K', layVol: '4.2K' }
    }
  },
  {
    id: '741289301',
    sportId: 4,
    sportName: 'Cricket',
    tournament: 'IPL 2026',
    name: 'Chennai Super Kings v Mumbai Indians',
    date: 'Today 19:30',
    isInPlay: false,
    hasTv: true,
    hasFancy: true,
    hasBookmaker: true,
    team1: 'Chennai Super Kings',
    team2: 'Mumbai Indians',
    score: 'Starts at 19:30 IST',
    odds: {
      team1: { back: '1.91', lay: '1.93', backVol: '320.5K', layVol: '140.2K' },
      draw: { back: '-', lay: '-', backVol: '', layVol: '' },
      team2: { back: '1.98', lay: '2.00', backVol: '280.9K', layVol: '115.4K' }
    }
  },
  {
    id: '845769665',
    sportId: 2,
    sportName: 'Tennis',
    tournament: 'WTA Dubai Open 2026',
    name: 'A Sasnovich v Di Shnaider',
    date: 'In-Play',
    isInPlay: true,
    hasTv: true,
    hasFancy: false,
    hasBookmaker: false,
    team1: 'A Sasnovich',
    team2: 'Di Shnaider',
    score: 'Set 2: (6-4, 3-2)',
    odds: {
      team1: { back: '1.45', lay: '1.48', backVol: '18.4K', layVol: '9.2K' },
      draw: { back: '-', lay: '-', backVol: '', layVol: '' },
      team2: { back: '3.10', lay: '3.25', backVol: '14.0K', layVol: '6.5K' }
    }
  },
  {
    id: '564330788',
    sportId: 2,
    sportName: 'Tennis',
    tournament: 'ATP Rio Open 2026',
    name: 'P Badosa v S Kraus',
    date: 'Tomorrow 16:00',
    isInPlay: false,
    hasTv: true,
    hasFancy: false,
    hasBookmaker: false,
    team1: 'P Badosa',
    team2: 'S Kraus',
    score: 'Tomorrow 16:00',
    odds: {
      team1: { back: '1.30', lay: '1.33', backVol: '32.1K', layVol: '15.4K' },
      draw: { back: '-', lay: '-', backVol: '', layVol: '' },
      team2: { back: '3.80', lay: '4.00', backVol: '21.0K', layVol: '8.7K' }
    }
  },
  {
    id: '109283741',
    sportId: 1,
    sportName: 'Football',
    tournament: 'UEFA Champions League',
    name: 'Real Madrid v Bayern Munich',
    date: 'Today 21:00',
    isInPlay: false,
    hasTv: true,
    hasFancy: false,
    hasBookmaker: true,
    team1: 'Real Madrid',
    team2: 'Bayern Munich',
    score: 'Today 21:00',
    odds: {
      team1: { back: '2.10', lay: '2.14', backVol: '240.5K', layVol: '80.0K' },
      draw: { back: '3.40', lay: '3.45', backVol: '110.2K', layVol: '45.0K' },
      team2: { back: '3.60', lay: '3.65', backVol: '185.0K', layVol: '62.0K' }
    }
  },
  {
    id: '109283742',
    sportId: 1,
    sportName: 'Football',
    tournament: 'English Premier League',
    name: 'Arsenal v Manchester City',
    date: 'In-Play',
    isInPlay: true,
    hasTv: true,
    hasFancy: false,
    hasBookmaker: true,
    team1: 'Arsenal',
    team2: 'Manchester City',
    score: '67\' [ 1 - 1 ]',
    odds: {
      team1: { back: '3.20', lay: '3.25', backVol: '340.0K', layVol: '115.0K' },
      draw: { back: '2.10', lay: '2.15', backVol: '220.0K', layVol: '90.0K' },
      team2: { back: '2.95', lay: '3.00', backVol: '310.0K', layVol: '120.0K' }
    }
  }
];

export const CASINO_GAMES = [
  { id: 'aviator', gname: 'Aviator', category: 'crash', provider: 'Spribe', imgpath: 'aviator.jpg', bg: 'linear-gradient(135deg, #e40539 0%, #7e031f 100%)' },
  { id: 'jetx', gname: 'JetX', category: 'crash', provider: 'Smartsoft', imgpath: 'jetx.jpg', bg: 'linear-gradient(135deg, #113670 0%, #05142b 100%)' },
  { id: 'teenpatti', gname: 'Teen Patti Live', category: 'live', provider: 'Evolution', imgpath: 'teenpatti.jpg', bg: 'linear-gradient(135deg, #04a1a6 0%, #094749 100%)' },
  { id: 'roulette', gname: 'Gold Roulette', category: 'table', provider: 'Ezugi', imgpath: 'roulette.jpg', bg: 'linear-gradient(135deg, #b8860b 0%, #543d03 100%)' },
  { id: 'baccarat', gname: 'Baccarat Super 6', category: 'table', provider: 'Evolution', imgpath: 'baccarat.jpg', bg: 'linear-gradient(135deg, #8b0000 0%, #3a0000 100%)' },
  { id: 'lucky7', gname: 'Lucky 7', category: 'live', provider: 'BetGames', imgpath: 'lucky7.jpg', bg: 'linear-gradient(135deg, #2e8b57 0%, #103822 100%)' },
  { id: 'cricketx', gname: 'CricketX', category: 'crash', provider: 'Smartsoft', imgpath: 'cricketx.jpg', bg: 'linear-gradient(135deg, #0f696e 0%, #052b2e 100%)' },
  { id: 'dragontiger', gname: 'Dragon Tiger', category: 'table', provider: 'Ezugi', imgpath: 'dragontiger.jpg', bg: 'linear-gradient(135deg, #d2691e 0%, #572906 100%)' },
  { id: 'andarbahar', gname: 'Andar Bahar', category: 'live', provider: 'SuperNowa', imgpath: 'andarbahar.jpg', bg: 'linear-gradient(135deg, #4682b4 0%, #15334d 100%)' },
  { id: 'poker', gname: 'Casino Holdem', category: 'table', provider: 'Evolution', imgpath: 'poker.jpg', bg: 'linear-gradient(135deg, #4b0082 0%, #1f0036 100%)' },
  { id: 'cards32', gname: '32 Cards', category: 'live', provider: 'Ezugi', imgpath: 'cards32.jpg', bg: 'linear-gradient(135deg, #c71585 0%, #540637 100%)' },
  { id: 'matka', gname: 'Worli Matka', category: 'live', provider: 'SuperNowa', imgpath: 'matka.jpg', bg: 'linear-gradient(135deg, #ff4500 0%, #691c00 100%)' }
];

export const RACING_SPORTS = [
  { name: 'Horse Racing', sportId: 7, count: 14, icon: 'fas fa-horse' },
  { name: 'Greyhound Racing', sportId: 43, count: 8, icon: 'fas fa-dog' }
];

export const OTHER_CASINOS = [
  { cname: 'Live Casino', ctype: 4, type: 'LC' },
  { cname: 'Slot Game', ctype: 5, type: 'SLOT' },
  { cname: 'Fantasy Game', ctype: 6, type: 'FANTASY' }
];
