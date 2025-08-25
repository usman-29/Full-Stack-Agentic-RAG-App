"""JWT token utilities for authentication."""

import os
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa


class JWTManager:
    """JWT token manager for creating and validating tokens."""
    
    def __init__(self):
        self.algorithm = "RS256"
        self.access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        self.refresh_token_expire_days = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
        
        # Generate or load RSA key pair
        self.private_key, self.public_key = self._get_or_generate_keys()
    
    def _get_or_generate_keys(self):
        """Get existing keys or generate new RSA key pair."""
        private_key_path = "jwt_private_key.pem"
        public_key_path = "jwt_public_key.pem"
        
        try:
            # Try to load existing keys
            with open(private_key_path, "rb") as f:
                private_key = serialization.load_pem_private_key(
                    f.read(), password=None
                )
            with open(public_key_path, "rb") as f:
                public_key = serialization.load_pem_public_key(f.read())
                
        except FileNotFoundError:
            # Generate new keys if they don't exist
            private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048
            )
            public_key = private_key.public_key()
            
            # Save keys to files
            with open(private_key_path, "wb") as f:
                f.write(private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=serialization.NoEncryption()
                ))
            
            with open(public_key_path, "wb") as f:
                f.write(public_key.public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo
                ))
        
        return private_key, public_key
    
    def create_access_token(self, user_data: Dict[str, Any]) -> str:
        """Create access token for user."""
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        payload = {
            "sub": str(user_data["id"]),
            "email": user_data["email"],
            "name": user_data["name"],
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        }
        
        private_key_pem = self.private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        return jwt.encode(payload, private_key_pem, algorithm=self.algorithm)
    
    def create_refresh_token(self, user_id: int) -> str:
        """Create refresh token for user."""
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        
        payload = {
            "sub": str(user_id),
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        }
        
        private_key_pem = self.private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        return jwt.encode(payload, private_key_pem, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token."""
        try:
            public_key_pem = self.public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )
            
            payload = jwt.decode(token, public_key_pem, algorithms=[self.algorithm])
            return payload
            
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def get_token_expire_time(self, token_type: str = "access") -> datetime:
        """Get token expiration time."""
        if token_type == "access":
            return datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        else:
            return datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)


# Global JWT manager instance
jwt_manager = JWTManager()
