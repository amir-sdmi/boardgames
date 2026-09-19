import { AuthPage, type AuthPageProps } from "@/components/auth/AuthPage";

export default function Page(props: AuthPageProps) {
  return <AuthPage {...props} mode="sign-in" />;
}
