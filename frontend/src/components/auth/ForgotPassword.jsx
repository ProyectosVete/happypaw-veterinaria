import { useState } from "react";
import { Mail, ArrowLeft, Send, PawPrint } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Ingresa tu correo electrónico");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/password-reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        toast.success("Revisa tu correo para las instrucciones");
      } else {
        toast.error(data.error || "Error al enviar el correo");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] to-[#E8E8C0] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#AA7229]/20 p-8 text-center">
            <div className="w-16 h-16 bg-[#A3D459] rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#AA7229] mb-2">Revisa tu correo</h2>
            <p className="text-gray-600 mb-4">
              Hemos enviado instrucciones para restablecer tu contraseña a:
            </p>
            <p className="font-semibold text-[#AA7229] mb-6">{email}</p>
            <Link
              to="/login"
              className="inline-block w-full bg-[#A3D459] hover:bg-[#8BC34A] text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Volver al inicio de sesión
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
            <p className="text-gray-500 mt-1">Recuperar contraseña</p>
          </div>
          
          <h2 className="text-xl font-semibold text-center text-gray-700 mb-2">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="text-center text-gray-500 text-sm mb-6">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] transition-all"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#A3D459] to-[#8BC34A] hover:from-[#8BC34A] hover:to-[#7CB342] text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar instrucciones
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-[#AA7229] hover:text-[#8B4513] hover:underline transition flex items-center justify-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}