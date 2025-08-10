// src/components/layout/HeaderSwitch.tsx
import HeaderStatic from "./headers/HeaderStatic";
import HeaderClient from "./headers/HeaderClient";

type Props = {
  interactive?: boolean;
  logoHref?: string;
  items?: Array<{ href: string; label: string }>;
};

// Server Component: darf Client-Komponenten rendern, solange Props serialisierbar bleiben.
export default function HeaderSwitch(props: Props) {
  const { interactive = false, ...rest } = props;
  if (interactive) return <HeaderClient {...rest} />;
  return <HeaderStatic {...rest} />;
}
