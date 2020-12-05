import React from "react";
import { View, Text } from "react-native";

class ErrorBoundaryState {
  error: Error | undefined = undefined;
  info: object | undefined = undefined;
}

export class ErrorBoundary extends React.Component<any, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    // Add some default error states
    this.state = new ErrorBoundaryState();
  }

  componentDidCatch(error: Error | undefined, info: object) {
    this.setState({ error: error, info: info });
  }

  render() {
    if (this.state.error) {
      console.error("An error happened: %o, info=%o", this.state.error, this.state.info);
      return (
        <View>
          <Text style={{ color: "red" }}>An unexpected error happened :(</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
