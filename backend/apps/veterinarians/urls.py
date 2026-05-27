from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VeterinarianViewSet

router = DefaultRouter()
router.register(r'', VeterinarianViewSet)

urlpatterns = [
    path('', include(router.urls)),
]