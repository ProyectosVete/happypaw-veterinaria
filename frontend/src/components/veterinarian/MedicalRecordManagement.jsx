import { useState, useEffect } from "react";
import { FileText, Search, Edit, Trash2, Printer, Calendar, PawPrint, User, Stethoscope, Pill, AlertCircle, Loader2, X } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function MedicalRecordManagement() {
  const [activeTab, setActiveTab] = useState("registrar");
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    pet_id: "",
    consultation_date: new Date().toISOString().split('T')[0],
    diagnosis: "",
    treatment: "",
    prescription: "",
    notes: "",
    weight: "",
    temperature: "",
    heart_rate: ""
  });

  // Funcion para mostrar valor o "Sin datos registrados"
  const displayValue = (value, unit = "") => {
    if (!value || value === "" || value === null || value === 0) {
      return "Sin datos registrados";
    }
    return `${value} ${unit}`.trim();
  };

  useEffect(() => {
    if (token) {
      loadPets();
      loadMedicalRecords();
    }
  }, [token]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRecords(records);
    } else {
      const filtered = records.filter(record =>
        (record.pet_name && record.pet_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.client_name && record.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredRecords(filtered);
    }
  }, [searchTerm, records]);

  const loadPets = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/pets/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPets(data);
    } catch (error) {
      console.error("Error al cargar mascotas:", error);
    }
  };

  const loadMedicalRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/medical-records/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRecords(data);
      setFilteredRecords(data);
    } catch (error) {
      toast.error("Error al cargar historial");
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'pet_id':
        if (!value) return "Selecciona una mascota";
        return "";
      case 'diagnosis':
        if (!value.trim()) return "El diagnóstico es requerido";
        if (value.trim().length < 3) return "Describe el diagnóstico con más detalle";
        return "";
      case 'treatment':
        if (!value.trim()) return "El tratamiento es requerido";
        if (value.trim().length < 3) return "Describe el tratamiento con mas detalle";
        return "";
      case 'weight':
        if (value && (isNaN(value) || value < 0)) return "Ingresa un peso valido";
        return "";
      case 'temperature':
        if (value && (isNaN(value) || value < 30 || value > 45)) return "Temperatura fuera de rango (30-45 C)";
        return "";
      case 'heart_rate':
        if (value && (isNaN(value) || value < 20 || value > 200)) return "Frecuencia cardiaca fuera de rango (20-200 lpm)";
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

    ['pet_id', 'diagnosis', 'treatment'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setTouched({ pet_id: true, diagnosis: true, treatment: true });

    if (!validateForm()) {
      toast.error("Corrige los errores del formulario");
      return;
    }

    setLoading(true);

    try {
      const selectedPet = pets.find(p => p.id_pet === parseInt(formData.pet_id));

      const recordData = {
        pet: parseInt(formData.pet_id),
        date: formData.consultation_date,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        prescription: formData.prescription || "",
        notes: formData.notes || "",
        weight: formData.weight || null,
        temperature: formData.temperature || null,
        heart_rate: formData.heart_rate || null
      };

      const response = await fetch('http://127.0.0.1:8000/api/medical-records/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(recordData)
      });

      const data = await response.json();

      if (data.id_record) {
        toast.success(`Consulta registrada para ${selectedPet?.name}`);
        setFormData({
          pet_id: "",
          consultation_date: new Date().toISOString().split('T')[0],
          diagnosis: "",
          treatment: "",
          prescription: "",
          notes: "",
          weight: "",
          temperature: "",
          heart_rate: ""
        });
        setErrors({});
        setTouched({});
        loadMedicalRecords();
        setActiveTab("consultar");
      } else {
        toast.error("Error al registrar consulta");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexion con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Eliminar este registro de ${record.pet_name || "mascota"}? Esta accion no se puede deshacer.`)) {
      return;
    }

    try {
      await fetch(`http://127.0.0.1:8000/api/medical-records/${record.id_record}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success("Registro eliminado");
      loadMedicalRecords();
    } catch (error) {
      toast.error("Error al eliminar registro");
    }
  };

  const handleEdit = (record) => {
    if (!record) {
      toast.error("Error: Registro no encontrado");
      return;
    }

    setEditingRecord(record);
    setFormData({
      pet_id: record.pet ? record.pet.toString() : "",
      consultation_date: record.date || new Date().toISOString().split('T')[0],
      diagnosis: record.diagnosis || "",
      treatment: record.treatment || "",
      prescription: record.prescription || "",
      notes: record.notes || "",
      weight: record.weight || "",
      temperature: record.temperature || "",
      heart_rate: record.heart_rate || ""
    });
    setErrors({});
    setTouched({});
  };

  const handleSaveEdit = async () => {
     // Validar campos obligatorios
    if (!formData.diagnosis || !formData.diagnosis.trim()) {
        toast.error("El diagnóstico es obligatorio");
        setErrors(prev => ({ ...prev, diagnosis: "El diagnóstico es requerido" }));
        return;
    }
    
    if (!formData.treatment || !formData.treatment.trim()) {
        toast.error("El tratamiento es obligatorio");
        setErrors(prev => ({ ...prev, treatment: "El tratamiento es requerido" }));
        return;
    }
    
    if (!formData.pet_id) {
        toast.error("Selecciona una mascota");
        return;
    }
    
    if (!validateForm()) return;
    if (!window.confirm(`Guardar cambios para este registro?`)) return;

    setLoading(true);
    try {
      const updateData = {
        pet: parseInt(formData.pet_id),
        date: formData.consultation_date,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        prescription: formData.prescription || "",
        notes: formData.notes || "",
        weight: formData.weight || null,
        temperature: formData.temperature || null,
        heart_rate: formData.heart_rate || null
      };

      const response = await fetch(`http://127.0.0.1:8000/api/medical-records/${editingRecord.id_record}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        toast.success("Registro actualizado");
        setEditingRecord(null);
        loadMedicalRecords();
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        toast.error("Error al actualizar registro");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingRecord(null);
    setFormData({
      pet_id: "",
      consultation_date: new Date().toISOString().split('T')[0],
      diagnosis: "",
      treatment: "",
      prescription: "",
      notes: "",
      weight: "",
      temperature: "",
      heart_rate: ""
    });
  };

  const generatePrescriptionPDF = (record) => {
    const doc = new jsPDF();

    doc.setFillColor(163, 212, 89);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("RECETA MEDICA", 105, 25, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("HAPPYPAW - Clinica Veterinaria", 105, 45, { align: "center" });
    doc.text("Tel: (999) 123-4567 | Email: clinica@happypaw.com", 105, 52, { align: "center" });

    doc.line(20, 58, 190, 58);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL PACIENTE", 20, 70);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Nombre: ${record.pet_name || "No especificado"}`, 20, 80);
    doc.text(`Dueño: ${record.client_name || "No especificado"}`, 20, 88);
    doc.text(`Fecha de consulta: ${record.date || "No especificada"}`, 20, 96);

    // Mostrar "Sin datos registrados" si no hay valores
    if (record.weight && record.weight !== "") {
      doc.text(`Peso: ${record.weight} kg`, 120, 80);
    } else {
      doc.text(`Peso: Sin datos registrados`, 120, 80);
    }
    if (record.temperature && record.temperature !== "") {
      doc.text(`Temperatura: ${record.temperature} C`, 120, 88);
    } else {
      doc.text(`Temperatura: Sin datos registrados`, 120, 88);
    }
    if (record.heart_rate && record.heart_rate !== "") {
      doc.text(`Frecuencia cardiaca: ${record.heart_rate} lpm`, 120, 96);
    } else {
      doc.text(`Frecuencia cardiaca: Sin datos registrados`, 120, 96);
    }

    doc.setFont("helvetica", "bold");
    doc.text("DIAGNÓSTICO", 20, 115);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const diagnosisLines = doc.splitTextToSize(record.diagnosis || "No especificado", 170);
    doc.text(diagnosisLines, 20, 125);

    let yPos = 135 + (diagnosisLines.length * 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TRATAMIENTO", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const treatmentLines = doc.splitTextToSize(record.treatment || "No especificado", 170);
    doc.text(treatmentLines, 20, yPos + 10);

    yPos = yPos + 15 + (treatmentLines.length * 5);

    if (record.prescription && record.prescription !== "SIN MEDICAMENTO") {
      doc.setFont("helvetica", "bold");
      doc.text("RECETA", 20, yPos);
      doc.setFont("helvetica", "normal");
      const prescriptionLines = doc.splitTextToSize(record.prescription, 170);
      doc.text(prescriptionLines, 20, yPos + 10);
      yPos = yPos + 20 + (prescriptionLines.length * 5);
    }

    if (record.notes) {
      doc.setFont("helvetica", "bold");
      doc.text("NOTAS ADICIONALES", 20, yPos);
      doc.setFont("helvetica", "normal");
      const notesLines = doc.splitTextToSize(record.notes, 170);
      doc.text(notesLines, 20, yPos + 10);
    }

    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text("Este documento es una receta medica valida. Su uso indebido es sancionado.", 105, 280, { align: "center" });

    doc.line(140, 270, 190, 270);
    doc.text("Firma del Veterinario", 165, 278, { align: "center" });

    doc.save(`receta_${record.pet_name || "mascota"}_${record.date || "fecha"}.pdf`);
    toast.success("Receta generada en PDF");
  };

  const maxDate = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-gradient-to-br from-[#A3D459] to-[#8BC34A] rounded-xl flex items-center justify-center shadow-md">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#AA7229]">Historial Medico</h2>
          <p className="text-sm text-gray-500">Registro y gestion de consultas veterinarias</p>
        </div>
      </div>

      {/* Tabs - Solo Registrar y Consultar */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => { setActiveTab("registrar"); setEditingRecord(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "registrar" ? "bg-[#A3D459] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          <FileText className="w-4 h-4" /> Registrar Consulta
        </button>
        <button
          onClick={() => { setActiveTab("consultar"); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "consultar" ? "bg-[#A3D459] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          <Search className="w-4 h-4" /> Consultar Historial
        </button>
      </div>

      {/* Registrar Consulta */}
      {activeTab === "registrar" && (
    <form onSubmit={handleRegister} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Mascota <span className="text-red-500">*</span>
                </label>
              <select
                name="pet_id"
                value={formData.pet_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459] ${touched.pet_id && errors.pet_id ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
              >
                <option value="">-- Seleccione mascota --</option>
                {pets.map(pet => (
                  <option key={pet.id_pet} value={pet.id_pet}>
                    {pet.name} - Dueño: {pet.client_name}
                  </option>
                ))}
              </select>
              {touched.pet_id && errors.pet_id && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.pet_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Fecha de consulta
              </label>
              <input
                type="date"
                name="consultation_date"
                max={maxDate}
                value={formData.consultation_date}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                name="weight"
                placeholder="Ej: 25.5"
                value={formData.weight}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-lg ${touched.weight && errors.weight ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
              />
              {touched.weight && errors.weight && <p className="mt-1 text-sm text-red-500">{errors.weight}</p>}
              <p className="mt-1 text-xs text-gray-400">Si no se ingresan datos, se regisrará como "sin datos registrados"</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Temperatura (C)</label>
              <input
                type="number"
                step="0.1"
                name="temperature"
                placeholder="Ej: 38.5"
                value={formData.temperature}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-lg ${touched.temperature && errors.temperature ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
              />
              {touched.temperature && errors.temperature && <p className="mt-1 text-sm text-red-500">{errors.temperature}</p>}
              <p className="mt-1 text-xs text-gray-400">Si no se ingresan datos, se regisrará como "sin datos registrados"</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Frecuencia cardiaca (lpm)</label>
              <input
                type="number"
                name="heart_rate"
                placeholder="Ej: 90"
                value={formData.heart_rate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-lg ${touched.heart_rate && errors.heart_rate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
              />
              {touched.heart_rate && errors.heart_rate && <p className="mt-1 text-sm text-red-500">{errors.heart_rate}</p>}
              <p className="mt-1 text-xs text-gray-400">Si no se ingresan datos, se regisrará como "sin datos registrados"</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
                Diagnóstico <span className="text-red-500">*</span>
            </label>
            <textarea
                name="diagnosis"
                rows="3"
                placeholder="Describa el diagnóstico..."
                value={formData.diagnosis}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-lg ${touched.diagnosis && errors.diagnosis ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            />
            {touched.diagnosis && errors.diagnosis && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.diagnosis}
                </p>
            )}
        </div>

        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tratamiento <span className="text-red-500">*</span>
            </label>
            <textarea
                name="treatment"
                rows="3"
                placeholder="Describa el tratamiento..."
                value={formData.treatment}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-lg ${touched.treatment && errors.treatment ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            />
            {touched.treatment && errors.treatment && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.treatment}
                </p>
            )}
        </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Receta (Medicamentos)</label>
            <textarea
              name="prescription"
              rows="3"
              placeholder="Ej: Amoxicilina 250mg cada 12h por 7 dias..."
              value={formData.prescription}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459]"
            />
            <p className="mt-1 text-xs text-gray-400">Opcional</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notas adicionales</label>
            <textarea
              name="notes"
              rows="2"
              placeholder="Observaciones adicionales..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#A3D459] to-[#8BC34A] hover:from-[#8BC34A] hover:to-[#7CB342] text-white font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Registrar Consulta
              </>
            )}
          </button>
        </form>
      )}

      {/* Consultar Historial General */}
      {activeTab === "consultar" && (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por mascota, dueño o diagnóstico..."
              className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500 mb-3">
            {filteredRecords.length} registro(s) encontrado(s)
          </p>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-[#A3D459] animate-spin" />
              <span className="ml-2 text-gray-500">Cargando historial...</span>
            </div>
          ) : filteredRecords.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {filteredRecords.map(record => (
                <div key={record.id_record} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <div className="w-8 h-8 bg-[#A3D459]/20 rounded-full flex items-center justify-center">
                          <PawPrint className="w-4 h-4 text-[#A3D459]" />
                        </div>
                        <h3 className="font-bold text-gray-800">{record.pet_name || "Mascota no especificada"}</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Fecha: {record.date || "No especificada"}
                        </span>
                      </div>
                      <div className="ml-10 space-y-1">
                        <p className="text-sm text-gray-600">
                          <User className="inline w-3 h-3 mr-1" /> Dueño: {record.client_name || "No especificado"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <Stethoscope className="inline w-3 h-3 mr-1" /> Diagnóstico: {record.diagnosis || "No especificado"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <Pill className="inline w-3 h-3 mr-1" /> Tratamiento: {record.treatment || "No especificado"}
                        </p>
                        {/* Signos vitales con "Sin datos registrados" */}
                        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Peso: {displayValue(record.weight, "kg")}
                          </p>
                          <p className="text-xs text-gray-500">
                            Temperatura: {displayValue(record.temperature, "C")}
                          </p>
                          <p className="text-xs text-gray-500">
                            Frec. cardiaca: {displayValue(record.heart_rate, "lpm")}
                          </p>
                        </div>
                        {record.prescription && record.prescription !== "SIN MEDICAMENTO" && (
                          <p className="text-sm text-gray-600">
                            Receta: {record.prescription.length > 50 ? record.prescription.substring(0, 50) + "..." : record.prescription}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {/* Boton de imprimir PDF */}
                      {record.prescription && record.prescription !== "SIN MEDICAMENTO" && (
                        <button
                          onClick={() => generatePrescriptionPDF(record)}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all"
                          title="Imprimir receta PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(record)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(record)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No hay registros medicos</p>
              <p className="text-sm text-gray-400 mt-1">Comienza registrando una consulta</p>
            </div>
          )}
        </>
      )}

      {/* Modal de edicion */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelEdit}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#A3D459] to-[#8BC34A] px-6 py-4 sticky top-0">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Editar Consulta</h3>
                <button onClick={cancelEdit} className="text-white hover:text-gray-200 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  Editando consulta de: <strong>{editingRecord.pet_name || "Mascota"}</strong> - {editingRecord.date || "Fecha no especificada"}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mascota</label>
                    <select
                      value={formData.pet_id}
                      onChange={e => setFormData({ ...formData, pet_id: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Seleccione mascota</option>
                      {pets.map(pet => (
                        <option key={pet.id_pet} value={pet.id_pet}>{pet.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={formData.consultation_date}
                      onChange={e => setFormData({ ...formData, consultation_date: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={e => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="Sin datos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura (C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.temperature}
                      onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="Sin datos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frec. cardiaca</label>
                    <input
                      type="number"
                      value={formData.heart_rate}
                      onChange={e => setFormData({ ...formData, heart_rate: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="Sin datos"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico <span className="text-red-500">*</span></label>
                  <textarea
                    rows="2"
                    value={formData.diagnosis}
                    onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tratamiento <span className="text-red-500">*</span></label>
                  <textarea
                    rows="2"
                    value={formData.treatment}
                    onChange={e => setFormData({ ...formData, treatment: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receta</label>
                  <textarea
                    rows="2"
                    value={formData.prescription}
                    onChange={e => setFormData({ ...formData, prescription: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    rows="2"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={handleSaveEdit} className="flex-1 bg-[#A3D459] text-white py-2 rounded-lg hover:bg-[#8BC34A] transition">
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