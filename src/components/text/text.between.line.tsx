import { Text, View } from "react-native";

interface IProps {
  title: string;
}
const TextBetweenLine = (props: IProps) => {
  const { title } = props;
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          borderBottomColor: "#000",
          borderBottomWidth: 1,
          paddingHorizontal: 35,
        }}
      ></View>

      <View>
        <Text style={{ color: "#000", padding: 15 }}>{title}</Text>
      </View>
      <View
        style={{
          borderBottomColor: "#000",
          borderBottomWidth: 1,
          paddingHorizontal: 35,
        }}
      ></View>
    </View>
  );
};
export default TextBetweenLine;
