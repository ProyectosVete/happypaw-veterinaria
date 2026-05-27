from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PetViewSet

router = DefaultRouter()
router.register(r'', PetViewSet)

urlpatterns = [
    path('', include(router.urls)),
]