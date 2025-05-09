import { useState } from "react";
import { Alert, Button, StyleSheet, TextInput, View } from "react-native";
import MineButton from "../button/mine.button";
const styles = StyleSheet.create({
  todoInput: {
    borderColor: "violet",
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 10,
  },
});

interface IProps {
  addTodo: (name: string) => void;
}

const InputTodo = (props: IProps) => {
  const { addTodo } = props;
  const [name, setName] = useState<string>("");
  const handleAddNewTodo = () => {
    if (!name) {
      Alert.alert(
        "Invalid Information",
        "You cannot add empty to do , Pls Input valid data",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]
      );
      return;
    }
    addTodo(name);
    setName("");
  };
  return (
    <>
      <View style={{ marginBottom: 20 }}>
        <TextInput
          onChangeText={(v) => setName(v)}
          value={name}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.todoInput}
        />
      </View>
      <MineButton title="Add new" onPress={handleAddNewTodo} />
    </>
  );
};
export default InputTodo;
