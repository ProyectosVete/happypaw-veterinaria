from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Appointment
from .serializers import AppointmentSerializer
from apps.veterinarians.models import Veterinarian

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Appointment.objects.all().order_by('date')
        
        try:
            veterinarian = Veterinarian.objects.get(email=user.email)
            return Appointment.objects.filter(veterinarian=veterinarian).order_by('date')
        except Veterinarian.DoesNotExist:
            return Appointment.objects.none()
    
    def create(self, request, *args, **kwargs):
        # Verificar fecha pasada
        date_str = request.data.get('date')
        if date_str:
            from datetime import datetime
            from django.utils import timezone
            try:
                appointment_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                if timezone.is_naive(appointment_date):
                    appointment_date = timezone.make_aware(appointment_date)
                if appointment_date < timezone.now():
                    return Response(
                        {'error': 'No se pueden agendar citas en fechas u horas pasadas'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except:
                pass
        
        return super().create(request, *args, **kwargs)