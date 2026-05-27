import { useState, useEffect } from "react";
import { Edit, Trash2, Save, X, User, Mail, Phone, MapPin, Loader2, Users, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function ClientManagement() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [editForm, setEditForm] = useState({});
  const { token } = useAuth();

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/clients/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      toast.error("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm(` ¿Estás seguro de eliminar a "${client.name}"?\n\nEsta acción eliminará también:\n• Todas sus mascotas\n• Todos los historiales médicos\n• Todas las citas\n\n¡Esta acción NO se puede deshacer!`)) {
      return;
    }
    
    setDeletingId(client.id_client);
    try {
      await fetch(`http://127.0.0.1:8000/api/clients/${client.id_client}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success(` Cliente ${client.name} eliminado`);
      loadClients();
    } catch (error) {
      toast.error("Error al eliminar cliente");
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (client) => {
    setEditingClient(client);
    setEditForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address || ""
    });
  };

  const saveEdit = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/clients/${editingClient.id_client}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        toast.success(` Cliente ${editForm.name} actualizado`);
        setEditingClient(null);
        loadClients();
      } else {
        toast.error("Error al actualizar cliente");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const cancelEdit = () => {
    setEditingClient(null);
    setEditForm({});
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 animate-fadeIn">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-gradient-to-br from-[#A3D459] to-[#8BC34A] rounded-xl flex items-center justify-center shadow-md">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#AA7229]">Editar Clientes</h2>
          <p className="text-sm text-gray-500">Modifica o elimina la información de tus clientes</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder=" Buscar por nombre, email o teléfono..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
           {filteredClients.length} cliente(s) encontrado(s)
        </p>
      </div>

      {/* Lista de clientes */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-[#A3D459] animate-spin" />
          <span className="ml-2 text-gray-500">Cargando clientes...</span>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {filteredClients.map(client => (
            <div 
              key={client.id_client} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-[#A3D459]/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-[#A3D459]/20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-[#A3D459]" />
                    </div>
                    <h3 className="font-semibold text-gray-800">{client.name}</h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      ID: {client.id_client}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-10">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                    {client.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                        <MapPin className="w-4 h-4" />
                        <span>{client.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button 
                    onClick={() => startEdit(client)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    title="Editar cliente"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(client)}
                    disabled={deletingId === client.id_client}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                    title="Eliminar cliente"
                  >
                    {deletingId === client.id_client ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No hay clientes registrados</p>
          <p className="text-sm text-gray-400 mt-1">Comienza registrando tu primer cliente</p>
        </div>
      )}

      {/* Modal de edición */}
      {editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn" onClick={cancelEdit}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#A3D459] to-[#8BC34A] px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white"> Editar Cliente</h3>
                <button onClick={cancelEdit} className="text-white hover:text-gray-200 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Editando: <strong>{editingClient.name}</strong>
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3D459] focus:border-transparent"
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3D459] focus:border-transparent"
                    value={editForm.email} 
                    onChange={e => setEditForm({...editForm, email: e.target.value})} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3D459] focus:border-transparent"
                    value={editForm.phone} 
                    onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3D459] focus:border-transparent"
                    rows="2"
                    value={editForm.address} 
                    onChange={e => setEditForm({...editForm, address: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button onClick={saveEdit} className="flex-1 bg-gradient-to-r from-[#A3D459] to-[#8BC34A] text-white font-semibold py-2 rounded-lg hover:shadow-md transition-all">
                   Guardar Cambios
                </button>
                <button onClick={cancelEdit} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-all">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}