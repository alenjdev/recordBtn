import { CommandIssuer } from "./CommandIssuer";
import { FC, useLayoutEffect, useState } from "react";
import { App, Device, ModuleData } from "@formant/data-sdk";

interface ICommandHandleProps {
  device: Device | undefined;
}

export const CommandHandle: FC<ICommandHandleProps> = ({ device }) => {
  const [isRecording, setIsRecording] = useState<boolean>();

  useLayoutEffect(() => {
    App.addModuleDataListener(receiveModuleData);
  }, [device]);

  const receiveModuleData = async (newValue: ModuleData) => {
    const latestState = getLatestJsonUrl(newValue);
    if (latestState === undefined) return;
    if (isRecording !== latestState.values[0])
      setIsRecording(latestState.values[0]);
  };

  return (
    <div>
      {isRecording ? (
        <CommandIssuer
          device={device!}
          label="STOP Polygon record"
          command="switch_polygon_record"
          params="STOP"
        />
      ) : (
        <CommandIssuer
          device={device!}
          label="START Polygon record"
          command="switch_polygon_record"
          params="START"
        />
      )}
    </div>
  );
};

function getLatestJsonUrl(
  moduleData: ModuleData
): { keys: string[]; values: boolean[] } | undefined {
  const streams = Object.values(moduleData.streams);
  if (streams.length === 0) {
    throw new Error("No streams.");
  }
  const stream = streams[0];
  if (stream === undefined) {
    throw new Error("No stream.");
  }
  if (stream.loading) {
    return undefined;
  }
  if (stream.tooMuchData) {
    throw new Error("Too much data.");
  }

  if (stream.data.length === 0) {
    throw new Error("No data.");
  }
  const latestPoint = stream.data[0].points.at(-1);
  if (!latestPoint) {
    throw new Error("No datapoints.");
  }
  return latestPoint[1];
}
