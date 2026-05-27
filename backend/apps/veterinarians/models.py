from django.db import models
from apps.accounts.models import User

class Veterinarian(models.Model):
    id_veterinarian = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    cedula = models.CharField(max_length=20, unique=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    specialty = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return self.name

    class Meta:
        db_table = 'veterinarians'