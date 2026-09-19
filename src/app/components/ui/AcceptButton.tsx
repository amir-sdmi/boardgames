import Button, { type ButtonProps } from "./Button";

export default function AcceptButton(props: Omit<ButtonProps, "variant">) {
  return <Button {...props} variant="accept" />;
}
