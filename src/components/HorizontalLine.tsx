import React from "react";
import { View, ViewStyle } from "react-native";

interface HorizontalLineProps {
  marginHorizontal?: string | number;
  marginVertical?: string | number;
  style?: ViewStyle | any[];
  color?: string;
}
interface HorizontalLineState {}
export class HorizontalLine extends React.PureComponent<HorizontalLineProps, HorizontalLineState> {
  constructor(props: HorizontalLineProps) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <View
        style={[
          {
            borderBottomWidth: 1,
            borderColor: this.props.color ? this.props.color : undefined,
            marginLeft: this.props.marginHorizontal || 15,
            marginRight: this.props.marginHorizontal || 15,
            marginTop: this.props.marginVertical || 5,
            marginBottom: this.props.marginVertical || 5,
          },
          this.props.style,
        ]}
      />
    );
  }
}
