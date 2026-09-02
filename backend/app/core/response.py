"""Consistent JSON response envelope and global exception handler.

Port of src/server/utils/apiResponse.js — every response is wrapped in
{"success": true/false, "data": ..., "error": ...} for frontend consistency.
"""

import logging
from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.errors import AppError

logger = logging.getLogger(__name__)


def success_response(data: Any, status_code: int = 200) -> JSONResponse:
    return JSONResponse(
        content={"success": True, "data": data},
        status_code=status_code,
    )


async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
    """Global exception handler registered on the FastAPI app."""
    return JSONResponse(
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            },
        },
        status_code=exc.status_code,
    )


async def unhandled_error_handler(_request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions — logs the traceback, returns 500."""
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Something went wrong",
            },
        },
        status_code=500,
    )
