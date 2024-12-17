from datetime import datetime
from app.db.base_class import Base
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import DeclarativeBase, declared_attr
from sqlalchemy import MetaData


class BaseModel(Base):
    __abstract__ = True
    
    createdAt:Mapped[datetime] = mapped_column( default=datetime.utcnow)
    updatedAt:Mapped[datetime] = mapped_column( default=datetime.utcnow, onupdate=datetime.utcnow)
    isDeleted:Mapped[bool] = mapped_column(default=False) 

# Configure naming convention for constraints
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

# Create metadata with naming convention
metadata = MetaData(naming_convention=convention)

class Base(DeclarativeBase):
    metadata = metadata
    
    # Disable lazy loading globally
    __mapper_args__ = {
        'eager_defaults': True
    }
    
    # Convert table name to lowercase
    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower() 