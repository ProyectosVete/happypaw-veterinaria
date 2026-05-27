import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'veterinary_backend.settings')
django.setup()

from apps.accounts.models import User
from apps.veterinarians.models import Veterinarian

print("=== SINCRONIZANDO VETERINARIOS ===\n")

# Obtener todos los usuarios con rol veterinarian
vet_users = User.objects.filter(role='veterinarian')

created_count = 0
updated_count = 0

for user in vet_users:
    # Verificar si ya existe por email
    try:
        vet = Veterinarian.objects.get(email=user.email)
        print(f" Ya existe: {vet.name} - {vet.email}")
        # Actualizar datos si es necesario
        if vet.user_id != user.id:
            vet.user = user
            vet.save()
            print(f"    Usuario actualizado para: {vet.name}")
            updated_count += 1
    except Veterinarian.DoesNotExist:
        # Crear nuevo veterinario
        try:
            vet = Veterinarian.objects.create(
                user=user,
                name=f"{user.first_name} {user.last_name}".strip() or user.username,
                email=user.email,
                cedula=user.cedula or f"PENDIENTE_{user.id}",
                phone=user.phone or "",
                specialty=user.specialty or "Medicina General"
            )
            print(f" Creado: {vet.name} - {vet.email}")
            created_count += 1
        except Exception as e:
            print(f" Error creando {user.username}: {e}")

print(f"\n Resumen: {created_count} creados, {updated_count} actualizados")
print(f" Total veterinarios en BD: {Veterinarian.objects.count()}")

print("\n=== VETERINARIOS ACTUALES ===")
for v in Veterinarian.objects.all():
    print(f"  ID: {v.id_veterinarian}, Nombre: {v.name}, Email: {v.email}")