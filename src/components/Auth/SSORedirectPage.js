import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

export default function SSORedirectPage() {
  return <AuthenticateWithRedirectCallback />;
}
