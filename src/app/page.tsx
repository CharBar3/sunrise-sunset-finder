"use client";

import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";

import { Icon, LatLng, Map } from "leaflet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [position, setPosition] = useState<null | LatLng>(null);
  const center = new LatLng(51.505, -0.09);
  const zoom = 13;

  function MapControls({ map }: { map: Map }) {
    const [mapPosition, setMapPosition] = useState(() => map.getCenter());

    const onClick = useCallback(() => {
      if (navigator) {
        navigator.geolocation.getCurrentPosition(
          (e) => {
            const {
              coords: { latitude, longitude },
            } = e;
            if (window) {
              const currentLocation = new LatLng(latitude, longitude);
              setPosition(currentLocation);
              getSunsetSunrise(currentLocation);
              map.flyTo(new LatLng(latitude, longitude), zoom);
            }
          },
          (e) => {
            console.log(e);
            alert("Location services not enabled");
          }
        );
      }
    }, [map]);

    const onMove = useCallback(() => {
      setMapPosition(map.getCenter());
    }, [map]);

    useEffect(() => {
      map.on("move", onMove);
      return () => {
        map.off("move", onMove);
      };
    }, [map, onMove]);

    return (
      <p>
        latitude: {mapPosition.lat.toFixed(4)}, longitude:{" "}
        {mapPosition.lng.toFixed(4)}{" "}
        <Button onClick={onClick}>Find My Location</Button>
      </p>
    );
  }

  const [sunData, setSunData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getSunsetSunrise = async (latLng: LatLng) => {
    setLoading(true);

    try {
      const req = await fetch(
        `https://api.sunrisesunset.io/json?lat=${latLng.lat}&lng=${latLng.lng}`
      );
      const data = await req.json();
      console.log(data);
      setSunData(data.results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert("Error getting sunrise/sunset data");
    }
  };

  const [map, setMap] = useState<Map | null>(null);

  const displayMap = useMemo(() => {
    const customIcon = new Icon({
      iconUrl:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1hcC1waW4iPjxwYXRoIGQ9Ik0yMCAxMGMwIDYtOCAxMi04IDEycy04LTYtOC0xMmE4IDggMCAwIDEgMTYgMFoiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIi8+PC9zdmc+",
      iconSize: [38, 38],
    });

    function MarkCoords() {
      const map = useMapEvents({
        click(e) {
          setPosition(e.latlng);
          getSunsetSunrise(e.latlng);
        },
      });

      return position === null ? null : (
        <Marker position={position} icon={customIcon}>
          <Popup>
            {position ? (
              <div>
                <p>Lat: {position.lat}</p>
                <p>Lng: {position.lng}</p>
              </div>
            ) : (
              ""
            )}
          </Popup>
        </Marker>
      );
    }

    return (
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={2}
        ref={setMap}
        className="relaitve min-h-[50vh]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkCoords />
      </MapContainer>
    );
  }, [position]);

  return (
    <div>
      <div>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl flex">
          Sunset/Sunrise Finder{" "}
          {loading && <LoaderCircle className="animate-spin" />}
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Click on the map to get sunrise and sunset information at the selected
          location
        </p>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Lat {position?.lat}
        </p>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Lng {position?.lng}
        </p>
        {sunData && (
          <ul>
            <ul>
              <li>Date: {sunData.date}</li>
              <li>Dawn: {sunData.dawn}</li>
              <li>Day Length: {sunData.day_length}</li>
              <li>Dusk: {sunData.dusk}</li>
              <li>First Light: {sunData.first_light}</li>
              <li>Golden Hour: {sunData.golden_hour}</li>
              <li>Last Light: {sunData.last_light}</li>
              <li>Solar Noon: {sunData.solar_noon}</li>
              <li>Sunrise: {sunData.sunrise}</li>
              <li>Sunset: {sunData.sunset}</li>
              <li>Timezone: {sunData.timezone}</li>
              <li>UTC Offset: {sunData.utc_offset}</li>
            </ul>
          </ul>
        )}
      </div>
      {map ? <MapControls map={map} /> : null}
      {displayMap}
    </div>
  );
}
