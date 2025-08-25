"""Authentication middleware for protecting routes."""

from typing import Optional
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import User
from auth.jwt_utils import jwt_manager


security = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current authenticated user from JWT token in cookie."""
    
    # Try to get token from cookie first
    token = request.cookies.get("access_token")
    
    # If no cookie token, try Authorization header
    if not token:
        authorization = request.headers.get("Authorization")
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
    
    if not token:
        return None
    
    # Verify token
    payload = jwt_manager.verify_token(token)
    if not payload or payload.get("type") != "access":
        return None
    
    # Get user from database
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user


async def require_auth(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    """Require authentication - raise exception if not authenticated."""
    
    user = await get_current_user(request, db)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is disabled"
        )
    
    return user


async def optional_auth(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Optional authentication - return user if authenticated, None otherwise."""
    
    try:
        return await get_current_user(request, db)
    except:
        return None
