from pydantic import BaseModel, EmailStr
from enum import Enum

class LoginRequest(BaseModel):
    username: EmailStr
    password: str

class UserLoginResponse(BaseModel):
    id: str
    email: EmailStr
    address: str
    name: str
    gender: str
    roleId: int
    phone: str
    avatar: str | None = None

class LoginResponseData(BaseModel):
    user: UserLoginResponse
    access_token: str

class CustomResponse(BaseModel):
    statusCode: int
    message: str
    data: LoginResponseData
    author: str = "Phan Gia Đại"

class TokenPayload(BaseModel):
    sub: str  # user id
    exp: int  # expiration time

class Token(BaseModel):
    access_token: str
    refresh_token: str

class AccountResponse(BaseModel):
    id: str | None = None
    email: EmailStr
    address: str = ""
    name: str
    gender: str = ""
    roleId: int
    phone: str = ""
    avatar: str | None = None

class ForgotPasswordDto(BaseModel):
    email: EmailStr

class ChangePasswordDto(BaseModel):
    oldPassword: str
    newPassword: str