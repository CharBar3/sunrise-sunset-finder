"use client";

import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";
import {
  FC,
  LegacyRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { Map } from "leaflet";

interface PageProps {}

const Page: FC<PageProps> = () => {
  const center = [51.505, -0.09];
  const zoom = 13;

  function DisplayPosition({ map }) {
    const [position, setPosition] = useState(() => map.getCenter());

    const onClick = useCallback(() => {
      map.setView(center, zoom);
    }, [map]);

    const onMove = useCallback(() => {
      setPosition(map.getCenter());
    }, [map]);

    useEffect(() => {
      map.on("move", onMove);
      return () => {
        map.off("move", onMove);
      };
    }, [map, onMove]);

    return (
      <p>
        latitude: {position.lat.toFixed(4)}, longitude:{" "}
        {position.lng.toFixed(4)} <Button onClick={onClick}>reset</Button>
      </p>
    );
  }

  function ExternalStateExample() {
    const [map, setMap] = useState<Map | null>(null);

    const displayMap = useMemo(
      () => (
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          ref={setMap}
          className="h-[800px]"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      ),
      []
    );

    return (
      <div>
        {map ? <DisplayPosition map={map} /> : null}
        {displayMap}
      </div>
    );
  }

  return <ExternalStateExample />;
};

export default Page;
