import { StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    //default display flex
    flex: 1,
    marginTop: 40,
    borderWidth: 1,
    borderColor: "red",
    // flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  item1: {
    padding: 20,
    borderWidth: 1,
    backgroundColor: "violet",
    height: 250,
    width: 300,
  },
  item2: {
    padding: 20,
    borderWidth: 1,
    backgroundColor: "green",
    height: 300,
    width: 100,
  },
  item3: {
    padding: 20,
    borderWidth: 1,
    backgroundColor: "GRAY",
    height: 100,
  },
  item4: { padding: 20, borderWidth: 1, backgroundColor: "gray" },
});
const FlexBox = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.item1}>Item 1</Text>
      <Text style={styles.item2}>Item 2</Text>
      <Text style={styles.item3}>Item 3</Text>
      <Text style={styles.item4}>Item 4</Text>
    </View>
  );
};

export default FlexBox;
