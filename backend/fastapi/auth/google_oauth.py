"""Google OAuth2 configuration and handlers."""

import os
from typing import Dict, Any
from authlib.integrations.starlette_client import OAuth
from fastapi import HTTPException


class GoogleOAuth:
    """Google OAuth2 manager."""
    
    def __init__(self):
        self.client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        self.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/v1/auth/callback")
        
        if not self.client_id or not self.client_secret:
            raise ValueError("Google OAuth2 credentials not found in environment variables")
        
        # Initialize OAuth
        self.oauth = OAuth()
        self.oauth.register(
            name='google',
            client_id=self.client_id,
            client_secret=self.client_secret,
            server_metadata_url='https://accounts.google.com/.well-known/openid_authorization_server',
            client_kwargs={
                'scope': 'openid email profile'
            }
        )
    
    def get_authorization_url(self, redirect_uri: str = None) -> str:
        """Get Google OAuth2 authorization URL."""
        if redirect_uri:
            self.redirect_uri = redirect_uri
            
        authorization_url = (
            "https://accounts.google.com/o/oauth2/auth?"
            f"client_id={self.client_id}&"
            f"redirect_uri={self.redirect_uri}&"
            "scope=openid email profile&"
            "response_type=code&"
            "access_type=offline&"
            "prompt=consent"
        )
        
        return authorization_url
    
    async def get_user_info(self, authorization_code: str) -> Dict[str, Any]:
        """Exchange authorization code for user information."""
        import httpx
        
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": authorization_code,
            "grant_type": "authorization_code",
            "redirect_uri": self.redirect_uri,
        }
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data)
            
            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to exchange authorization code for tokens"
                )
            
            tokens = token_response.json()
            access_token = tokens.get("access_token")
            
            if not access_token:
                raise HTTPException(
                    status_code=400,
                    detail="No access token received from Google"
                )
            
            # Get user info
            user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {"Authorization": f"Bearer {access_token}"}
            
            user_response = await client.get(user_info_url, headers=headers)
            
            if user_response.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to get user information from Google"
                )
            
            user_data = user_response.json()
            
            # Standardize user data
            return {
                "google_id": user_data.get("id"),
                "email": user_data.get("email"),
                "name": user_data.get("name"),
                "picture": user_data.get("picture"),
                "given_name": user_data.get("given_name"),
                "family_name": user_data.get("family_name"),
                "locale": user_data.get("locale"),
                "verified_email": user_data.get("verified_email", False)
            }


# Global Google OAuth instance
google_oauth = GoogleOAuth()
