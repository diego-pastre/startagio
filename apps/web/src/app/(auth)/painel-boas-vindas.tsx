import { Building2Icon, GraduationCapIcon, LandmarkIcon, MapPinIcon, SparklesIcon, UserCheckIcon } from "lucide-react";
import { Logo } from "@/components/logo";

const PERFIS = [
  { icone: GraduationCapIcon, titulo: "Estudantes", texto: "encontram vagas que combinam com o curso e o momento." },
  { icone: Building2Icon, titulo: "Empresas", texto: "publicam vagas e escolhem pelo ranking de candidatos." },
  { icone: LandmarkIcon, titulo: "Instituições", texto: "acompanham e validam cada estágio." },
];

/**
 * Lado esquerdo do login e do cadastro (só a partir de 1024px).
 * Os cartões flutuantes são ilustração, não dados reais.
 */
export function PainelBoasVindas() {
  return (
    <section className="relative hidden overflow-hidden bg-gradiente-marca text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      {/* Bolhas de luz no fundo. */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 size-112 rounded-full bg-destaque/25 blur-3xl" />

      <Logo claro className="relative" />

      <div className="relative flex flex-col gap-10">
        <div className="flex max-w-lg flex-col gap-4">
          <h1 className="text-4xl leading-[1.1] font-extrabold tracking-tight text-balance xl:text-5xl">
            Seu primeiro estágio começa com uma boa conexão.
          </h1>
          <p className="text-lg text-white/80">
            A rede que aproxima quem está começando de quem quer ensinar e contratar.
          </p>
        </div>

        <Ilustracao />

        <ul className="grid max-w-xl gap-3">
          {PERFIS.map(({ icone: Icone, titulo, texto }) => (
            <li key={titulo} className="flex items-center gap-3 text-sm text-white/85">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                <Icone className="size-4.5" />
              </span>
              <span>
                <strong className="font-semibold text-white">{titulo}</strong> {texto}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-white/60">Startagio · plataforma de vagas de estágio</p>
    </section>
  );
}

/** Cartões de exemplo. Cores fixas (zinc), porque são “papel branco” nos dois temas. */
function Ilustracao() {
  return (
    <div aria-hidden className="relative h-44 max-w-xl text-zinc-900 select-none">
      <div className="absolute top-0 left-0 w-72 -rotate-2 rounded-2xl bg-white p-4 shadow-2xl shadow-black/20">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[oklch(0.94_0.04_var(--marca-matiz))] text-sm font-bold text-[oklch(0.42_0.17_var(--marca-matiz))]">
            NA
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Estágio em Dados</p>
            <p className="flex items-center gap-1 text-xs text-zinc-500">
              <MapPinIcon className="size-3" /> Remoto · R$ 1.500/mês
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          {["SQL", "Python", "Excel"].map((tag) => (
            <span key={tag} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[0.7rem] font-medium text-zinc-600">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute top-6 right-0 flex w-60 rotate-2 items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-2xl shadow-black/20">
        <span className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <UserCheckIcon className="size-4.5" />
        </span>
        <div className="text-xs">
          <p className="font-bold">Candidatura enviada</p>
          <p className="text-zinc-500">Prova concluída</p>
        </div>
      </div>

      <div className="absolute bottom-0 left-40 flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-xs font-bold shadow-xl shadow-black/20">
        <SparklesIcon className="size-4 text-amber-500" />
        Vaga com o seu perfil
      </div>
    </div>
  );
}
