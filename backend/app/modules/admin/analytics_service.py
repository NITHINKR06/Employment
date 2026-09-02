"""Admin analytics — aggregates over existing tables. Read-only, no own table."""

from sqlalchemy import func as sa_func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ForbiddenError
from app.modules.bookings.models import Booking
from app.modules.payments.models import Payment, PaymentStatus
from app.modules.professionals.models import Professional
from app.modules.users.models import User


def _assert_admin(admin_user: User) -> None:
    if admin_user.role.value != "ADMIN":
        raise ForbiddenError()


async def get_platform_analytics(db: AsyncSession, admin_user: User) -> dict:
    _assert_admin(admin_user)

    total_users = (await db.execute(select(sa_func.count(User.id)))).scalar_one()
    total_professionals = (await db.execute(select(sa_func.count(Professional.id)))).scalar_one()
    total_bookings = (await db.execute(select(sa_func.count(Booking.id)))).scalar_one()
    total_revenue = (
        await db.execute(
            select(sa_func.coalesce(sa_func.sum(Payment.amount), 0)).where(
                Payment.status == PaymentStatus.PAID
            )
        )
    ).scalar_one()

    return {
        "totalUsers": total_users,
        "totalProfessionals": total_professionals,
        "totalBookings": total_bookings,
        "totalRevenue": float(total_revenue),
    }
