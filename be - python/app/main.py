from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.db.database import init_db
from app.core.config import settings
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY, HTTP_401_UNAUTHORIZED
from fastapi.encoders import jsonable_encoder
from app.api.deps import public_endpoints
from fastapi.openapi.docs import get_swagger_ui_html
from app.core.responses import ErrorResponse
from app.api.middleware.auth_middleware import AuthMiddleware

# Add Swagger UI endpoints to public endpoints
public_endpoints.add("fastapi.openapi.docs.get_swagger_ui_html")
public_endpoints.add("fastapi.openapi.docs.get_redoc_html")
public_endpoints.add("fastapi.openapi.docs.get_openapi")
public_endpoints.add("/docs")
public_endpoints.add("/redoc")
public_endpoints.add("/openapi.json")
public_endpoints.add("app.api.v1.endpoints.auth.login")
public_endpoints.add("app.api.v1.endpoints.auth.refresh_token")
public_endpoints.add("app.api.v1.endpoints.seed_data.seed_data")
public_endpoints.add("app.api.v1.endpoints.clinic.get_all_clinics")
public_endpoints.add("app.api.v1.endpoints.specialty.get_all_specialties")
public_endpoints.add("app.api.v1.endpoints.doctor.get_all_doctors")
public_endpoints.add("app.api.v1.endpoints.doctor.get_doctors_by_clinic")
public_endpoints.add("app.api.v1.endpoints.doctor.get_doctors_by_specialization")
public_endpoints.add("app.api.v1.endpoints.doctor.get_doctor_by_id")
public_endpoints.add("app.api.v1.endpoints.schedules.get_schedules_by_doctor_id")
public_endpoints.add("app.api.v1.endpoints.auth.forgot_password")


def register_public_endpoints():
    """Register all public endpoints"""
    # Documentation endpoints
    doc_endpoints = [
        "fastapi.openapi.docs.get_swagger_ui_html",
        "fastapi.openapi.docs.get_redoc_html", 
        "fastapi.openapi.docs.get_openapi",
        "/docs",
        "/redoc",
        "/openapi.json"
    ]

    # Auth endpoints
    auth_endpoints = [
        "app.api.v1.endpoints.auth.login",
        "app.api.v1.endpoints.auth.refresh"
    ]

    # Public API endpoints
    public_api_endpoints = [
        "/api/v1/clinic",
        "/api/v1/specialty",
        "/api/v1/doctor",
        "/api/v1/doctor/spec/{specialization_id}",
        "/api/v1/doctor/clinic/{clinic_id}",
        "/api/v1/doctor/{doctor_id}",
        "/api/v1/schedules/{doctor_id}"
    ]

    # Static file endpoints
    static_endpoints = [
        "/public",
        "/images"
    ]

    # Register all endpoints
    all_endpoints = (
        doc_endpoints + 
        auth_endpoints + 
        public_api_endpoints + 
        static_endpoints
    )
    
    for endpoint in all_endpoints:
        public_endpoints.add(endpoint)

# Call this function before creating the FastAPI app
register_public_endpoints()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi tạo database khi ứng dụng khởi động
    await init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan,
    docs_url=None,  # Disable default docs
    redoc_url=None,  # Disable default redoc
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Configure CORS first
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Add middleware
app.add_middleware(AuthMiddleware)

# Then add authentication middleware
@app.middleware("http")
async def authentication_middleware(request: Request, call_next):
    # Skip authentication for OPTIONS requests
    if request.method == "OPTIONS":
        return await call_next(request)
        
    path = request.url.path
    route = request.scope.get("route")
    
    # Check if endpoint is public
    is_public = False
    
    # First check path-based endpoints
    if path in public_endpoints:
        is_public = True
    # Then check path prefixes
    elif any(path.startswith(p) for p in ["/docs", "/redoc", "/openapi.json", "/public", "/images"]):
        is_public = True
    # Finally check route-based endpoints
    elif route:
        endpoint_path = f"{route.endpoint.__module__}.{route.endpoint.__name__}"
        is_public = endpoint_path in public_endpoints

    if is_public:
        return await call_next(request)
        
    # Handle authentication for non-public endpoints
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return ErrorResponse(
            message="Not authenticated",
            status_code=HTTP_401_UNAUTHORIZED,
            error_type="Unauthorized"
        )

    try:
        token = auth_header.split(" ")[1]
        request.state.token = token
        return await call_next(request)
    except Exception as e:
        return ErrorResponse(
            message="Internal server error",
            status_code=500,
            error_type="Internal Server Error"
        )

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Đường dẫn tới thư mục public
public_path = Path(__file__).parent / "public"

# Tạo các thư mục nếu chưa tồn tại
(public_path / "images" / "avatars").mkdir(parents=True, exist_ok=True)
(public_path / "images" / "clinics").mkdir(parents=True, exist_ok=True)
(public_path / "images" / "specializations").mkdir(parents=True, exist_ok=True)

# Mount thư mục public với cả 2 đường dẫn
app.mount("/public", StaticFiles(directory="app/public"), name="public")
app.mount("/images", StaticFiles(directory=str(public_path / "images")), name="images")

# Add exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    error_type = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        409: "Conflict",
        422: "Unprocessable Entity",
        500: "Internal Server Error",
        502: "Bad Gateway",
        503: "Service Unavailable",
    }.get(exc.status_code, "Error")
    
    return ErrorResponse(
        message=str(exc.detail),
        status_code=exc.status_code,
        error_type=error_type,
        headers=getattr(exc, "headers", None)
    )

@app.exception_handler(RequestValidationError) 
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return ErrorResponse(
        message="Validation error",
        status_code=HTTP_422_UNPROCESSABLE_ENTITY,
        error_type="Unprocessable Entity",
        errors=jsonable_encoder(exc.errors())
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return ErrorResponse(
        message="Internal server error",
        status_code=500,
        error_type="Internal Server Error"
    ) 

# Thêm các custom routes cho swagger UI
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
    )

@app.middleware("http")
async def cors_debug_middleware(request: Request, call_next):
    print(f"Request headers: {request.headers}")
    response = await call_next(request)
    print(f"Response headers: {response.headers}")
    return response

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)
