import { normalizarCnpj, somenteDigitos } from "./documentos";

// Máscaras aplicadas enquanto a pessoa digita. Aceitam valor parcial e o resultado
// sempre passa de volta pelos schemas, que tiram a máscara antes de gravar.

function aplicarPadrao(valor: string, padrao: string): string {
  let resultado = "";
  let indice = 0;
  for (const simbolo of padrao) {
    if (indice >= valor.length) break;
    resultado += simbolo === "#" ? valor[indice++] : simbolo;
  }
  return resultado;
}

export function formatarCpf(valor: string): string {
  return aplicarPadrao(somenteDigitos(valor).slice(0, 11), "###.###.###-##");
}

export function formatarCnpj(valor: string): string {
  return aplicarPadrao(normalizarCnpj(valor).slice(0, 14), "##.###.###/####-##");
}

export function formatarCep(valor: string): string {
  return aplicarPadrao(somenteDigitos(valor).slice(0, 8), "#####-###");
}

export function formatarTelefone(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, 11);
  if (digitos.length <= 2) return digitos.length ? `(${digitos}` : "";
  return aplicarPadrao(digitos, digitos.length === 11 ? "(##) #####-####" : "(##) ####-####");
}

/** Dinheiro sendo digitado: os dígitos viram centavos ("135000" → "1.350,00"). Até 99.999.999,99. */
export function formatarMoedaDigitando(valor: string): string {
  const digitos = somenteDigitos(valor).replace(/^0+/, "").slice(0, 10);
  if (!digitos) return "";
  return (Number(digitos) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** "1.350,00" → 1350. Número passa direto; texto sem vírgula é lido como número comum ("1350.5"). */
export function lerMoeda(valor: string | number): number {
  if (typeof valor === "number") return valor;
  const texto = valor.trim().replace(/^R\$\s*/, "");
  return texto.includes(",") ? Number(texto.replace(/\./g, "").replace(",", ".")) : Number(texto);
}
