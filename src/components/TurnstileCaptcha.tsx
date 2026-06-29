import { Turnstile } from "@marsidev/react-turnstile";

type TurnstileCaptchaProps = {
  onVerify: (token: string) => void;
  onExpire: () => void;
};

export function TurnstileCaptcha({ onVerify, onExpire }: TurnstileCaptchaProps) {
  return (
    <Turnstile
      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
      onSuccess={onVerify}
      onExpire={onExpire}
      onError={onExpire}
    />
  );
}