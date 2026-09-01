"""Application settings loaded from environment / .env file."""

from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Database ──
    database_url: str = "postgresql+asyncpg://promarket:promarket@localhost:5433/promarket"
    database_url_sync: str = "postgresql://promarket:promarket@localhost:5433/promarket"

    # ── Firebase Admin ──
    firebase_project_id: str = ""
    firebase_client_email: str = ""
    firebase_private_key: str = ""

    # ── CORS ──
    cors_origins: list[str] = ["http://localhost:3000"]

    # ── Debug ──
    debug: bool = False

    @field_validator("firebase_private_key", mode="before")
    @classmethod
    def _unescape_newlines(cls, v: str) -> str:
        """Firebase private keys are often stored with literal \\n — convert them."""
        if isinstance(v, str):
            return v.replace("\\n", "\n")
        return v

    @field_validator("database_url", mode="before")
    @classmethod
    def _force_asyncpg_driver(cls, v: str) -> str:
        """.env commonly carries a bare postgresql:// URL shared with Prisma —
        force the asyncpg driver so the async engine doesn't fall back to psycopg2,
        and strip Prisma-only query params (e.g. ?schema=public) that asyncpg's
        connect() doesn't understand as a keyword argument."""
        if not isinstance(v, str):
            return v
        if v.startswith("postgresql://"):
            v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
        parts = urlsplit(v)
        query = [(k, val) for k, val in parse_qsl(parts.query) if k != "schema"]
        return urlunsplit(parts._replace(query=urlencode(query)))


settings = Settings()
