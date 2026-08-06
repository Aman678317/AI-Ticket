import uuid
import datetime
import json
from sqlalchemy import create_engine, Column, String, Text, Float, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    tickets = relationship("Ticket", back_populates="category")
    kb_article = relationship("KBArticle", back_populates="category", uselist=False)

class KBArticle(Base):
    __tablename__ = "kb_articles"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    category_id = Column(String, ForeignKey("categories.id"), nullable=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    embedding_vector = Column(Text, nullable=True) # Stored as JSON string
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    category = relationship("Category", back_populates="kb_article")

class Ticket(Base):
    __tablename__ = "tickets"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False, default="usr_demo_employee")
    user_email = Column(String, nullable=True, default="employee@company.com")
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    sanitized_description = Column(Text, nullable=True)
    category_id = Column(String, ForeignKey("categories.id"), nullable=True)
    confidence_score = Column(Float, default=0.0)
    status = Column(String(50), default="open") # open, auto_resolved, pending_agent, resolved
    pii_detected = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String, nullable=True)

    category = relationship("Category", back_populates="tickets")
    responses = relationship("Response", back_populates="ticket")
    feedbacks = relationship("Feedback", back_populates="ticket")
    audit_logs = relationship("AuditLog", back_populates="ticket")

class Response(Base):
    __tablename__ = "responses"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False)
    response_text = Column(Text, nullable=False)
    generated_by = Column(String(50), nullable=False) # ai_auto, ai_draft_agent_edited, agent_manual
    kb_article_id = Column(String, nullable=True)
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)

    ticket = relationship("Ticket", back_populates="responses")

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False)
    was_edited = Column(Boolean, default=False)
    rating = Column(Integer, nullable=True) # 1 to 5 CSAT rating
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    ticket = relationship("Ticket", back_populates="feedbacks")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False)
    model_version = Column(String(50), default="v1.0.0-hybrid")
    confidence_score = Column(Float, nullable=False)
    pii_redacted_count = Column(Integer, default=0)
    action = Column(String(100), nullable=False) # auto_resolved, routed_to_agent, agent_approved, agent_modified
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    ticket = relationship("Ticket", back_populates="audit_logs")

class SystemSetting(Base):
    __tablename__ = "system_settings"
    
    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=False)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
