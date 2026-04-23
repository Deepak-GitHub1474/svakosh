export const MAX_PAIN_SYMBOLS = [
    { label: 'NIFTY', value: 'NIFTY' },
    { label: 'BANKNIFTY', value: 'BANKNIFTY' },
    { label: 'FINNIFTY', value: 'FINNIFTY' },
    { label: 'MIDCPNIFTY', value: 'MIDCPNIFTY' },
    { label: 'SENSEX', value: 'SENSEX' },
    { label: 'BANKEX', value: 'BANKEX' }
];

export const MAX_PAIN_EXPIRIES = [
    { label: 'Current Week', value: 'CURRENT_WEEK' },
    { label: 'Next Week', value: 'NEXT_WEEK' },
    { label: 'Far Week', value: 'FAR_WEEK' }
];

export const STRIKE_DIFFERENCES: Record<string, number> = {
    'NIFTY': 50,
    'BANKNIFTY': 100,
    'FINNIFTY': 50,
    'MIDCPNIFTY': 25,
    'SENSEX': 100,
    'BANKEX': 100
};
