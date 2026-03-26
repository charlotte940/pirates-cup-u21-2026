import { useState, useRef } from 'react';
import { Camera, Upload, Image, X, CheckCircle2, Download, Trash2, Grid, List, Search, Users, Trophy, MapPin } from 'lucide-react';

interface PhotoUpload {
  id: string;
  file: File;
  preview: string;
  caption: string;
  category: 'match' | 'team' | 'venue' | 'behind-scenes' | 'fans' | 'ceremony';
  tags: string[];
  uploadedAt: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
}

interface UploadedPhoto {
  id: string;
  url: string;
  caption: string;
  category: string;
  tags: string[];
  uploadedAt: string;
  uploadedBy: string;
  downloads: number;
}

const categories = [
  { id: 'match', label: 'Match Action', icon: Trophy },
  { id: 'team', label: 'Team Photos', icon: Users },
  { id: 'venue', label: 'Venue/Shots', icon: MapPin },
  { id: 'behind-scenes', label: 'Behind the Scenes', icon: Camera },
  { id: 'fans', label: 'Fans & Atmosphere', icon: Users },
  { id: 'ceremony', label: 'Awards/Ceremony', icon: Trophy },
];

const demoUploadedPhotos: UploadedPhoto[] = [
  {
    id: 'up1',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
    caption: 'Opening ceremony kickoff',
    category: 'ceremony',
    tags: ['opening', 'ceremony', '2026'],
    uploadedAt: '2026-07-15T09:30:00',
    uploadedBy: 'Tournament Photographer',
    downloads: 12
  },
  {
    id: 'up2',
    url: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400',
    caption: 'Pirates U21 vs Chiefs U21 - First half action',
    category: 'match',
    tags: ['pirates', 'chiefs', 'match', 'field-a'],
    uploadedAt: '2026-07-15T10:15:00',
    uploadedBy: 'Tournament Photographer',
    downloads: 8
  },
  {
    id: 'up3',
    url: 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?w=400',
    caption: 'Team huddle before match',
    category: 'team',
    tags: ['team', 'huddle', 'pregame'],
    uploadedAt: '2026-07-15T08:45:00',
    uploadedBy: 'Tournament Photographer',
    downloads: 5
  },
];

export default function PhotographerDashboard() {
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload');
  const [pendingPhotos, setPendingPhotos] = useState<PhotoUpload[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>(demoUploadedPhotos);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto: PhotoUpload = {
          id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview: event.target?.result as string,
          caption: '',
          category: 'match',
          tags: [],
          uploadedAt: new Date().toISOString(),
          status: 'pending',
          progress: 0
        };
        setPendingPhotos(prev => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePendingPhoto = (id: string) => {
    setPendingPhotos(prev => prev.filter(p => p.id !== id));
  };

  const updatePhotoCaption = (id: string, caption: string) => {
    setPendingPhotos(prev => prev.map(p => p.id === id ? { ...p, caption } : p));
  };

  const updatePhotoCategory = (id: string, category: PhotoUpload['category']) => {
    setPendingPhotos(prev => prev.map(p => p.id === id ? { ...p, category } : p));
  };

  const addTag = (photoId: string, tag: string) => {
    if (!tag.trim()) return;
    setPendingPhotos(prev => prev.map(p => 
      p.id === photoId ? { ...p, tags: [...p.tags, tag.trim()] } : p
    ));
  };

  const removeTag = (photoId: string, tagToRemove: string) => {
    setPendingPhotos(prev => prev.map(p => 
      p.id === photoId ? { ...p, tags: p.tags.filter(t => t !== tagToRemove) } : p
    ));
  };

  const uploadPhotos = async () => {
    if (pendingPhotos.length === 0) return;

    // Simulate upload process
    for (const photo of pendingPhotos) {
      setPendingPhotos(prev => prev.map(p => 
        p.id === photo.id ? { ...p, status: 'uploading' } : p
      ));

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setPendingPhotos(prev => prev.map(p => 
          p.id === photo.id ? { ...p, progress } : p
        ));
      }

      // Add to uploaded photos
      const uploadedPhoto: UploadedPhoto = {
        id: `up-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: photo.preview,
        caption: photo.caption || photo.file.name,
        category: photo.category,
        tags: photo.tags,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Tournament Photographer',
        downloads: 0
      };

      setUploadedPhotos(prev => [uploadedPhoto, ...prev]);
      
      setPendingPhotos(prev => prev.map(p => 
        p.id === photo.id ? { ...p, status: 'completed' } : p
      ));
    }

    // Clear completed photos after delay
    setTimeout(() => {
      setPendingPhotos([]);
    }, 2000);
  };

  const deleteUploadedPhoto = (id: string) => {
    setUploadedPhotos(prev => prev.filter(p => p.id !== id));
    setSelectedPhotos(prev => prev.filter(pid => pid !== id));
  };

  const togglePhotoSelection = (id: string) => {
    setSelectedPhotos(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const downloadSelected = () => {
    // Simulate download
    alert(`Downloading ${selectedPhotos.length} photos...`);
    setSelectedPhotos([]);
  };

  const filteredPhotos = uploadedPhotos.filter(photo => {
    const matchesCategory = selectedCategory === 'all' || photo.category === selectedCategory;
    const matchesSearch = 
      photo.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pirates-black to-pirates-gray-800 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-pirates-gold rounded-xl flex items-center justify-center">
            <Camera className="w-7 h-7 text-pirates-black" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold uppercase">Photo Management</h2>
            <p className="text-white/70">Upload and manage tournament photos for media access</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-pirates-gray-200 p-4">
          <p className="text-pirates-gray-500 text-sm">Total Photos</p>
          <p className="text-2xl font-bold text-pirates-black">{uploadedPhotos.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-pirates-gray-200 p-4">
          <p className="text-pirates-gray-500 text-sm">Pending Upload</p>
          <p className="text-2xl font-bold text-amber-600">{pendingPhotos.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-pirates-gray-200 p-4">
          <p className="text-pirates-gray-500 text-sm">Total Downloads</p>
          <p className="text-2xl font-bold text-green-600">{uploadedPhotos.reduce((sum, p) => sum + p.downloads, 0)}</p>
        </div>
        <div className="bg-white rounded-xl border border-pirates-gray-200 p-4">
          <p className="text-pirates-gray-500 text-sm">Categories</p>
          <p className="text-2xl font-bold text-pirates-red">{categories.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'upload' ? 'bg-pirates-red text-white' : 'bg-white text-pirates-gray-600 border border-pirates-gray-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Photos
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'gallery' ? 'bg-pirates-red text-white' : 'bg-white text-pirates-gray-600 border border-pirates-gray-200'
          }`}
        >
          <Image className="w-4 h-4" />
          Photo Gallery
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-pirates-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-pirates-red hover:bg-pirates-red/5 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-16 h-16 bg-pirates-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-pirates-gray-400" />
            </div>
            <p className="text-pirates-black font-medium mb-2">Click to upload photos</p>
            <p className="text-pirates-gray-500 text-sm">or drag and drop images here</p>
            <p className="text-pirates-gray-400 text-xs mt-2">Supports: JPG, PNG, WebP (max 10MB each)</p>
          </div>

          {/* Pending Photos */}
          {pendingPhotos.length > 0 && (
            <div className="bg-white rounded-xl border border-pirates-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-pirates-black">Pending Upload ({pendingPhotos.length})</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPendingPhotos([])}
                    className="px-3 py-2 text-pirates-gray-600 hover:text-pirates-red text-sm"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={uploadPhotos}
                    className="flex items-center gap-2 px-4 py-2 bg-pirates-red text-white rounded-lg font-medium hover:bg-pirates-red/90"
                  >
                    <Upload className="w-4 h-4" />
                    Upload All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pendingPhotos.map(photo => (
                  <div key={photo.id} className="border border-pirates-gray-200 rounded-xl overflow-hidden">
                    <div className="relative aspect-square">
                      <img 
                        src={photo.preview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      {photo.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                        </div>
                      )}
                      {photo.status === 'completed' && (
                        <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                          <CheckCircle2 className="w-12 h-12 text-white" />
                        </div>
                      )}
                      <button
                        onClick={() => removePendingPhoto(photo.id)}
                        disabled={photo.status === 'uploading'}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3 space-y-2">
                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                        placeholder="Add caption..."
                        disabled={photo.status === 'uploading'}
                        className="w-full text-sm px-2 py-1 border border-pirates-gray-200 rounded focus:border-pirates-red focus:outline-none disabled:opacity-50"
                      />
                      <select
                        value={photo.category}
                        onChange={(e) => updatePhotoCategory(photo.id, e.target.value as PhotoUpload['category'])}
                        disabled={photo.status === 'uploading'}
                        className="w-full text-sm px-2 py-1 border border-pirates-gray-200 rounded focus:border-pirates-red focus:outline-none disabled:opacity-50"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                      <div className="flex flex-wrap gap-1">
                        {photo.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-pirates-gray-100 rounded flex items-center gap-1">
                            {tag}
                            <button 
                              onClick={() => removeTag(photo.id, tag)}
                              disabled={photo.status === 'uploading'}
                              className="hover:text-pirates-red"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          placeholder="+ tag"
                          disabled={photo.status === 'uploading'}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addTag(photo.id, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="text-xs px-2 py-0.5 w-16 border border-pirates-gray-200 rounded focus:border-pirates-red focus:outline-none disabled:opacity-50"
                        />
                      </div>
                      {photo.status === 'uploading' && (
                        <div className="w-full h-1 bg-pirates-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-pirates-red transition-all"
                            style={{ width: `${photo.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all' ? 'bg-pirates-red text-white' : 'bg-white border border-pirates-gray-200 text-pirates-gray-600'
                }`}
              >
                All Photos
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.id ? 'bg-pirates-red text-white' : 'bg-white border border-pirates-gray-200 text-pirates-gray-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pirates-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search photos..."
                  className="pl-9 pr-4 py-2 border border-pirates-gray-200 rounded-lg text-sm focus:border-pirates-red focus:outline-none"
                />
              </div>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-pirates-red text-white' : 'bg-white border border-pirates-gray-200'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-pirates-red text-white' : 'bg-white border border-pirates-gray-200'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedPhotos.length > 0 && (
            <div className="bg-pirates-red/10 border border-pirates-red/30 rounded-xl p-4 flex items-center justify-between">
              <span className="text-pirates-red font-medium">{selectedPhotos.length} photos selected</span>
              <div className="flex gap-2">
                <button
                  onClick={downloadSelected}
                  className="flex items-center gap-2 px-4 py-2 bg-pirates-red text-white rounded-lg text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download Selected
                </button>
                <button
                  onClick={() => setSelectedPhotos([])}
                  className="px-4 py-2 text-pirates-gray-600 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Photo Grid */}
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-12 text-pirates-gray-400">
              <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No photos found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map(photo => (
                <div 
                  key={photo.id} 
                  className={`border rounded-xl overflow-hidden group ${
                    selectedPhotos.includes(photo.id) ? 'border-pirates-red ring-2 ring-pirates-red/20' : 'border-pirates-gray-200'
                  }`}
                >
                  <div className="relative aspect-square">
                    <img 
                      src={photo.url} 
                      alt={photo.caption} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => togglePhotoSelection(photo.id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          selectedPhotos.includes(photo.id) ? 'bg-pirates-red text-white' : 'bg-white text-pirates-black'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteUploadedPhoto(photo.id)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pirates-black hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    {selectedPhotos.includes(photo.id) && (
                      <div className="absolute top-2 left-2 w-6 h-6 bg-pirates-red rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-pirates-black truncate">{photo.caption}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs px-2 py-0.5 bg-pirates-gray-100 rounded text-pirates-gray-600">
                        {categories.find(c => c.id === photo.category)?.label || photo.category}
                      </span>
                      <span className="text-xs text-pirates-gray-400 flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {photo.downloads}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPhotos.map(photo => (
                <div 
                  key={photo.id}
                  onClick={() => togglePhotoSelection(photo.id)}
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer ${
                    selectedPhotos.includes(photo.id) ? 'border-pirates-red bg-pirates-red/5' : 'border-pirates-gray-200 hover:bg-pirates-gray-50'
                  }`}
                >
                  <img 
                    src={photo.url} 
                    alt={photo.caption}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-pirates-black">{photo.caption}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-pirates-gray-500">
                      <span>{categories.find(c => c.id === photo.category)?.label}</span>
                      <span>•</span>
                      <span>{new Date(photo.uploadedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {photo.downloads} downloads
                      </span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {photo.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-pirates-gray-100 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteUploadedPhoto(photo.id); }}
                    className="p-2 text-pirates-gray-400 hover:text-pirates-red"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
