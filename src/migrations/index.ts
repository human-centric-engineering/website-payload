import * as migration_20251205_160143 from './20251205_160143';
import * as migration_20251210_115406 from './20251210_115406';

export const migrations = [
  {
    up: migration_20251205_160143.up,
    down: migration_20251205_160143.down,
    name: '20251205_160143',
  },
  {
    up: migration_20251210_115406.up,
    down: migration_20251210_115406.down,
    name: '20251210_115406'
  },
];
