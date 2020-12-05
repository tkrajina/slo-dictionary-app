import { default as React } from "react";
import { View, ViewStyle } from "react-native";
import { LAYOUT_STYLES } from "../styles/styles";

const PADDING = 2;

interface Props {
  percentage: number;
  width: number;
  height: number;
  color?: string;
}
export class Progress extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const width = (this.props.width - 2 * PADDING) * Math.min(this.props.percentage, 1) - 2;
    return (
      <View style={{ width: this.props.width, height: this.props.height, borderColor: this.props.color || "gray", borderWidth: 1 }}>
        <View style={{ position: "absolute", height: this.props.height - 2 * PADDING - 2, top: PADDING, left: PADDING, width: width, backgroundColor: this.props.color || "gray" }}></View>
      </View>
    );
  }
}
