import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  skills: string[];
  images: string[];
  availability: string;
  createdAt: string;
}

interface PostServiceProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const STORAGE_KEY = 'cp-services';

const categories = ['Technology', 'Healthcare', 'Education', 'Creative', 'Business', 'Culinary', 'Other'];
const availabilityOptions = ['Available', 'Busy', 'Unavailable'];
const skillOptions = ['React', 'Node.js', 'TypeScript', 'Python', 'Design', 'Writing', 'Marketing', 'Consulting', 'Teaching', 'Cooking'];

const PostService: React.FC<PostServiceProps> = ({ theme, toggleTheme }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technology',
    price: '',
    skills: [] as string[],
    images: [] as string[],
    availability: 'Available',
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setServices(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const saveServices = (updatedServices: Service[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedServices));
    setServices(updatedServices);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const addImage = (url: string) => {
    if (url.trim()) {
      setFormData(prev => ({ ...prev, images: [...prev.images, url.trim()] }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newService: Service = {
      id: editingService?.id || `service-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: parseFloat(formData.price),
      skills: formData.skills,
      images: formData.images,
      availability: formData.availability,
      createdAt: editingService?.createdAt || new Date().toISOString(),
    };

    let updatedServices;
    if (editingService) {
      updatedServices = services.map(s => s.id === editingService.id ? newService : s);
      toast.success('Service updated successfully');
    } else {
      updatedServices = [newService, ...services];
      toast.success('Service created successfully');
    }

    saveServices(updatedServices);
    resetForm();
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price.toString(),
      skills: service.skills,
      images: service.images,
      availability: service.availability,
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      const updatedServices = services.filter(s => s.id !== id);
      saveServices(updatedServices);
      toast.success('Service deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Technology',
      price: '',
      skills: [],
      images: [],
      availability: 'Available',
    });
    setEditingService(null);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-heading text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
                  Post Service
                </h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Create, edit, and manage your professional services
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-sm font-semibold hover:scale-105 transition-all duration-200"
                >
                  <Plus size={18} />
                  Add New Service
                </button>
              )}
            </div>

            {/* Service Form */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-lg text-[hsl(var(--foreground))]">
                    {editingService ? 'Edit Service' : 'Create New Service'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Web Development Services"
                        className="w-full px-4 py-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))] transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))] transition-all"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your service in detail..."
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))] transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="e.g., 5000"
                        min="0"
                        step="100"
                        className="w-full px-4 py-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))] transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        Availability
                      </label>
                      <select
                        name="availability"
                        value={formData.availability}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))] transition-all"
                      >
                        {availabilityOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {skillOptions.map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            formData.skills.includes(skill)
                              ? 'bg-[hsl(var(--cp-indigo))] text-white'
                              : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      Images
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Enter image URL..."
                        className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))] transition-all"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addImage((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addImage(input.value);
                          input.value = '';
                        }}
                        className="px-4 py-2 rounded-lg bg-[hsl(var(--cp-indigo))] text-white text-sm font-medium hover:bg-[hsl(var(--cp-indigo))]/90 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {formData.images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.images.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`Service image ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-sm font-semibold hover:scale-105 transition-all duration-200"
                    >
                      <Save size={18} />
                      {editingService ? 'Update Service' : 'Create Service'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Services List */}
            <div className="space-y-4">
              {services.length === 0 ? (
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center">
                    <ImageIcon className="text-[hsl(var(--muted-foreground))]" size={32} />
                  </div>
                  <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">No services yet</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                    Create your first service to start offering your expertise
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-lg bg-[hsl(var(--cp-indigo))] text-white text-sm font-medium hover:bg-[hsl(var(--cp-indigo))]/90 transition-colors"
                  >
                    Create Service
                  </button>
                </div>
              ) : (
                services.map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-[hsl(var(--foreground))]">{service.title}</h3>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[hsl(var(--cp-indigo))]/10 text-[hsl(var(--cp-indigo))]">
                            {service.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            service.availability === 'Available'
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                              : service.availability === 'Busy'
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                          }`}>
                            {service.availability}
                          </span>
                        </div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">{service.description}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">₹{service.price}</span>
                          {service.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {service.skills.map((skill) => (
                                <span key={skill} className="text-xs bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] px-2 py-0.5 rounded-md">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors text-[hsl(var(--foreground))]"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostService;
