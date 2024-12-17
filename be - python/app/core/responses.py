from typing import Any, Dict, Optional
from fastapi.responses import JSONResponse

class SuccessResponse(JSONResponse):
    def __init__(
        self,
        content: Any,
        message: str = "Success",
        status_code: int = 200,
        headers: Optional[Dict[str, str]] = None,
    ) -> None:
        super().__init__(
            content={
                "statusCode": status_code,
                "message": message,
                "data": content,
                "author": "Phan Gia Đại"
            },
            status_code=status_code,
            headers=headers,
        )

class ErrorResponse(JSONResponse):
    def __init__(
        self,
        message: str,
        status_code: int = 400,
        error_type: str = "Bad Request",
        errors: Any = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> None:
        error_content = {
            "statusCode": status_code,
            "message": message,
            "error": error_type
        }
        if errors is not None:
            error_content["errors"] = errors
            
        super().__init__(
            content=error_content,
            status_code=status_code,
            headers=headers,
        ) 