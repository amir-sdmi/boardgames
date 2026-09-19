import Button, { type ButtonProps } from "./Button";

export default function RejectButton(props: Omit<ButtonProps, "variant">) {
  return <Button {...props} variant="reject" />;
}
