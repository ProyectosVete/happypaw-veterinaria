
from django.contrib import admin
from .models import Client

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('id_client', 'name', 'email', 'phone')
    search_fields = ('name', 'email')