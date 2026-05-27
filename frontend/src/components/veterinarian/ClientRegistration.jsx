import { useState } from "react";
import { UserPlus, Save, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function ClientRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return "El nombre es obligatorio";
        if (value.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
        return "";
      case 'email':
        if (!value.trim()) return "El email es obligatorio";
        if (!/\S+@\S+\.\S+/.test(value)) return "Ingresa un email válido";
        return "";
      case 'phone':
        if (!value.trim()) return "El teléfono es obligatorio";
        if (!/^\d{10,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) return "Teléfono inválido (10-15 dígitos)";
        return "";
      case 'address':
        if (!value.trim()) return "La dirección es obligatoria";
        if (value.trim().length < 5) return "La dirección debe ser más específica";
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

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    ['name', 'email', 'phone', 'address'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, address: true });
    
    if (!validateForm()) {
      toast.error(" Corrige los errores del formulario");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/clients/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.id_client) {
        toast.success(` Cliente ${formData.name} registrado`);
        setFormData({ name: "", email: "", phone: "", address: "" });
        setErrors({});
        setTouched({});
      } else if (data.email) {
        setErrors({ email: "Este email ya está registrado" });
        toast.error(" Este email ya está registrado");
      } else {
        toast.error("Error al registrar cliente");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-gradient-to-br from-[#A3D459] to-[#8BC34A] rounded-xl flex items-center justify-center shadow-md">
          <UserPlus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#AA7229]">Registrar Cliente</h2>
          <p className="text-sm text-gray-500">Ingresa los datos del nuevo cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] transition-all ${
              touched.name && errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Ej: María López García"
          />
          {touched.name && errors.name && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] transition-all ${
              touched.email && errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="correo@ejemplo.com"
          />
          {touched.email && errors.email && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.email}
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] transition-all ${
              touched.phone && errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="9991234567"
          />
          {touched.phone && errors.phone && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.phone}
            </p>
          )}
        </div>

        {/* Dirección (AHORA OBLIGATORIA) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Dirección <span className="text-red-500">*</span>
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            onBlur={handleBlur}
            rows="3"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] transition-all ${
              touched.address && errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Calle, número, colonia, ciudad, código postal"
          />
          {touched.address && errors.address && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.address}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#A3D459] to-[#8BC34A] hover:from-[#8BC34A] hover:to-[#7CB342] text-white font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Registrando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Registrar Cliente
            </>
          )}
        </button>
      </form>
    </div>
  );
}