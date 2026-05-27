import { useState, useEffect } from "react";
import { Search, User, Phone, Mail, MapPin, PawPrint } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function ClientSearch() {
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Ingresa un nombre o email para buscar");
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get(`/clients/?search=${query}`);
      setClients(response.data);
      setSelectedClient(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al buscar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 animate-fadeIn">
      <div className="flex items-center gap-2 mb-6">
        <Search className="w-6 h-6 text-[#A3D459]" />
        <h2 className="text-xl font-bold text-[#AA7229]">Búsqueda de Clientes</h2>
      </div>
      
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Buscar por nombre o email..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#A3D459]"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-[#A3D459] hover:bg-[#8BC34A] text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>
      
      <div className="space-y-4">
        {clients.map((client) => (
          <div 
            key={client.id_client} 
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
            onClick={() => setSelectedClient(client)}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#A3D459]/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-[#A3D459]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{client.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{client.phone}</span>
                  </div>
                  {client.address && (
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="w-4 h-4" />
                      <span>{client.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {clients.length === 0 && query && !loading && (
          <p className="text-center text-gray-500 py-8">No se encontraron clientes</p>
        )}
      </div>

      {/* Modal de detalles del cliente */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedClient(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#AA7229]">Detalles del Cliente</h3>
              <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Nombre</label>
                <p className="font-medium">{selectedClient.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p>{selectedClient.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Teléfono</label>
                <p>{selectedClient.phone}</p>
              </div>
              {selectedClient.address && (
                <div>
                  <label className="text-sm text-gray-500">Dirección</label>
                  <p>{selectedClient.address}</p>
                </div>
              )}
              <div className="pt-4">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="w-full bg-[#A3D459] hover:bg-[#8BC34A] text-white py-2 rounded-lg transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}