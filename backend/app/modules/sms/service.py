"""SMS business logic — no router; called internally by bookings/contact."""

from app.core.config import settings
from app.modules.sms import templates
from app.modules.sms.client import get_client


async def send_booking_confirmed(phone: str | None, *, name: str, date: str, time: str) -> None:
    if not phone:
        return
    await get_client().send(phone, templates.booking_confirmed(name=name, date=date, time=time))


async def send_booking_reminder(phone: str | None, *, name: str, date: str, time: str) -> None:
    if not phone:
        return
    await get_client().send(phone, templates.booking_reminder(name=name, date=date, time=time))


async def send_booking_status_changed(phone: str | None, *, name: str, status: str) -> None:
    if not phone:
        return
    await get_client().send(phone, templates.booking_status_changed(name=name, status=status))
