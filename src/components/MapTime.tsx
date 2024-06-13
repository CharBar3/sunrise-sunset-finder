"use client";

import "leaflet/dist/leaflet.css";
const coordsLookup = require("coordinate_to_country");
import { Button } from "@/components/ui/button";
import countryCodes from "@/country-code-lookup";
import { cn } from "@/lib/utils";
import FetchSunriseSunsetData from "@/server actions/fetchSunriseSunsetData";
import { Icon, LatLng, Map } from "leaflet";
import { ArrowDown, CircleHelp, LoaderCircle, LocateFixed } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { useDebounce } from "react-use";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Badge } from "./ui/badge";

const MapTime = () => {
  const [position, setPosition] = useState<null | LatLng>(null);

  const [, cancel] = useDebounce(
    () => {
      getSunsetSunrise();
    },
    2000,
    [position]
  );

  const updatePostion = (latLng: LatLng) => {
    setLoading(true);
    setSunData(false);
    setPosition(latLng);
  };

  function MapControls({ map }: { map: Map }) {
    const [mapPosition, setMapPosition] = useState(() => map.getCenter());

    const onClick = useCallback(() => {
      setLoading(true);
      setPosition(null);
      navigator.geolocation.getCurrentPosition(
        (e) => {
          const {
            coords: { latitude, longitude },
          } = e;

          const currentLocation = new LatLng(latitude, longitude);
          updatePostion(currentLocation);
          map.flyTo(currentLocation, 13);
        },
        (e) => {
          console.log(e);
          alert("Location services not enabled");
          setLoading(false);
        }
      );
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
      <Button
        size="icon"
        className="absolute right-4 bottom-4"
        onClick={onClick}
      >
        <LocateFixed />
      </Button>
    );
  }

  const [sunData, setSunData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getSunsetSunrise = async () => {
    if (!position) {
      return;
    }

    try {
      const results = await FetchSunriseSunsetData(position.lat, position.lng);
      setSunData(results);
      setLoading(false);
    } catch (error) {
      console.log(error);
      alert("Error getting sunrise/sunset data");
    } finally {
      setLoading(false);
    }
  };

  const [map, setMap] = useState<Map | null>(null);
  const [country, setCountry] = useState<string | null>(null);

  const displayMap = useMemo(() => {
    const customIcon = new Icon({
      iconUrl:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1hcC1waW4iPjxwYXRoIGQ9Ik0yMCAxMGMwIDYtOCAxMi04IDEycy04LTYtOC0xMmE4IDggMCAwIDEgMTYgMFoiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIi8+PC9zdmc+",
      iconSize: [38, 38],
      // iconAnchor: [19, 43],
    });

    function MarkCoords() {
      const map = useMapEvents({
        click(e) {
          const countryCode = coordsLookup(e.latlng.lat, e.latlng.lng);
          const country =
            countryCodes[countryCode[0] as keyof typeof countryCodes];

          setCountry(country);

          updatePostion(e.latlng);
        },
        zoom(e) {
          console.log(e);
        },
      });

      return position === null ? null : (
        <Marker position={position} icon={customIcon} />
      );
    }

    return (
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        ref={setMap}
        className="h-full z-0"
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
    <div className="h-screen grid grid-rows-[100px_1fr] sm:grid-rows-[70px_1fr]">
      <div className=" bg-yellow p-2 flex justify-between">
        <div>
          <div className="flex space-x-2 mb-2">
            <h1 className="font-bold ">🔎 Sunrise/Sunset Time Finder</h1>
            {loading && <LoaderCircle className="animate-spin" />}
          </div>
          {sunData && (
            <div className="flex gap-2 flex-wrap">
              <Badge>Sunrise: {sunData.sunrise} </Badge>
              <Badge>Sunset: {sunData.sunset} </Badge>
              <Badge>Country: {country} </Badge>
            </div>
          )}
        </div>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild className="cursor-default">
              <Button variant="ghost" size="icon">
                <CircleHelp />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="leading-7">
                Click on the map to get sunrise and sunset information at the
                selected location
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {/* <div className="absolute z-10 top-40 left-2 flex flex-col space-y-1">
          {sunData &&
            Object.entries(sunData).map(([key, value]) => {
              const label =
                key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ");
              return (
                <Badge>
                  {label}: {value as string}
                </Badge>
              );
            })}
        </div> */}
      </div>
      <div>{displayMap}</div>
      {map && <MapControls map={map} />}
    </div>
  );
};

export default MapTime;
