from django.db import models
from apps.pets.models import Pet
from apps.veterinarians.models import Veterinarian

class MedicalRecord(models.Model):
    id_record = models.AutoField(primary_key=True)
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='medical_records')
    veterinarian = models.ForeignKey(Veterinarian, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateField()
    diagnosis = models.TextField()
    treatment = models.TextField()
    prescription = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    temperature = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    heart_rate = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'medical_records'  # 👈 Fuerza el nombre de la tabla

    def __str__(self):
        return f"Historial {self.id_record} - {self.pet.name} - {self.date}"