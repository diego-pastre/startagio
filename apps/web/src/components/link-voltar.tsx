import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export function LinkVoltar({ href, rotulo }: { href: string; rotulo: string }) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeftIcon className="size-4" />
      {rotulo}
    </Link>
  );
}
