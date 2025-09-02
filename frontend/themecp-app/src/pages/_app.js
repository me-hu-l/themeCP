import AuthProvider from "@/context/AuthContext";
import LevelContextProvider from "@/context/LevelContext";
import ProfileContextProvider from "@/context/ProfileContext/ProfileContext";
import ContestHistoryContextProvider from "@/context/ProfileContext/ContestHistoryContext";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <LevelContextProvider>
        <ProfileContextProvider>
          <ContestHistoryContextProvider>
            <Component {...pageProps} />
          </ContestHistoryContextProvider>
        </ProfileContextProvider>
      </LevelContextProvider>
    </AuthProvider>
  );
}