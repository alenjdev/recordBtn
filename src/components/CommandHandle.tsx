import { Component } from "react";
import { App, Device, ModuleData } from "@formant/data-sdk";
import { Button } from "@alenjdev/ui-sdk";

interface ICommandHandleProps {
  device: Device | undefined;
}

interface ICommandHandleState {
  isRecording: boolean;
  disable: boolean;
}
interface latestState {
  keys: string[];
  values: boolean[];
}

export class CommandHandle extends Component<
  ICommandHandleProps,
  ICommandHandleState
> {
  public constructor(props: any) {
    super(props);
    this.state = {
      isRecording: false,
      disable: false,
    };
  }

  public componentDidMount() {
    App.addModuleDataListener(this.receiveModuleData);
  }

  receiveModuleData = async (newValue: ModuleData) => {
    const { isRecording } = this.state;
    const latestState = getLatestData(newValue);
    if (latestState === undefined) return;
    if (typeof latestState === "string") return;
    if (latestState.values[0] === undefined || latestState.values.length === 0)
      return;
    if (isRecording !== latestState.values[0]) {
      this.setState({
        isRecording: latestState.values[0],
        disable: false,
      });
    }
  };

  issueCommand = async () => {
    const { device } = this.props;
    const { isRecording } = this.state;
    if (!device) return;
    device.sendCommand("switch_polygon_record", isRecording ? "STOP" : "START");
    this.setState({
      disable: true,
    });
    setTimeout(() => {
      this.setState({
        disable: false,
      });
    }, 20000);
  };
  render() {
    const { disable, isRecording } = this.state;
    return (
      <div>
        <Button
          disabled={disable}
          onClick={this.issueCommand}
          type="primary"
          size="large"
        >
          {isRecording ? "STOP Polygon record" : "START Polygon record"}
        </Button>
      </div>
    );
  }
}

function getLatestData(
  moduleData: ModuleData
): latestState | string | undefined {
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
