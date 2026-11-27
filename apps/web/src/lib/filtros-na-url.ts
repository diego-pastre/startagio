/**
 * Grava os filtros de uma lista na URL (?area=...&pagina=2): recarregar ou compartilhar o link mantém a busca.
 * O replaceState muda a URL sem ir ao servidor, e o Next atualiza o useSearchParams.
 * Mudar um filtro volta para a página 1; para trocar de página, passe só `pagina`.
 */
export function atualizarFiltrosNaUrl(mudancas: Record<string, string | undefined>, pagina?: number) {
  const parametros = new URLSearchParams(window.location.search);
  for (const [chave, valor] of Object.entries(mudancas)) {
    if (valor) parametros.set(chave, valor);
    else parametros.delete(chave);
  }
  if (pagina && pagina > 1) parametros.set("pagina", String(pagina));
  else parametros.delete("pagina");
  const consulta = parametros.toString();
  window.history.replaceState(null, "", consulta ? `?${consulta}` : window.location.pathname);
}
