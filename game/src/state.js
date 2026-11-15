export const state = {
  phase: 'menu', // 'menu', 'buy', 'active', 'ended'
  roundTime: 100, // seconds remaining in round
  buyTime: 15,    // seconds remaining in buy phase
  roundNumber: 1,
  scores: { vanguard: 0, sentinel: 0 },
  maxWins: 5,
  
  player: {
    id: 'player',
    team: 'vanguard',
    pos: { x: 0, y: 0, z: 0 },
    vel: { x: 0, y: 0, z: 0 },
    rot: { yaw: 0, pitch: 0 },
    hp: 100,
    armor: 0,
    money: 800,
    alive: true,
    weapon: 'p2000',
    inventory: {
      p2000: { mag: 13, reserve: 52 },
      vk9: { mag: 0, reserve: 0 },
      ar77: { mag: 0, reserve: 0 },
      m590: { mag: 0, reserve: 0 },
      lr50: { mag: 0, reserve: 0 }
    },
    gear: { kevlar: false, frag: 0, smoke: 0 },
    isCrouching: false,
    isGrounded: true,
    hasBomb: false
  },

  bots: [], // array of bot objects

  bomb: {
    planted: false,
    site: null, // 'A' or 'B'
    timer: 35.0, // fuse
    planter: null,
    defusing: false,
    defuseProgress: 0, // 0 to 5 seconds
    planting: false,
    plantProgress: 0   // 0 to 3 seconds
  },

  roundResult: {
    winner: null, // 'vanguard', 'sentinel', or null
    reason: ''    // 'elimination', 'detonation', 'defusal', 'timeout'
  },

  killFeed: [], // recent kills { killer, victim, weapon }
  tracers: [],  // active bullet tracers { start, end, alpha }
  particles: [],// visual particles
  grenades: []  // active grenades in flight / smoke
};
