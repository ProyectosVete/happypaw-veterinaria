import { useState, useEffect } from "react";
import { 
    UserPlus, Users, Search, Edit, Trash2, X, Shield, User, 
    Phone, Mail, CreditCard, AlertCircle, Eye, EyeOff, Stethoscope, Loader2 
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function UserManagement() {
    const [activeTab, setActiveTab] = useState("crear");
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { token } = useAuth();
    
    const specialtiesList = [
        { value: "general", label: "Medicina General" },
        { value: "surgery", label: "Cirugia" },
        { value: "dermatology", label: "Dermatologia" },
        { value: "dentistry", label: "Odontologia" },
        { value: "cardiology", label: "Cardiologia" },
        { value: "ophthalmology", label: "Oftalmologia" },
        { value: "nutrition", label: "Nutricion" },
        { value: "emergency", label: "Medicina de Emergencia" },
        { value: "rehabilitation", label: "Rehabilitacion" },
        { value: "other", label: "Otra" },
    ];
    
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        first_name: "",
        last_name: "",
        role: "veterinarian",
        phone: "",
        cedula: "",
        specialty: "general"
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (token) {
            loadUsers();
        }
    }, [token]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/users/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            toast.error("Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'username':
                if (!value.trim()) return "El nombre de usuario es requerido";
                if (value.trim().length < 3) return "El nombre de usuario debe tener al menos 3 caracteres";
                return "";
            case 'first_name':
                if (!value.trim()) return "El nombre es obligatorio";
                return "";
            case 'last_name':
                if (!value.trim()) return "El apellido es obligatorio";
                return "";
            case 'email':
                if (!value.trim()) return "El email es requerido";
                if (!/^\S+@\S+\.\S+$/.test(value)) return "Ingresa un email válido";
                return "";
            case 'phone':
                if (!value.trim()) return "El teléfono es requerido";
                if (!/^\d{10}$/.test(value)) return "El teléfono debe tener exactamente 10 dígitos numéricos";
                return "";
            case 'cedula':
                if (formData.role === "veterinarian" && !value.trim()) return "La cédula es requerida para veterinarios";
                if (value && !/^\d{8}$/.test(value)) return "La cédula debe tener exactamente 8 dígitos numéricos";
                return "";
            case 'password':
                if (!editingUser && !value) return "La contraseña es requerida";
                if (value && value.length < 6) return "La contraseña debe tener al menos 6 caracteres";
                return "";
            case 'confirmPassword':
                if (formData.password && value !== formData.password) return "Las contraseñas no coinciden";
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
        
        const fieldsToValidate = editingUser 
            ? ['username', 'first_name', 'last_name', 'email', 'phone']
            : ['username', 'first_name', 'last_name', 'email', 'phone', 'password', 'confirmPassword'];
        
        if (formData.role === "veterinarian") {
            fieldsToValidate.push('cedula');
        }
        
        fieldsToValidate.forEach(field => {
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
        
        setTouched({
            username: true, first_name: true, last_name: true,
            email: true, phone: true, password: true, confirmPassword: true
        });
        
        if (!validateForm()) {
            toast.error("Por favor corrige los errores del formulario");
            return;
        }
        
        setLoading(true);
        
        const userData = {
            username: formData.username.trim(),
            password: formData.password,
            email: formData.email.trim(),
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            role: formData.role,
            phone: formData.phone.trim(),
            cedula: formData.role === "veterinarian" ? formData.cedula.trim() : "",
            specialty: formData.role === "veterinarian" ? formData.specialty : ""
        };
        
        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                toast.success(`Usuario ${formData.username} creado exitosamente`);
                setFormData({
                    username: "", password: "", confirmPassword: "", email: "",
                    first_name: "", last_name: "", role: "veterinarian", phone: "", cedula: "", specialty: "general"
                });
                setErrors({});
                setTouched({});
                await loadUsers();
                setActiveTab("ver");
            } else {
                if (data.username) {
                    toast.error(data.username[0]);
                    setErrors({ username: data.username[0] });
                } else if (data.email) {
                    toast.error(data.email[0]);
                    setErrors({ email: data.email[0] });
                } else if (data.phone) {
                    toast.error(data.phone[0]);
                    setErrors({ phone: data.phone[0] });
                } else if (data.cedula) {
                    toast.error(data.cedula[0]);
                    setErrors({ cedula: data.cedula[0] });
                } else {
                    toast.error(data.error || "Error al crear usuario");
                }
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`¿Eliminar a ${user.username}? Esta acción no se puede deshacer.`)) return;
        
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/auth/users/${user.id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                toast.success("Usuario eliminado");
                loadUsers();
            } else {
                toast.error(data.error || "Error al eliminar usuario");
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
    };

    const startEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: "",
            confirmPassword: "",
            email: user.email,
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            role: user.role,
            phone: user.phone || "",
            cedula: user.cedula || "",
            specialty: user.specialty || "general"
        });
        setErrors({});
        setTouched({});
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const saveEdit = async () => {
        setTouched({
            username: true, first_name: true, last_name: true,
            email: true, phone: true
        });
        
        if (formData.role === "veterinarian") {
            setTouched(prev => ({ ...prev, cedula: true }));
        }
        
        if (!validateForm()) return;
        
        const updateData = {
            username: formData.username,
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role,
            phone: formData.phone,
            cedula: formData.cedula,
            specialty: formData.role === "veterinarian" ? formData.specialty : ""
        };
        
        if (formData.password) {
            updateData.password = formData.password;
        }
        
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/auth/users/${editingUser.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                toast.success("Usuario actualizado");
                setEditingUser(null);
                loadUsers();
            } else {
                if (data.username) {
                    toast.error(data.username[0]);
                    setErrors({ username: data.username[0] });
                } else if (data.email) {
                    toast.error(data.email[0]);
                    setErrors({ email: data.email[0] });
                } else if (data.phone) {
                    toast.error(data.phone[0]);
                    setErrors({ phone: data.phone[0] });
                } else if (data.cedula) {
                    toast.error(data.cedula[0]);
                    setErrors({ cedula: data.cedula[0] });
                } else {
                    toast.error(data.error || "Error al actualizar usuario");
                }
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setFormData({
            username: "", password: "", confirmPassword: "", email: "",
            first_name: "", last_name: "", role: "veterinarian", phone: "", cedula: "", specialty: "general"
        });
        setErrors({});
        setTouched({});
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const getRoleBadge = (role) => {
        return role === "admin" 
            ? "bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
            : "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1";
    };

    const getSpecialtyLabel = (specialty) => {
        const found = specialtiesList.find(s => s.value === specialty);
        return found ? found.label : specialty;
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A3D459] to-[#8BC34A] rounded-xl flex items-center justify-center shadow-md">
                    <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#AA7229]">Gestión de Usuarios</h2>
                    <p className="text-sm text-gray-500">Registra y administra veterinarios y administradores</p>
                </div>
            </div>

            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => { setActiveTab("crear"); setEditingUser(null); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "crear" ? "bg-[#A3D459] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                    <UserPlus className="w-4 h-4" /> Crear Usuario
                </button>
                <button
                    onClick={() => setActiveTab("ver")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "ver" ? "bg-[#A3D459] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                    <Users className="w-4 h-4" /> Ver Usuarios
                </button>
            </div>

            {/* Crear Usuario */}
            {activeTab === "crear" && (
                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nombre de usuario */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Nombre de usuario <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full p-2 border rounded-lg ${touched.username && errors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                placeholder="usuario123"
                            />
                            {touched.username && errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full pl-10 p-2 border rounded-lg ${touched.email && errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                            {touched.email && errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Contraseña <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full p-2 border rounded-lg pr-10 ${touched.password && errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                    placeholder="Mínimo 6 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#A3D459]"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {touched.password && errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>

                        {/* Confirmar contraseña */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Confirmar contraseña <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full p-2 border rounded-lg pr-10 ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                    placeholder="Repite la contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#A3D459]"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {touched.confirmPassword && errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                        </div>

                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full p-2 border rounded-lg ${touched.first_name && errors.first_name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                placeholder="Nombre"
                            />
                            {touched.first_name && errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                        </div>

                        {/* Apellido */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Apellido <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full p-2 border rounded-lg ${touched.last_name && errors.last_name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                placeholder="Apellido"
                            />
                            {touched.last_name && errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                        </div>

                        {/* Rol */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Rol <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="admin"
                                        checked={formData.role === "admin"}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-[#A3D459]"
                                    />
                                    <Shield className="w-4 h-4 text-purple-600" />
                                    <span>Administrador</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="veterinarian"
                                        checked={formData.role === "veterinarian"}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-[#A3D459]"
                                    />
                                    <User className="w-4 h-4 text-green-600" />
                                    <span>Veterinario</span>
                                </label>
                            </div>
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Teléfono <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full pl-10 p-2 border rounded-lg ${touched.phone && errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                    placeholder="10 dígitos numéricos"
                                />
                            </div>
                            {touched.phone && errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>

                        {/* Campos para veterinario */}
                        {formData.role === "veterinarian" && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Cédula profesional <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            name="cedula"
                                            value={formData.cedula}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full pl-10 p-2 border rounded-lg ${touched.cedula && errors.cedula ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            placeholder="8 dígitos numéricos"
                                        />
                                    </div>
                                    {touched.cedula && errors.cedula && <p className="text-red-500 text-sm mt-1">{errors.cedula}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Especialidad <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <select
                                            name="specialty"
                                            value={formData.specialty}
                                            onChange={handleChange}
                                            className="w-full pl-10 p-2 border border-gray-300 rounded-lg"
                                        >
                                            {specialtiesList.map(spec => (
                                                <option key={spec.value} value={spec.value}>{spec.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#A3D459] to-[#8BC34A] hover:from-[#8BC34A] hover:to-[#7CB342] text-white font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creando...</> : <><UserPlus className="w-5 h-5" /> Crear Usuario</>}
                    </button>
                </form>
            )}

            {/* Ver Usuarios */}
            {activeTab === "ver" && (
                <>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar por usuario, nombre o email..."
                            className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3D459]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{filteredUsers.length} usuario(s) encontrado(s)</p>

                    {loading ? (
                        <div className="flex justify-center items-center py-12"><Loader2 className="w-8 h-8 text-[#A3D459] animate-spin" /><span className="ml-2 text-gray-500">Cargando usuarios...</span></div>
                    ) : filteredUsers.length > 0 ? (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {filteredUsers.map(user => (
                                <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <div className="w-8 h-8 bg-[#A3D459]/20 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-[#A3D459]" />
                                                </div>
                                                <h3 className="font-bold text-gray-800">{user.username}</h3>
                                                <span className={getRoleBadge(user.role)}>
                                                    {user.role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                    {user.role === "admin" ? "Administrador" : "Veterinario"}
                                                </span>
                                            </div>
                                            <div className="ml-10 space-y-1">
                                                <p className="text-sm text-gray-600">Nombre: {user.first_name} {user.last_name}</p>
                                                <p className="text-sm text-gray-600">Email: {user.email}</p>
                                                <p className="text-sm text-gray-600">Teléfono: {user.phone}</p>
                                                {user.cedula && <p className="text-sm text-gray-600">Cédula: {user.cedula}</p>}
                                                {user.specialty && <p className="text-sm text-gray-600">Especialidad: {getSpecialtyLabel(user.specialty)}</p>}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button onClick={() => startEdit(user)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(user)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12"><Users className="w-16 h-16 mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No hay usuarios registrados</p></div>
                    )}
                </>
            )}

            {/* Modal de edición */}
            {editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelEdit}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-[#A3D459] to-[#8BC34A] px-6 py-4 sticky top-0">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Editar Usuario</h3>
                                <button onClick={cancelEdit} className="text-white hover:text-gray-200 transition"><X className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-700">Editando: <strong>{editingUser.username}</strong> ({editingUser.role === "admin" ? "Administrador" : "Veterinario"})</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Usuario *</label>
                                    <input type="text" name="username" value={formData.username} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2 border rounded-lg ${touched.username && errors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                                    {touched.username && errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2 border rounded-lg ${touched.email && errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                                    {touched.email && errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nueva contraseña (opcional)</label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded-lg pr-10" placeholder="Dejar vacío para mantener" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"><Eye className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar</label>
                                    <div className="relative">
                                        <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full p-2 border rounded-lg pr-10" />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"><Eye className="w-4 h-4" /></button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2 border rounded-lg ${touched.first_name && errors.first_name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                                    {touched.first_name && errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido *</label>
                                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2 border rounded-lg ${touched.last_name && errors.last_name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                                    {touched.last_name && errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono *</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2 border rounded-lg ${touched.phone && errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                                    {touched.phone && errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                </div>
                                {formData.role === "veterinarian" && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Cédula</label>
                                            <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2 border rounded-lg ${touched.cedula && errors.cedula ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                                            {touched.cedula && errors.cedula && <p className="text-red-500 text-sm mt-1">{errors.cedula}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Especialidad</label>
                                            <select name="specialty" value={formData.specialty} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg">
                                                {specialtiesList.map(spec => <option key={spec.value} value={spec.value}>{spec.label}</option>)}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={saveEdit} className="flex-1 bg-[#A3D459] text-white py-2 rounded-lg hover:bg-[#8BC34A] transition">Guardar Cambios</button>
                                <button onClick={cancelEdit} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg transition">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}