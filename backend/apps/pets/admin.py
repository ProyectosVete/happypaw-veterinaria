from django.contrib import admin
from .models import Pet

@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ('id_pet', 'name', 'species', 'age', 'client')
    search_fields = ('name', 'client__name')