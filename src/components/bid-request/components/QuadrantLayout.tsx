import React from "react";
import QuadrantCard from "./QuadrantCard";

interface QuadrantData {
  frontLeft: number | null;
  frontRight: number | null;
  rearLeft: number | null;
  rearRight: number | null;
}

interface QuadrantLayoutProps {
  title: string;
  measurementType: "tire" | "brake";
  data: QuadrantData;
  onMeasurementChange: (position: keyof QuadrantData, value: number | null) => void;
}

const QuadrantLayout = ({ title, measurementType, data, onMeasurementChange }: QuadrantLayoutProps) => {
  const positions = [
    { key: "frontLeft" as keyof QuadrantData, label: "Front Left" },
    { key: "frontRight" as keyof QuadrantData, label: "Front Right" },
    { key: "rearLeft" as keyof QuadrantData, label: "Rear Left" },
    { key: "rearRight" as keyof QuadrantData, label: "Rear Right" },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-4">
        {positions.map(({ key, label }) => (
          <QuadrantCard
            key={key}
            position={label}
            measurement={data[key]}
            measurementType={measurementType}
            onMeasurementChange={(value) => onMeasurementChange(key, value)}
          />
        ))}
      </div>
    </div>
  );
};

export default QuadrantLayout;
