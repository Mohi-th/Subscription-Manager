import "@/global.css"
import { Link } from "expo-router";
import { Text, View } from "react-native";
import SaveScreen from "../components/SafeAreaView";

export default function App() {
  return (
    <SaveScreen >
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link href={"/OnBoarding"}>onboarding</Link>
      <Link href={"/(auth)/SignIn"} className="border px-5 py-2">sign in</Link>
      <Link href={"/(auth)/SignUp"} className="border px-5 py-2">create new account</Link>
      {/* <Link href="/Subscriptions/spotify" className="border px-5 py-2">Spotify Subscription</Link>
      <Link href={{
        pathname:"/Subscriptions/[id]",
        params:{id:"claude"}
      }} className="border px-5 py-2">Claude Max subscription</Link> */}
    </SaveScreen>
  );
}