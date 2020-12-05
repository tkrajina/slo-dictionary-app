import { Linking } from "expo";
import { default as React } from "react";
import { TextProps, Text } from "react-native";

interface TextWithLinksProps extends TextProps {
  text: string;
}
export class TextWithLinks extends React.PureComponent<TextWithLinksProps> {
  constructor(props: TextWithLinksProps) {
    super(props);
  }

  renderChunk(s: string, index: number) {
    if (s.indexOf("http") === 0) {
      return (
        <Text key={"" + index} style={[{ color: "blue" }, this.props.style]} onPress={() => Linking.openURL(s)}>
          {s}
        </Text>
      );
    } else {
      return <Text key={"" + index}>{s}</Text>;
    }
  }

  render() {
    return <Text style={this.props.style}>{splitTextAndLinks(this.props.text).map((s, index) => this.renderChunk(s, index))}</Text>;
  }
}

const delimiter = "" + Math.random() + Math.random();

function splitTextAndLinks(text: string): string[] {
  if (!text) {
    return [];
  }
  return text
    .replace(/https{0,1}:\S+/, (s) => {
      return delimiter + s + delimiter;
    })
    .split(delimiter);
}
