from rest_framework import serializers
from .models import MedicalRecord

class MedicalRecordSerializer(serializers.ModelSerializer):
    pet_name = serializers.CharField(source='pet.name', read_only=True)
    client_name = serializers.CharField(source='pet.client.name', read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = ['id_record', 'pet', 'pet_name', 'client_name', 'date', 'diagnosis', 
                  'treatment', 'prescription', 'notes', 'weight', 'temperature', 'heart_rate']