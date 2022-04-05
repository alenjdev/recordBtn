import { CommandIssuer } from "./CommandIssuer";
import { FC, useEffect, useState, useMemo } from "react";
import { App, Device, ModuleData } from "@formant/data-sdk";
import { Button } from "@alenjdev/ui-sdk";

interface ICommandHandleProps {
  device: Device | undefined;
}

export const CommandHandle: FC<ICommandHandleProps> = ({ device }) => {
  const [isRecording, setIsRecording] = useState<boolean>();
  const [disable, setDisable] = useState(false);

  useEffect(() => {
    App.addModuleDataListener(receiveModuleData);
  }, [device]);

  const receiveModuleData = async (newValue: ModuleData) => {
    const latestState = getLatestJsonUrl(newValue);
    if (latestState === undefined) return;
    let currentState = latestState.values[0];
    setDisable(!disable);
    if (isRecording !== currentState) {
      setIsRecording(latestState.values[0]);
      console.log(isRecording);
    }
  };

  const issueCommand = async () => {
    if (!device) return;
    device.sendCommand("switch_polygon_record", isRecording ? "STOP" : "START");
    setDisable(true);
    setTimeout(() => {
      setDisable(false);
    }, 20000);
  };

  return (
    <div>
      <Button
        disabled={disable}
        onClick={issueCommand}
        type="primary"
        size="large"
      >
        {isRecording ? "STOP Polygon record" : "START Polygon record"}
      </Button>
    </div>
  );
};

function getLatestJsonUrl(
  moduleData: ModuleData
): { keys: string[]; values: boolean[] } | string | undefined {
  const streams = Object.values(moduleData.streams);
  if (streams.length === 0) {
    return "No streams.";
  }
  const stream = streams[0];
  if (stream === undefined) {
    return "No stream.";
  }
  if (stream.loading) {
    return undefined;
  }
  if (stream.tooMuchData) {
    return "Too much data.";
  }

  if (stream.data.length === 0) {
    return "No data.";
  }
  const latestPoint = stream.data[0].points.at(-1);
  if (!latestPoint) {
    return "No datapoints.";
  }
  return latestPoint[1];
}
