// Colunas DATE (sem hora). O Prisma lê e grava essas colunas como Date à meia-noite UTC.
// Na API elas trafegam como texto "YYYY-MM-DD" para o front não deslocar o dia ao converter de fuso.

/** "2026-12-15" → Date que o Prisma grava como 2026-12-15. */
export function paraDataDoBanco(dataIso: string): Date {
  return new Date(`${dataIso}T00:00:00.000Z`);
}

/** Valor de coluna DATE lido do banco → "YYYY-MM-DD". */
export function dataDoBanco(data: Date | null): string | null {
  return data ? data.toISOString().slice(0, 10) : null;
}
