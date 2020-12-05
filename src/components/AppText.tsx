import { default as React } from "react";
import { Text, TextProps, TextStyle } from "react-native";

interface AppTextProps extends TextProps {
  fontScale?: number;
}

export class AppText extends React.Component<AppTextProps, any> {
  render() {
    const style = [{ fontSize: this.props.fontScale ? 14 * this.props.fontScale : undefined } as TextStyle, this.props.style || {}];
    const allProps = Object.assign({}, this.props, { style: style });
    return (
      <Text numberOfLines={this.props.numberOfLines} {...allProps}>
        {this.props.children}
      </Text>
    );
  }
}
