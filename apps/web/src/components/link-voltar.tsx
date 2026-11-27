import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export function LinkVoltar({ href, rotulo }: { href: string; rotulo: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
      {rotulo}
    </Link>
  );
}
