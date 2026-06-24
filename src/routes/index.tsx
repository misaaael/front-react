import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import {
  listarDispositivos,
  type Dispositivo,
  type ListarResponse,
} from "@/lib/intelbras.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Casa Inteligente • Dispositivos" },
      {
        name: "description",
        content:
          "Consulte os dispositivos vinculados à sua conta Open Casa Inteligente da Intelbras.",
      },
    ],
  }),
  component: Index,
});

type Origem = "todos" | "vinculados" | "compartilhados";

function Index() {
  const fetchDispositivos = useServerFn(listarDispositivos);
  const [token, setToken] = useState("");
  const [origem, setOrigem] = useState<Origem>("todos");
  const [pagina, setPagina] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(20);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ListarResponse | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function run(nextPagina = pagina, nextOrigem = origem, nextSize = tamanhoPagina) {
    if (!token.trim()) return;
    setLoading(true);
    try {
      const data = await fetchDispositivos({
        data: {
          token: token.trim(),
          pagina: nextPagina,
          tamanhoPagina: nextSize,
          origem: nextOrigem,
        },
      });
      setResult(data as ListarResponse);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPagina(1);
    run(1, origem, tamanhoPagina);
  }

  function reset() {
    setSubmitted(false);
    setResult(null);
    setToken("");
    setPagina(1);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {!submitted ? (
          <TokenForm
            token={token}
            setToken={setToken}
            loading={loading}
            onSubmit={onSubmit}
          />
        ) : (
          <Results
            result={result}
            loading={loading}
            origem={origem}
            pagina={pagina}
            tamanhoPagina={tamanhoPagina}
            onChangeOrigem={(o) => {
              setOrigem(o);
              setPagina(1);
              run(1, o, tamanhoPagina);
            }}
            onChangePagina={(p) => {
              setPagina(p);
              run(p, origem, tamanhoPagina);
            }}
            onChangeTamanho={(t) => {
              setTamanhoPagina(t);
              setPagina(1);
              run(1, origem, t);
            }}
            onRefresh={() => run(pagina, origem, tamanhoPagina)}
            onReset={reset}
          />
        )}
      </main>
      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-center text-xs text-muted-foreground">
        Protótipo • Case técnico Squad PO • Open Casa Inteligente
      </footer>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-brand-foreground">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l9-8 9 8" />
              <path d="M5 10v10h14V10" />
              <path d="M10 20v-6h4v6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-foreground">
              Casa Inteligente
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              Console de dispositivos
            </p>
          </div>
        </div>
        <span className="rounded-full border border-border bg-brand-soft px-3 py-1 text-xs font-medium text-foreground">
          API • Intelbras
        </span>
      </div>
    </header>
  );
}

function TokenForm({
  token,
  setToken,
  loading,
  onSubmit,
}: {
  token: string;
  setToken: (v: string) => void;
  loading: boolean;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Conecte sua conta
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cole o <span className="font-medium text-foreground">token temporário</span> gerado em{" "}
          <span className="font-mono text-xs">Contas → Token Temporário</span> na
          plataforma Open Casa Inteligente.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="space-y-2">
          <label htmlFor="token" className="text-sm font-medium text-foreground">
            Token de acesso
          </label>
          <textarea
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ey..."
            rows={4}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 font-mono text-xs text-foreground outline-none ring-ring/20 transition focus:border-ring focus:ring-4"
            required
          />
          <p className="text-xs text-muted-foreground">
            Seu token é enviado apenas para a API da Intelbras e não é armazenado.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !token.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Spinner /> Consultando…
            </>
          ) : (
            "Listar dispositivos"
          )}
        </button>
      </form>
    </div>
  );
}

function Results({
  result,
  loading,
  origem,
  pagina,
  tamanhoPagina,
  onChangeOrigem,
  onChangePagina,
  onChangeTamanho,
  onRefresh,
  onReset,
}: {
  result: ListarResponse | null;
  loading: boolean;
  origem: Origem;
  pagina: number;
  tamanhoPagina: number;
  onChangeOrigem: (o: Origem) => void;
  onChangePagina: (p: number) => void;
  onChangeTamanho: (t: number) => void;
  onRefresh: () => void;
  onReset: () => void;
}) {
  const dispositivos = result?.dispositivos ?? [];
  const totalPaginas = Math.max(
    1,
    Math.ceil((result?.total ?? dispositivos.length) / tamanhoPagina),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Dispositivos
          </h1>
          <p className="text-sm text-muted-foreground">
            {result?.ok
              ? `${dispositivos.length} item(ns) exibidos${
                  result.total ? ` • ${result.total} no total` : ""
                }`
              : "Erro ao consultar a API"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-accent disabled:opacity-50"
          >
            {loading ? <Spinner /> : "Atualizar"}
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
          >
            Trocar token
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        <FilterChips origem={origem} onChange={onChangeOrigem} />
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <label htmlFor="size">Itens por página</label>
          <select
            id="size"
            value={tamanhoPagina}
            onChange={(e) => onChangeTamanho(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}

          </select>
        </div>
      </div>

      {!result?.ok ? (
        <ErrorState
          message={result?.message ?? "Erro desconhecido."}
          code={result?.errorCode}
          onRetry={onRefresh}
          onReset={onReset}
        />
      ) : dispositivos.length === 0 ? (

        <EmptyState />
      ) : (
        <DeviceGrid devices={dispositivos} />
      )}

      {result?.ok && dispositivos.length > 0 && (
        <Pagination
          pagina={pagina}
          totalPaginas={totalPaginas}
          onChange={onChangePagina}
          disabled={loading}
        />
      )}
    </div>
  );
}

function FilterChips({
  origem,
  onChange,
}: {
  origem: Origem;
  onChange: (o: Origem) => void;
}) {
  const opts: { value: Origem; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "vinculados", label: "Vinculados" },
    { value: "compartilhados", label: "Compartilhados" },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {opts.map((o) => {
        const active = origem === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={
              "rounded-full px-3 py-1.5 text-xs font-medium transition " +
              (active
                ? "bg-brand text-brand-foreground"
                : "border border-border bg-background text-foreground hover:bg-accent")
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function DeviceGrid({ devices }: { devices: Dispositivo[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {devices.map((d, i) => (
        <DeviceCard key={String(d.id ?? d.mac ?? i)} device={d} />
      ))}
    </ul>
  );
}

function DeviceCard({ device }: { device: Dispositivo }) {
  const nome =
    (device.nome as string) ||
    (device.nomeDispositivo as string) ||
    (device.descricao as string) ||
    "Dispositivo sem nome";
  const modelo =
    (device.modelo as string) ||
    (device.modeloDispositivo as string) ||
    (device.tipo as string) ||
    "—";
  const mac = (device.mac as string) || (device.macAddress as string) || "";
  const isOnline =
    device.online === true ||
    device.status === "online" ||
    device.estado === "online";
  const isShared =
    device.compartilhado === true ||
    (typeof device.origem === "string" &&
      (device.origem as string).toLowerCase().includes("compart"));

  return (
    <li className="group rounded-xl border border-border bg-card p-4 transition hover:border-brand/60 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-foreground">
          <DeviceIcon />
        </div>
        <span
          className={
            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide " +
            (isOnline
              ? "bg-success/15 text-foreground"
              : "bg-muted text-muted-foreground")
          }
          style={{ color: isOnline ? "var(--success)" : undefined }}
        >
          {isOnline ? "● Online" : "○ Offline"}
        </span>
      </div>
      <div className="mt-3">
        <h3 className="truncate text-sm font-semibold text-foreground" title={nome}>
          {nome}
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{modelo}</p>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span className="font-mono">{mac || "—"}</span>
        <span
          className={
            "rounded px-1.5 py-0.5 " +
            (isShared
              ? "bg-accent text-accent-foreground"
              : "bg-brand-soft text-foreground")
          }
        >
          {isShared ? "Compartilhado" : "Vinculado"}
        </span>
      </div>
    </li>
  );
}

function DeviceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </svg>
  );
}

function Pagination({
  pagina,
  totalPaginas,
  onChange,
  disabled,
}: {
  pagina: number;
  totalPaginas: number;
  onChange: (p: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm">
      <button
        onClick={() => onChange(Math.max(1, pagina - 1))}
        disabled={disabled || pagina <= 1}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Anterior
      </button>
      <span className="text-xs text-muted-foreground">
        Página <span className="font-semibold text-foreground">{pagina}</span> de{" "}
        {totalPaginas}
      </span>
      <button
        onClick={() => onChange(pagina + 1)}
        disabled={disabled || pagina >= totalPaginas}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        Próxima →
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-foreground">
        <DeviceIcon />
      </div>
      <h3 className="text-sm font-semibold text-foreground">
        Nenhum dispositivo encontrado
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Esta conta ainda não possui dispositivos vinculados ou compartilhados.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  code,
  onRetry,
  onReset,
}: {
  message: string;
  code?: "unauthorized" | "network" | "server" | "unexpected";
  onRetry: () => void;
  onReset: () => void;
}) {
  const title =
    code === "unauthorized"
      ? "Token inválido ou expirado"
      : code === "network"
        ? "Falha de conexão com a API"
        : code === "server"
          ? "API da Intelbras indisponível"
          : code === "unexpected"
            ? "Resposta inesperada da API"
            : "Não foi possível listar os dispositivos";
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          !
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {code !== "unauthorized" && (
              <button
                onClick={onRetry}
                className="inline-flex items-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent"
              >
                Tentar novamente
              </button>
            )}
            <button
              onClick={onReset}
              className="inline-flex items-center rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground transition hover:opacity-95"
            >
              {code === "unauthorized" ? "Informar novo token" : "Trocar token"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
