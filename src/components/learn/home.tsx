import { useNavigation } from "@react-navigation/native";
import { Button, Text, View } from "react-native";

const Home = () => {
  const navigation: any = useNavigation();

  return (
    <View>
      <Text>Home Component</Text>
      <Button
        title="Go To Detail"
        onPress={() => navigation.navigate("HomeDetails")}
      ></Button>
    </View>
  );
};
export default Home;
