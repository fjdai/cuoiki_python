from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings
from pathlib import Path
from jinja2 import Environment, select_autoescape, FileSystemLoader

# Configure FastMail
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

# Initialize FastMail
fastmail = FastMail(conf)

# Configure Jinja2 for email templates
env = Environment(
    loader=FileSystemLoader("app/templates/email"),
    autoescape=select_autoescape(['html', 'xml'])
)

async def send_booking_success_email(email_to: str, data: dict):
    template = env.get_template("booking_success.html")
    html = template.render(**data)
    
    message = MessageSchema(
        subject="Xác nhận lịch khám tại DoctorCare",
        recipients=[email_to],
        body=html,
        subtype="html"
    )
    
    await fastmail.send_message(message)

async def send_booking_failed_email(email_to: str, data: dict):
    template = env.get_template("booking_failed.html")
    html = template.render(**data)
    
    message = MessageSchema(
        subject="Thông báo hủy lịch khám tại DoctorCare",
        recipients=[email_to],
        body=html,
        subtype="html"
    )
    
    await fastmail.send_message(message)

async def send_booking_new_email(email_to: str, data: dict):
    template = env.get_template("booking_new.html")
    html = template.render(**data)
    
    message = MessageSchema(
        subject="Thông báo đặt lịch khám tại DoctorCare",
        recipients=[email_to],
        body=html,
        subtype="html"
    )
    
    await fastmail.send_message(message)

async def send_bill_email(email_to: str, data: dict):
    template = env.get_template("bill.html")
    html = template.render(**data)
    
    message = MessageSchema(
        subject="Hóa đơn khám bệnh từ DoctorCare",
        recipients=[email_to],
        body=html,
        subtype="html"
    )
    
    await fastmail.send_message(message)

async def send_forgot_password_email(email_to: str, data: dict):
    template = env.get_template("forgot_password.html")
    html = template.render(**data)
    
    message = MessageSchema(
        subject="Mật khẩu mới từ DoctorCare",
        recipients=[email_to],
        body=html,
        subtype="html"
    )
    
    await fastmail.send_message(message) 