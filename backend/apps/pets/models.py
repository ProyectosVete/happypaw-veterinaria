from django.db import models
from apps.clients.models import Client

class Pet(models.Model):
    SPECIES = (
        ('dog', 'Perro'),
        ('cat', 'Gato'),
        ('bird', 'Ave'),
        ('rabbit', 'Conejo'),
        ('other', 'Otro'),
    )
    
    AGE_UNIT = (
        ('years', 'Años'),
        ('months', 'Meses'),
    )
    
    id_pet = models.AutoField(primary_key=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='pets')
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=20, choices=SPECIES)
    custom_species = models.CharField(max_length=100, blank=True, null=True)
    breed = models.CharField(max_length=100, blank=True, null=True)
    age = models.IntegerField()
    age_unit = models.CharField(max_length=10, choices=AGE_UNIT, default='years')  # ← Campo importante
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        species_display = self.custom_species if self.species == 'other' and self.custom_species else self.get_species_display()
        age_display = f"{self.age} {'años' if self.age_unit == 'years' else 'meses'}"
        return f"{self.name} ({species_display}) - {age_display} - Dueño: {self.client.name}"