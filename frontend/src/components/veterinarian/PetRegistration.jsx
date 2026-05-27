import { useState, useEffect } from "react";
import { PawPrint, Save, AlertCircle, Eye, Dog, Cat, Bird, Rabbit, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { fetchSafeArray, getToken } from "../../utils/apiUtils";

export default function PetRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    species: "dog",
    custom_species: "",
    breed: "",
    age: "",
    age_unit: "years",
    client: ""
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
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
      loadClients();
    }
  }, [token]);

  const loadClients = async () => {
    setLoadingClients(true);
    try {
      // ✅ Usar fetchSafeArray que siempre retorna un array
      const data = await fetchSafeArray('http://127.0.0.1:8000/api/clients/', {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, []);
      
      setClients(data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'client':
        if (!value) return "Selecciona un dueño";
        return "";
      case 'name':
        if (!value.trim()) return "El nombre de la mascota es requerido";
        if (value.trim().length < 2) return "El nombre debe tener al menos 2 caracteres";
        return "";
      case 'custom_species':
        if (formData.species === 'other' && !value.trim()) return "Especifica la especie";
        return "";
      case 'age':
        if (!value) return "La edad es requerida";
        if (isNaN(value) || value < 0) return "Ingresa una edad válida";
        if (formData.age_unit === 'years' && value > 50) return "¿La edad es correcta?";
        if (formData.age_unit === 'months' && value > 120) return "Los meses no pueden exceder 120";
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
    
    ['client', 'name', 'age'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    if (formData.species === 'other' && !formData.custom_species.trim()) {
      newErrors.custom_species = "Especifica la especie";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ client: true, name: true, age: true });
    
    if (!validateForm()) {
        toast.error("Corrige los errores del formulario");
        return;
    }
    
    setLoading(true);
    
    let breedValue = formData.breed.trim();
    if (breedValue === "") {
        breedValue = "Raza desconocida";
    }
    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/pets/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: formData.name,
                species: formData.species,
                custom_species: formData.species === 'other' ? formData.custom_species : "",
                breed: breedValue,
                age: parseInt(formData.age),
                age_unit: formData.age_unit,
                client: parseInt(formData.client)
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const selectedClient = clients.find(c => c.id_client === parseInt(formData.client));
            const speciesDisplay = formData.species === 'other' ? formData.custom_species : speciesList.find(s => s.value === formData.species)?.label;
            toast.success(`${formData.name} (${speciesDisplay}) registrada para ${selectedClient?.name}`);
            setFormData({ 
                name: "", species: "dog", custom_species: "", breed: "", 
                age: "", age_unit: "years", client: "" 
            });
            setErrors({});
            setTouched({});
        } else {
            if (data.non_field_errors) {
                toast.error(data.non_field_errors[0]);
            } else if (data.name) {
                toast.error(data.name[0]);
            } else if (data.message) {
                toast.error(data.message);
            } else {
                toast.error("Error al registrar mascota");
            }
        }
    } catch (error) {
        console.error("Error:", error);
        toast.error("Error de conexion con el servidor");
    } finally {
        setLoading(false);
    }
};

  const selectedClient = Array.isArray(clients) 
    ? clients.find(c => c.id_client === parseInt(formData.client)) 
    : null;
  const selectedSpecies = speciesList.find(s => s.value === formData.species);
  const SpeciesIcon = selectedSpecies?.icon || PawPrint;
  
  const displayBreed = formData.breed.trim() === "" ? "Raza desconocida" : formData.breed;
  const displaySpecies = formData.species === 'other' && formData.custom_species 
    ? formData.custom_species 
    : selectedSpecies?.label || "Especie";
  const displayAge = `${formData.age} ${formData.age_unit === 'years' ? 'años' : 'meses'}`;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-gradient-to-br from-[#A3D459] to-[#8BC34A] rounded-xl flex items-center justify-center shadow-md">
          <PawPrint className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#AA7229]">Registrar Mascota</h2>
          <p className="text-sm text-gray-500">Ingresa los datos del paciente veterinario</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dueño de la mascota */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Dueño de la mascota <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            {loadingClients ? (
              <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Cargando clientes...
              </div>
            ) : (
              <select
                name="client"
                value={formData.client}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] ${
                  touched.client && errors.client ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">-- Seleccione un dueño --</option>
                {Array.isArray(clients) && clients.map(client => (
                  <option key={client.id_client} value={client.id_client}>
                    {client.name} - {client.email}
                  </option>
                ))}
              </select>
            )}
          </div>
          {touched.client && errors.client && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.client}
            </p>
          )}
        </div>

        {/* Resto del formulario igual... */}
        {/* Nombre de la mascota */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nombre de la mascota <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="Ej: Max, Luna, Rocky"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] ${
              touched.name && errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {touched.name && errors.name && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.name}
            </p>
          )}
        </div>

        {/* Especie */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Especie <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">
            {speciesList.map((species) => {
              const Icon = species.icon;
              const isSelected = formData.species === species.value;
              return (
                <button
                  key={species.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, species: species.value, custom_species: "" }))}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
                    isSelected 
                      ? "bg-[#A3D459] text-white shadow-md transform scale-105" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{species.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Campo para especie personalizada */}
          {formData.species === 'other' && (
            <div className="mt-2">
              <input
                type="text"
                name="custom_species"
                placeholder="Especifique la especie (ej: Hurón, Erizo, etc.)"
                value={formData.custom_species}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] ${
                  touched.custom_species && errors.custom_species ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {touched.custom_species && errors.custom_species && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.custom_species}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Raza */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Raza</label>
          <input
            type="text"
            name="breed"
            placeholder="Ej: Labrador, Siamés, Pastor Alemán (opcional)"
            value={formData.breed}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459]"
          />
          <p className="mt-1 text-xs text-gray-400">
            Si no se especifica, se guardará como "Raza desconocida"
          </p>
        </div>

        {/* Edad con selector de unidad */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Edad <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              name="age"
              step="0.5"
              placeholder="Ej: 2"
              value={formData.age}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] ${
                touched.age && errors.age ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            <select
              name="age_unit"
              value={formData.age_unit}
              onChange={handleChange}
              className="w-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459]"
            >
              <option value="years">Años</option>
              <option value="months">Meses</option>
            </select>
          </div>
          {touched.age && errors.age && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.age}
            </p>
          )}
        </div>

        {/* Vista previa */}
        {(formData.name || displayBreed || formData.age || selectedClient) && (
          <div className="bg-gradient-to-r from-[#F5F5DC] to-[#F5F5DC]/50 rounded-lg p-4 border border-[#A3D459]/30">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-[#A3D459]" />
              <span className="text-sm font-semibold text-gray-600">Vista previa</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                <SpeciesIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">
                  {formData.name || "Nombre pendiente"}
                </h3>
                <p className="text-sm text-gray-600">
                  {displaySpecies} | {formData.age ? displayAge : "? años"}
                  {displayBreed && ` | ${displayBreed}`}
                </p>
                {selectedClient && (
                  <p className="text-xs text-gray-500">Dueño: {selectedClient.name}</p>
                )}
              </div>
            </div>
          </div>
        )}

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
              Registrar Mascota
            </>
          )}
        </button>
      </form>
    </div>
  );
}