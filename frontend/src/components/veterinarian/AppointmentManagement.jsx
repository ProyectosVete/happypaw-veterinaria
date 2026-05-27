import { useState, useEffect } from "react";
import { Calendar, Clock, Search, Edit, Trash2, X, PawPrint, User, Stethoscope, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function AppointmentManagement() {
  const [activeTab, setActiveTab] = useState("agendar");
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [pets, setPets] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    pet_id: "",
    veterinarian_id: "",
    date: "",
    time: "",
    reason: "",
    consultation_type: "general"
  });

  const consultationTypes = [
    { value: "general", label: "Consulta General / Revision anual" },
    { value: "first", label: "Primera Consulta" },
    { value: "sickness", label: "Cita por Enfermedad" },
    { value: "emergency", label: "Cita por Emergencia" },
    { value: "specialized", label: "Consulta Especializada" },
    { value: "pre_surgical", label: "Consulta Pre-quirurgica" },
    { value: "geriatric", label: "Consulta Geriatrica" },
    { value: "telemedicine", label: "Telemedicina" },
    { value: "nutrition", label: "Consulta de Nutricion" },
    { value: "euthanasia", label: "Eutanasia" }
  ];

  const appointmentStatus = [
    { value: "scheduled", label: "Programada", color: "bg-blue-100 text-blue-800" },
    { value: "confirmed", label: "Confirmada", color: "bg-green-100 text-green-800" },
    { value: "in_progress", label: "En Curso", color: "bg-yellow-100 text-yellow-800" },
    { value: "completed", label: "Completada", color: "bg-gray-100 text-gray-800" },
    { value: "cancelled", label: "Cancelada", color: "bg-red-100 text-red-800" },
    { value: "no_show", label: "No Asistio", color: "bg-orange-100 text-orange-800" }
  ];

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  useEffect(() => {
    if (token) {
      loadPets();
      loadVeterinarians();
      loadAppointments();
    }
  }, [token]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAppointments(appointments);
    } else {
      const filtered = appointments.filter(apt =>
        (apt.pet_name && apt.pet_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (apt.client_name && apt.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (apt.veterinarian_name && apt.veterinarian_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredAppointments(filtered);
    }
  }, [searchTerm, appointments]);

  const loadPets = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/pets/', {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPets(data);
    } catch (error) {
      console.error("Error al cargar mascotas:", error);
    }
  };

  const loadVeterinarians = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/veterinarians/', {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log("Veterinarios cargados:", data);
      
      const formattedVets = data.map(vet => ({
        id_veterinarian: vet.id,
        name: vet.name,
        specialty: vet.specialty || "Medicina General",
        email: vet.email
      }));
      
      setVeterinarians(formattedVets);
    } catch (error) {
      console.error("Error al cargar veterinarios:", error);
      toast.error("Error al cargar veterinarios");
    }
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/appointments/', {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAppointments(data);
      setFilteredAppointments(data);
    } catch (error) {
      toast.error("Error al cargar citas");
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'pet_id':
        if (!value) return "Selecciona una mascota";
        return "";
      case 'veterinarian_id':
        if (!value) return "Selecciona un veterinario";
        return "";
      case 'date':
        if (!value) return "Selecciona una fecha";
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return "No se pueden agendar citas en fechas pasadas";
        return "";
      case 'time':
        if (!value) return "Selecciona una hora";
        if (formData.date) {
          const selectedDateTime = new Date(`${formData.date}T${value}`);
          const now = new Date();
          if (selectedDateTime < now) {
            return "No se pueden agendar citas en horas pasadas";
          }
        }
        return "";
      case 'reason':
        if (!value.trim()) return "El motivo es requerido";
        if (value.trim().length < 5) return "Describe el motivo con mas detalle";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const checkScheduleConflict = async (vetId, date, time, excludeId = null) => {
    try {
      const dateTimeStr = `${date}T${time}:00`;
      const response = await fetch(`http://127.0.0.1:8000/api/appointments/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const existing = await response.json();
      return existing.filter(a => 
        a.id_appointment !== excludeId && 
        a.date === dateTimeStr &&
        a.veterinarian === vetId &&
        a.status !== 'cancelled'
      ).length > 0;
    } catch (error) {
      return false;
    }
  };

  const validateForm = async () => {
    const newErrors = {};
    let isValid = true;
    
    // Validar campos requeridos
    if (!formData.pet_id) {
      newErrors.pet_id = "Selecciona una mascota";
      isValid = false;
    }
    if (!formData.veterinarian_id) {
      newErrors.veterinarian_id = "Selecciona un veterinario";
      isValid = false;
    }
    if (!formData.date) {
      newErrors.date = "Selecciona una fecha";
      isValid = false;
    }
    if (!formData.time) {
      newErrors.time = "Selecciona una hora";
      isValid = false;
    }
    if (!formData.reason || !formData.reason.trim()) {
      newErrors.reason = "El motivo es requerido";
      isValid = false;
    }
    
    // Validar fecha pasada
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "No se pueden agendar citas en fechas pasadas";
        isValid = false;
      }
    }
    
    // Validar hora pasada si es hoy
    if (formData.date && formData.time && isValid) {
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      if (selectedDateTime < now) {
        newErrors.time = "No se pueden agendar citas en horas pasadas";
        isValid = false;
      }
    }
    
    // Validar conflicto de horario
    if (formData.veterinarian_id && formData.date && formData.time && isValid) {
      const hasConflict = await checkScheduleConflict(
        formData.veterinarian_id, formData.date, formData.time, editingAppointment?.id_appointment
      );
      if (hasConflict) {
        newErrors.schedule = "El veterinario ya tiene una cita en ese horario";
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ pet_id: true, veterinarian_id: true, date: true, time: true, reason: true });
    
    const isValid = await validateForm();
    if (!isValid) {
      toast.error("Corrige los errores del formulario");
      return;
    }
    
    const vetId = parseInt(formData.veterinarian_id);
    if (isNaN(vetId) || vetId <= 0) {
      toast.error("Seleccione un veterinario valido");
      return;
    }
    
    const selectedVet = veterinarians.find(v => v.id_veterinarian === vetId);
    if (!selectedVet) {
      toast.error("Veterinario no encontrado");
      return;
    }
    
    setLoading(true);
    
    try {
      const selectedPet = pets.find(p => p.id_pet === parseInt(formData.pet_id));
      const dateTimeStr = `${formData.date}T${formData.time}:00`;
      
      const appointmentData = {
        pet: parseInt(formData.pet_id),
        veterinarian: vetId,
        date: dateTimeStr,
        reason: formData.reason,
        consultation_type: formData.consultation_type,
        status: "scheduled"
      };
      
      console.log("Enviando cita:", appointmentData);
      
      const response = await fetch('http://127.0.0.1:8000/api/appointments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });
      
      const data = await response.json();
      console.log("Respuesta:", data);
      
      if (response.ok) {
        toast.success(`Cita agendada para ${selectedPet?.name} con ${selectedVet.name}`);
        setFormData({ pet_id: "", veterinarian_id: "", date: "", time: "", reason: "", consultation_type: "general" });
        setErrors({});
        setTouched({});
        loadAppointments();
        setActiveTab("consultar");
      } else {
        console.error("Error del servidor:", data);
        if (data.error) {
          toast.error(data.error);
        } else if (data.date) {
          toast.error(data.date[0] || "Error en la fecha");
        } else if (data.non_field_errors) {
          toast.error(data.non_field_errors[0]);
        } else {
          toast.error("Error al agendar cita");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexion con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointment, newStatus) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/appointments/${appointment.id_appointment}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        toast.success(`Cita actualizada a ${appointmentStatus.find(s => s.value === newStatus)?.label}`);
        loadAppointments();
      } else {
        toast.error("Error al actualizar estado");
      }
    } catch (error) {
      toast.error("Error de conexion");
    }
  };

  const handleDelete = async (appointment) => {
    if (!window.confirm(`Cancelar la cita de ${appointment.pet_name}?`)) return;
    
    try {
      await fetch(`http://127.0.0.1:8000/api/appointments/${appointment.id_appointment}/`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success("Cita cancelada");
      loadAppointments();
    } catch (error) {
      toast.error("Error al cancelar cita");
    }
  };

  const getStatusBadge = (status) => {
    const statusInfo = appointmentStatus.find(s => s.value === status);
    return statusInfo ? `px-2 py-1 rounded-full text-xs ${statusInfo.color}` : "px-2 py-1 rounded-full text-xs bg-gray-100";
  };

  const getStatusLabel = (status) => {
    const statusInfo = appointmentStatus.find(s => s.value === status);
    return statusInfo?.label || status;
  };

  const getConsultationLabel = (type) => {
    const typeInfo = consultationTypes.find(t => t.value === type);
    return typeInfo?.label || type;
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-gradient-to-br from-[#A3D459] to-[#8BC34A] rounded-xl flex items-center justify-center shadow-md">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#AA7229]">Gestion de Citas</h2>
          <p className="text-sm text-gray-500">Agenda y administra las citas de tus pacientes</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => { setActiveTab("agendar"); setEditingAppointment(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "agendar" ? "bg-[#A3D459] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          <Calendar className="w-4 h-4" /> Agendar Cita
        </button>
        <button
          onClick={() => { setActiveTab("consultar"); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "consultar" ? "bg-[#A3D459] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          <Search className="w-4 h-4" /> Consultar Citas
        </button>
      </div>

      {/* Agendar Cita */}
      {activeTab === "agendar" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mascota <span className="text-red-500">*</span></label>
              <select 
                name="pet_id" 
                value={formData.pet_id} 
                onChange={handleChange} 
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] ${touched.pet_id && errors.pet_id ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              >
                <option value="">-- Seleccione mascota --</option>
                {pets.map(pet => (
                  <option key={pet.id_pet} value={pet.id_pet}>
                    {pet.name} - Dueño: {pet.client_name}
                  </option>
                ))}
              </select>
              {touched.pet_id && errors.pet_id && <p className="text-red-500 text-sm mt-1">{errors.pet_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Veterinario <span className="text-red-500">*</span></label>
              <select 
                name="veterinarian_id" 
                value={formData.veterinarian_id} 
                onChange={handleChange} 
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] ${touched.veterinarian_id && errors.veterinarian_id ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              >
                <option value="">-- Seleccione un veterinario --</option>
                {veterinarians.map(vet => (
                  <option key={vet.id_veterinarian} value={vet.id_veterinarian}>
                    {vet.name} - {vet.specialty}
                  </option>
                ))}
              </select>
              {touched.veterinarian_id && errors.veterinarian_id && <p className="text-red-500 text-sm mt-1">{errors.veterinarian_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                name="date" 
                min={minDate} 
                value={formData.date} 
                onChange={handleChange} 
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] ${touched.date && errors.date ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {touched.date && errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hora <span className="text-red-500">*</span></label>
              <select 
                name="time" 
                value={formData.time} 
                onChange={handleChange} 
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] ${touched.time && errors.time ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              >
                <option value="">-- Seleccione una hora --</option>
                {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
              </select>
              {touched.time && errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Consulta <span className="text-red-500">*</span></label>
              <select 
                name="consultation_type" 
                value={formData.consultation_type} 
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459]"
              >
                {consultationTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo / Sintomas <span className="text-red-500">*</span></label>
              <textarea 
                name="reason" 
                rows="3" 
                placeholder="Describa el motivo de la consulta..." 
                value={formData.reason} 
                onChange={handleChange} 
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] ${touched.reason && errors.reason ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {touched.reason && errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
            </div>
          </div>

          {errors.schedule && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {errors.schedule}
              </p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-[#A3D459] to-[#8BC34A] hover:from-[#8BC34A] hover:to-[#7CB342] text-white font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Agendando...
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                Agendar Cita
              </>
            )}
          </button>
        </form>
      )}

      {/* Consultar Citas */}
      {activeTab === "consultar" && (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por mascota, dueño o veterinario..."
              className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500 mb-3">{filteredAppointments.length} cita(s) encontrada(s)</p>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-[#A3D459] animate-spin" />
              <span className="ml-2 text-gray-500">Cargando citas...</span>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {filteredAppointments.map(apt => {
                const dateObj = new Date(apt.date);
                const dateStr = dateObj.toISOString().split('T')[0];
                const timeStr = apt.date.split('T')[1]?.substring(0, 5) || "";
                
                return (
                  <div key={apt.id_appointment} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <div className="w-8 h-8 bg-[#A3D459]/20 rounded-full flex items-center justify-center">
                            <PawPrint className="w-4 h-4 text-[#A3D459]" />
                          </div>
                          <h3 className="font-bold text-gray-800">{apt.pet_name || "Mascota"}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(apt.status)}`}>
                            {getStatusLabel(apt.status)}
                          </span>
                        </div>
                        <div className="ml-10 space-y-1">
                          <p className="text-sm text-gray-600"><User className="inline w-3 h-3 mr-1" /> Dueño: {apt.client_name || "No especificado"}</p>
                          <p className="text-sm text-gray-600"><Stethoscope className="inline w-3 h-3 mr-1" /> Veterinario: {apt.veterinarian_name || "No especificado"}</p>
                          <p className="text-sm text-gray-600"><Calendar className="inline w-3 h-3 mr-1" /> Fecha: {dateStr} - Hora: {timeStr}</p>
                          <p className="text-sm text-gray-600">Motivo: {apt.reason}</p>
                          <p className="text-sm text-gray-600">Tipo: {getConsultationLabel(apt.consultation_type)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <select
                          value={apt.status}
                          onChange={(e) => updateStatus(apt, e.target.value)}
                          className="text-xs p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459]"
                        >
                          {appointmentStatus.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <button
                          onClick={() => handleDelete(apt)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Cancelar cita"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No hay citas agendadas</p>
              <p className="text-sm text-gray-400 mt-1">Comienza agendando una nueva cita</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}