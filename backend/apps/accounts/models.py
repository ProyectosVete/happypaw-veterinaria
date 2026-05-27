from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

class User(AbstractUser):
    ROLES = (
        ('admin', 'Administrador'),
        ('veterinarian', 'Veterinario'),
    )
    
    SPECIALTIES = (
        ('general', 'Medicina General'),
        ('surgery', 'Cirugia'),
        ('dermatology', 'Dermatologia'),
        ('dentistry', 'Odontologia'),
        ('cardiology', 'Cardiologia'),
        ('ophthalmology', 'Oftalmologia'),
        ('nutrition', 'Nutricion'),
        ('emergency', 'Medicina de Emergencia'),
        ('rehabilitation', 'Rehabilitacion'),
        ('other', 'Otra'),
    )
    
    role = models.CharField(max_length=20, choices=ROLES, default='veterinarian')
    phone = models.CharField(max_length=10, blank=True, null=True)
    cedula = models.CharField(max_length=8, blank=True, null=True)
    specialty = models.CharField(max_length=30, choices=SPECIALTIES, blank=True, null=True)
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"