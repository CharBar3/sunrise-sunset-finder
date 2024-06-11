import { FC } from "react";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";
import { Card } from "./ui/card";

interface InfoBoxProps {
  label: string;
  info: string | null;
  loading: boolean;
}

const InfoBox: FC<InfoBoxProps> = ({ label, info, loading }) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-2 w-36">
      <Label>{label}</Label>
      {loading ? (
        <Skeleton className="h-6 w-[250px]" />
      ) : (
        <p>{info ? info : "TBD"}</p>
      )}
    </div>
  );
};

export default InfoBox;
