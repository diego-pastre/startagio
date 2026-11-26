import type { UseFormReturn } from "react-hook-form";
import type { NovaVagaData, NovaVagaInput } from "@startagio/contracts";

/** Formulário do assistente: entrada como a pessoa digita, saída já no formato da API. */
export type FormularioVaga = UseFormReturn<NovaVagaInput, unknown, NovaVagaData>;
