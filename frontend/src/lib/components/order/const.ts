export const TRADE_ICON_BUTTON =
	'inline-flex size-7 items-center justify-center rounded border text-xs font-medium transition-colors cursor-pointer';

export const TRADE_LABEL = 'font-semibold uppercase tracking-[0.12em]';

export const TRADE_BUTTON = {
	BUY: 'border-transparent bg-bullish-solid text-white hover:bg-bullish-solid-hover',
	SELL: 'border-transparent bg-bearish-solid text-white hover:bg-bearish-solid-hover'
} as const;
