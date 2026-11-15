export const MAP_DATA = {
  name: 'Foundry Yard',
  spawns: {
    vanguard: { x: 0, y: 1.6, z: -35 },
    sentinel: { x: 0, y: 1.6, z: 35 }
  },
  sites: {
    A: { name: 'Furnace', center: { x: 22, y: 0, z: 25 }, radius: 6 },
    B: { name: 'Crane Yard', center: { x: -22, y: 0, z: 25 }, radius: 6 }
  },
  // AABB Colliders: { min: [x,y,z], max: [x,y,z] }
  colliders: [
    // Outer walls
    { min: [-45, 0, -45], max: [45, 10, -43] }, // South wall
    { min: [-45, 0, 43], max: [45, 10, 45] },   // North wall
    { min: [-45, 0, -45], max: [-43, 10, 45] }, // West wall
    { min: [43, 0, -45], max: [45, 10, 45] },   // East wall

    // Mid dividing walls / structures
    { min: [-5, 0, -10], max: [5, 8, 10] },     // Center warehouse
    { min: [-30, 0, -5], max: [-15, 6, 5] },    // West connector block
    { min: [15, 0, -5], max: [30, 6, 5] },      // East connector block

    // Crates & Containers (Sightline blockers & cover)
    { min: [-28, 0, -20], max: [-22, 3, -16] }, // Container W1
    { min: [22, 0, -20], max: [28, 3, -16] },   // Container E1
    { min: [-8, 0, -25], max: [-2, 2.5, -22] }, // Crate Mid S
    { min: [2, 0, 20], max: [8, 2.5, 23] },     // Crate Mid N

    // Site A containers & structures (Furnace)
    { min: [16, 0, 18], max: [22, 4, 22] },
    { min: [24, 0, 28], max: [30, 4, 32] },

    // Site B containers & structures (Crane Yard)
    { min: [-30, 0, 18], max: [-24, 4, 22] },
    { min: [-22, 0, 28], max: [-16, 4, 32] }
  ],
  // Waypoint graph for bot AI navigation
  waypoints: [
    { id: 0, pos: { x: 0, y: 0, z: -30 }, neighbors: [1, 2, 3] },
    { id: 1, pos: { x: -20, y: 0, z: -20 }, neighbors: [0, 4, 6] },
    { id: 2, pos: { x: 0, y: 0, z: -10 }, neighbors: [0, 5, 7] },
    { id: 3, pos: { x: 20, y: 0, z: -20 }, neighbors: [0, 5, 8] },
    { id: 4, pos: { x: -25, y: 0, z: 0 }, neighbors: [1, 6, 9] },
    { id: 5, pos: { x: 0, y: 0, z: 0 }, neighbors: [2, 7, 10] },
    { id: 6, pos: { x: -12, y: 0, z: -5 }, neighbors: [1, 4, 5] },
    { id: 7, pos: { x: 12, y: 0, z: -5 }, neighbors: [2, 3, 5] },
    { id: 8, pos: { x: 25, y: 0, z: 0 }, neighbors: [3, 7, 11] },
    { id: 9, pos: { x: -25, y: 0, z: 15 }, neighbors: [4, 12, 14] },
    { id: 10, pos: { x: 0, y: 0, z: 15 }, neighbors: [5, 13, 14] },
    { id: 11, pos: { x: 25, y: 0, z: 15 }, neighbors: [8, 13, 15] },
    { id: 12, pos: { x: -22, y: 0, z: 25 }, neighbors: [9, 14, 'B'] }, // Site B
    { id: 13, pos: { x: 22, y: 0, z: 25 }, neighbors: [10, 15, 'A'] }, // Site A
    { id: 14, pos: { x: -10, y: 0, z: 30 }, neighbors: [9, 10, 12] },
    { id: 15, pos: { x: 10, y: 0, z: 30 }, neighbors: [10, 11, 13] }
  ]
};
