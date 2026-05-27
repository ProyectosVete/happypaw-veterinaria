from django.contrib import admin
from .models import Veterinarian

@admin.register(Veterinarian)
class VeterinarianAdmin(admin.ModelAdmin):
    list_display = ('id_veterinarian', 'name', 'cedula', 'email')
    search_fields = ('name', 'cedula')