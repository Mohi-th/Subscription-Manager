import { Link } from "expo-router";
import { Text} from "react-native";
import SaveScreen from "../components/SafeAreaView";

export default function App() {
  return (
    <SaveScreen>
      <Text className="text-7xl font-sans-extrabold text-success">Home</Text>
      <Link href={"/OnBoarding"} className="mt-4 font-sans-bold rounded bg-primary text-white p-4">onboarding</Link>
      <Link href={"/(auth)/SignIn"} className="mt-4 font-sans-bold rounded bg-primary text-white p-4">sign in</Link>
      <Link href={"/(auth)/SignUp"} className="mt-4 font-sans-bold rounded bg-primary text-white p-4">create new account</Link>
    </SaveScreen>
  );
}