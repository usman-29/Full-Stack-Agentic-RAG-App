"""Authentication API routes."""

from fastapi import APIRouter, HTTPException, Depends, Response, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from database.connection import get_db
from models.schemas import HealthResponse
from services.auth_service import auth_service
from auth.middleware import require_auth, get_current_user
from auth.google_oauth import google_oauth
from auth.jwt_utils import jwt_manager


auth_router = APIRouter()


@auth_router.get("/login")
async def login():
    """Initiate Google OAuth2 login flow."""
    try:
        authorization_url = google_oauth.get_authorization_url()
        return {
            "authorization_url": authorization_url,
            "message": "Redirect user to this URL to start Google OAuth2 login"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate login URL: {str(e)}"
        )


@auth_router.get("/callback")
async def auth_callback(
    code: str,
    response: Response,
    db: Session = Depends(get_db)
):
    """Handle Google OAuth2 callback."""
    try:
        if not code:
            raise HTTPException(
                status_code=400,
                detail="Authorization code not provided"
            )
        
        # Authenticate with Google
        user, access_token, refresh_token = await auth_service.authenticate_with_google(code, db)
        
        # Set secure HTTP-only cookies
        response.set_cookie(
            key="access_token",
            value=access_token,
            max_age=30 * 60,  # 30 minutes
            httponly=True,
            secure=True,  # Set to False for development if not using HTTPS
            samesite="lax"
        )
        
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            max_age=7 * 24 * 60 * 60,  # 7 days
            httponly=True,
            secure=True,  # Set to False for development if not using HTTPS
            samesite="lax"
        )
        
        return {
            "message": "Authentication successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "picture": user.picture
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Authentication failed: {str(e)}"
        )


@auth_router.post("/refresh")
async def refresh_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token."""
    try:
        refresh_token = request.cookies.get("refresh_token")
        
        if not refresh_token:
            raise HTTPException(
                status_code=401,
                detail="Refresh token not provided"
            )
        
        # Generate new access token
        new_access_token = auth_service.refresh_access_token(refresh_token, db)
        
        if not new_access_token:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired refresh token"
            )
        
        # Set new access token cookie
        response.set_cookie(
            key="access_token",
            value=new_access_token,
            max_age=30 * 60,  # 30 minutes
            httponly=True,
            secure=True,  # Set to False for development if not using HTTPS
            samesite="lax"
        )
        
        return {"message": "Token refreshed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Token refresh failed: {str(e)}"
        )


@auth_router.post("/logout")
async def logout(response: Response):
    """Logout user by clearing cookies."""
    try:
        # Clear authentication cookies
        response.delete_cookie(key="access_token", httponly=True, samesite="lax")
        response.delete_cookie(key="refresh_token", httponly=True, samesite="lax")
        
        return {"message": "Logged out successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Logout failed: {str(e)}"
        )


@auth_router.get("/me")
async def get_current_user_info(
    current_user = Depends(require_auth)
):
    """Get current authenticated user information."""
    return {
        "user": current_user.to_dict(),
        "message": "User information retrieved successfully"
    }


@auth_router.get("/verify")
async def verify_token(
    request: Request,
    db: Session = Depends(get_db)
):
    """Verify if user is authenticated."""
    user = await get_current_user(request, db)
    
    if user:
        return {
            "authenticated": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "picture": user.picture
            }
        }
    else:
        return {
            "authenticated": False,
            "user": None
        }
