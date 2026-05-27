from rest_framework import serializers
from .models import Pet

class PetSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    species_display = serializers.SerializerMethodField()
    age_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Pet
        fields = ['id_pet', 'name', 'species', 'custom_species', 'species_display', 
                  'breed', 'age', 'age_unit', 'age_display', 'client', 'client_name', 
                  'created_at', 'updated_at']
    
    def get_species_display(self, obj):
        if obj.species == 'other' and obj.custom_species:
            return obj.custom_species
        return obj.get_species_display()
    
    def get_age_display(self, obj):
        if obj.age_unit == 'months':
            return f"{obj.age} meses"
        return f"{obj.age} anos"
    
    def validate(self, data):
        """Validar que no exista una mascota con el mismo nombre, especie y dueño"""
        name = data.get('name')
        species = data.get('species')
        client = data.get('client')
        
        if name and species and client:
            # Verificar si ya existe una mascota con los mismos datos
            existing_pet = Pet.objects.filter(
                name=name.strip(),
                species=species,
                client=client
            )
            
            if self.instance:
                existing_pet = existing_pet.exclude(id_pet=self.instance.id_pet)
            
            if existing_pet.exists():
                raise serializers.ValidationError(
                    f"Ya existe una mascota llamada '{name}' para este cliente con la misma especie"
                )
        
        return data