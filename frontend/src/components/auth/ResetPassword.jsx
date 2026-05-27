import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, PawPrint } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.new_password) {
      newErrors.new_password = "La contraseña es requerida";
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = "La contraseña debe tener al menos 6 caracteres";
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = "Confirma tu contraseña";
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Las contraseñas no coinciden";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Corrige los errores del formulario");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/password-reset/confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          token,
          new_password: formData.new_password,
          confirm_password: formData.confirm_password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        toast.success("Contraseña restablecida exitosamente");
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast.error(data.error || "Error al restablecer la contraseña");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] to-[#E8E8C0] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#AA7229]/20 p-8 text-center">
            <div className="w-16 h-16 bg-[#A3D459] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#AA7229] mb-2">
              ¡Contraseña restablecida!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu contraseña ha sido actualizada exitosamente.
            </p>
            <Link
              to="/login"
              className="inline-block w-full bg-[#A3D459] hover:bg-[#8BC34A] text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] to-[#E8E8C0] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl border border-[#AA7229]/20 p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#A3D459] to-[#8BC34A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <PawPrint className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#AA7229]">HAPPYPAW</h1>
            <p className="text-gray-500 mt-1">Restablecer contraseña</p>
          </div>
          
          <h2 className="text-xl font-semibold text-center text-gray-700 mb-2">
            Nueva contraseña
          </h2>
          <p className="text-center text-gray-500 text-sm mb-6">
            Ingresa tu nueva contraseña para continuar
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nueva contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.new_password}
                  onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                  onBlur={() => validateForm()}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] transition-all ${
                    errors.new_password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.new_password && (
                <p className="mt-1 text-sm text-red-500">{errors.new_password}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Confirmar contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                  onBlur={() => validateForm()}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] transition-all ${
                    errors.confirm_password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Confirma tu contraseña"
                  required
                />
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-500">{errors.confirm_password}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#A3D459] to-[#8BC34A] hover:from-[#8BC34A] hover:to-[#7CB342] text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Restableciendo...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Restablecer contraseña
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-[#AA7229] hover:text-[#8B4513] hover:underline transition">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}