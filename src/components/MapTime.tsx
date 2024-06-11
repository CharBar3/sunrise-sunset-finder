"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

import { Button } from "@/components/ui/button";
import { Icon, LatLng, Map } from "leaflet";
import { ArrowDown, CircleHelp, LocateFixed } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";

const MapTime = () => {
  const [open, setOpen] = useState(false);
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
      <div>
        <Button size="icon" onClick={onClick}>
          <LocateFixed />
        </Button>
      </div>
    );
  }

  const [sunData, setSunData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getSunsetSunrise = async () => {
    if (!position) {
      return;
    }

    try {
      const req = await fetch(
        `https://api.sunrisesunset.io/json?lat=${position.lat}&lng=${position.lng}`
        // { method: "GET", mode: "no-cors" }
      );
      const data = await req.json();
      console.log(data);
      setSunData(data.results);
    } catch (error) {
      console.log(error);
      alert("Error getting sunrise/sunset data");
    } finally {
      setLoading(false);
    }
  };

  const [map, setMap] = useState<Map | null>(null);

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
          updatePostion(e.latlng);
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
        className="absolute top-0 left-0 right-0 bottom-0 h-screen z-0"
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
      <div className="absolute z-[400] bg-background p-4 w-full">
        <div className="flex space-x-2">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl flex">
            Sunset / Sunrise Finder
          </h1>
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
          {map && <MapControls map={map} />}
        </div>
        <div className="space-y-2">
          <div className="flex items-center">
            <Label className="w-8">Lat</Label>
            <Input className="mt-1" defaultValue={position?.lat} />
          </div>
          <div className="flex items-center">
            <Label className="w-8">Lng</Label>
            <Input defaultValue={position?.lng} />
          </div>
        </div>
        <div className="relative">
          <Button
            className="absolute bottom-0 right-0"
            size="icon"
            onClick={() => setOpen((prev) => !prev)}
          >
            <ArrowDown
              className={cn(
                open ? "rotate-180" : "rotate-0",
                "transition-all duration-500"
              )}
            />
          </Button>
          <ul
            className={cn(
              "space-y-2 pt-2 overflow-hidden transition-[height] duration-500",
              open ? "h-[384px]" : "h-[60px]"
            )}
          >
            <li className="flex items-center">
              <Label className="w-24">Sunrise</Label>
              {loading ? (
                <Skeleton className="h-6 w-[250px]" />
              ) : (
                <p>{sunData ? sunData.sunrise : "TBD"}</p>
              )}
            </li>
            <li className="flex items-center">
              <Label className="w-24">Sunset</Label>
              {loading ? (
                <Skeleton className="h-6 w-[250px]" />
              ) : (
                <p>{sunData ? sunData.sunset : "TBD"}</p>
              )}
            </li>
            {sunData &&
              Object.entries(sunData).map(([key, value]) => {
                if (["sunset", "sunrise"].includes(key)) {
                  return;
                }

                const label =
                  key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ");

                return (
                  <li key={key} className="flex items-center">
                    <Label className="w-24">{label}</Label>
                    {loading ? (
                      <Skeleton className="h-6 w-[250px]" />
                    ) : (
                      <p>{value as string}</p>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
      {displayMap}
    </div>
  );
};

export default MapTime;
