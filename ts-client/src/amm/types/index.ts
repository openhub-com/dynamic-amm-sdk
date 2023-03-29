import { AccountInfo, PublicKey, Transaction } from '@solana/web3.js';
import { TokenInfo } from '@solana/spl-token-registry';
import { IdlAccounts, IdlTypes } from '@project-serum/anchor';
import BN from 'bn.js';
import { Amm as AmmIdl } from '../idl';
import { VaultState } from '@mercurial-finance/vault-sdk';
import Decimal from 'decimal.js';

export interface AmmImplementation {
  tokenA: TokenInfo;
  tokenB: TokenInfo;
  decimals: number;
  isStablePool: boolean;
  updateState: () => Promise<void>;
  getPoolTokenMint: () => PublicKey;
  getUserBalance: (owner: PublicKey) => Promise<BN>;
  getLpSupply: () => Promise<BN>;
  getSwapQuote: (inTokenMint: PublicKey, inAmountLamport: BN, slippage: number) => BN;
  swap: (owner: PublicKey, inTokenMint: PublicKey, inAmountLamport: BN, outAmountLamport: BN) => Promise<Transaction>;
  getDepositQuote: (tokenAInAmount: BN, tokenBInAmount: BN, isImbalance: boolean, slippage: number) => DepositQuote;
  deposit: (owner: PublicKey, tokenAInAmount: BN, tokenBInAmount: BN, poolTokenAmount: BN) => Promise<Transaction>;
  getWithdrawQuote: (lpTokenAmount: BN, slippage: number, tokenMint?: PublicKey) => WithdrawQuote;
  withdraw: (
    owner: PublicKey,
    withdrawTokenAmount: BN,
    tokenAOutAmount: BN,
    tokenBOutAmount: BN,
  ) => Promise<Transaction>;
}

export type DepositQuote = {
  poolTokenAmountOut: BN;
  minPoolTokenAmountOut: BN;
  tokenAInAmount: BN;
  tokenBInAmount: BN;
};

export type WithdrawQuote = {
  poolTokenAmountIn: BN;
  minTokenAOutAmount: BN;
  minTokenBOutAmount: BN;
  tokenAOutAmount: BN;
  tokenBOutAmount: BN;
};

export interface SwapResult {
  amountOut: BN;
  priceImpact: Decimal;
  fee: BN;
}

export type AccountsToCache = {
  apyPdaBuffer: AccountInfo<Buffer> | null;
  poolBuffer: AccountInfo<Buffer> | null;
  vaultAPdaBuffer: AccountInfo<Buffer> | null;
  vaultBPdaBuffer: AccountInfo<Buffer> | null;
  vaultAReserveBuffer: AccountInfo<Buffer> | null;
  vaultBReserveBuffer: AccountInfo<Buffer> | null;
  vaultALpMintBuffer: AccountInfo<Buffer> | null;
  vaultBLpMintBuffer: AccountInfo<Buffer> | null;
  poolVaultALpBuffer: AccountInfo<Buffer> | null;
  poolVaultBLpBuffer: AccountInfo<Buffer> | null;
  poolLpMintBuffer: AccountInfo<Buffer> | null;
  marinadeBuffer: AccountInfo<Buffer> | null;
  solidoBuffer: AccountInfo<Buffer> | null;
  clockAccountBuffer: AccountInfo<Buffer> | null;
};

export enum AccountType {
  APY = 'apy',
  VAULT_A_RESERVE = 'vaultAReserve',
  VAULT_B_RESERVE = 'vaultBReserve',
  VAULT_A_LP = 'vaultALp',
  VAULT_B_LP = 'vaultBLp',
  POOL_VAULT_A_LP = 'poolVaultALp',
  POOL_VAULT_B_LP = 'poolVaultBLp',
  POOL_LP_MINT = 'poolLpMint',
  SYSVAR_CLOCK = 'sysClockVar',
}

export type CurveType = ConstantProductCurve | StableSwapCurve;

export type StableSwapCurve = {
  stable: {
    amp: BN;
    tokenMultiplier: TokenMultiplier;
    depeg: Depeg;
  };
};

export type ConstantProductCurve = {
  constantProduct: {};
};

export type DepegNone = {
  none: {};
};

export type DepegMarinade = {
  marinade: {};
};

export type DepegLido = {
  lido: {};
};

export type DepegType = DepegNone | DepegMarinade | DepegLido;

export interface TokenMultiplier {
  tokenAMultiplier: BN;
  tokenBMultiplier: BN;
  precisionFactor: number;
}

export type PoolState = Omit<IdlAccounts<AmmIdl>['pool'], 'curveType' | 'fees'> & {
  curveType: CurveType;
  fees: PoolFees;
};
export type Depeg = Omit<IdlTypes<AmmIdl>['Depeg'], 'depegType'> & { depegType: DepegType };
export type PoolFees = IdlTypes<AmmIdl>['PoolFees'];

export type PoolInformation = {
  tokenAAmount: BN;
  tokenBAmount: BN;
};

export type AccountsInfo = {
  vaultAReserve: BN;
  vaultBReserve: BN;
  vaultALpSupply: BN;
  vaultBLpSupply: BN;
  poolVaultALp: BN;
  poolVaultBLp: BN;
  poolLpSupply: BN;
  currentTime: BN;
};

/** Utils */
export interface ParsedClockState {
  info: {
    epoch: number;
    epochStartTimestamp: number;
    leaderScheduleEpoch: number;
    slot: number;
    unixTimestamp: number;
  };
  type: string;
  program: string;
  space: number;
}

export type SwapQuoteParam = {
  poolState: PoolState;
  vaultA: VaultState;
  vaultB: VaultState;
  poolVaultALp: BN;
  poolVaultBLp: BN;
  vaultALpSupply: BN;
  vaultBLpSupply: BN;
  vaultAReserve: BN;
  vaultBReserve: BN;
  currentTime: number;
  depegAccounts: Map<String, AccountInfo<Buffer>>;
};
