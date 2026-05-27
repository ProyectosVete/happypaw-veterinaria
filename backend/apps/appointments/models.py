from django.db import models
from apps.pets.models import Pet
from apps.veterinarians.models import Veterinarian

class Appointment(models.Model):
    STATUS = (
        ('scheduled', 'Programada'),
        ('confirmed', 'Confirmada'),
        ('in_progress', 'En Curso'),
        ('completed', 'Completada'),
        ('cancelled', 'Cancelada'),
        ('no_show', 'No Asistio'),
    )
    
    CONSULTATION_TYPES = (
        ('general', 'Consulta General / Revision anual'),
        ('first', 'Primera Consulta'),
        ('sickness', 'Cita por Enfermedad'),
        ('emergency', 'Cita por Emergencia'),
        ('specialized', 'Consulta Especializada'),
        ('pre_surgical', 'Consulta Pre-quirurgica'),
        ('geriatric', 'Consulta Geriatrica'),
        ('telemedicine', 'Telemedicina'),
        ('nutrition', 'Consulta de Nutricion'),
        ('euthanasia', 'Eutanasia'),
    )
    
    id_appointment = models.AutoField(primary_key=True)
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='appointments')
    veterinarian = models.ForeignKey(Veterinarian, on_delete=models.CASCADE, related_name='appointments')
    date = models.DateTimeField()
    reason = models.TextField()
    consultation_type = models.CharField(max_length=50, choices=CONSULTATION_TYPES, default='general')
    status = models.CharField(max_length=20, choices=STATUS, default='scheduled')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cita {self.id_appointment} - {self.pet.name} - {self.date.strftime('%Y-%m-%d %H:%M')}"