import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'veterinary_backend.settings')
django.setup()

from apps.veterinarians.models import Veterinarian
from django.contrib.auth import get_user_model

User = get_user_model()

def agregar_veterinarios():
    print("🐾 Agregando veterinarios de prueba...")
    
    # Lista de veterinarios de prueba
    veterinarios = [
        {
            'name': 'Dr. Carlos López',
            'cedula': '12345678',
            'phone': '5551112222',
            'email': 'carlos@veterinaria.com',
            'specialty': 'Medicina General'
        },
        {
            'name': 'Dra. María García',
            'cedula': '87654321',
            'phone': '5553334444',
            'email': 'maria@veterinaria.com',
            'specialty': 'Cirugía'
        },
        {
            'name': 'Dr. Juan Rodríguez',
            'cedula': '11223344',
            'phone': '5555556666',
            'email': 'juan@veterinaria.com',
            'specialty': 'Dermatología'
        },
        {
            'name': 'Dra. Ana Martínez',
            'cedula': '44332211',
            'phone': '5557778888',
            'email': 'ana@veterinaria.com',
            'specialty': 'Odontología'
        },
        {
            'name': 'Dr. Luis Fernández',
            'cedula': '55667788',
            'phone': '5559990000',
            'email': 'luis@veterinaria.com',
            'specialty': 'Cardiología'
        }
    ]
    
    creados = 0
    for vet_data in veterinarios:
        # Verificar si ya existe
        if not Veterinarian.objects.filter(email=vet_data['email']).exists():
            # Crear usuario asociado
            username = vet_data['email'].split('@')[0]
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': vet_data['email'],
                    'role': 'veterinarian',
                    'first_name': vet_data['name'].split()[1] if len(vet_data['name'].split()) > 1 else '',
                    'last_name': vet_data['name'].split()[0] if vet_data['name'].split() else '',
                }
            )
            if created:
                user.set_password('vet123')
                user.save()
            
            # Crear veterinario
            veterinario = Veterinarian.objects.create(
                user=user,
                name=vet_data['name'],
                cedula=vet_data['cedula'],
                phone=vet_data['phone'],
                email=vet_data['email'],
                specialty=vet_data['specialty']
            )
            creados += 1
            print(f"  ✅ Creado: {vet_data['name']} - {vet_data['specialty']}")
        else:
            print(f"  ⚠️ Ya existe: {vet_data['name']}")
    
    print(f"\n📊 Total veterinarios agregados: {creados}")
    print(f"📊 Total veterinarios en BD: {Veterinarian.objects.count()}")

if __name__ == '__main__':
    agregar_veterinarios()