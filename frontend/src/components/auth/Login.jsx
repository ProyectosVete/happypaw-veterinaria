import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, User, Lock, PawPrint, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    if (!credentials.username.trim()) newErrors.username = "El usuario es requerido";
    if (!credentials.password) newErrors.password = "La contraseña es requerida";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (data.access) {
            login(data.access, { username: credentials.username });
            
            // Obtener el usuario actual para saber su rol
            const userResponse = await fetch('http://127.0.0.1:8000/api/auth/me/', {
                headers: { 'Authorization': `Bearer ${data.access}` }
            });
            const userData = await userResponse.json();
            
            // Guardar rol en el contexto
            login(data.access, { username: credentials.username, role: userData.role });
            
            toast.success(`Bienvenido ${credentials.username}!`);
            
            if (userData.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/veterinarian');
            }
        } else {
            toast.error('Credenciales invalidas');
        }
    } catch (error) {
        toast.error('Error de conexion');
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] to-[#E8E8C0] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl border border-[#AA7229]/20 p-8 transform transition-all duration-300 hover:shadow-xl">
          
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-[#A3D459] to-[#8BC34A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <PawPrint className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#AA7229]">HAPPYPAW</h1>
            <p className="text-gray-500 mt-1">Sistema de Gestión Veterinaria</p>
          </div>
          
          <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">Iniciar Sesión</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error general */}
            {errors.form && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {errors.form}
                </p>
              </div>
            )}
            
            {/* Campo Usuario */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Usuario <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className={`w-full pl-12 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3D459] transition-all ${
                    errors.username ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tu usuario"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
              )}
            </div>
            
            {/* Campo Contraseña con botón para ver/ocultar */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3D459] transition-all ${
                    errors.password ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#A3D459] transition-colors"
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            
            {/* Enlace "¿Olvidaste tu contraseña?" */}
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-sm text-[#AA7229] hover:text-[#8B4513] hover:underline transition"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            
            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#A3D459] to-[#8BC34A] hover:from-[#8BC34A] hover:to-[#7CB342] text-white font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
          
          {/* Credenciales de prueba */}
          <div className="mt-6 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs text-center text-gray-500">
              <span className="font-semibold"> Credenciales de prueba:</span><br />
              Veterinario: -<br />
              Admin: -
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}