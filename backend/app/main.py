"""FastAPI application entrypoint.

- Registers CORS middleware
- Mounts all module routers under /api/v1/
- Registers global error handlers
- Provides a health check endpoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.errors import AppError
from app.core.response import app_error_handler, unhandled_error_handler

from app.modules.users.router import router as users_router
from app.modules.professionals.router import router as professionals_router
from app.modules.bookings.router import router as bookings_router
from app.modules.payments.router import router as payments_router
from app.modules.reviews.router import router as reviews_router

app = FastAPI(
    title="ProMarket API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    # credentials not needed — we use Bearer token, not cookies
)

# ── Error handlers ──
app.add_exception_handler(AppError, app_error_handler)  # type: ignore[arg-type]
app.add_exception_handler(Exception, unhandled_error_handler)  # type: ignore[arg-type]

# ── Routers ──
API_V1 = "/api/v1"
app.include_router(users_router, prefix=API_V1)
app.include_router(professionals_router, prefix=API_V1)
app.include_router(bookings_router, prefix=API_V1)
app.include_router(payments_router, prefix=API_V1)
app.include_router(reviews_router, prefix=API_V1)


# ── Health check ──
@app.get("/api/v1/health", tags=["system"])
async def health_check():
    return {"status": "ok"}
