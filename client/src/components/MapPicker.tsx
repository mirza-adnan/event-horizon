import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet + React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface MapPickerProps {
    lat?: number;
    lng?: number;
    onChange: (lat: number, lng: number) => void;
    className?: string;
}

function LocationMarker({ lat, lng, onChange }: { lat?: number, lng?: number, onChange: (lat: number, lng: number) => void }) {
    const map = useMap();
    
    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });

    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], map.getZoom());
        }
    }, [lat, lng, map]);

    return lat && lng ? (
        <Marker position={[lat, lng]} />
    ) : null;
}

export default function MapPicker({ lat, lng, onChange, className }: MapPickerProps) {
    const defaultCenter: [number, number] = [23.8103, 90.4125]; // Dhaka, Bangladesh
    const center: [number, number] = lat && lng ? [lat, lng] : defaultCenter;

    return (
        <div className={`h-[300px] w-full rounded-lg overflow-hidden border border-zinc-800 ${className}`}>
            <MapContainer 
                center={center} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker lat={lat} lng={lng} onChange={onChange} />
            </MapContainer>
            <p className="text-[10px] text-text-weak mt-1 ml-1 italic">
                Click on the map to set the exact location
            </p>
        </div>
    );
}
