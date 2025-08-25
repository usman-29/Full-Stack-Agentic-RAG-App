"""Authentication service for user management."""

from datetime import datetime
from typing import Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException

from database.models import User
from auth.jwt_utils import jwt_manager
from auth.google_oauth import google_oauth


class AuthService:
    """Service for handling authentication operations."""
    
    def __init__(self):
        self.jwt_manager = jwt_manager
        self.google_oauth = google_oauth
    
    async def authenticate_with_google(
        self, 
        authorization_code: str, 
        db: Session
    ) -> Tuple[User, str, str]:
        """
        Authenticate user with Google OAuth2 and return user with tokens.
        
        Returns:
            Tuple of (user, access_token, refresh_token)
        """
        try:
            # Get user info from Google
            google_user_data = await self.google_oauth.get_user_info(authorization_code)
            
            if not google_user_data.get("verified_email"):
                raise HTTPException(
                    status_code=400,
                    detail="Email not verified with Google"
                )
            
            # Check if user exists or create new one
            user = self._get_or_create_user(google_user_data, db)
            
            # Update last login
            user.last_login = datetime.utcnow()
            db.commit()
            
            # Generate tokens
            access_token = self.jwt_manager.create_access_token(user.to_dict())
            refresh_token = self.jwt_manager.create_refresh_token(user.id)
            
            return user, access_token, refresh_token
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Authentication failed: {str(e)}"
            )
    
    def _get_or_create_user(self, google_user_data: Dict[str, Any], db: Session) -> User:
        """Get existing user or create new user from Google data."""
        
        google_id = google_user_data.get("google_id")
        email = google_user_data.get("email")
        
        # Try to find user by Google ID first
        user = db.query(User).filter(User.google_id == google_id).first()
        
        if user:
            # Update user info if it changed
            self._update_user_from_google_data(user, google_user_data)
            db.commit()
            return user
        
        # Try to find user by email (in case they had account before Google auth)
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            # Link existing account with Google
            user.google_id = google_id
            self._update_user_from_google_data(user, google_user_data)
            db.commit()
            return user
        
        # Create new user
        user = User(
            google_id=google_id,
            email=email,
            name=google_user_data.get("name", ""),
            picture=google_user_data.get("picture"),
            given_name=google_user_data.get("given_name"),
            family_name=google_user_data.get("family_name"),
            locale=google_user_data.get("locale"),
            is_active=True
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user
    
    def _update_user_from_google_data(self, user: User, google_data: Dict[str, Any]):
        """Update user fields from Google data."""
        user.name = google_data.get("name", user.name)
        user.picture = google_data.get("picture", user.picture)
        user.given_name = google_data.get("given_name", user.given_name)
        user.family_name = google_data.get("family_name", user.family_name)
        user.locale = google_data.get("locale", user.locale)
        user.updated_at = datetime.utcnow()
    
    def refresh_access_token(self, refresh_token: str, db: Session) -> Optional[str]:
        """Generate new access token from refresh token."""
        
        payload = self.jwt_manager.verify_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            return None
        
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user or not user.is_active:
            return None
        
        # Generate new access token
        return self.jwt_manager.create_access_token(user.to_dict())
    
    def get_user_by_id(self, user_id: int, db: Session) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    def deactivate_user(self, user_id: int, db: Session) -> bool:
        """Deactivate user account."""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_active = False
            user.updated_at = datetime.utcnow()
            db.commit()
            return True
        return False


# Global auth service instance
auth_service = AuthService()
