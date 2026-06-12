import type { RowCount } from '$lib/constants/game';
export type { RowCount } from '$lib/constants/game';

export enum BetMode {
  MANUAL = 'MANUAL',
  AUTO = 'AUTO',
}

export enum Currency {
  BTC = 'BTC',
  ETH = 'ETH',
  LTC = 'LTC',
  USD = 'USD',
}

export interface CurrencyMetadata {
  symbol: string;
  label: string;
  decimals: number;
  iconColor: string;
}

/**
 * Game's risk level, which controls the volatility of payout.
 */
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

/**
 * A record of the bet amount associated to every existing ball in the game
 * that is still in motion.
 *
 * When a ball enters a bin, its record is removed.
 */
export type BetAmountOfExistingBalls = {
  [ballId: number]: number;
};

export type WinRecord = {
  /**
   * UUID of the win record.
   */
  id: string;
  /**
   * Which game this record belongs to.
   */
  gameId: 'plinko' | 'crash' | 'mines';
  /**
   * How much the player has bet.
   */
  betAmount: number;
  /**
   * Payout multiplier.
   */
  multiplier: number;
  /**
   * Actual payout amount.
   */
  payout: number;
  /**
   * Payout value minus the bet amount.
   */
  profit: number;
  /**
   * Game-specific data.
   */
  details?: {
    rowCount?: RowCount;
    binIndex?: number;
    mineCount?: number;
    safeCount?: number;
    crashPoint?: number;
  };
};
