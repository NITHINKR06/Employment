"""Python Data Seeder for ProMarket.

Populates initial seed data (4 professionals, services, skills, badges, portfolio images)
into the Python database (`promarket_py`).
"""

import asyncio
import logging
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import async_session_factory
import app.modules.bookings.models  # noqa: F401
import app.modules.contact.models  # noqa: F401
import app.modules.notifications.models  # noqa: F401
import app.modules.payments.models  # noqa: F401
from app.modules.professionals.models import (
    PortfolioImage,
    Professional,
    ProfessionalSkill,
    Service,
    Skill,
    TrustBadge,
)
import app.modules.reviews.models  # noqa: F401
from app.modules.users.models import Role, User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")


def avatar_url(name: str) -> str:
    encoded = name.replace(" ", "%20")
    return f"https://ui-avatars.com/api/?name={encoded}&background=006948&color=fff&size=256&bold=true"


def portfolio_urls(seed_prefix: str, count: int = 3) -> list[str]:
    return [f"https://picsum.photos/seed/{seed_prefix}-{i}/640/480" for i in range(count)]


SEED_PROFESSIONALS = [
    {
        "email": "arjun.rao@promarket.dev",
        "name": "Arjun Rao",
        "title": "Master Plumber",
        "trade": "Plumbing",
        "yearsExperience": 12,
        "ratingAvg": 4.9,
        "reviewCount": 214,
        "hourlyRate": 45.0,
        "verified": True,
        "location": "Bangalore, IN",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "availability": "Available Today",
        "skills": ["Pipe Repair", "Leak Detection"],
        "bio": "Arjun has spent over a decade solving plumbing problems for homes and small businesses across the city, known for clean work and honest quotes.",
        "trustBadges": ["Licensed & Insured", "Background Checked", "Emergency Service"],
        "servicesOffered": [
            {"title": "Leak Repair", "subtext": "Fixes for pipes, faucets, and fixtures"},
            {"title": "Drain Cleaning", "subtext": "Clog removal and maintenance"},
            {"title": "Water Heater Install", "subtext": "New unit setup and replacement"},
            {"title": "Emergency Plumbing", "subtext": "Same-day response for urgent issues"},
        ],
    },
    {
        "email": "priya.menon@promarket.dev",
        "name": "Priya Menon",
        "title": "Interior Painter",
        "trade": "Painting",
        "yearsExperience": 7,
        "ratingAvg": 4.8,
        "reviewCount": 132,
        "hourlyRate": 35.0,
        "verified": True,
        "location": "Bangalore, IN",
        "latitude": 12.9352,
        "longitude": 77.6245,
        "availability": "Available Tomorrow",
        "skills": ["Interior Painting", "Wall Prep"],
        "bio": "Priya brings a designer's eye to every painting job, specializing in clean lines, color consulting, and durable finishes for homes.",
        "trustBadges": ["Licensed & Insured", "Background Checked"],
        "servicesOffered": [
            {"title": "Interior Painting", "subtext": "Living rooms, bedrooms, ceilings"},
            {"title": "Wall Prep & Repair", "subtext": "Filling, sanding, priming"},
            {"title": "Color Consulting", "subtext": "Help choosing the right palette"},
        ],
    },
    {
        "email": "vikram.shah@promarket.dev",
        "name": "Vikram Shah",
        "title": "Licensed Electrician",
        "trade": "Electrical",
        "yearsExperience": 9,
        "ratingAvg": 4.7,
        "reviewCount": 98,
        "hourlyRate": 50.0,
        "verified": True,
        "location": "Bangalore, IN",
        "latitude": 12.9784,
        "longitude": 77.6408,
        "availability": "Available Today",
        "skills": ["Wiring", "Fixture Install"],
        "bio": "Vikram handles everything from a single outlet swap to a full rewiring job, with a strong focus on safety and code compliance.",
        "trustBadges": ["Licensed & Insured", "Background Checked", "Emergency Service"],
        "servicesOffered": [
            {"title": "Outlet Installation", "subtext": "New outlets and switches"},
            {"title": "Light Fixture Install", "subtext": "Ceiling fans, fixtures, dimmers"},
            {"title": "Panel Upgrades", "subtext": "Breaker panel replacement"},
        ],
    },
    {
        "email": "meera.das@promarket.dev",
        "name": "Meera Das",
        "title": "House Cleaning Specialist",
        "trade": "Cleaning",
        "yearsExperience": 5,
        "ratingAvg": 4.9,
        "reviewCount": 176,
        "hourlyRate": 28.0,
        "verified": True,
        "location": "Bangalore, IN",
        "latitude": 12.9165,
        "longitude": 77.6101,
        "availability": "Available This Week",
        "skills": ["Deep Cleaning", "Move-out Cleaning"],
        "bio": "Meera leads a small, trusted cleaning team known for thorough, reliable service and flexible scheduling.",
        "trustBadges": ["Background Checked"],
        "servicesOffered": [
            {"title": "Standard Cleaning", "subtext": "Weekly or bi-weekly upkeep"},
            {"title": "Deep Cleaning", "subtext": "Top-to-bottom one-time clean"},
            {"title": "Move-out Cleaning", "subtext": "Full clean for move-in/move-out"},
        ],
    },
]


async def seed_database(db: AsyncSession):
    for index, entry in enumerate(SEED_PROFESSIONALS):
        firebase_uid = f"seed-{index + 1}"

        # 1. Upsert User
        stmt = select(User).where(User.email == entry["email"])
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()

        if user is None:
            user = User(
                firebase_uid=firebase_uid,
                email=entry["email"],
                name=entry["name"],
                role=Role.EMPLOYEE,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        # 2. Upsert Professional
        stmt = select(Professional).where(Professional.user_id == user.id)
        res = await db.execute(stmt)
        professional = res.scalar_one_or_none()

        if professional is None:
            professional = Professional(
                user_id=user.id,
                title=entry["title"],
                trade=entry["trade"],
                years_experience=entry["yearsExperience"],
                hourly_rate=Decimal(str(entry["hourlyRate"])),
                bio=entry["bio"],
                location=entry["location"],
                latitude=Decimal(str(entry["latitude"])),
                longitude=Decimal(str(entry["longitude"])),
                avatar=avatar_url(entry["name"]),
                verified=entry["verified"],
                availability=entry["availability"],
                rating_avg=Decimal(str(entry["ratingAvg"])),
                review_count=entry["reviewCount"],
            )
            db.add(professional)
            await db.commit()
            await db.refresh(professional)
        else:
            professional.latitude = Decimal(str(entry["latitude"]))
            professional.longitude = Decimal(str(entry["longitude"]))
            await db.commit()

        # 3. Skills
        for skill_name in entry["skills"]:
            stmt = select(Skill).where(Skill.name == skill_name)
            res = await db.execute(stmt)
            skill = res.scalar_one_or_none()
            if skill is None:
                skill = Skill(name=skill_name)
                db.add(skill)
                await db.commit()
                await db.refresh(skill)

            stmt = select(ProfessionalSkill).where(
                ProfessionalSkill.professional_id == professional.id,
                ProfessionalSkill.skill_id == skill.id,
            )
            res = await db.execute(stmt)
            ps = res.scalar_one_or_none()
            if ps is None:
                db.add(ProfessionalSkill(professional_id=professional.id, skill_id=skill.id))
                await db.commit()

        # 4. Trust Badges
        for label in entry["trustBadges"]:
            stmt = select(TrustBadge).where(
                TrustBadge.professional_id == professional.id,
                TrustBadge.label == label,
            )
            res = await db.execute(stmt)
            if res.scalar_one_or_none() is None:
                db.add(TrustBadge(professional_id=professional.id, label=label))
                await db.commit()

        # 5. Portfolio Images
        prefix = entry["email"].split("@")[0]
        for url in portfolio_urls(prefix):
            stmt = select(PortfolioImage).where(
                PortfolioImage.professional_id == professional.id,
                PortfolioImage.url == url,
            )
            res = await db.execute(stmt)
            if res.scalar_one_or_none() is None:
                db.add(PortfolioImage(professional_id=professional.id, url=url))
                await db.commit()

        # 6. Services Offered
        for s in entry["servicesOffered"]:
            stmt = select(Service).where(
                Service.professional_id == professional.id,
                Service.title == s["title"],
            )
            res = await db.execute(stmt)
            if res.scalar_one_or_none() is None:
                db.add(Service(professional_id=professional.id, title=s["title"], subtext=s["subtext"]))
                await db.commit()

        logger.info("Seeded professional: %s", entry['name'])


async def main():
    async with async_session_factory() as db:
        await seed_database(db)
    logger.info("Database seeding complete!")


if __name__ == "__main__":
    asyncio.run(main())
