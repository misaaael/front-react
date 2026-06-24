// Frontend service for the (future) Django backend.
// Centraliza a chamada HTTP para listar dispositivos.
//
// Backend esperado:
//   POST {VITE_API_BASE_URL}/api/devices/
//   Body: { token, page, pageSize, origin }
//
// Enquanto o backend não está disponível, usamos um mock local
// para permitir o desenvolvimento visual da UI.

export type Origin = "all" | "linked" | "shared";

export type ErrorCode = "unauthorized" | "network" | "server" | "unexpected";

export type Device = Record<string, unknown> & {
  id?: string | number;
  name?: string;
  model?: string;
  mac?: string;
  online?: boolean;
  shared?: boolean;
};

export type ListDevicesRequest = {
  token: string;
  page: number;
  pageSize: number;
  origin: Origin;
};

export type ListDevicesResponse = {
  ok: boolean;
  status: number;
  message?: string;
  errorCode?: ErrorCode;
  devices: Device[];
  total: number;
  page: number;
  pageSize: number;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

// Habilite VITE_USE_MOCK=true (ou deixe sem VITE_API_BASE_URL) para usar mock.
const USE_MOCK =
  import.meta.env.VITE_USE_MOCK === "true" || !API_BASE_URL;

export async function listDevices(
  req: ListDevicesRequest,
): Promise<ListDevicesResponse> {
  if (USE_MOCK) {
    return mockListDevices(req);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/devices/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(req),
    });

    const text = await res.text();
    let payload: unknown = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    if (!res.ok) {
      let errorCode: ErrorCode;
      let message: string;
      if (res.status === 401 || res.status === 403) {
        errorCode = "unauthorized";
        message =
          "Token inválido ou expirado. Gere um novo token e tente novamente.";
      } else if (res.status >= 500) {
        errorCode = "server";
        message = `Backend indisponível (HTTP ${res.status}). Tente novamente em instantes.`;
      } else {
        errorCode = "unexpected";
        message =
          (payload && typeof payload === "object" && "message" in payload
            ? String((payload as { message?: unknown }).message)
            : null) ?? `Resposta inesperada (HTTP ${res.status}).`;
      }
      return {
        ok: false,
        status: res.status,
        message,
        errorCode,
        devices: [],
        total: 0,
        page: req.page,
        pageSize: req.pageSize,
      };
    }

    const r = (payload ?? {}) as Record<string, unknown>;
    const devices = (Array.isArray(r.devices) ? r.devices : []) as Device[];
    const total = typeof r.total === "number" ? r.total : devices.length;

    return {
      ok: true,
      status: res.status,
      devices,
      total,
      page: typeof r.page === "number" ? r.page : req.page,
      pageSize: typeof r.pageSize === "number" ? r.pageSize : req.pageSize,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      message:
        "Não foi possível conectar ao backend. Verifique sua conexão e tente novamente.",
      errorCode: "network",
      devices: [],
      total: 0,
      page: req.page,
      pageSize: req.pageSize,
    };
  }
}

// ---------- Mock local (apenas dev visual) ----------

const MOCK_DEVICES: Device[] = Array.from({ length: 47 }).map((_, i) => {
  const shared = i % 4 === 0;
  const online = i % 3 !== 0;
  return {
    id: `dev-${i + 1}`,
    name: shared
      ? `Câmera compartilhada ${i + 1}`
      : `Dispositivo ${i + 1}`,
    model: ["iM5 SC", "iM7 OUT", "EWS 1001", "EG 200", "RG 1200"][i % 5],
    mac: `AA:BB:CC:${String(i).padStart(2, "0")}:${String((i * 7) % 100).padStart(2, "0")}:FF`,
    online,
    shared,
  };
});

async function mockListDevices(
  req: ListDevicesRequest,
): Promise<ListDevicesResponse> {
  await new Promise((r) => setTimeout(r, 400));

  if (!req.token.trim()) {
    return {
      ok: false,
      status: 401,
      message: "Token inválido ou expirado.",
      errorCode: "unauthorized",
      devices: [],
      total: 0,
      page: req.page,
      pageSize: req.pageSize,
    };
  }

  // Simula erro com tokens especiais para testar a UI
  if (req.token === "error:401") {
    return {
      ok: false,
      status: 401,
      message: "Token inválido ou expirado.",
      errorCode: "unauthorized",
      devices: [],
      total: 0,
      page: req.page,
      pageSize: req.pageSize,
    };
  }
  if (req.token === "error:500") {
    return {
      ok: false,
      status: 500,
      message: "Backend indisponível (HTTP 500).",
      errorCode: "server",
      devices: [],
      total: 0,
      page: req.page,
      pageSize: req.pageSize,
    };
  }
  if (req.token === "empty") {
    return {
      ok: true,
      status: 200,
      devices: [],
      total: 0,
      page: req.page,
      pageSize: req.pageSize,
    };
  }

  let list = MOCK_DEVICES;
  if (req.origin === "shared") list = list.filter((d) => d.shared);
  else if (req.origin === "linked") list = list.filter((d) => !d.shared);

  const total = list.length;
  const start = (req.page - 1) * req.pageSize;
  const paged = list.slice(start, start + req.pageSize);

  return {
    ok: true,
    status: 200,
    devices: paged,
    total,
    page: req.page,
    pageSize: req.pageSize,
  };
}
