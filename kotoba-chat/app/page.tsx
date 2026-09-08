import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from "./chatgpt-auth";
import OjiisanApp from "./ojiisan-app";
export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await getChatGPTUser();
  return <OjiisanApp signedIn={!!user} signInPath={chatGPTSignInPath("/")} signOutPath={chatGPTSignOutPath("/")} />;
}
