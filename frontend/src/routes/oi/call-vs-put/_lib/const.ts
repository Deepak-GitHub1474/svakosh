export const symbols = [
    { label: 'NIFTY', value: 'NIFTY' },
    { label: 'BANKNIFTY', value: 'BANKNIFTY' },
    { label: 'FINNIFTY', value: 'FINNIFTY' },
    { label: 'MIDCPNIFTY', value: 'MIDCPNIFTY' },
    { label: 'SENSEX', value: 'SENSEX' },
    { label: 'BANKEX', value: 'BANKEX' }
];

export const expiries = [
    { label: 'Current Week', value: 'CURRENT_WEEK' },
    { label: 'Next Week', value: 'NEXT_WEEK' },
    { label: 'Next To Next Week', value: 'NEXT_TO_NEXT_WEEK' }
];

export const strikeDifferences: Record<string, number> = {
    NIFTY: 50,
    BANKNIFTY: 100,
    FINNIFTY: 50,
    MIDCPNIFTY: 25,
    BANKEX: 100,
    SENSEX: 100
};