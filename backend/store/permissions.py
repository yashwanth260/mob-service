from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to the admin user.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.email == 'admin@7star.com')

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    The request is authenticated as an admin, or is a read-only request.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.email == 'admin@7star.com')

class IsAdminOrPostOnly(permissions.BasePermission):
    """
    Allows POST requests to any authenticated user, but restricts GET, PATCH, DELETE to admin.
    """
    def has_permission(self, request, view):
        if request.method == 'POST':
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_authenticated and request.user.email == 'admin@7star.com')
