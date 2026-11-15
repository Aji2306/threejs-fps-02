export const WEAPONS = {
  p2000: {
    id: 'p2000',
    name: 'P2000 Sidearm',
    type: 'pistol',
    price: 0,
    damage: 32,
    range: 100,
    fireRate: 4, // shots per sec
    magSize: 13,
    reserve: 52,
    reloadTime: 2.0,
    spread: 0.02,
    moveSpeedMult: 1.0,
    isAutomatic: false
  },
  vk9: {
    id: 'vk9',
    name: 'VK-9 SMG',
    type: 'smg',
    price: 900,
    damage: 24,
    range: 60,
    fireRate: 10,
    magSize: 25,
    reserve: 100,
    reloadTime: 2.2,
    spread: 0.035,
    moveSpeedMult: 0.95,
    isAutomatic: true
  },
  ar77: {
    id: 'ar77',
    name: 'AR-77 Rifle',
    type: 'rifle',
    price: 2500,
    damage: 36,
    range: 150,
    fireRate: 9,
    magSize: 30,
    reserve: 90,
    reloadTime: 2.5,
    spread: 0.015,
    moveSpeedMult: 0.88,
    isAutomatic: true
  },
  m590: {
    id: 'm590',
    name: 'M590 Shotgun',
    type: 'shotgun',
    price: 1800,
    damage: 18, // per pellet (8 pellets)
    range: 25,
    fireRate: 1.5,
    magSize: 6,
    reserve: 24,
    reloadTime: 0.6, // per shell
    spread: 0.08,
    moveSpeedMult: 0.90,
    isAutomatic: false,
    pellets: 8
  },
  lr50: {
    id: 'lr50',
    name: 'LR-50 Marksman',
    type: 'sniper',
    price: 3200,
    damage: 105, // one shot chest/head
    range: 250,
    fireRate: 0.9,
    magSize: 5,
    reserve: 15,
    reloadTime: 3.0,
    spread: 0.005,
    moveSpeedMult: 0.80,
    isAutomatic: false,
    hasScope: true
  }
};

export const GEAR = {
  kevlar: { id: 'kevlar', name: 'Kevlar Vest', price: 650, armor: 50 },
  frag: { id: 'frag', name: 'FRAG-6 Grenade', price: 300 },
  smoke: { id: 'smoke', name: 'Smoke Grenade', price: 250 }
};
