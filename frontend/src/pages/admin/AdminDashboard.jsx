import { useState } from "react";
import { Shield, Users, UserPlus, LogOut } from "lucide-react";
import UserManagement from "../../components/admin/UserManagement";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("usuarios");
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] to-[#E8E8C0]">
      <header className="bg-white shadow-md border-b-4 border-[#A3D459] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#8B4513] to-[#AA7229] rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#AA7229]">HAPPYPAW Admin</h1>
                <p className="text-sm text-[#AA7229]/70">Panel de Administracion</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Bienvenido</p>
                <p className="font-semibold text-[#AA7229]">{user?.username}</p>
              </div>
              <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all">
                <LogOut className="w-4 h-4" /> Cerrar Sesion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-3 mb-8">
          <button onClick={() => setActiveTab("usuarios")} className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all ${activeTab === "usuarios" ? "bg-[#8B4513] text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"}`}>
            <Users className="w-4 h-4" /> Gestionar Usuarios
          </button>
        </div>

        {activeTab === "usuarios" && <UserManagement />}
      </main>

      <footer className="bg-white border-t border-[#AA7229] mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-center text-sm text-[#AA7229]/60">© 2026 HAPPYPAW - Panel de Administracion</p>
        </div>
      </footer>
    </div>
  );
}