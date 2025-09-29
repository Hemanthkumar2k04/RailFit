from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict

class TokenData(BaseModel):
    username: str = None
    user_id: int = None
    role: str = None