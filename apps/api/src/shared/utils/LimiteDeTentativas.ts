interface Registro {
  falhas: number;
  /** Instante (em ms) em que a contagem zera. */
  expiraEm: number;
}

interface OpcoesDoLimite {
  /** Quantas falhas cabem na janela. Depois disso a chave fica bloqueada até a janela acabar. */
  maximo: number;
  janelaMs: number;
  /** Relógio, trocado nos testes. */
  agora?: () => number;
}

/** Acima disso, as chaves mais antigas saem da memória (ex.: alguém inventando milhares de logins). */
const MAXIMO_DE_CHAVES = 50_000;

/**
 * Conta falhas por chave (ex.: o login digitado) dentro de uma janela de tempo, em memória.
 * Vale para uma cópia da API: se um dia ela rodar em várias, cada uma conta as suas,
 * e a contagem zera quando a API reinicia.
 */
export class LimiteDeTentativas {
  private registros = new Map<string, Registro>();

  constructor(private readonly opcoes: OpcoesDoLimite) {}

  /** Milissegundos até a chave poder tentar de novo; 0 se ela pode tentar agora. */
  esperaRestante(chave: string): number {
    const registro = this.registroValido(chave);
    if (!registro || registro.falhas < this.opcoes.maximo) return 0;
    return registro.expiraEm - this.agora();
  }

  registrarFalha(chave: string): void {
    const registro = this.registroValido(chave);
    if (registro) {
      registro.falhas += 1;
      return;
    }
    this.abrirEspaco();
    this.registros.set(chave, { falhas: 1, expiraEm: this.agora() + this.opcoes.janelaMs });
  }

  limpar(chave: string): void {
    this.registros.delete(chave);
  }

  private registroValido(chave: string): Registro | undefined {
    const registro = this.registros.get(chave);
    if (registro && registro.expiraEm <= this.agora()) {
      this.registros.delete(chave);
      return undefined;
    }
    return registro;
  }

  private abrirEspaco(): void {
    if (this.registros.size < MAXIMO_DE_CHAVES) return;
    const agora = this.agora();
    for (const [chave, registro] of this.registros) {
      if (registro.expiraEm <= agora) this.registros.delete(chave);
    }
    // Ainda cheio: o Map guarda a ordem de inserção, então a primeira chave é a mais antiga.
    if (this.registros.size >= MAXIMO_DE_CHAVES) {
      const maisAntiga = this.registros.keys().next().value;
      if (maisAntiga !== undefined) this.registros.delete(maisAntiga);
    }
  }

  private agora(): number {
    return (this.opcoes.agora ?? Date.now)();
  }
}
