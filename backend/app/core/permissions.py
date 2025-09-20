from fastapi import HTTPException, status, Depends
from app.models.user import User as UserModel
from app.api.auth import get_current_user
from app.schemas.user import UserRole
from typing import List

class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: UserModel = Depends(get_current_user)):
        if UserRole(current_user.role) not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"
            )
        return current_user

# Role-based dependencies
require_admin = RoleChecker([UserRole.ADMIN])
require_manager_or_admin = RoleChecker([UserRole.ADMIN, UserRole.MANAGER])
require_any_authenticated = RoleChecker([UserRole.ADMIN, UserRole.MANAGER, UserRole.FIELD_INSPECTOR])

# Specific role checks
def require_admin_role(current_user: UserModel = Depends(get_current_user)):
    """Require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def require_manager_or_higher(current_user: UserModel = Depends(get_current_user)):
    """Require manager or admin role"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager or Admin access required"
        )
    return current_user