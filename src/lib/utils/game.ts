import { LOCAL_STORAGE_KEY } from '$lib/constants/game';
import { balance, balances, selectedCurrency } from '$lib/stores/game';
import { get } from 'svelte/store';
import { Currency } from '$lib/types';

export function setBalanceFromLocalStorage() {
  const rawCurrency = window.localStorage.getItem(LOCAL_STORAGE_KEY.CURRENCY);
  if (rawCurrency && Object.values(Currency).includes(rawCurrency as Currency)) {
    selectedCurrency.set(rawCurrency as Currency);
  }

  const rawBalances = window.localStorage.getItem(LOCAL_STORAGE_KEY.BALANCES);
  if (rawBalances) {
    try {
      const parsedBalances = JSON.parse(rawBalances);
      balances.set(parsedBalances);
      
      const currency = get(selectedCurrency);
      if (parsedBalances[currency] !== undefined) {
        balance.set(parsedBalances[currency]);
      }
    } catch (e) {
      console.error('Failed to parse balances from local storage', e);
    }
  }
}

export function writeBalanceToLocalStorage() {
  const currencyVal = get(selectedCurrency);
  window.localStorage.setItem(LOCAL_STORAGE_KEY.CURRENCY, currencyVal);

  const balancesVal = get(balances);
  window.localStorage.setItem(LOCAL_STORAGE_KEY.BALANCES, JSON.stringify(balancesVal));
}
