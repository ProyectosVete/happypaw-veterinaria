from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
import re

User = get_user_model()

# Definir validadores antes de usarlos
phone_regex = RegexValidator(
    regex=r'^\d{10}$',
    message="El teléfono debe tener exactamente 10 dígitos numéricos"
)

cedula_regex = RegexValidator(
    regex=r'^\d{8}$',
    message="La cédula debe tener exactamente 8 dígitos numéricos"
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 
                  'role', 'phone', 'cedula', 'specialty', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True},
            'is_active': {'read_only': True},
            'username': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
            'phone': {'required': True, 'validators': [phone_regex]},
            'cedula': {'required': False, 'validators': [cedula_regex]}
        }
    
    def validate_username(self, value):
        """Validar que el username sea único"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso")
        return value
    
    def validate_email(self, value):
        """Validar que el email sea único"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está registrado")
        return value
    
    def validate_phone(self, value):
        """Validar formato de teléfono"""
        if not re.match(r'^\d{10}$', value):
            raise serializers.ValidationError("El teléfono debe tener exactamente 10 dígitos numéricos")
        return value
    
    def validate_cedula(self, value):
        """Validar que la cédula sea única entre veterinarios"""
        if value:
            if User.objects.filter(cedula=value).exists():
                raise serializers.ValidationError("Esta cédula ya está registrada")
            if not re.match(r'^\d{8}$', value):
                raise serializers.ValidationError("La cédula debe tener exactamente 8 dígitos numéricos")
        return value
    
    def validate_first_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre es obligatorio")
        return value.strip()
    
    def validate_last_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El apellido es obligatorio")
        return value.strip()
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'veterinarian'),
            phone=validated_data.get('phone', ''),
            cedula=validated_data.get('cedula', ''),
            specialty=validated_data.get('specialty', '')
        )
        return user


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                  'phone', 'cedula', 'specialty', 'is_active', 'date_joined']


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'role', 'phone', 'cedula', 'specialty']
    
    def validate_username(self, value):
        instance = self.instance
        if User.objects.filter(username=value).exclude(id=instance.id).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso")
        return value
    
    def validate_email(self, value):
        instance = self.instance
        if User.objects.filter(email=value).exclude(id=instance.id).exists():
            raise serializers.ValidationError("Este correo electrónico ya está registrado")
        return value
    
    def validate_phone(self, value):
        instance = self.instance
        if not re.match(r'^\d{10}$', value):
            raise serializers.ValidationError("El teléfono debe tener exactamente 10 dígitos numéricos")
        if User.objects.filter(phone=value).exclude(id=instance.id).exists():
            raise serializers.ValidationError("Este número de teléfono ya está registrado")
        return value
    
    def validate_cedula(self, value):
        if value:
            instance = self.instance
            if not re.match(r'^\d{8}$', value):
                raise serializers.ValidationError("La cédula debe tener exactamente 8 dígitos numéricos")
            if User.objects.filter(cedula=value).exclude(id=instance.id).exists():
                raise serializers.ValidationError("Esta cédula ya está registrada")
        return value
    
    def validate_first_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre es obligatorio")
        return value.strip()
    
    def validate_last_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El apellido es obligatorio")
        return value.strip()


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=6, write_only=True)
    confirm_password = serializers.CharField(min_length=6, write_only=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data