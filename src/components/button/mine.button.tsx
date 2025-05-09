import { Pressable, StyleSheet, Text, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const styles = StyleSheet.create({
  btnContainer: {
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "yellow",
  },
  text: {
    textTransform: "uppercase",
  },
});
interface IProps {
  title: string;
  onPress: any;
}
const MineButton = (props: IProps) => {
  const { title, onPress } = props;
  return (
    <>
      <Pressable
        style={({ pressed }) => ({
          opacity: pressed === true ? 0.5 : 1,
          alignSelf: "flex-start",
        })}
        onPress={onPress}
      >
        <View style={styles.btnContainer}>
          <AntDesign
            name="pluscircle"
            size={30}
            color="black"
            style={{ color: "GRAY" }}
          />

          <Text style={styles.text}>{title}</Text>
        </View>
      </Pressable>
    </>
  );
};
export default MineButton;
