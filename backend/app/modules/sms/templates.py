"""SMS message templates."""


def booking_confirmed(*, name: str, date: str, time: str) -> str:
    return f"Hi {name}, your ProMarket booking on {date} at {time} is confirmed."


def booking_reminder(*, name: str, date: str, time: str) -> str:
    return f"Reminder: {name}, your ProMarket booking is coming up on {date} at {time}."


def booking_status_changed(*, name: str, status: str) -> str:
    return f"Hi {name}, your ProMarket booking status changed to {status}."
