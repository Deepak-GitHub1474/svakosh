INDICES: tuple[tuple[str, str, str], ...] = (
    ("NSE:IDX:NIFTY", "NIFTY", "Nifty 50"),
    ("NSE:IDX:BANKNIFTY", "BANKNIFTY", "Nifty Bank"),
    ("NSE:IDX:FINNIFTY", "FINNIFTY", "Nifty Fin Service"),
    ("NSE:IDX:MIDCPNIFTY", "MIDCPNIFTY", "Nifty Midcap Select"),
    ("NSE:IDX:NIFTYNXT50", "NIFTYNXT50", "Nifty Next 50"),
    ("NSE:IDX:INDIAVIX", "INDIAVIX", "India VIX"),
    ("BSE:IDX:SENSEX", "SENSEX", "BSE Sensex"),
    ("BSE:IDX:SENSEX50", "SENSEX50", "BSE Sensex 50"),
    ("BSE:IDX:BANKEX", "BANKEX", "BSE Bankex"),
)

EQUITY_PREFIX = "NSE:EQ:"
FII_DII_DAYS = 5
STALE_AFTER_SECONDS = 120

WS_PROTOCOL = "svakosh.v1"
DEFAULT_FIELDS = frozenset({"ltp", "prev_close"})
FEED_FIELDS = frozenset({
    "ltp", "prev_close", "open", "high", "low", "volume", "atp", "ltq",
    "bid", "bid_qty", "ask", "ask_qty", "total_buy_qty", "total_sell_qty",
    "oi", "prev_oi", "upper_circuit", "lower_circuit", "high_52w", "low_52w", "ts",
})
SUBJECT_UNSAFE_CHARS = frozenset(" .*>")
MAX_TOKENS_PER_SOCKET = 1000
MAX_DEPTH_PER_SOCKET = 5
SEND_QUEUE_LIMIT = 2000
SEARCH_LIMIT = 30
INTRADAY_INTERVAL = "3m"
INTRADAY_LOOKBACK_DAYS = 6

INSTRUMENT_NAMES_MAX = 200

COMPANY_NAMES: dict[str, str] = {
    "NSE:IDX:NIFTY": "NIFTY 50",
    "NSE:IDX:BANKNIFTY": "NIFTY BANK",
    "NSE:IDX:MIDCPNIFTY": "NIFTY MIDCAP SELECT",
    "NSE:IDX:FINNIFTY": "NIFTY FIN SERVICE",
    "NSE:IDX:NIFTYNXT50": "NIFTY NEXT 50",
    "BSE:IDX:SENSEX": "BSE SENSEX",
    "BSE:IDX:BANKEX": "BSE BANKEX",
    "BSE:IDX:SENSEX50": "BSE SENSEX 50",
    "NSE:EQ:ADANIENT": "Adani Enterprises",
    "NSE:EQ:ADANIPORTS": "Adani Ports & SEZ",
    "NSE:EQ:APOLLOHOSP": "Apollo Hospitals",
    "NSE:EQ:ASIANPAINT": "Asian Paints",
    "NSE:EQ:AXISBANK": "Axis Bank",
    "NSE:EQ:BAJAJ-AUTO": "Bajaj Auto",
    "NSE:EQ:BAJFINANCE": "Bajaj Finance",
    "NSE:EQ:BAJAJFINSV": "Bajaj Finserv",
    "NSE:EQ:BEL": "Bharat Electronics",
    "NSE:EQ:BHARTIARTL": "Bharti Airtel",
    "NSE:EQ:CIPLA": "Cipla",
    "NSE:EQ:COALINDIA": "Coal India",
    "NSE:EQ:DRREDDY": "Dr Reddys Laboratories",
    "NSE:EQ:EICHERMOT": "Eicher Motors",
    "NSE:EQ:ETERNAL": "Eternal",
    "NSE:EQ:GRASIM": "Grasim Industries",
    "NSE:EQ:HCLTECH": "HCL Technologies",
    "NSE:EQ:HDFCBANK": "HDFC Bank",
    "NSE:EQ:HDFCLIFE": "HDFC Life Insurance",
    "NSE:EQ:HEROMOTOCO": "Hero Motocorp",
    "NSE:EQ:HINDALCO": "Hindalco Industries",
    "NSE:EQ:HINDUNILVR": "Hindustan Unilever",
    "NSE:EQ:ICICIBANK": "ICICI Bank",
    "NSE:EQ:ITC": "ITC",
    "NSE:EQ:INDUSINDBK": "Indusind Bank",
    "NSE:EQ:INFY": "Infosys",
    "NSE:EQ:JSWSTEEL": "JSW Steel",
    "NSE:EQ:JIOFIN": "Jio Financial Services",
    "NSE:EQ:KOTAKBANK": "Kotak Bank",
    "NSE:EQ:LT": "Larsen & Toubro",
    "NSE:EQ:M&M": "Mahindra & Mahindra",
    "NSE:EQ:MARUTI": "Maruti Suzuki",
    "NSE:EQ:NTPC": "NTPC",
    "NSE:EQ:NESTLEIND": "Nestle",
    "NSE:EQ:ONGC": "Oil & Natural Gas Corporation",
    "NSE:EQ:POWERGRID": "Power Grid Corporation of India",
    "NSE:EQ:RELIANCE": "Reliance Industries",
    "NSE:EQ:SBILIFE": "SBI Life Insurance",
    "NSE:EQ:SHRIRAMFIN": "Shriram Finance",
    "NSE:EQ:SBIN": "State Bank of India",
    "NSE:EQ:SUNPHARMA": "Sun Pharmaceutical",
    "NSE:EQ:TCS": "Tata Consultancy Services",
    "NSE:EQ:TATACONSUM": "Tata Consumer Products",
    "NSE:EQ:TMPV": "Tata Motors Passenger Vehicles",
    "NSE:EQ:TATASTEEL": "Tata Steel",
    "NSE:EQ:TECHM": "Tech Mahindra",
    "NSE:EQ:TITAN": "Titan",
    "NSE:EQ:TRENT": "Trent",
    "NSE:EQ:ULTRACEMCO": "UltraTech Cement",
    "NSE:EQ:WIPRO": "Wipro",
    "NSE:EQ:BANKBARODA": "Bank of Baroda",
    "NSE:EQ:PNB": "Punjab National Bank",
    "NSE:EQ:FEDERALBNK": "Federal Bank",
    "NSE:EQ:IDFCFIRSTB": "IDFC First Bank",
    "NSE:EQ:BANDHANBNK": "Bandhan Bank",
    "NSE:EQ:AUBANK": "AU Small Finance Bank",
}
