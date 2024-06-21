import { cookies } from "next/headers";
import Login from "./components/login";


export default function Home() {
  const cookieValue = cookies().get('webauthn_credential');
  let details = null;

  if (cookieValue) {
    details = JSON.parse(decodeURIComponent(cookieValue?.value));
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {details && details.user.name}
      <Login webauthn_credential={cookieValue?.value} />
    </main>
  );
}
