COL_PLANS = "plans"
COL_SUBSCRIPTIONS = "subscriptions"
COL_PAYMENTS = "payments"
COL_PAYMENT_EVENTS = "payment_events"
COL_COUPONS = "coupons"
COL_COUPON_REDEMPTIONS = "coupon_redemptions"
COL_USERS = "users"

TENURE_MONTHS = {"monthly": 1, "quarterly": 3, "annually": 12}
TOTAL_CYCLES = {"monthly": 120, "quarterly": 40, "annually": 10}

PLAN_ANALYTICS = "analytics"
PLAN_BROKER = "broker"

STATUS_PENDING = "pending"
STATUS_ACTIVE = "active"
STATUS_CANCELLED = "cancelled"
STATUS_EXPIRED = "expired"
STATUS_FAILED = "failed"
VALID_STATUSES = (STATUS_ACTIVE, STATUS_CANCELLED)

PROVIDER_RAZORPAY = "razorpay"
PROVIDER_FREE = "free"

COUPON_OFFER = "offer"
COUPON_REFERRAL = "referral"
COUPON_FLOOR_PAISE = 1000

TRIAL_TENURE = "monthly"
TRIAL_NOTE = "1"

REFERRAL_WINDOW_DAYS = 30
REFERRAL_DISCOUNT_PERCENT = 10
REFERRAL_REWARD_PERCENT = 10
REFERRAL_MAX_USES = 50

PENDING_REUSE_MINUTES = 30
PENDING_SYNC_MINUTES = 30
RENEWAL_GRACE_HOURS = 24
EVENT_RETRY_AFTER_SECONDS = 120

JOB_INTERVAL_SECONDS = 3600
JOB_LOCK_KEY = "billing:job"
ENTITLEMENT_CACHE_SECONDS = 60
ENTITLEMENT_CACHE_KEY = "billing:entitlements:{}"

DEFAULT_PLANS = (
    {
        "code": "premium",
        "name": "Premium Analytics",
        "type": PLAN_ANALYTICS,
        "description": "Premium analytics tools",
        "features": ["option_chain", "oi_tracker", "stocks_screener"],
        "prices": [
            {"tenure": "monthly", "broker": None, "ip": None, "price_paise": 49900, "provider_plan_id": None},
            {"tenure": "quarterly", "broker": None, "ip": None, "price_paise": 134900, "provider_plan_id": None},
            {"tenure": "annually", "broker": None, "ip": None, "price_paise": 499900, "provider_plan_id": None},
        ],
    },
    {
        "code": "broker_account",
        "name": "Broker Account",
        "type": PLAN_BROKER,
        "description": "Place orders from one linked broker account",
        "features": ["trading"],
        "ip_brokers": {"ipv6": []},
        "prices": [
            {"tenure": "monthly", "broker": None, "ip": "ipv4", "price_paise": 49900, "provider_plan_id": None},
            {"tenure": "quarterly", "broker": None, "ip": "ipv4", "price_paise": 134900, "provider_plan_id": None},
            {"tenure": "annually", "broker": None, "ip": "ipv4", "price_paise": 499900, "provider_plan_id": None},
            {"tenure": "monthly", "broker": None, "ip": "ipv6", "price_paise": 29900, "provider_plan_id": None},
            {"tenure": "quarterly", "broker": None, "ip": "ipv6", "price_paise": 79900, "provider_plan_id": None},
            {"tenure": "annually", "broker": None, "ip": "ipv6", "price_paise": 299900, "provider_plan_id": None},
        ],
    },
)
