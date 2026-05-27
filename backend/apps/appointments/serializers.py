from rest_framework import serializers
from .models import Appointment
from apps.veterinarians.models import Veterinarian
from datetime import datetime
from django.utils import timezone

class AppointmentSerializer(serializers.ModelSerializer):
    pet_name = serializers.CharField(source='pet.name', read_only=True)
    client_name = serializers.CharField(source='pet.client.name', read_only=True)
    veterinarian_name = serializers.CharField(source='veterinarian.name', read_only=True)
    date_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = ['id_appointment', 'pet', 'pet_name', 'client_name', 'veterinarian', 
                  'veterinarian_name', 'date', 'date_display', 'reason', 
                  'consultation_type', 'status', 'created_at']
    
    def get_date_display(self, obj):
        if obj.date:
            return obj.date.strftime('%Y-%m-%d %H:%M')
        return None
    
    def validate_date(self, value):
        """Validar que la fecha no sea pasada"""
        now = timezone.now()
        if value < now:
            raise serializers.ValidationError("No se pueden agendar citas en fechas u horas pasadas")
        return value
    
    def validate(self, data):
        """Validar que no haya conflicto de horarios con el mismo veterinario"""
        veterinarian = data.get('veterinarian')
        date = data.get('date')
        
        if veterinarian and date:
            # Verificar si ya existe una cita para el mismo veterinario en el mismo horario
            existing_appointments = Appointment.objects.filter(
                veterinarian=veterinarian,
                date=date,
                status__in=['scheduled', 'confirmed', 'in_progress']
            )
            
            if self.instance:
                existing_appointments = existing_appointments.exclude(id=self.instance.id)
            
            if existing_appointments.exists():
                raise serializers.ValidationError(
                    {'date': f'El veterinario {veterinarian.name} ya tiene una cita en ese horario'}
                )
        
        return data