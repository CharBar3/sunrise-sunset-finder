"use client";

import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";

import { Icon, LatLng } from "leaflet";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

export default function Home() {
  const [sunData, setSunData] = useState(null);
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

  const customIcon = new Icon({
    iconUrl:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1hcC1waW4iPjxwYXRoIGQ9Ik0yMCAxMGMwIDYtOCAxMi04IDEycy04LTYtOC0xMmE4IDggMCAwIDEgMTYgMFoiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIi8+PC9zdmc+",
    iconSize: [38, 38],
  });

  const [position, setPosition] = useState<null | LatLng>(null);

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
      {sunData ? (
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
      ) : (
        <div></div>
      )}

      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={2}
        className="relaitve min-h-[50vh]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkCoords />
      </MapContainer>
    </div>
  );
}
