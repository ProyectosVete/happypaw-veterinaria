import { useState, useEffect } from "react";
import { PawPrint, Search, Edit, Trash2, Loader2, X, Dog, Cat, Bird, Rabbit } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function PetList() {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingPet, setEditingPet] = useState(null);
  const [editForm, setEditForm] = useState({});
  const { token } = useAuth();

  const speciesList = [
    { value: "dog", label: "Perro", icon: Dog },
    { value: "cat", label: "Gato", icon: Cat },
    { value: "bird", label: "Ave", icon: Bird },
    { value: "rabbit", label: "Conejo", icon: Rabbit },
    { value: "other", label: "Otro", icon: PawPrint }
  ];

  useEffect(() => {
    if (token) {
      loadAllPets();
    }
  }, [token]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPets(pets);
    } else {
      const filtered = pets.filter(pet =>
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPets(filtered);
    }
  }, [searchTerm, pets]);

  const loadAllPets = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/pets/', {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPets(data);
      setFilteredPets(data);
    } catch (error) {
      toast.error("Error al cargar mascotas");
    } finally {
      setLoading(false);
    }
  };

  const getSpeciesIcon = (species) => {
    const found = speciesList.find(s => s.value === species);
    return found?.icon || PawPrint;
  };

  const getSpeciesLabel = (species, customSpecies) => {
    if (species === 'other' && customSpecies) {
      return customSpecies;
    }
    const found = speciesList.find(s => s.value === species);
    return found?.label || species;
  };

  const getAgeDisplay = (age, ageUnit) => {
    if (ageUnit === 'months') {
      return `${age} meses`;
    }
    return `${age} años`;
  };

  const getSpeciesColor = () => {
    return "bg-[#A3D459] text-white";
  };

  const handleDelete = async (pet) => {
    if (!window.confirm(`Eliminar a "${pet.name}"? Esta accion no se puede deshacer.`)) {
      return;
    }
    
    setDeletingId(pet.id_pet);
    try {
      await fetch(`http://127.0.0.1:8000/api/pets/${pet.id_pet}/`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success(`Mascota ${pet.name} eliminada`);
      loadAllPets();
    } catch (error) {
      toast.error("Error al eliminar mascota");
    } finally {
      setDeletingId(null);
    }
  };

 const startEdit = (pet) => {
    console.log("Editando mascota:", pet);
    console.log("Client ID:", pet.client_id || pet.client);
    
    setEditingPet(pet);
    setEditForm({
        name: pet.name,
        species: pet.species,
        custom_species: pet.custom_species || "",
        breed: pet.breed || "",
        age: pet.age.toString(),
        age_unit: pet.age_unit || "years"
    });
};

const saveEdit = async () => {
    // Validaciones
    if (!editForm.name || editForm.name.trim() === "") {
        toast.error("El nombre de la mascota es requerido");
        return;
    }
    if (!editForm.age || editForm.age <= 0) {
        toast.error("La edad es requerida y debe ser mayor a 0");
        return;
    }
    
    // Validar especie personalizada
    if (editForm.species === 'other' && !editForm.custom_species.trim()) {
        toast.error("Especifica la especie");
        return;
    }
    
    let breedValue = editForm.breed.trim();
    if (breedValue === "") {
        breedValue = "Raza desconocida";
    }
    
    //  Asegurar que client_id se envía correctamente
    const clientId = editingPet.client_id || editingPet.client;
    
    if (!clientId) {
        toast.error("Error: No se encontró el ID del dueño");
        console.error("editingPet:", editingPet);
        return;
    }
    
    const updateData = {
        name: editForm.name,
        species: editForm.species,
        custom_species: editForm.species === 'other' ? editForm.custom_species : "",
        breed: breedValue,
        age: parseInt(editForm.age),
        age_unit: editForm.age_unit,
        client: clientId  // ← Usar el ID correcto
    };
    
    console.log("Enviando actualización:", updateData);
    
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/pets/${editingPet.id_pet}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        
        const data = await response.json();
        console.log("Respuesta:", data);
        
        if (response.ok) {
            toast.success(`Mascota ${editForm.name} actualizada`);
            setEditingPet(null);
            loadAllPets();
        } else {
            toast.error(`Error: ${data.message || data.error || "Verifica los datos"}`);
        }
    } catch (error) {
        console.error("Error:", error);
        toast.error("Error de conexion con el servidor");
    }
};

  const cancelEdit = () => {
    setEditingPet(null);
    setEditForm({});
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-gradient-to-br from-[#A3D459] to-[#8BC34A] rounded-xl flex items-center justify-center shadow-md">
          <PawPrint className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#AA7229]">Consultar Mascotas</h2>
          <p className="text-sm text-gray-500">Busca por nombre de mascota o nombre del dueño</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar por nombre de mascota o nombre del dueño..."
          className="w-full pl-10 pr-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Contador de resultados */}
      <p className="text-xs text-gray-500 mb-3">
        {filteredPets.length} mascota(s) encontrada(s)
      </p>

      {/* Lista de mascotas */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-[#A3D459] animate-spin" />
          <span className="ml-2 text-gray-500">Cargando mascotas...</span>
        </div>
      ) : filteredPets.length > 0 ? (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {filteredPets.map(pet => {
            const Icon = getSpeciesIcon(pet.species);
            const speciesLabel = getSpeciesLabel(pet.species, pet.custom_species);
            const ageDisplay = getAgeDisplay(pet.age, pet.age_unit);
            const displayBreed = pet.breed === "Raza desconocida" ? "Raza desconocida" : pet.breed;
            return (
              <div key={pet.id_pet} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-[#A3D459]/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${getSpeciesColor()} rounded-full flex items-center justify-center shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{pet.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          Especie: {speciesLabel}
                        </span>
                        {displayBreed && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            Raza: {displayBreed}
                          </span>
                        )}
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          Edad: {ageDisplay}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          Dueño: {pet.client_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEdit(pet)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar mascota"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(pet)}
                      disabled={deletingId === pet.id_pet}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                      title="Eliminar mascota"
                    >
                      {deletingId === pet.id_pet ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <PawPrint className="w-16 h-16 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">
            {searchTerm 
              ? `No se encontraron mascotas para "${searchTerm}"` 
              : "No hay mascotas registradas en el sistema"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {!searchTerm && "Comienza registrando tu primera mascota"}
          </p>
        </div>
      )}

      {/* Modal de edicion */}
      {editingPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelEdit}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#A3D459] to-[#8BC34A] px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Editar Mascota</h3>
                <button onClick={cancelEdit} className="text-white hover:text-gray-200 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  Editando: <strong>{editingPet.name}</strong> - Dueño: {editingPet.client_name}
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3D459] focus:border-transparent"
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  />
                </div>
                
                {/* Especie */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Especie *</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3D459]"
                    value={editForm.species}
                    onChange={e => setEditForm({...editForm, species: e.target.value})}
                  >
                    {speciesList.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                
                {/* Especie personalizada (si es "Otro") */}
                {editForm.species === 'other' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Especificar especie *</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3D459]"
                      placeholder="Ej: Hurón, Erizo, etc."
                      value={editForm.custom_species} 
                      onChange={e => setEditForm({...editForm, custom_species: e.target.value})} 
                    />
                  </div>
                )}
                
                {/* Raza */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Raza</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Si se deja vacío, se guardará como 'Raza desconocida'"
                    value={editForm.breed} 
                    onChange={e => setEditForm({...editForm, breed: e.target.value})} 
                  />
                </div>
                
                {/* Edad con selector de unidad */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Edad *</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      step="0.5"
                      className="flex-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3D459]"
                      value={editForm.age} 
                      onChange={e => setEditForm({...editForm, age: e.target.value})} 
                    />
                    <select
                      value={editForm.age_unit}
                      onChange={e => setEditForm({...editForm, age_unit: e.target.value})}
                      className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3D459]"
                    >
                      <option value="years">Años</option>
                      <option value="months">Meses</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button onClick={saveEdit} className="flex-1 bg-[#A3D459] text-white py-2 rounded-lg hover:bg-[#8BC34A] transition">
                  Guardar Cambios
                </button>
                <button onClick={cancelEdit} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg transition">
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