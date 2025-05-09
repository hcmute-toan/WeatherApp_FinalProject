import { APP_COLOR } from "@/utils/constant";
import { useState } from "react";
import {
  Button,
  KeyboardTypeOptions,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
const styles = StyleSheet.create({
  inputGroup: {
    padding: 5,
    gap: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: "400",
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  eye: {
    position: "absolute",
    right: 10,
    top: 10,
  },
});
interface IProps {
  title?: string;
  keyBoardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  value?: any;
  setValue?: (v: any) => void;
  style?: StyleProp<TextStyle>;
  onChangeText?: any;
  onBlur?: any;
  error?: any;
  placeholder?: any;
  touched?: any;
  editable?: boolean;
}
const ShareInput = (props: IProps) => {
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const {
    title,
    keyBoardType,
    secureTextEntry = false,
    value,
    setValue,
    style,
    onChangeText,
    onBlur,
    error,
    placeholder,
    touched,
    editable = true,
  } = props;
  return (
    <View style={styles.inputGroup}>
      {title && <Text style={styles.text}>{title}</Text>}
      <View>
        <TextInput
          editable={editable}
          value={value}
          placeholder={placeholder}
          onChangeText={onChangeText}
          onFocus={() => setIsFocus(true)}
          onBlur={(e) => {
            if (onBlur) onBlur(e); // Only call onBlur if it exists
            setIsFocus(false);
          }}
          keyboardType={keyBoardType}
          style={[
            styles.input,
            style,
            { borderColor: isFocus ? APP_COLOR.GRAY : APP_COLOR.GRAY },
          ]}
          secureTextEntry={secureTextEntry && !isShowPassword}
        />
        {error && touched && (
          <Text style={{ color: "red", marginTop: 5 }}>{error}</Text>
        )}
        {secureTextEntry && (
          <FontAwesome5
            name={isShowPassword ? "eye" : "eye-slash"}
            size={20}
            color="black"
            style={styles.eye}
            onPress={() => setIsShowPassword(!isShowPassword)}
          />
        )}
      </View>
    </View>
  );
};

export default ShareInput;
