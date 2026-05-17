import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Locate, MapPin, Search, Star, BadgeCheck, Zap, ExternalLink, Layers } from 'lucide-react';
import { haversineDistanceKm } from '../lib/geo';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { professionals as localProfessionals } from '../data/professionals';
import { marketplaceServices } from '../pages/Marketplace';
import type { Professional } from './ProfessionalCard';
import type { Service } from '../pages/Marketplace';

type LatLng = { lat: number; lng: number };

// Fix default marker icons (Leaflet needs this in many bundlers)
const markerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [41, 41],
});

function Recenter({ center }: { center: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.setView([center.lat, center.lng], 12, { animate: true });
  }, [center, map]);
  return null;
}

export type NearbyItem = {
  id: string;
  name: string;
  role: string;
  category: string;
  rating: number;
  reviews: number;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  skills: string[];
  avatar: string;
  available: boolean;
  status: 'online' | 'busy' | 'offline';
  isService?: boolean;
  price?: string;
  verified?: boolean;
};

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  mumbai: { lat: 19.0760, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  pune: { lat: 18.5204, lng: 73.8567 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  patna: { lat: 25.5941, lng: 85.1376 },
  kerala: { lat: 9.9312, lng: 76.2673 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
};

function getApproxCoords(loc: string): { lat: number; lng: number } {
  const norm = loc.toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (norm.includes(key)) {
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.04,
        lng: coords.lng + (Math.random() - 0.5) * 0.04,
      };
    }
  }
  return { lat: 28.6139 + (Math.random() - 0.5) * 0.1, lng: 77.2090 + (Math.random() - 0.5) * 0.1 }; // Delhi default fallback
}

const HEATMAP_HUBS = [
  { name: 'Mumbai Tech & Finance Hub', center: [19.0760, 72.8777] as [number, number], radius: 12000, count: 240, color: '#3b82f6' },
  { name: 'Bangalore Silicon Valley Hub', center: [12.9716, 77.5946] as [number, number], radius: 15000, count: 480, color: '#8b5cf6' },
  { name: 'Delhi NCR Enterprise Hub', center: [28.6139, 77.2090] as [number, number], radius: 14000, count: 350, color: '#ec4899' },
  { name: 'Pune IT Park Cluster', center: [18.5204, 73.8567] as [number, number], radius: 10000, count: 180, color: '#10b981' },
  { name: 'Hyderabad Cyberabad Hub', center: [17.3850, 78.4867] as [number, number], radius: 12000, count: 290, color: '#f59e0b' },
];

const getCurrentPosition = () =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    });
  });

interface DiscoverMapProps {
  radiusKm?: number;
  professionalsList?: Professional[];
  showServices?: boolean;
  onBookMeeting?: (item: NearbyItem) => void;
}

export default function DiscoverMap({
  radiusKm = 30,
  professionalsList,
  showServices = true,
  onBookMeeting,
}: DiscoverMapProps) {
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<LatLng | null>({ lat: 28.6139, lng: 77.2090 }); // Default Delhi
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'professionals' | 'services'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbProfiles, setDbProfiles] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDb() {
      try {
        const { data } = await supabase.from('profiles').select('*').limit(50);
        if (data && data.length > 0) setDbProfiles(data);
      } catch (e) { /* fallback gracefully */ }
    }
    fetchDb();
  }, []);

  const allCombinedItems = useMemo(() => {
    const list: NearbyItem[] = [];

    // 1. Local Professionals
    const sourceProfs = professionalsList && professionalsList.length > 0 ? professionalsList : localProfessionals;
    sourceProfs.forEach(p => {
      let lat = p.latitude;
      let lng = p.longitude;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        const coords = getApproxCoords(p.location || p.city || '');
        lat = coords.lat;
        lng = coords.lng;
      }
      list.push({
        id: p.id,
        name: p.name,
        role: p.role,
        category: p.category,
        rating: p.rating,
        reviews: p.reviews,
        city: p.city || p.location.split(',')[0],
        state: p.state || '',
        country: p.country || 'India',
        latitude: lat,
        longitude: lng,
        distanceKm: userPos ? haversineDistanceKm(userPos, { lat, lng }) : 0,
        skills: p.skills || [],
        avatar: p.avatar,
        available: p.available,
        status: p.status || (p.available ? 'online' : 'offline'),
        price: p.rate || '₹1,000/hr',
        verified: p.verified,
        isService: false,
      });
    });

    // 2. Marketplace Services
    if (showServices) {
      marketplaceServices.forEach(s => {
        let lat = s.latitude;
        let lng = s.longitude;
        if (typeof lat !== 'number' || typeof lng !== 'number') {
          const coords = getApproxCoords(s.city || s.provider);
          lat = coords.lat;
          lng = coords.lng;
        }
        list.push({
          id: s.id,
          name: s.provider,
          role: s.title,
          category: s.category,
          rating: s.rating,
          reviews: s.reviews,
          city: s.city || 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          latitude: lat,
          longitude: lng,
          distanceKm: userPos ? haversineDistanceKm(userPos, { lat, lng }) : 0,
          skills: s.skills || [],
          avatar: s.avatar,
          available: true,
          status: 'online',
          price: s.price,
          verified: s.verified,
          isService: true,
        });
      });
    }

    // 3. Supabase DB Profiles
    dbProfiles.forEach(r => {
      const lat = typeof r.latitude === 'string' ? Number(r.latitude) : r.latitude;
      const lng = typeof r.longitude === 'string' ? Number(r.longitude) : r.longitude;
      if (typeof lat === 'number' && typeof lng === 'number' && !list.some(x => x.id === String(r.id))) {
        const name = r.full_name || r.name || r.user_metadata?.full_name || r.app_metadata?.full_name || 'Professional';
        list.push({
          id: String(r.id),
          name,
          role: r.role || 'Expert Professional',
          category: r.category || 'Technology',
          rating: r.rating || 4.8,
          reviews: r.reviews || 42,
          city: r.city || 'Delhi',
          state: r.state || 'Delhi',
          country: r.country || 'India',
          latitude: lat,
          longitude: lng,
          distanceKm: userPos ? haversineDistanceKm(userPos, { lat, lng }) : 0,
          skills: ['Expertise', 'Consulting'],
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
          available: true,
          status: 'online',
          price: '₹1,500/hr',
          verified: true,
          isService: false,
        });
      }
    });

    return list;
  }, [professionalsList, showServices, dbProfiles, userPos]);

  const filteredAndSorted = useMemo(() => {
    return allCombinedItems
      .filter(item => {
        if (activeTab === 'professionals' && item.isService) return false;
        if (activeTab === 'services' && !item.isService) return false;
        if (item.distanceKm > radiusKm) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchRole = item.role.toLowerCase().includes(q);
          const matchCity = item.city.toLowerCase().includes(q);
          const matchSkill = item.skills.some(s => s.toLowerCase().includes(q));
          if (!matchName && !matchRole && !matchCity && !matchSkill) return false;
        }
        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [allCombinedItems, activeTab, radiusKm, searchQuery]);

  async function handleLocate() {
    setLoading(true);
    setGeoError(null);
    try {
      const pos = await getCurrentPosition();
      const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserPos(next);
    } catch (e: any) {
      setGeoError(e?.message || 'Unable to retrieve your location');
    } finally {
      setLoading(false);
    }
  }

  const initialCenter = (userPos ? [userPos.lat, userPos.lng] : [28.6139, 77.209]) as [number, number];

  return (
    <section className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-lg">
      <div className="p-6 border-b border-[hsl(var(--border))] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
            <MapPin className="text-[hsl(var(--cp-indigo))]" /> Live Professional Radar & Map
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            Real-time geolocated professionals and marketplace services across India.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
              showHeatmap
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-400 shadow-sm'
                : 'bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            <Layers className="w-4 h-4" /> {showHeatmap ? 'Density Hubs: ON' : 'Density Hubs: OFF'}
          </button>
          <button
            type="button"
            onClick={handleLocate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-blue))] to-[hsl(var(--cp-violet))] text-white text-xs font-bold shadow-md hover:scale-105 transition-all duration-200 disabled:opacity-60"
          >
            <Locate className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Locating...' : 'My Exact Location'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
        <div className="h-[550px] relative z-10">
          <MapContainer
            center={initialCenter}
            zoom={11}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <Recenter center={userPos} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {userPos && (
              <Marker position={[userPos.lat, userPos.lng]} icon={markerIcon}>
                <Popup>
                  <div className="text-xs font-bold px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md">
                    📍 Your Current Location
                  </div>
                </Popup>
              </Marker>
            )}

            {showHeatmap &&
              HEATMAP_HUBS.map((hub, idx) => (
                <Circle
                  key={idx}
                  center={hub.center}
                  radius={hub.radius}
                  pathOptions={{ color: hub.color, fillColor: hub.color, fillOpacity: 0.2, weight: 2 }}
                >
                  <Popup>
                    <div className="p-1">
                      <div className="text-xs font-bold">{hub.name}</div>
                      <div className="text-[11px] text-[hsl(var(--muted-foreground))]">{hub.count}+ verified professionals</div>
                    </div>
                  </Popup>
                </Circle>
              ))}

            {filteredAndSorted.map(item => (
              <Marker key={item.id + (item.isService ? '-s' : '-p')} position={[item.latitude, item.longitude]} icon={markerIcon}>
                <Popup className="premium-map-popup">
                  <div className="w-[260px] p-1 font-sans text-left">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative flex-shrink-0">
                        <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-[hsl(var(--border))]" />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white dark:border-gray-800 rounded-full ${
                            item.status === 'online' ? 'bg-emerald-500' : item.status === 'busy' ? 'bg-amber-500' : 'bg-gray-400'
                          }`}
                          title={`Status: ${item.status}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-sm text-[hsl(var(--foreground))] truncate">{item.name}</h4>
                          {item.verified && <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium line-clamp-1">{item.role}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                          {item.isService ? 'Marketplace Service' : 'Professional'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs mb-3 bg-[hsl(var(--muted))]/40 p-2 rounded-lg font-medium">
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {item.rating} ({item.reviews})
                      </span>
                      <span className="flex items-center gap-1 text-[hsl(var(--cp-indigo))]">
                        <MapPin className="w-3.5 h-3.5" /> {item.distanceKm.toFixed(1)} km away
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.skills.slice(0, 4).map((sk, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] font-medium">
                          {sk}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[hsl(var(--border))]">
                      <Link
                        to={item.isService ? '/marketplace' : `/profile/${item.id}`}
                        className="flex-1 text-center py-2 rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] text-xs font-semibold hover:bg-[hsl(var(--muted))]/80 transition-all flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </Link>
                      <button
                        type="button"
                        onClick={() => onBookMeeting?.(item)}
                        className="flex-1 text-center py-2 rounded-xl bg-gradient-to-r from-[hsl(var(--cp-indigo))] to-[hsl(var(--cp-violet))] text-white text-xs font-semibold hover:opacity-90 shadow-sm flex items-center justify-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5" /> Book
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <aside className="p-5 border-t lg:border-t-0 lg:border-l border-[hsl(var(--border))] flex flex-col bg-[hsl(var(--card))]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[hsl(var(--cp-indigo))]" />
              <h3 className="font-semibold text-[hsl(var(--foreground))] text-sm">Nearby Directory</h3>
            </div>
            <span className="text-xs bg-[hsl(var(--cp-indigo))]/10 text-[hsl(var(--cp-indigo))] px-2.5 py-1 rounded-full font-bold">
              {filteredAndSorted.length} nearby
            </span>
          </div>

          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Filter list by name, skill, city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cp-indigo))]/40"
            />
            <Search className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-[hsl(var(--muted))]/50 mb-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'all' ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm font-bold' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('professionals')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'professionals' ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm font-bold' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              Pros
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'services' ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm font-bold' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              Services
            </button>
          </div>

          {geoError && <div className="mb-4 text-xs text-rose-500 font-semibold p-2 bg-rose-500/10 rounded-lg">{geoError}</div>}

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[380px] pr-1.5 scrollbar-thin">
            {filteredAndSorted.length === 0 && (
              <div className="text-center py-12 text-xs text-[hsl(var(--muted-foreground))]">
                No professionals or services found within {radiusKm}km. Try expanding distance or search.
              </div>
            )}
            {filteredAndSorted.map(item => (
              <div
                key={item.id + (item.isService ? '-s' : '-p')}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 hover:border-[hsl(var(--cp-indigo))]/50 transition-all flex items-center gap-3 group"
              >
                <div className="relative flex-shrink-0">
                  <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-xl object-cover" />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white dark:border-gray-800 rounded-full ${
                      item.status === 'online' ? 'bg-emerald-500' : item.status === 'busy' ? 'bg-amber-500' : 'bg-gray-400'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h5 className="font-semibold text-xs text-[hsl(var(--foreground))] truncate group-hover:text-[hsl(var(--cp-indigo))] transition-colors">
                      {item.name}
                    </h5>
                    <span className="text-[10px] font-bold text-[hsl(var(--cp-indigo))]">{item.distanceKm.toFixed(1)} km</span>
                  </div>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">{item.role}</p>
                  <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[hsl(var(--border))]/50">
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {item.rating}
                    </span>
                    <button
                      type="button"
                      onClick={() => onBookMeeting?.(item)}
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[hsl(var(--cp-indigo))]/10 text-[hsl(var(--cp-indigo))] hover:bg-[hsl(var(--cp-indigo))] hover:text-white transition-all shadow-sm flex items-center gap-1"
                    >
                      <Zap size={12} /> Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
