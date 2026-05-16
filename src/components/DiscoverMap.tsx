import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { LatLng as LeafLatLng } from 'leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import { Locate, MapPin, Search } from 'lucide-react';
import { haversineDistanceKm } from '../lib/geo';

import { supabase } from '../lib/supabaseClient';

type LatLng = { lat: number; lng: number };


import { useAuth } from '../context/AuthContext';

// Fix default marker icons (Leaflet needs this in many bundlers)
const markerIcon = new L.Icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [41, 41],
});

function Recenter({ center }: { center: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.setView([center.lat, center.lng]);
  }, [center, map]);
  return null;
}

type NearbyProfessional = {
  id: string;
  name: string;
  role?: string;
  rating?: number;
  reviews?: number;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number;
};

const defaultRadiusKm = 30;

const getCurrentPosition = () =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    });
  });

export default function DiscoverMap({ radiusKm = defaultRadiusKm }: { radiusKm?: number }) {
  // const { currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [professionals, setProfessionals] = useState<NearbyProfessional[]>([]);

  const professionalMarkers = useMemo(() => {
    // Render ONE marker per professional. No city clustering.
    // Guarantees every professional with numeric lat/lng is visible.
    return professionals.filter(
      (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number',
    );
  }, [professionals]);


  async function loadNearby() {
    if (!userPos) return;
    // Defensive: ensure valid coordinate ranges before distance math.
    if (!Number.isFinite(userPos.lat) || !Number.isFinite(userPos.lng)) return;
    if (userPos.lat < -90 || userPos.lat > 90) return;
    if (userPos.lng < -180 || userPos.lng > 180) return;

    setLoading(true);
    setGeoError(null);

    try {
      // Query all professionals with coordinates. Then compute distance client-side.
      // (If you want DB-distance queries, we can later switch to location_geog && ST_DWithin.)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, name, role, city, state, country, latitude, longitude, created_at, app_metadata, user_metadata, ratings')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;
      const rows = data ?? [];

      const mapped: NearbyProfessional[] = rows
        .map((r: any) => {
          const lat = typeof r.latitude === 'string' ? Number(r.latitude) : r.latitude;
          const lng = typeof r.longitude === 'string' ? Number(r.longitude) : r.longitude;
          if (typeof lat !== 'number' || typeof lng !== 'number') return null;

          const distanceKm = haversineDistanceKm(userPos, { lat, lng });
          if (distanceKm > radiusKm) return null;

          // Your frontend uses name fields inconsistently (demo uses name).
          const name = r.full_name || r.name || r.user_metadata?.full_name || r.app_metadata?.full_name || 'Professional';

          return {
            id: String(r.id),
            name,
            role: r.role,
            city: r.city,
            state: r.state,
            country: r.country,
            latitude: lat,
            longitude: lng,
            distanceKm,
            rating: r.rating,
            reviews: r.reviews,
          };
        })
        .filter(Boolean) as NearbyProfessional[];

      mapped.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
      setProfessionals(mapped);
    } catch (e: any) {
      setGeoError(e?.message || 'Failed to load nearby professionals');
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  }

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

  useEffect(() => {
    // Only load nearby professionals after user clicks “Near Me”.
    // Prevents auto-loading that can lead to showing results immediately.
  }, [radiusKm]);


  const initialCenter = (userPos ? [userPos.lat, userPos.lng] : [28.6139, 77.209]) as [number, number]; // Delhi default


  return (
    <section className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-[hsl(var(--border))] flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold text-[hsl(var(--foreground))]">Discover Map (Near Me)</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            OpenStreetMap + nearby professionals by distance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLocate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--cp-indigo))]/15 border border-[hsl(var(--cp-indigo))]/30 text-[hsl(var(--cp-indigo-light))] hover:bg-[hsl(var(--cp-indigo))]/25 transition-all duration-200 disabled:opacity-60"
          >
            <Locate className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Locating...' : 'Near Me'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div className="h-[520px]">
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
                  <div className="text-sm font-semibold">You</div>
                </Popup>
              </Marker>
            )}

            {professionalMarkers.map((p) => (
              <Marker
                key={p.id}
                position={[p.latitude as number, p.longitude as number]}
                icon={markerIcon}
              >
                <Popup>
                  <div className="min-w-[220px]">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[hsl(var(--cp-indigo))] mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold">{p.name}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                          {(p.distanceKm ?? 0).toFixed(1)} km away
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      {p.role ? p.role : 'Professional'}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          </MapContainer>
        </div>

        <aside className="p-5 border-t lg:border-t-0 lg:border-l border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[hsl(var(--cp-indigo))]" />
            <h3 className="font-semibold text-[hsl(var(--foreground))]">Nearby Professionals</h3>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            Sorted by distance (within {radiusKm}km).
          </p>

          {geoError && (
            <div className="mt-4 text-sm text-rose-500">{geoError}</div>
          )}

          <div className="mt-4 space-y-3 max-h-[430px] overflow-auto pr-2">
            {loading && <div className="text-sm text-[hsl(var(--muted-foreground))]">Loading...</div>}
            {!loading && professionals.length === 0 && userPos && (
              <div className="text-sm text-[hsl(var(--muted-foreground))]">No professionals found in this radius.</div>
            )}
            {!loading && professionals.length === 0 && !userPos && (
              <div className="text-sm text-[hsl(var(--muted-foreground))]">Tap “Near Me” to see professionals on the map.</div>
            )}

            {professionalMarkers.slice(0, 30).map((p) => (
              <div key={p.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {(p.distanceKm ?? 0).toFixed(1)} km · {p.role ? p.role : 'Professional'}
                </div>
              </div>
            ))}

          </div>
        </aside>
      </div>
    </section>
  );
}

