from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterUserView, UserDetailView, CurrentUserView, VeterinariansListView,
    PasswordResetRequestView, PasswordResetConfirmView
)

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('veterinarians/', VeterinariansListView.as_view(), name='veterinarians_list'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('users/', RegisterUserView.as_view(), name='user_list_create'),
    path('users/<int:user_id>/', UserDetailView.as_view(), name='user_detail'),
]