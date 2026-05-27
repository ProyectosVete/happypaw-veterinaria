import re
import ssl
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer, UserListSerializer, 
    PasswordResetRequestSerializer, 
    PasswordResetConfirmSerializer
)

User = get_user_model()


class RegisterUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if request.user.role != 'admin':
            return Response(
                {'error': 'No tienes permiso para registrar usuarios'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validaciones adicionales antes del serializador
        phone = request.data.get('phone', '')
        email = request.data.get('email', '')
        cedula = request.data.get('cedula', '')
        
        # Validar formato de teléfono
        if not re.match(r'^\d{10}$', phone):
            return Response(
                {'phone': ['El teléfono debe tener exactamente 10 dígitos numéricos']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar teléfono único para el mismo rol
        role = request.data.get('role', 'veterinarian')
        if User.objects.filter(phone=phone, role=role).exists():
            return Response(
                {'phone': [f'El número de teléfono ya está registrado para otro {role}']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar email único
        if User.objects.filter(email=email).exists():
            return Response(
                {'email': ['Este correo electrónico ya está registrado']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar cédula única para veterinarios
        if role == 'veterinarian' and cedula:
            if not re.match(r'^\d{8}$', cedula):
                return Response(
                    {'cedula': ['La cédula debe tener exactamente 8 dígitos numéricos']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if User.objects.filter(cedula=cedula).exists():
                return Response(
                    {'cedula': ['Esta cédula ya está registrada']},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            if user.role == 'veterinarian':
                from apps.veterinarians.models import Veterinarian
                Veterinarian.objects.get_or_create(
                    email=user.email,
                    defaults={
                        'user': user,
                        'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                        'cedula': request.data.get('cedula', 'PENDIENTE'),
                        'phone': request.data.get('phone', ''),
                        'specialty': request.data.get('specialty', 'general')
                    }
                )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        if request.user.role != 'admin':
            return Response(
                {'error': 'No tienes permiso para ver usuarios'},
                status=status.HTTP_403_FORBIDDEN
            )
        users = User.objects.all().order_by('-date_joined')
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
    
    def put(self, request, user_id):
        if request.user.role != 'admin':
            return Response(
                {'error': 'No tienes permiso para editar usuarios'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object(user_id)
        if not user:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        # Validaciones para edición
        phone = request.data.get('phone', '')
        email = request.data.get('email', '')
        cedula = request.data.get('cedula', '')
        role = request.data.get('role', user.role)
        
        # Validar formato de teléfono
        if phone and not re.match(r'^\d{10}$', phone):
            return Response(
                {'phone': ['El teléfono debe tener exactamente 10 dígitos numéricos']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar teléfono único para el mismo rol (excluyendo el usuario actual)
        if phone and User.objects.filter(phone=phone, role=role).exclude(id=user_id).exists():
            return Response(
                {'phone': [f'El número de teléfono ya está registrado para otro {role}']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar email único (excluyendo el usuario actual)
        if email and User.objects.filter(email=email).exclude(id=user_id).exists():
            return Response(
                {'email': ['Este correo electrónico ya está registrado']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar cédula única (excluyendo el usuario actual)
        if role == 'veterinarian' and cedula:
            if not re.match(r'^\d{8}$', cedula):
                return Response(
                    {'cedula': ['La cédula debe tener exactamente 8 dígitos numéricos']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if User.objects.filter(cedula=cedula).exclude(id=user_id).exists():
                return Response(
                    {'cedula': ['Esta cédula ya está registrada']},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Actualizar usando el serializador
        from .serializers import UserUpdateSerializer
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            if 'password' in request.data and request.data['password']:
                user.set_password(request.data['password'])
                user.save()
            serializer.save()
            
            # Actualizar también en veterinarians si es veterinario
            if user.role == 'veterinarian':
                from apps.veterinarians.models import Veterinarian
                vet, created = Veterinarian.objects.update_or_create(
                    email=user.email,
                    defaults={
                        'user': user,
                        'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                        'cedula': request.data.get('cedula', user.cedula or 'PENDIENTE'),
                        'phone': request.data.get('phone', user.phone or ''),
                        'specialty': request.data.get('specialty', user.specialty or 'general')
                    }
                )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, user_id):
        if request.user.role != 'admin':
            return Response(
                {'error': 'No tienes permiso para eliminar usuarios'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object(user_id)
        if not user:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        if user.id == request.user.id:
            return Response(
                {'error': 'No puedes eliminar tu propio usuario'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.delete()
        return Response({'message': 'Usuario eliminado'}, status=status.HTTP_200_OK)
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class VeterinariansListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from apps.veterinarians.models import Veterinarian
        veterinarians = Veterinarian.objects.all()
        result = [{
            'id': v.id_veterinarian,
            'name': v.name,
            'email': v.email,
            'specialty': v.specialty or "general",
            'cedula': v.cedula,
            'phone': v.phone
        } for v in veterinarians]
        return Response(result, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        print("=== SOLICITUD DE RECUPERACIÓN ===")
        
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            print(f"Email solicitado: {email}")
            
            # Usar filter().first() para evitar duplicados
            user = User.objects.filter(email=email).first()
            
            if user:
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
                print(f"Enlace generado: {reset_url}")
                
                # Enviar correo con SSL deshabilitado
                try:
                    # Crear contexto SSL sin verificación
                    ssl_context = ssl.create_default_context()
                    ssl_context.check_hostname = False
                    ssl_context.verify_mode = ssl.CERT_NONE
                    
                    send_mail(
                        subject='Recuperación de contraseña - HAPPYPAW',
                        message=f'''
Hola {user.get_full_name() or user.username},

Recibimos una solicitud para restablecer tu contraseña en HAPPYPAW.

Para crear una nueva contraseña, haz clic en el siguiente enlace:
{reset_url}

Si no solicitaste este cambio, ignora este correo.

Este enlace expirará en 24 horas.

Saludos,
Equipo HAPPYPAW
''',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[email],
                        fail_silently=False,
                    )
                    print("Correo enviado exitosamente")
                    
                except Exception as e:
                    print(f"Error al enviar correo: {e}")
                    # Mostrar el enlace en la terminal para pruebas
                    print(f"Enlace de recuperación (copia y pega en el navegador): {reset_url}")
                
                return Response({'message': 'Correo enviado'}, status=status.HTTP_200_OK)
            else:
                print(f"Usuario con email {email} no encontrado")
                return Response(
                    {'message': 'Si el correo existe, recibirás instrucciones'},
                    status=status.HTTP_200_OK
                )
        
        print(f"Errores de validación: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        print("=== CONFIRMACIÓN DE RECUPERACIÓN ===")
        
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                uid = force_str(urlsafe_base64_decode(serializer.validated_data['uid']))
                user = User.objects.get(pk=uid)
                print(f"Usuario encontrado: {user.username}")
                
                if default_token_generator.check_token(user, serializer.validated_data['token']):
                    user.set_password(serializer.validated_data['new_password'])
                    user.save()
                    print("Contraseña actualizada exitosamente")
                    return Response({'message': 'Contraseña restablecida'}, status=status.HTTP_200_OK)
                else:
                    print("Token inválido o expirado")
                    return Response({'error': 'Enlace inválido o expirado'}, status=status.HTTP_400_BAD_REQUEST)
                    
            except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
                print(f"Error: {e}")
                return Response({'error': 'Enlace inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"Errores de validación: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)