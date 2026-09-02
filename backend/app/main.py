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
from app.modules.notifications.router import router as notifications_router
from app.modules.contact.router import router as contact_router
from app.modules.settings.router import router as settings_router
from app.modules.categories.router import router as categories_router
from app.modules.favorites.router import router as favorites_router
from app.modules.geocoding.router import router as geocoding_router
from app.modules.availability.router import router as availability_router
from app.modules.booking_lifecycle.router import router as booking_lifecycle_router
from app.modules.push.router import router as push_router
from app.modules.review_response.router import router as review_response_router
from app.modules.disputes.router import router as disputes_router
from app.modules.verification.router import router as verification_router

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
app.include_router(notifications_router, prefix=API_V1)
app.include_router(contact_router, prefix=API_V1)
app.include_router(settings_router, prefix=API_V1)
app.include_router(categories_router, prefix=API_V1)
app.include_router(favorites_router, prefix=API_V1)
app.include_router(geocoding_router, prefix=API_V1)
app.include_router(availability_router, prefix=API_V1)
app.include_router(booking_lifecycle_router, prefix=API_V1)
app.include_router(push_router, prefix=API_V1)
app.include_router(review_response_router, prefix=API_V1)
app.include_router(disputes_router, prefix=API_V1)
app.include_router(verification_router, prefix=API_V1)


# ── Health check ──
@app.get("/api/v1/health", tags=["system"])
async def health_check():
    return {"status": "ok"}
