from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

import sys
import os

# Add app to PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../app")

# Import Base from your project
from app.config.database import Base
from app.models import user, contest  # import all models here

# Load settings
from app.config.database import DATABASE_URL  # the asyncpg URL

# Alembic Config
config = context.config
fileConfig(config.config_file_name)

# Override URL in alembic.ini with the one from config
config.set_main_option("sqlalchemy.url", DATABASE_URL.replace("asyncpg", "psycopg2"))

target_metadata = Base.metadata


def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online():
    """Run migrations in 'online' mode with async engine."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)


if context.is_offline_mode():
    run_migrations_offline()
else:
    import asyncio
    asyncio.run(run_migrations_online())
