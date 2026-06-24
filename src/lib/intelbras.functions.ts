import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  pagina: z.number().int().min(1).default(1),
  tamanhoPagina: z.number().int().min(1).max(100).default(20),
  origem: z.enum(["todos", "vinculados", "compartilhados"]).default("todos"),
});

export type Dispositivo = {
  id?: string | number;
  nome?: string;
  modelo?: string;
  tipo?: string;
  mac?: string;
  online?: boolean;
  compartilhado?: boolean;
  [k: string]: unknown;
};

export type ListarResponse = {
  ok: boolean;
  status: number;
  message?: string;
  dispositivos: Dispositivo[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
};

export const listarDispositivos = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<ListarResponse> => {
    const url = new URL(
      "https://api-casainteligente.intelbras.com.br/produtos/listar-dispositivos/v1",
    );
    url.searchParams.set("pagina", String(data.pagina));
    url.searchParams.set("tamanhoPagina", String(data.tamanhoPagina));

    try {
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.token}`,
          Accept: "application/json",
        },
      });

      const text = await res.text();
      let payload: unknown = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        payload = text;
      }

      if (!res.ok) {
        const msg =
          res.status === 401 || res.status === 403
            ? "Token inválido ou expirado. Gere um novo token em Contas → Token Temporário."
            : `Falha ao consultar a API (HTTP ${res.status}).`;
        return {
          ok: false,
          status: res.status,
          message: msg,
          dispositivos: [],
          total: 0,
          pagina: data.pagina,
          tamanhoPagina: data.tamanhoPagina,
        };
      }

      // Normalize payload shape
      const raw = payload as Record<string, unknown> | unknown[] | null;
      let list: Dispositivo[] = [];
      let total = 0;

      if (Array.isArray(raw)) {
        list = raw as Dispositivo[];
        total = list.length;
      } else if (raw && typeof raw === "object") {
        const r = raw as Record<string, unknown>;
        const candidates = [
          r.dispositivos,
          r.data,
          r.items,
          r.resultado,
          r.result,
          r.content,
        ];
        const arr = candidates.find((c) => Array.isArray(c)) as
          | Dispositivo[]
          | undefined;
        list = arr ?? [];
        total =
          typeof r.total === "number"
            ? r.total
            : typeof r.totalRegistros === "number"
              ? r.totalRegistros
              : list.length;
      }

      // Apply origem filter client-side (API filter not guaranteed)
      if (data.origem !== "todos") {
        list = list.filter((d) => {
          const isShared =
            d.compartilhado === true ||
            (typeof d.origem === "string" &&
              d.origem.toLowerCase().includes("compart"));
          return data.origem === "compartilhados" ? isShared : !isShared;
        });
      }

      return {
        ok: true,
        status: res.status,
        dispositivos: list,
        total,
        pagina: data.pagina,
        tamanhoPagina: data.tamanhoPagina,
      };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        message:
          "Não foi possível conectar à API da Intelbras. Verifique sua conexão e tente novamente.",
        dispositivos: [],
        total: 0,
        pagina: data.pagina,
        tamanhoPagina: data.tamanhoPagina,
      };
    }
  });
