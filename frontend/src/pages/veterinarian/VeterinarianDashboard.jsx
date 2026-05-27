import { useState, useEffect } from "react";
import { 
  PawPrint, Users, Calendar, FileText, UserPlus, Search, Dog, 
  LogOut, Home, CalendarCheck, Activity, Stethoscope, Clock, 
  TrendingUp, Award
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ClientRegistration from "../../components/veterinarian/ClientRegistration";
import ClientList from "../../components/veterinarian/ClientList";
import PetRegistration from "../../components/veterinarian/PetRegistration";
import PetList from "../../components/veterinarian/PetList";
import AppointmentManagement from "../../components/veterinarian/AppointmentManagement";
import MedicalRecordManagement from "../../components/veterinarian/MedicalRecordManagement";

// Mapeo de especialidades a español
const specialtyMap = {
    'general': 'Medicina General',
    'surgery': 'Cirugia',
    'dermatology': 'Dermatologia',
    'dentistry': 'Odontologia',
    'cardiology': 'Cardiologia',
    'ophthalmology': 'Oftalmologia',
    'nutrition': 'Nutricion',
    'emergency': 'Medicina de Emergencia',
    'rehabilitation': 'Rehabilitacion',
    'other': 'Otra'
};

export default function VeterinarianDashboard() {
  const [activeTab, setActiveTab] = useState("inicio");
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    weeklyAppointments: 0,
    totalPets: 0,
    totalClients: 0,
    weeklyPetVisits: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const { user, token, logout } = useAuth();

  const tabs = [
    { id: "inicio", label: "Inicio", icon: Home },
    { id: "registroCliente", label: "Registrar Cliente", icon: UserPlus },
    { id: "listaClientes", label: "Mis Clientes", icon: Users },
    { id: "registroMascota", label: "Registrar Mascota", icon: Dog },
    { id: "listaMascotas", label: "Mis Mascotas", icon: PawPrint },
    { id: "citas", label: "Citas", icon: Calendar },
    { id: "historial", label: "Historial", icon: FileText }
  ];

  // Funcion para obtener el dia de la semana
  const getDayName = () => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    return days[new Date().getDay()];
  };

  // Obtener saludo segun la hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos dias";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const getSpecialtyLabel = (specialty) => {
    return specialtyMap[specialty] || specialty || "Medicina General";
  };

  // Cargar datos del usuario actual
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!token) return;
      try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/me/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setCurrentUser(data);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
      }
    };
    loadCurrentUser();
  }, [token]);

  // Cargar datos del veterinario para nombre completo
  useEffect(() => {
    const loadVeterinarianData = async () => {
      if (!token || !currentUser?.email) return;
      try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/veterinarians/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const veterinarians = await response.json();
        const vetData = veterinarians.find(v => v.email === currentUser.email);
        if (vetData) {
          setCurrentUser(prev => ({
            ...prev,
            vet_name: vetData.name,
            vet_specialty: vetData.specialty
          }));
        }
      } catch (error) {
        console.error("Error al cargar datos del veterinario:", error);
      }
    };
    loadVeterinarianData();
  }, [token, currentUser?.email]);

  // Cargar estadisticas
  useEffect(() => {
    const loadStats = async () => {
      if (!token || activeTab !== "inicio") return;
      
      setLoadingStats(true);
      try {
        const appointmentsRes = await fetch('http://127.0.0.1:8000/api/appointments/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const appointments = await appointmentsRes.json();
        
        const petsRes = await fetch('http://127.0.0.1:8000/api/pets/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const pets = await petsRes.json();
        
        const clientsRes = await fetch('http://127.0.0.1:8000/api/clients/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const clients = await clientsRes.json();
        
        const pending = appointments.filter(apt => 
          apt.status === 'scheduled' || apt.status === 'confirmed'
        );
        
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const weekly = appointments.filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate >= startOfWeek && aptDate <= endOfWeek;
        });
        
        const weeklyPetIds = new Set(weekly.map(apt => apt.pet));
        const weeklyPetsCount = weeklyPetIds.size;
        
        setStats({
          pendingAppointments: pending.length,
          weeklyAppointments: weekly.length,
          totalPets: pets.length,
          totalClients: clients.length,
          weeklyPetVisits: weeklyPetsCount
        });
      } catch (error) {
        console.error("Error al cargar estadisticas:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    loadStats();
  }, [token, activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] to-[#E8E8C0]">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-[#A3D459] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#A3D459] to-[#8BC34A] rounded-xl flex items-center justify-center shadow-lg">
                <PawPrint className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#AA7229]">HAPPYPAW</h1>
                <p className="text-sm text-[#AA7229]/70">Sistema de Gestion Veterinaria</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">{getGreeting()}</p>
                <p className="font-semibold text-[#AA7229]">
                  {currentUser?.vet_name || currentUser?.first_name || currentUser?.username || "Veterinario"}
                </p>
                {currentUser?.vet_specialty && (
                  <p className="text-xs text-gray-400">{getSpecialtyLabel(currentUser.vet_specialty)}</p>
                )}
              </div>
              <button 
                onClick={logout} 
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Navegacion con pestañas */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id 
                  ? "bg-[#A3D459] text-white shadow-md transform scale-105" 
                  : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pantalla de Inicio (Dashboard) */}
        {activeTab === "inicio" && (
          <div className="animate-fadeIn">
            {/* Bienvenida */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#AA7229]">
                    {getGreeting()}, {currentUser?.vet_name || currentUser?.first_name || currentUser?.username || "Veterinario"}!
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Hoy es {getDayName()}, {new Date().toLocaleDateString('es-MX')}
                  </p>
                  {currentUser?.vet_specialty && (
                    <p className="text-sm text-[#A3D459] mt-2 flex items-center gap-1">
                      <Stethoscope className="w-4 h-4" />
                      Especialidad: {getSpecialtyLabel(currentUser.vet_specialty)}
                    </p>
                  )}
                </div>
                <div className="w-16 h-16 bg-[#A3D459]/20 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-[#A3D459]" />
                </div>
              </div>
            </div>

            {/* Tarjetas de estadisticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Citas Pendientes</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.pendingAppointments}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Citas esta Semana</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.weeklyAppointments}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <CalendarCheck className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Mascotas Atendidas</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.weeklyPetVisits}</p>
                    <p className="text-xs text-gray-400">en la semana</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Mascotas</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalPets}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Dog className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Seccion de actividad reciente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                  <Calendar className="w-5 h-5 text-[#A3D459]" />
                  <h3 className="text-lg font-semibold text-[#AA7229]">Proximas Citas</h3>
                </div>
                {loadingStats ? (
                  <div className="text-center py-8 text-gray-500">Cargando...</div>
                ) : stats.pendingAppointments > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">Tienes {stats.pendingAppointments} cita(s) pendiente(s)</p>
                    <div className="mt-4">
                      <button 
                        onClick={() => setActiveTab("citas")}
                        className="w-full bg-[#A3D459]/10 hover:bg-[#A3D459]/20 text-[#A3D459] font-semibold py-2 rounded-lg transition"
                      >
                        Ver todas las citas
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>No hay citas pendientes</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                  <TrendingUp className="w-5 h-5 text-[#A3D459]" />
                  <h3 className="text-lg font-semibold text-[#AA7229]">Resumen General</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Total clientes registrados</span>
                    <span className="font-bold text-[#AA7229]">{stats.totalClients}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Total mascotas registradas</span>
                    <span className="font-bold text-[#AA7229]">{stats.totalPets}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Citas completadas</span>
                    <span className="font-bold text-[#AA7229]">
                      {stats.weeklyAppointments - stats.pendingAppointments > 0 
                        ? stats.weeklyAppointments - stats.pendingAppointments 
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido de los otros modulos */}
        <div className="animate-fadeIn">
          {activeTab === "registroCliente" && <ClientRegistration />}
          {activeTab === "listaClientes" && <ClientList />}
          {activeTab === "registroMascota" && <PetRegistration />}
          {activeTab === "listaMascotas" && <PetList />}
          {activeTab === "citas" && <AppointmentManagement />}
          {activeTab === "historial" && <MedicalRecordManagement />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#AA7229] mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-center text-sm text-[#AA7229]/60">
            © 2026 HAPPYPAW - Clinica Veterinaria | Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}