import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:5000/api";

async function req(method: string, path: string, body?: object, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Xato");
  return data;
}

type Screen = "login" | "register" | "passenger" | "driver";
type OrderStatus = "PENDING" | "SEARCHING" | "ACCEPTED" | "ARRIVED" | "STARTED" | "COMPLETED" | "CANCELLED";

interface Order {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  price: number;
  status: OrderStatus;
  distanceKm?: number;
  durationMin?: number;
}

interface PriceEstimate {
  distanceKm: number;
  durationMin: number;
  price: number;
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "#f59e0b",
  SEARCHING: "#3b82f6",
  ACCEPTED: "#8b5cf6",
  ARRIVED: "#06b6d4",
  STARTED: "#10b981",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Kutilmoqda",
  SEARCHING: "Haydovchi axtarilmoqda",
  ACCEPTED: "Qabul qilindi",
  ARRIVED: "Haydovchi yetib keldi",
  STARTED: "Yo'lda",
  COMPLETED: "Tugallandi",
  CANCELLED: "Bekor qilindi",
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [token, setToken] = useState(() => localStorage.getItem("tezgo_token") || "");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auth forms
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"PASSENGER" | "DRIVER">("PASSENGER");

  // Passenger state
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [estimate, setEstimate] = useState<PriceEstimate | null>(null);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"order" | "history">("order");

  // Driver state
  const [isOnline, setIsOnline] = useState(false);
  const [driverOrders, setDriverOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (token) {
      req("GET", "/auth/me", undefined, token)
        .then((u) => {
          setUser(u);
          setScreen(u.role === "DRIVER" ? "driver" : "passenger");
          if (u.driver?.online) setIsOnline(true);
        })
        .catch(() => {
          localStorage.removeItem("tezgo_token");
          setToken("");
        });
    }
  }, []);

  const login = async () => {
    setLoading(true); setError("");
    try {
      const res = await req("POST", "/auth/login", { phone, password });
      localStorage.setItem("tezgo_token", res.token);
      setToken(res.token);
      setUser(res.user);
      setScreen(res.user.role === "DRIVER" ? "driver" : "passenger");
      if (res.user.driver?.online) setIsOnline(true);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const register = async () => {
    setLoading(true); setError("");
    try {
      await req("POST", "/auth/register", { phone, password, fullName, role });
      setScreen("login");
      setError("");
      alert("Ro'yxatdan o'tdingiz! Endi kirishingiz mumkin.");
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("tezgo_token");
    setToken(""); setUser(null); setScreen("login");
    setPhone(""); setPassword(""); setFullName("");
  };

  const loadMyOrders = useCallback(async () => {
    try {
      const orders = await req("GET", "/orders/my", undefined, token);
      setMyOrders(orders);
    } catch {}
  }, [token]);

  const getEstimate = async () => {
    if (!pickupAddress || !dropoffAddress) return;
    setLoading(true);
    try {
      const est = await req("POST", "/matching/estimate", {
        pickupLat: 41.2995 + Math.random() * 0.05,
        pickupLng: 69.2401 + Math.random() * 0.05,
        dropoffLat: 41.3456 + Math.random() * 0.05,
        dropoffLng: 69.3012 + Math.random() * 0.05,
      }, token);
      setEstimate(est);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const createOrder = async () => {
    if (!estimate) return;
    setLoading(true); setError("");
    try {
      await req("POST", "/orders", {
        pickupAddress,
        dropoffAddress,
        pickupLat: 41.2995,
        pickupLng: 69.2401,
        dropoffLat: 41.3456,
        dropoffLng: 69.3012,
        price: estimate.price,
        distanceKm: estimate.distanceKm,
        durationMin: estimate.durationMin,
      }, token);
      setPickupAddress(""); setDropoffAddress(""); setEstimate(null);
      setActiveTab("history");
      loadMyOrders();
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const toggleOnline = async () => {
    setLoading(true);
    try {
      await req("POST", isOnline ? "/drivers/offline" : "/drivers/online", undefined, token);
      setIsOnline(!isOnline);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const s: Record<string, React.CSSProperties> = {
    wrap: { maxWidth: 440, margin: "0 auto", padding: "2rem 1rem", fontFamily: "system-ui, sans-serif" },
    logo: { fontSize: 28, fontWeight: 700, color: "#f97316", marginBottom: 8, letterSpacing: -1 },
    sub: { color: "#6b7280", fontSize: 14, marginBottom: 32 },
    card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "1.5rem" },
    label: { display: "block", fontSize: 13, color: "#6b7280", marginBottom: 6, fontWeight: 500 },
    input: { width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 10, fontSize: 15, boxSizing: "border-box" as const, outline: "none" },
    btn: { width: "100%", padding: "12px", background: "#f97316", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 8 },
    btnSm: { padding: "8px 16px", background: "#f97316", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" },
    btnGhost: { padding: "8px 16px", background: "transparent", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, cursor: "pointer" },
    err: { color: "#ef4444", fontSize: 13, margin: "8px 0" },
    row: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    badge: { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
    tabs: { display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 10, padding: 4, marginBottom: 20 },
    tab: { flex: 1, padding: "8px", borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#6b7280" },
    tabActive: { background: "#fff", color: "#111", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
    orderCard: { border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", marginBottom: 10 },
    estimateBox: { background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "14px 16px", marginTop: 12 },
  };

  if (screen === "login" || screen === "register") {
    const isReg = screen === "register";
    return (
      <div style={s.wrap}>
        <div style={s.logo}>TezGo 🚕</div>
        <p style={s.sub}>{isReg ? "Yangi hisob yaratish" : "Hisobingizga kiring"}</p>
        <div style={s.card}>
          {isReg && (
            <>
              <label style={s.label}>To'liq ism</label>
              <input style={{ ...s.input, marginBottom: 14 }} placeholder="Ali Valiyev" value={fullName} onChange={e => setFullName(e.target.value)} />
              <label style={s.label}>Rol</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {(["PASSENGER", "DRIVER"] as const).map(r => (
                  <button key={r} onClick={() => setRole(r)} style={{
                    flex: 1, padding: "10px", borderRadius: 10, border: "2px solid",
                    borderColor: role === r ? "#f97316" : "#e5e7eb",
                    background: role === r ? "#fff7ed" : "#fff",
                    color: role === r ? "#f97316" : "#6b7280",
                    fontWeight: 600, cursor: "pointer", fontSize: 14
                  }}>
                    {r === "PASSENGER" ? "🧍 Yo'lovchi" : "🚗 Haydovchi"}
                  </button>
                ))}
              </div>
            </>
          )}
          <label style={s.label}>Telefon raqam</label>
          <input style={{ ...s.input, marginBottom: 14 }} placeholder="+998901234567" value={phone} onChange={e => setPhone(e.target.value)} />
          <label style={s.label}>Parol</label>
          <input style={{ ...s.input, marginBottom: 14 }} type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && (isReg ? register() : login())} />
          {error && <p style={s.err}>{error}</p>}
          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} onClick={isReg ? register : login} disabled={loading}>
            {loading ? "Yuklanmoqda..." : isReg ? "Ro'yxatdan o'tish" : "Kirish"}
          </button>
          <p style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "#6b7280" }}>
            {isReg ? "Hisobingiz bormi?" : "Hisob yo'qmi?"}{" "}
            <span style={{ color: "#f97316", cursor: "pointer", fontWeight: 600 }} onClick={() => { setScreen(isReg ? "login" : "register"); setError(""); }}>
              {isReg ? "Kirish" : "Ro'yxatdan o'tish"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  if (screen === "passenger") {
    return (
      <div style={s.wrap}>
        <div style={s.row}>
          <div style={s.logo}>TezGo 🚕</div>
          <button style={s.btnGhost} onClick={logout}>Chiqish</button>
        </div>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>Salom, {user?.fullName} 👋</p>

        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(activeTab === "order" ? s.tabActive : {}) }} onClick={() => setActiveTab("order")}>Buyurtma</button>
          <button style={{ ...s.tab, ...(activeTab === "history" ? s.tabActive : {}) }} onClick={() => { setActiveTab("history"); loadMyOrders(); }}>Tarix</button>
        </div>

        {activeTab === "order" && (
          <div style={s.card}>
            <label style={s.label}>📍 Qayerdan</label>
            <input style={{ ...s.input, marginBottom: 14 }} placeholder="Manzil kiriting..." value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} />
            <label style={s.label}>🏁 Qayerga</label>
            <input style={{ ...s.input, marginBottom: 16 }} placeholder="Manzil kiriting..." value={dropoffAddress} onChange={e => setDropoffAddress(e.target.value)} />

            {error && <p style={s.err}>{error}</p>}

            {!estimate ? (
              <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} onClick={getEstimate} disabled={loading || !pickupAddress || !dropoffAddress}>
                {loading ? "Hisoblanmoqda..." : "Narxni hisoblash"}
              </button>
            ) : (
              <>
                <div style={s.estimateBox}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#6b7280", fontSize: 14 }}>Masofa</span>
                    <span style={{ fontWeight: 600 }}>{estimate.distanceKm} km</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#6b7280", fontSize: 14 }}>Taxminiy vaqt</span>
                    <span style={{ fontWeight: 600 }}>{estimate.durationMin} daqiqa</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6b7280", fontSize: 14 }}>Narx</span>
                    <span style={{ fontWeight: 700, fontSize: 18, color: "#f97316" }}>{estimate.price.toLocaleString()} so'm</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button style={{ ...s.btnGhost, flex: 1 }} onClick={() => setEstimate(null)}>Bekor</button>
                  <button style={{ ...s.btn, flex: 2, marginTop: 0, opacity: loading ? 0.7 : 1 }} onClick={createOrder} disabled={loading}>
                    {loading ? "..." : "Buyurtma berish"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div>
            {myOrders.length === 0 ? (
              <div style={{ ...s.card, textAlign: "center", color: "#9ca3af", padding: "2rem" }}>
                Hali buyurtmalar yo'q
              </div>
            ) : myOrders.map(o => (
              <div key={o.id} style={s.orderCard}>
                <div style={s.row}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>#{o.id.slice(0, 8)}</span>
                  <span style={{ ...s.badge, background: STATUS_COLOR[o.status] + "20", color: STATUS_COLOR[o.status] }}>
                    {STATUS_LABEL[o.status]}
                  </span>
                </div>
                <div style={{ fontSize: 14, marginBottom: 4 }}>
                  <span style={{ color: "#6b7280" }}>📍</span> {o.pickupAddress}
                </div>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <span style={{ color: "#6b7280" }}>🏁</span> {o.dropoffAddress}
                </div>
                <div style={{ fontWeight: 700, color: "#f97316" }}>{o.price?.toLocaleString()} so'm</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (screen === "driver") {
    return (
      <div style={s.wrap}>
        <div style={s.row}>
          <div style={s.logo}>TezGo 🚗</div>
          <button style={s.btnGhost} onClick={logout}>Chiqish</button>
        </div>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>Haydovchi: {user?.fullName}</p>

        <div style={{ ...s.card, marginBottom: 16 }}>
          <div style={s.row}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Holat</div>
              <div style={{ fontSize: 14, color: isOnline ? "#22c55e" : "#9ca3af", marginTop: 2 }}>
                {isOnline ? "🟢 Online" : "⚫ Offline"}
              </div>
            </div>
            <button
              onClick={toggleOnline}
              disabled={loading}
              style={{
                padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                background: isOnline ? "#fef2f2" : "#f0fdf4",
                color: isOnline ? "#ef4444" : "#22c55e",
                fontWeight: 600, fontSize: 14
              }}
            >
              {loading ? "..." : isOnline ? "Offline bo'lish" : "Online bo'lish"}
            </button>
          </div>
        </div>

        {isOnline && (
          <div style={{ ...s.card, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>✅ Buyurtmalar kutilmoqda</div>
            <div style={{ fontSize: 14, color: "#6b7280" }}>
              Yangi buyurtmalar real-time Socket.IO orqali keladi.
              <br />Pasajir buyurtma berganda bu yerda ko'rinadi.
            </div>
          </div>
        )}

        {!isOnline && (
          <div style={{ ...s.card, background: "#f9fafb", textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
            Buyurtma qabul qilish uchun online bo'ling
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>API endpointlar (haydovchi)</div>
          {[
            { method: "POST", path: "/drivers/online", desc: "Online bo'lish" },
            { method: "POST", path: "/drivers/offline", desc: "Offline bo'lish" },
            { method: "PATCH", path: "/drivers/location", desc: "Lokatsiya yangilash" },
            { method: "PATCH", path: "/orders/:id/accept", desc: "Buyurtma qabul qilish" },
            { method: "PATCH", path: "/orders/:id/status", desc: "Status yangilash" },
          ].map(ep => (
            <div key={ep.path} style={{ ...s.orderCard, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                background: ep.method === "GET" ? "#dbeafe" : ep.method === "POST" ? "#dcfce7" : "#fef9c3",
                color: ep.method === "GET" ? "#1d4ed8" : ep.method === "POST" ? "#15803d" : "#854d0e",
                padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: "monospace"
              }}>{ep.method}</span>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: "#374151" }}>{ep.path}</span>
              <span style={{ fontSize: 13, color: "#9ca3af", marginLeft: "auto" }}>{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
