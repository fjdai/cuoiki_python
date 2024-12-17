import asyncio
import bcrypt
from datetime import datetime, timedelta
from sqlalchemy.future import select
from app.db.database import AsyncSessionLocal, init_db
from app.models.user import User, Gender
from app.models.role import Role
from app.models.clinic import Clinic
from app.models.doctor_user import DoctorUser
from app.models.patient import Patient
from app.models.patient_schedule import PatientSchedule, Status
from app.models.schedule import Schedule
from app.models.specialization import Specialization
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def get_hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

async def create_seed_data():
    async with AsyncSessionLocal() as session:
        try:
            logger.info("Starting seed data creation...")
            
            # Tạo roles
            roles_data = [
                (1, "Admin"),
                (2, "Doctor"),
                (3, "Supporter")
            ]
            
            for id, name in roles_data:
                existing_role = await session.execute(
                    select(Role).where(Role.id == id)
                )
                role = existing_role.scalar()
                if not role:
                    role = Role(id=id, name=name)
                    session.add(role)
            await session.commit()

            # Tạo admin user
            existing_admin = await session.execute(
                select(User).where(User.email == "admin@example.com")
            )
            admin = existing_admin.scalar()
            if not admin:
                admin = User(
                    name="Admin User",
                    email="admin@example.com",
                    password=await get_hash_password("adminpassword"),
                    phone="1111111111",
                    gender=Gender.Male,
                    roleId=1,  # Admin role
                    description="System Administrator",
                    address="Admin Address",
                    avatar="admin.jpg"
                )
                session.add(admin)
                await session.commit()

            # Tạo clinics
            clinics = []
            for i in range(1, 11):
                clinic = Clinic(
                    name=f"Clinic {i}",
                    address=f"{i} Medical Street, City",
                    phone=f"555-000{i}",
                    description=f"Modern medical clinic number {i} offering comprehensive healthcare services.",
                    image="campbell-clinic.jpg"
                )
                clinics.append(clinic)
            session.add_all(clinics)
            await session.commit()

            # Tạo specializations
            specializations = []
            for i in range(1, 11):
                spec = Specialization(
                    name=f"Specialization {i}",
                    description=f"Medical specialization in field {i}",
                    image="cardiology.jpg"
                )
                specializations.append(spec)
            session.add_all(specializations)
            await session.commit()

            # Tạo doctors
            doctors = []
            for i in range(1, 11):
                doctor = User(
                    name=f"Dr. Smith {i}",
                    email=f"doctor{i}@hospital.com",
                    password=await get_hash_password("doctor123"),
                    phone=f"555-111{i}",
                    avatar="doctor.jpg",
                    gender=Gender.Male if i % 2 == 0 else Gender.Female,
                    roleId=2,  # Doctor role
                    description=f"Experienced doctor with {i + 5} years of practice",
                    address=f"{i} Doctor Street, Medical City"
                )
                doctors.append(doctor)
            session.add_all(doctors)
            await session.commit()

            # Tạo supporters
            supporters = []
            for i in range(1, 11):
                supporter = User(
                    name=f"Supporter {i}",
                    email=f"supporter{i}@hospital.com",
                    password=await get_hash_password("supporter123"),
                    phone=f"555-333{i}",
                    avatar=f"supporter{i}.jpg",
                    gender=Gender.Male if i % 2 == 0 else Gender.Female,
                    roleId=3,  # Supporter role
                    description=f"Medical support staff member {i}",
                    address=f"{i} Support Street, Medical City"
                )
                supporters.append(supporter)
            session.add_all(supporters)
            await session.commit()

            # Tạo doctor_user relationships
            for i, doctor in enumerate(doctors):
                doctor_user = DoctorUser(
                    doctorId=doctor.id,
                    clinicId=clinics[i % len(clinics)].id,
                    specializationId=specializations[i % len(specializations)].id
                )
                session.add(doctor_user)
            await session.commit()

            # Tạo patients
            patients = []
            for i in range(1, 11):
                patient = Patient(
                    name=f"Patient {i}",
                    email=f"patient{i}@example.com",
                    phone=f"555-222{i}",
                    gender=Gender.Male if i % 2 == 0 else Gender.Female,
                    address=f"{i} Patient Avenue, City",
                    description=f"Patient with medical history {i}"
                )
                patients.append(patient)
            session.add_all(patients)
            await session.commit()

            # Tạo schedules với UTC time
            schedules = []
            for doctor in doctors:
                for day in range(7):
                    for hour in range(8, 17):
                        start_time = datetime.now() + timedelta(days=day)
                        start_time = start_time.replace(hour=hour, minute=0, second=0, microsecond=0)
                        end_time = start_time + timedelta(hours=1)
                        
                        schedule = Schedule(
                            doctorId=doctor.id,
                            startTime=start_time,
                            endTime=end_time,
                            price=500000 + (hour - 8) * 50000,
                            maxBooking=3,
                            sumBooking=0
                        )
                        schedules.append(schedule)
            session.add_all(schedules)
            await session.commit()

            # Tạo patient_schedules
            for i in range(5):
                patient_schedule = PatientSchedule(
                    patientId=patients[i].id,
                    scheduleId=schedules[i].id,
                    status=Status.Accept if i % 3 == 0 else 
                           Status.Pending if i % 3 == 1 else Status.Reject
                )
                session.add(patient_schedule)

            await session.commit()
            logger.info("Seeding completed successfully.")
        except Exception as e:
            logger.error(f"Error during seeding: {e}")
            await session.rollback()
            raise

async def main():
    try:
        await init_db()  # Tạo tables trước
        await create_seed_data()  # Sau đó seed data
    except Exception as e:
        print(f"Error during seeding: {e}")
        raise
    
if __name__ == "__main__":
    asyncio.run(main()) 