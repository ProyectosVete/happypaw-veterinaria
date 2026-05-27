from django.contrib import admin
from .models import MedicalRecord

@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('id_record', 'pet', 'veterinarian', 'date', 'diagnosis')
    list_filter = ('date',)