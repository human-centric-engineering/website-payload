import * as migration_20251205_160143 from './20251205_160143';

export const migrations = [
  {
    up: migration_20251205_160143.up,
    down: migration_20251205_160143.down,
    name: '20251205_160143'
  },
];
