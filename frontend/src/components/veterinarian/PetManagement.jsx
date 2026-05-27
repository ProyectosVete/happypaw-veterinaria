import { useState, useEffect } from "react";
import { PawPrint, Search, Edit, Trash2, User, Dog, Cat, Bird, Rabbit, Save, X } from "lucide-react";
import toast from "react-hot-toast";

export default function PetManagement() {
  const [activeTab, setActiveTab] = useState("registrar");
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPet, setEditingPet] = useState(null);
  const [clients, setClients] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    species: "dog",
    breed: "",
    age: "",
    client_id: ""
  });
  const [errors, setErrors] = useState({});

  // Especies disponibles
  const speciesList = [
    { value: "dog", label: "Perro", icon: Dog },
    { value: "cat", label: "Gato", icon: Cat },
    { value: "bird", label: "Ave", icon: Bird },
    { value: "rabbit", label: "Conejo", icon: Rabbit },
    { value: "other", label: "Otro", icon: PawPrint }
  ];

  // Cargar datos guardados
  useEffect(() => {
    // Cargar clientes
    const savedClients = localStorage.getItem('veterinary_clients');
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    } else {
      // Clientes de ejemplo
      const mockClients = [
        { id_client: 1, name: "María López", email: "maria@test.com", phone: "5551234567" },
        { id_client: 2, name: "Juan Pérez", email: "juan@test.com", phone: "5557654321" },
        { id_client: 3, name: "Ana García", email: "ana@test.com", phone: "5559876543" }
      ];
      setClients(mockClients);
      localStorage.setItem('veterinary_clients', JSON.stringify(mockClients));
    }

    // Cargar mascotas
    const savedPets = localStorage.getItem('veterinary_pets');
    if (savedPets) {
      setPets(JSON.parse(savedPets));
      setFilteredPets(JSON.parse(savedPets));
    } else {
      // Mascotas de ejemplo
      const mockPets = [
        { id_pet: 1, name: "Max", species: "dog", breed: "Labrador", age: 3, client_id: 1, client_name: "María López" },
        { id_pet: 2, name: "Luna", species: "cat", breed: "Siamés", age: 2, client_id: 2, client_name: "Juan Pérez" },
        { id_pet: 3, name: "Rocky", species: "dog", breed: "Pastor Alemán", age: 5, client_id: 1, client_name: "María López" }
      ];
      setPets(mockPets);
      setFilteredPets(mockPets);
      localStorage.setItem('veterinary_pets', JSON.stringify(mockPets));
    }
  }, []);

  // Guardar mascotas en localStorage
  const saveToLocalStorage = (newPets) => {
    localStorage.setItem('veterinary_pets', JSON.stringify(newPets));
  };

  // Filtrar mascotas
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPets(pets);
    } else {
      const filtered = pets.filter(pet =>
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pet.client_name && pet.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPets(filtered);
    }
  }, [searchTerm, pets]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "El nombre de la mascota es requerido";
    if (!formData.client_id) newErrors.client_id = "Debes seleccionar un dueño";
    if (!formData.age) newErrors.age = "La edad es requerida";
    else if (isNaN(formData.age) || formData.age < 0) newErrors.age = "Edad válida requerida";
    else if (formData.age > 50) newErrors.age = "¿La edad es correcta?";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const selectedClient = clients.find(c => c.id_client === parseInt(formData.client_id));
    
    const newPet = {
      id_pet: Date.now(),
      name: formData.name,
      species: formData.species,
      breed: formData.breed,
      age: parseInt(formData.age),
      client_id: parseInt(formData.client_id),
      client_name: selectedClient?.name || "Desconocido"
    };
    
    const newPets = [...pets, newPet];
    setPets(newPets);
    setFilteredPets(newPets);
    saveToLocalStorage(newPets);
    
    const speciesLabel = speciesList.find(s => s.value === formData.species)?.label || formData.species;
    toast.success(`${formData.name} (${speciesLabel}) registrado como mascota de ${selectedClient?.name}`);
    
    setFormData({ name: "", species: "dog", breed: "", age: "", client_id: "" });
    setActiveTab("consultar");
  };

  const handleDelete = (pet) => {
    if (!window.confirm(`¿Eliminar a ${pet.name}? Esta acción no se puede deshacer.`)) return;
    const newPets = pets.filter(p => p.id_pet !== pet.id_pet);
    setPets(newPets);
    setFilteredPets(newPets);
    saveToLocalStorage(newPets);
    toast.success(`Mascota ${pet.name} eliminada`);
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || "",
      age: pet.age.toString(),
      client_id: pet.client_id.toString()
    });
  };

  const handleSaveEdit = () => {
    if (!validateForm()) return;
    if (!window.confirm(`¿Guardar cambios para ${editingPet.name}?`)) return;
    
    const selectedClient = clients.find(c => c.id_client === parseInt(formData.client_id));
    
    const updatedPets = pets.map(p => 
      p.id_pet === editingPet.id_pet ? { 
        ...p, 
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        age: parseInt(formData.age),
        client_id: parseInt(formData.client_id),
        client_name: selectedClient?.name || "Desconocido"
      } : p
    );
    
    setPets(updatedPets);
    setFilteredPets(updatedPets);
    saveToLocalStorage(updatedPets);
    toast.success("Mascota actualizada");
    setEditingPet(null);
  };

  const cancelEdit = () => {
    setEditingPet(null);
    setFormData({ name: "", species: "dog", breed: "", age: "", client_id: "" });
  };

  const getSpeciesIcon = (species) => {
    const found = speciesList.find(s => s.value === species);
    return found?.icon || PawPrint;
  };

  const getSpeciesLabel = (species) => {
    const found = speciesList.find(s => s.value === species);
    return found?.label || species;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 animate-fadeIn">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => {
            setActiveTab("registrar");
            setEditingPet(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition ${
            activeTab === "registrar" 
              ? "bg-[#A3D459] text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <PawPrint className="w-4 h-4" />
          Registrar Mascota
        </button>
        <button
          onClick={() => setActiveTab("consultar")}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition ${
            activeTab === "consultar" 
              ? "bg-[#A3D459] text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Search className="w-4 h-4" />
          Consultar Mascotas
        </button>
      </div>

      {/* Registrar Mascota */}
      {activeTab === "registrar" && (
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Dueño */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dueño de la mascota *</label>
            <select 
              className={`w-full p-2 border rounded ${errors.client_id ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.client_id}
              onChange={e => setFormData({...formData, client_id: e.target.value})}
              required
            >
              <option value="">-- Seleccione un dueño --</option>
              {clients.map(client => (
                <option key={client.id_client} value={client.id_client}>
                  {client.name} - {client.email}
                </option>
              ))}
            </select>
            {errors.client_id && <p className="text-red-500 text-sm mt-1">{errors.client_id}</p>}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la mascota *</label>
            <input 
              type="text" 
              className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="Ej: Max, Luna, Rocky"
              required 
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Especie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Especie *</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {speciesList.map((species) => {
                const Icon = species.icon;
                const isSelected = formData.species === species.value;
                return (
                  <button
                    key={species.value}
                    type="button"
                    onClick={() => setFormData({...formData, species: species.value})}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition ${
                      isSelected
                        ? "border-[#A3D459] bg-[#A3D459]/10 text-[#A3D459]"
                        : "border-gray-300 hover:border-[#A3D459] text-gray-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{species.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Raza */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Raza </label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded"
              value={formData.breed} 
              onChange={e => setFormData({...formData, breed: e.target.value})} 
              placeholder="Ej: Labrador, Siamés, Pastor Alemán (opcional)"
            />
          </div>

          {/* Edad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Edad (años) *</label>
            <input 
              type="number" 
              className={`w-full p-2 border rounded ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.age} 
              onChange={e => setFormData({...formData, age: e.target.value})} 
              placeholder="Ej: 2, 3.5"
              min="0"
              step="0.5"
              required 
            />
            {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
          </div>

          {/* Vista previa */}
          {(formData.name || formData.species) && (
            <div className="bg-[#F5F5DC] rounded-lg p-3 mt-2">
              <p className="text-sm text-gray-600">
                <strong>Vista previa:</strong> {formData.name || "Sin nombre"} - 
                {speciesList.find(s => s.value === formData.species)?.label || "Especie"}
                {formData.breed && ` - ${formData.breed}`}
                {formData.age && ` - ${formData.age} años`}
              </p>
            </div>
          )}

          <button type="submit" className="w-full bg-[#A3D459] hover:bg-[#8BC34A] text-white font-semibold py-2 rounded transition">
            Registrar Mascota
          </button>
        </form>
      )}

      {/* Consultar Mascotas */}
      {activeTab === "consultar" && (
        <>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar por nombre de mascota o nombre del dueño..." 
                className="w-full pl-10 p-2 border border-gray-300 rounded"
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">{filteredPets.length} mascota(s) encontrada(s)</p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredPets.map(pet => {
              const Icon = getSpeciesIcon(pet.species);
              return (
                <div key={pet.id_pet} className="border rounded-lg p-3 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#A3D459]/20 rounded-full flex items-center justify-center">
                          <Icon className="w-4 h-4 text-[#A3D459]" />
                        </div>
                        <h3 className="font-semibold text-gray-800">{pet.name}</h3>
                        <span className="text-xs text-gray-400">ID: {pet.id_pet}</span>
                      </div>
                      <div className="ml-10 mt-1 space-y-1">
                        <p className="text-sm text-gray-600">🐾 Especie: {getSpeciesLabel(pet.species)}</p>
                        {pet.breed && <p className="text-sm text-gray-600">📋 Raza: {pet.breed}</p>}
                        <p className="text-sm text-gray-600">🎂 Edad: {pet.age} años</p>
                        <p className="text-sm text-gray-600">👤 Dueño: {pet.client_name}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(pet)} 
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded transition"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(pet)} 
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredPets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <PawPrint className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No hay mascotas registradas</p>
                {searchTerm && <p className="text-sm mt-1">No se encontraron resultados para "{searchTerm}"</p>}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de edición */}
      {editingPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelEdit}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#AA7229]">Editar Mascota</h3>
              <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dueño *</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={formData.client_id}
                  onChange={e => setFormData({...formData, client_id: e.target.value})}
                >
                  <option value="">-- Seleccione un dueño --</option>
                  {clients.map(client => (
                    <option key={client.id_client} value={client.id_client}>
                      {client.name} - {client.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especie *</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={formData.species}
                  onChange={e => setFormData({...formData, species: e.target.value})}
                >
                  {speciesList.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded"
                  value={formData.breed} 
                  onChange={e => setFormData({...formData, breed: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edad (años) *</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded"
                  value={formData.age} 
                  onChange={e => setFormData({...formData, age: e.target.value})} 
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={handleSaveEdit} className="flex-1 bg-[#A3D459] hover:bg-[#8BC34A] text-white py-2 rounded transition">
                Guardar
              </button>
              <button onClick={cancelEdit} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}