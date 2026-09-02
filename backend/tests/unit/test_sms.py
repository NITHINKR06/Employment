"""Tests for modules/sms — templates and gateway failure isolation."""

from unittest.mock import AsyncMock

import httpx
import pytest

from app.modules.sms import service, templates
from app.modules.sms.client import SmsGatewayClient


def test_booking_confirmed_template_fills_placeholders():
    rendered = templates.booking_confirmed(name="Alex", date="2026-03-01", time="2:00 PM")
    assert "Alex" in rendered
    assert "2026-03-01" in rendered
    assert "2:00 PM" in rendered


def test_booking_reminder_template_fills_placeholders():
    rendered = templates.booking_reminder(name="Alex", date="2026-03-01", time="2:00 PM")
    assert "Alex" in rendered
    assert "2026-03-01" in rendered
    assert "2:00 PM" in rendered


def test_booking_status_changed_template_fills_placeholders():
    rendered = templates.booking_status_changed(name="Alex", status="Confirmed")
    assert "Alex" in rendered
    assert "Confirmed" in rendered


@pytest.mark.asyncio
async def test_gateway_network_failure_is_caught_and_reported_false(monkeypatch):
    """A gateway failure must never raise up into the calling booking/contact flow."""
    client = SmsGatewayClient(gateway_url="https://sms.example.test/send", api_key="k")
    monkeypatch.setattr(client, "_post", AsyncMock(side_effect=httpx.ConnectError("boom")))

    result = await client.send("+15551234567", "hello")

    assert result is False


@pytest.mark.asyncio
async def test_send_booking_confirmed_never_raises_when_client_fails(monkeypatch):
    monkeypatch.setattr(service, "get_client", lambda: AsyncMock(send=AsyncMock(return_value=False)))
    # Should not raise even though the underlying send "fails".
    await service.send_booking_confirmed("+15551234567", name="Alex", date="2026-03-01", time="2:00 PM")
