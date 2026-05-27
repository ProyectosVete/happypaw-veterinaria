"""
URL configuration for veterinary_backend project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API URLs
    path('api/auth/', include('apps.accounts.urls')),
    path('api/clients/', include('apps.clients.urls')),
    path('api/veterinarians/', include('apps.veterinarians.urls')),
    path('api/pets/', include('apps.pets.urls')),
    path('api/medical-records/', include('apps.medical_records.urls')),
    path('api/appointments/', include('apps.appointments.urls')),
]
