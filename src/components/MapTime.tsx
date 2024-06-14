"use client";

import "leaflet/dist/leaflet.css";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import FetchSunriseSunsetData from "@/server actions/fetchSunriseSunsetData";
import { Icon, LatLng, Map } from "leaflet";
import {
  CircleHelp,
  LoaderCircle,
  LocateFixed,
  PlusCircleIcon,
  PlusIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { useDebounce } from "react-use";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import MapUtils from "@/lib/map-utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const MapTime = () => {
  const [country, setCountry] = useState<string | null>(null);
  const [position, setPosition] = useState<null | LatLng>(null);

  const [, cancel] = useDebounce(
    () => {
      if (!position) {
        return;
      }
      setSunData(null);
      setCountry(MapUtils.getCountryNameFromLatLng(position.lat, position.lng));
      console.log(country);
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
        className="absolute right-6 bottom-6"
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
  const displayMap = useMemo(() => {
    const customIcon = new Icon({
      iconUrl:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1hcC1waW4iPjxwYXRoIGQ9Ik0yMCAxMGMwIDYtOCAxMi04IDEycy04LTYtOC0xMmE4IDggMCAwIDEgMTYgMFoiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIi8+PC9zdmc+",
      iconSize: [38, 38],
      iconAnchor: [19, 36],
    });

    function MarkCoords() {
      const map = useMapEvents({
        click(e) {
          updatePostion(e.latlng);
        },
        zoom(e) {
          console.log(e);
        },
      });

      return position === null ? null : (
        <Marker position={position} icon={customIcon}>
          <Popup offset={[0, -23]}>{`${position.lat}, ${position.lng}`}</Popup>
        </Marker>
      );
    }

    return (
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        ref={setMap}
        className="h-full z-0"
        minZoom={3}
        // maxBounds={[
        //   [-90, -180],
        //   [90, 180],
        // ]}
      >
        <TileLayer
          attribution='<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkCoords />
      </MapContainer>
    );
  }, [position]);

  return (
    <div className="grid grid-rows-[auto_1fr] h-screen">
      <div className="bg-yellow p-2 flex justify-between">
        <div>
          <div className="flex space-x-2 mb-2">
            <h1 className="font-bold ">🔎 Sunrise/Sunset Time Finder</h1>
            <div className="mx-4 flex items-center justify-center aspect-square">
              <Popover>
                <PopoverTrigger>
                  <CircleHelp />
                </PopoverTrigger>
                <PopoverContent>
                  <p className="leading-7">
                    Click on the map to get sunrise and sunset information at
                    the selected location
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            {loading && <LoaderCircle className="animate-spin" />}
          </div>
          <div className="relative flex px-2 items-center">
            <div className="relative flex gap-2 flex-wrap px-2">
              <Badge className="h-[22px]">
                Sunrise: {sunData && sunData.sunrise}{" "}
              </Badge>
              <Badge className="h-[22px]">
                Sunset: {sunData && sunData.sunset}{" "}
              </Badge>
              {country && (
                <Badge className="h-[22px]">Country: {country} </Badge>
              )}
            </div>
            <div className="h-full flex items-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" className="aspect-square">
                    <PlusCircleIcon />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sunrise Sunset Info</DialogTitle>
                    <DialogDescription>
                      {position && (
                        <h2 className="text-center font-bold">
                          Lat: {position?.lat} Lng: {position?.lng}
                        </h2>
                      )}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Type</TableHead>
                            <TableHead className="w-[100px]">Data</TableHead>
                          </TableRow>
                        </TableHeader>
                        {sunData &&
                          Object.entries(sunData).map(([key, value]) => {
                            const label =
                              key.charAt(0).toUpperCase() +
                              key.slice(1).replace("_", " ");
                            return (
                              <TableRow key={key}>
                                <TableCell>{label}</TableCell>
                                <TableCell>{value as string}</TableCell>
                              </TableRow>
                            );
                          })}
                      </Table>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
            <div
              className={cn(
                "absolute top-0 right-0 h-full  border-l-4 border-black z-10 bg-yellow transition-all duration-500",
                !loading && sunData ? "w-0" : "w-full"
              )}
            ></div>
          </div>
        </div>
      </div>

      <div>{displayMap}</div>

      {map && <MapControls map={map} />}
    </div>
  );
};

export default MapTime;
