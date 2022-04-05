import { FC } from "react";
import { Device, Fleet } from "@formant/data-sdk";
import { Button } from "@alenjdev/ui-sdk";
import { useState } from "react";
interface ICommandIssuerProps {
  device: Device;
  command: string;
  label: string;
  params: string;
}

export const CommandIssuer: FC<ICommandIssuerProps> = ({
  device,
  command,
  label,
  params,
}) => {
  const [disable, setDisable] = useState(false);
  const issueCommand = async () => {
    if (!device) return;
    device.sendCommand(command, params);
    setDisable(true);
    setTimeout(() => {
      setDisable(false);
    }, 5000);
  };

  return (
    <div>
      <Button
        disabled={disable}
        onClick={issueCommand}
        type="primary"
        size="large"
      >
        {label}
      </Button>
    </div>
  );
};
