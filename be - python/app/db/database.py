from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from sqlalchemy import text
from app.db.base_class import Base
import importlib
import logging
from sqlalchemy.orm import configure_mappers

logger = logging.getLogger(__name__)

# Import all models để SQLAlchemy discover chúng
def import_models():
    importlib.import_module('app.models.user')
    importlib.import_module('app.models.role')
    importlib.import_module('app.models.clinic')
    importlib.import_module('app.models.doctor_user')
    importlib.import_module('app.models.patient')
    importlib.import_module('app.models.patient_schedule')
    importlib.import_module('app.models.schedule')
    importlib.import_module('app.models.specialization')

# Import models trước khi tạo metadata
import_models()

# Configure mappers with eager loading
configure_mappers()

# Create async engine cho PostgreSQL
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,
    future=True,
    pool_pre_ping=True,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW
)

# Tạo async session với eager loading
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False  # Tắt autoflush để tăng performance
)

# Dependency để get database session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            await session.execute(text(f'SET search_path TO {settings.POSTGRES_SCHEMA}'))
            yield session
            await session.commit()
        except Exception as e:
            logger.error(f"Database error: {str(e)}")
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    try:
        async with engine.begin() as conn:
            # Tạo schema nếu chưa tồn tại
            logger.info(f"Creating schema {settings.POSTGRES_SCHEMA} if not exists...")
            await conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS {settings.POSTGRES_SCHEMA}'))
            
            # Set search_path
            logger.info(f"Setting search_path to {settings.POSTGRES_SCHEMA}...")
            await conn.execute(text(f'SET search_path TO {settings.POSTGRES_SCHEMA}'))
            
            # Tạo các bảng
            logger.info("Creating all tables...")
            # Đảm bảo metadata được set schema trước khi tạo bảng
            for table in Base.metadata.tables.values():
                table.schema = settings.POSTGRES_SCHEMA
            await conn.run_sync(Base.metadata.create_all)
            
            logger.info("Database initialization completed successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise