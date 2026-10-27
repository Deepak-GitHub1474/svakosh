from __future__ import annotations

import asyncio
import logging

from fastapi import FastAPI

from app.api.endpoints.billing.constants import JOB_INTERVAL_SECONDS, JOB_LOCK_KEY
from app.api.endpoints.billing.lifecycle import reconcile
from app.api.endpoints.billing.setup import ensure_billing_setup

logger = logging.getLogger("svakosh.billing.jobs")


class BillingJobs:
    def __init__(self) -> None:
        self.task: asyncio.Task[None] | None = None

    async def start(self, app: FastAPI) -> None:
        if app.state.mongo_db is None or app.state.redis is None:
            return
        try:
            await ensure_billing_setup(app.state.mongo_db)
        except Exception:
            logger.exception("Billing: setup failed.")
            return
        self.task = asyncio.create_task(self.run(app))

    def stop(self) -> None:
        if self.task is not None:
            self.task.cancel()

    async def run(self, app: FastAPI) -> None:
        while True:
            try:
                if await app.state.redis.set(JOB_LOCK_KEY, "1", nx=True, ex=JOB_INTERVAL_SECONDS - 60):
                    await reconcile(app.state.mongo_db, app.state.redis, app.state.razorpay)
            except Exception:
                logger.exception("Billing: job failed.")
            await asyncio.sleep(JOB_INTERVAL_SECONDS)


billing_jobs = BillingJobs()
