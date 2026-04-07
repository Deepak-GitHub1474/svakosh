import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.responses import err_response, extract_request_payload

logger = logging.getLogger("svakosh.error_handlers")


def _dev_mode() -> bool:
    s = get_settings()
    return s.API_ENV.lower() in ("development", "dev", "local")


def _http_fail_message(status_code: int) -> str:
    return {
        400: "Bad request.",
        401: "Unauthorized.",
        403: "Forbidden.",
        404: "Resource not found.",
        405: "Method not allowed.",
        503: "Service unavailable.",
    }.get(status_code, "Request could not be completed.")


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def _validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        errors = exc.errors()
        if not errors:
            reason = "Validation error: invalid request."
        else:
            e0 = errors[0]
            parts = [
                str(x)
                for x in e0.get("loc", ())
                if str(x) not in ("body", "query", "path")
            ]
            loc = " → ".join(parts)
            raw = str(e0.get("msg", "invalid input"))
            reason = f"Validation error: {loc}: {raw}" if loc else f"Validation error: {raw}"
        payload = await extract_request_payload(request, exc)
        logger.warning("Validation failure message=%s payload=%r", reason, payload)
        return JSONResponse(
            status_code=422,
            content=err_response(
                reason,
                data=None,
            ),
        )

    @app.exception_handler(HTTPException)
    async def _http_error(request: Request, exc: HTTPException) -> JSONResponse:
        payload = await extract_request_payload(request)
        detail = exc.detail
        msg = _http_fail_message(exc.status_code)
        logger.warning(
            "HTTP exception status=%s detail=%r payload=%r",
            exc.status_code,
            detail,
            payload,
        )
        if isinstance(detail, str):
            content = err_response(detail, data=None)
        else:
            content = err_response(
                msg,
                data=detail,
            )
        return JSONResponse(status_code=exc.status_code, content=content)

    @app.exception_handler(Exception)
    async def _unhandled_error(request: Request, exc: Exception) -> JSONResponse:
        logger.error(
            "Unhandled error.\nReason: %s: %s",
            type(exc).__name__,
            exc,
            exc_info=exc,
        )
        reason = (
            f"{type(exc).__name__}: {exc}"
            if _dev_mode()
            else "Something went wrong. Try again later."
        )
        payload = await extract_request_payload(request)
        logger.error("Unhandled request error message=%s payload=%r", reason, payload)
        return JSONResponse(
            status_code=500,
            content=err_response(
                reason,
                data=None,
            ),
        )
