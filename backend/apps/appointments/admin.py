from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id_appointment', 'pet', 'veterinarian', 'date', 'status')
    list_filter = ('status', 'date')