from rest_framework import serializers
from .models import Client
from apps.pets.serializers import PetSerializer

class ClientSerializer(serializers.ModelSerializer):
    pets = PetSerializer(many=True, read_only=True)
    
    class Meta:
        model = Client
        fields = '__all__'