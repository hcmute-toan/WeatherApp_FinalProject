import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
const styles = StyleSheet.create({
  todo: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "red",
  },
  todoItem: {
    backgroundColor: "aqua",
    padding: 20,
    borderColor: "red",
    borderWidth: 1,
  },
});

interface IProps {
  todoList1: ITodo[];
  deleteTodo: (v: number) => void;
}

const ListTodo = (props: IProps) => {
  const { todoList1, deleteTodo } = props;
  return (
    <>
      <FlatList
        style={styles.todo}
        data={todoList1}
        keyExtractor={(item) => item.id + ""}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity onPress={() => deleteTodo(item.id)}>
              <Text key={item.id} style={styles.todoItem}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </>
  );
};
export default ListTodo;
