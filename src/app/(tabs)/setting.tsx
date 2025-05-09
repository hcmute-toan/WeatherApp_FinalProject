// app/(auth)/welcome.tsx
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { APP_COLOR } from "@/utils/constant";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  welcomeText: {
    flex: 0.6,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 20,
  },
  welcomeBtn: {
    flex: 0.4,
    marginHorizontal: 50,
  },
  heading: {
    fontWeight: "700",
    fontSize: 50,
    color: APP_COLOR.Default,
  },
  body: {
    fontWeight: "600",
    fontSize: 40,
    marginVertical: 10,
    color: APP_COLOR.Default,
  },
});

const WelcomePage = () => {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        style={{ flex: 1 }}
        colors={["#fff", "#f0f0f0"]}
        locations={[0.5, 0.8]}
      >
        <View style={styles.container}>
          <View style={styles.welcomeText}>
            <Text style={styles.heading}>Welcome To</Text>
            <Text style={styles.body}>Weather App</Text>
          </View>
          <View style={styles.welcomeBtn}>
            <View
              style={{
                alignItems: "center",
                gap: 8,
                marginTop: 15,
                flexDirection: "row",
                alignSelf: "center",
              }}
            >
              <Text style={{ color: APP_COLOR.Default, fontSize: 15 }}>
                Don't have an account yet?
              </Text>
              <Link href="/(auth)/signup">
                <Text
                  style={{
                    textDecorationLine: "underline",
                    color: APP_COLOR.Default,
                    fontSize: 15,
                  }}
                >
                  Sign Up
                </Text>
              </Link>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default WelcomePage;
