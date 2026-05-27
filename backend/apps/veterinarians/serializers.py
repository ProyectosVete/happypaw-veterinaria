from rest_framework import serializers
from .models import Veterinarian

class VeterinarianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Veterinarian
        fields = '__all__'
