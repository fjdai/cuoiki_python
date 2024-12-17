from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            # Lấy token từ Authorization header
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                # Lưu token vào request state
                request.state.token = token
                logger.debug(f"Token found in header: {token[:10]}...")
            else:
                logger.debug("No token found in Authorization header")
                request.state.token = None

        except Exception as e:
            logger.error(f"Error in auth middleware: {str(e)}")
            request.state.token = None

        response = await call_next(request)
        return response 