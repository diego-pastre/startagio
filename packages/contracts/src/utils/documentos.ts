export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Tira a máscara e passa para maiúsculas. O CNPJ pode ter letras desde jul/2026 (IN RFB 2.229/2024). */
export function normalizarCnpj(valor: string): string {
  return valor.toUpperCase().replace(/[^0-9A-Z]/g, "");
}

export function cpfValido(valor: string): boolean {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digitoVerificador = (base: string) => {
    const pesoInicial = base.length + 1;
    const soma = [...base].reduce((total, digito, i) => total + Number(digito) * (pesoInicial - i), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return (
    digitoVerificador(cpf.slice(0, 9)) === Number(cpf[9]) &&
    digitoVerificador(cpf.slice(0, 10)) === Number(cpf[10])
  );
}

export function cnpjValido(valor: string): boolean {
  const cnpj = normalizarCnpj(valor);
  if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj) || /^(.)\1{13}$/.test(cnpj)) return false;

  // No CNPJ alfanumérico cada caractere vale (código ASCII - 48); para dígitos dá o próprio número.
  const digitoVerificador = (base: string) => {
    const soma = [...base].reduce((total, caractere, i) => {
      const peso = ((base.length - 1 - i) % 8) + 2;
      return total + (caractere.charCodeAt(0) - 48) * peso;
    }, 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  return (
    digitoVerificador(cnpj.slice(0, 12)) === Number(cnpj[12]) &&
    digitoVerificador(cnpj.slice(0, 13)) === Number(cnpj[13])
  );
}
