import jwt
from django.conf import settings
from rest_framework import authentication
from rest_framework import exceptions
from django.contrib.auth.models import User

class SupabaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        try:
            prefix, token = auth_header.split(' ')
            if prefix.lower() != 'bearer':
                return None
        except ValueError:
            return None

        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f'Invalid token: {e}')

        user_id = payload.get('sub')
        email = payload.get('email', '')
        if not user_id:
            raise exceptions.AuthenticationFailed('Invalid payload')

        # Since Supabase handles users, we just create a dummy Django user 
        # with the Supabase ID as username if it doesn't exist so DRF works
        user, created = User.objects.get_or_create(username=user_id)
        
        if email and user.email != email:
            user.email = email
            user.save(update_fields=['email'])
        
        return (user, token)
