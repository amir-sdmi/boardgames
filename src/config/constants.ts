const PLAYER_LIMITS = {
  MIN: 1,
  MAX: 7,
} as const;

const PRICES = {
  cards: 1,
  tractor: 2,
  manure: 2,
  field: 3,
} as const;

const MIN_HARVEST_QUANTITY = 2 as const;
const MAX_ROUND = 3 as const;
const CARDS_TO_SHOW_IN_MARKET = 2 as const;
export {
  PLAYER_LIMITS,
  PRICES,
  MIN_HARVEST_QUANTITY,
  MAX_ROUND,
  CARDS_TO_SHOW_IN_MARKET,
};
