import React, { useState, useEffect } from "react";
import {
  Calculator, Settings, Plus, Trash2, Package, Clock,
  Sparkles, Share2, Lightbulb, Type, TrendingUp, Lock,
  Eye, EyeOff, Copy, Check, ShoppingCart,
  X, CalendarClock, Coins, Zap, Wallet
} from "lucide-react";

// ── SENHAS COM VALIDADE ANUAL ────────────────────────
// Adicione uma linha a cada nova venda
const SENHAS = [
  { senha: "confeasy-teste2025", expira: "2026-09-29", nome: "Teste" },
];

function verificarSenha(pwd) {
  const hoje = new Date().toISOString().split("T")[0];
  const found = SENHAS.find((s) => s.senha === pwd);
  if (!found) return { ok: false, msg: "Senha incorreta." };
  if (hoje > found.expira) return { ok: false, msg: "Acesso expirado. Renove seu plano." };
  return { ok: true, nome: found.nome };
}

// ── CORES ─────────────────────────────────────────────
var C = {
  bg: "#0D0D0D", surface: "#161616", card: "#1E1E1E", cardHov: "#252525",
  border: "#2A2A2A", borderL: "#383838",
  lime: "#C8F135", limeD: "#1A2200",
  purple: "#8B5CF6", purpleD: "#1A1030",
  teal: "#2DD4BF", tealD: "#0A1F1C",
  rose: "#F43F5E", roseD: "#1F0A10",
  amber: "#F59E0B", amberD: "#1F1500",
  text: "#F0F0F0", textMid: "#A0A0A0", textMuted: "#606060",
};

var css = "\n  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');\n  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}\n  body{background:#0D0D0D;font-family:'Outfit',sans-serif;}\n  input,select,textarea{font-family:'Outfit',sans-serif;}\n  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}\n  input[type=range]{-webkit-appearance:none;appearance:none;height:4px;border-radius:99px;background:#2A2A2A;outline:none;cursor:pointer;}\n  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#C8F135;cursor:pointer;}\n  select option{background:#1E1E1E;color:#F0F0F0;}\n  ::-webkit-scrollbar{width:3px;}\n  ::-webkit-scrollbar-thumb{background:#2A2A2A;border-radius:2px;}\n  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}\n  @keyframes shake{0%,100%{transform:translateX(0)}25%,75%{transform:translateX(-6px)}50%{transform:translateX(6px)}}\n  @keyframes spin{to{transform:rotate(360deg)}}\n  .fade-up{animation:fadeUp .2s ease forwards;}\n  .shake{animation:shake .35s ease;}\n  input:focus,select:focus,textarea:focus{outline:none;border-color:#C8F135 !important;}\n  .del-btn:hover{color:#F43F5E !important;}\n";

function fmt(v) { return (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function fmtDate(d) { return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }); }
function fmtDT(d) { return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); }
function load(k, def) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch(e) { return def; } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} }

var DEF_INGS = [
  { id: 1, name: "Leite Condensado", packageWeight: 395, cost: 5.50 },
  { id: 2, name: "Creme de Leite", packageWeight: 200, cost: 3.20 },
  { id: 3, name: "Chocolate em Po 50%", packageWeight: 1000, cost: 35.00 },
  { id: 4, name: "Manteiga", packageWeight: 200, cost: 12.00 },
  { id: 5, name: "Farinha de Trigo", packageWeight: 1000, cost: 5.00 },
  { id: 6, name: "Ovos", packageWeight: 1, cost: 0.80 },
  { id: 7, name: "Embalagem", packageWeight: 1, cost: 1.50 },
];
var DEF_BIZ = { salary: 3000, fixedCosts: 800, hoursPerDay: 8, daysPerWeek: 5 };
var DEF_RECIPE = {
  name: "Brigadeiro Gourmet", yields: 20, timeSpentMinutes: 60, profitMargin: 30,
  selectedIngredients: [{ id: 1, quantity: 395 }, { id: 2, quantity: 100 }, { id: 3, quantity: 40 }, { id: 4, quantity: 20 }]
};

// ── LOGO SVG ──────────────────────────────────────────
function ConfeasyIcon(props) {
  var size = props.size || 28;
  return React.createElement("svg", { width: size, height: size, viewBox: "0 0 32 32", fill: "none" },
    React.createElement("rect", { x: 4, y: 18, width: 24, height: 10, rx: 4, fill: "#C8F135" }),
    React.createElement("path", { d: "M10 18V14C10 10.686 12.686 8 16 8C19.314 8 22 10.686 22 14V18", stroke: "#C8F135", strokeWidth: 2.5, strokeLinecap: "round" }),
    React.createElement("path", { d: "M13 8C13 6.343 14.343 5 16 5C17.657 5 19 6.343 19 8", stroke: "#C8F135", strokeWidth: 2, strokeLinecap: "round" }),
    React.createElement("circle", { cx: 16, cy: 22, r: 2, fill: "#0D0D0D" })
  );
}

function Badge(props) {
  return React.createElement("span", {
    style: { background: props.color + "22", color: props.color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6 }
  }, props.children);
}

function Card(props) {
  return React.createElement("div", {
    style: Object.assign({ background: C.card, border: "1px solid " + (props.accent || C.border), borderRadius: 16, padding: 20 }, props.style)
  }, props.children);
}

function StatCard(props) {
  var accent = props.accent || C.lime;
  return React.createElement("div", { style: { background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: 18 } },
    React.createElement("div", { style: { fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 } }, props.label),
    React.createElement("div", { style: { fontSize: 26, fontWeight: 800, color: accent, lineHeight: 1 } }, props.value),
    props.sub && React.createElement("div", { style: { fontSize: 11, color: C.textMuted, marginTop: 4 } }, props.sub)
  );
}

// ── LOGIN ─────────────────────────────────────────────
function Login(props) {
  var _s = useState(""); var pwd = _s[0]; var setPwd = _s[1];
  var _v = useState(false); var show = _v[0]; var setShow = _v[1];
  var _e = useState(""); var err = _e[0]; var setErr = _e[1];
  var _k = useState(false); var shake = _k[0]; var setShake = _k[1];

  function attempt() {
    var res = verificarSenha(pwd);
    if (res.ok) { props.onLogin(); }
    else { setErr(res.msg); setShake(true); setTimeout(function() { setShake(false); }, 400); }
  }

  var inSt = { width: "100%", background: C.surface, border: "1.5px solid " + (err ? C.rose : C.border), borderRadius: 12, padding: "13px 44px 13px 16px", fontSize: 15, color: C.text, outline: "none", fontFamily: "'Outfit',sans-serif", transition: "border-color .2s" };

  return React.createElement("div", { style: { minHeight: "100vh", background: C.bg, fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 } },
    React.createElement("style", null, css),
    React.createElement("div", { className: shake ? "shake" : "", style: { width: "100%", maxWidth: 380 } },
      React.createElement("div", { style: { textAlign: "center", marginBottom: 40 } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 } },
          React.createElement(ConfeasyIcon, { size: 36 }),
          React.createElement("span", { style: { fontSize: 32, fontWeight: 900, color: C.text, letterSpacing: -1 } }, "Confeasy")
        ),
        React.createElement("p", { style: { color: C.textMuted, fontSize: 13 } }, "Sua confeitaria em um so lugar")
      ),
      React.createElement("div", { style: { background: C.card, border: "1px solid " + C.border, borderRadius: 20, padding: 28 } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 22 } },
          React.createElement(Lock, { size: 13, color: C.lime }),
          React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 2, textTransform: "uppercase" } }, "Acesso privado")
        ),
        React.createElement("div", { style: { position: "relative", marginBottom: err ? 10 : 16 } },
          React.createElement("input", { type: show ? "text" : "password", placeholder: "Digite sua senha", value: pwd,
            onChange: function(e) { setPwd(e.target.value); setErr(""); },
            onKeyDown: function(e) { if (e.key === "Enter") attempt(); },
            style: inSt }),
          React.createElement("button", { onClick: function() { setShow(!show); }, style: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex" } },
            show ? React.createElement(EyeOff, { size: 17 }) : React.createElement(Eye, { size: 17 })
          )
        ),
        err && React.createElement("p", { style: { color: C.rose, fontSize: 12, marginBottom: 14 } }, err),
        React.createElement("button", { onClick: attempt, style: { width: "100%", background: C.lime, color: C.bg, border: "none", borderRadius: 12, padding: 14, fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "'Outfit',sans-serif" } }, "Entrar")
      )
    )
  );
}

// ── MAIN APP ──────────────────────────────────────────
export default function App() {
  var _l = useState(function() { return load("cf_session", false); }); var loggedIn = _l[0]; var setLoggedIn = _l[1];
  var _t = useState("pedidos"); var tab = _t[0]; var setTab = _t[1];
  var _b = useState(function() { return load("cf_biz", DEF_BIZ); }); var biz = _b[0]; var setBiz = _b[1];
  var _i = useState(function() { return load("cf_ings", DEF_INGS); }); var ingredients = _i[0]; var setIngredients = _i[1];
  var _r = useState(function() { return load("cf_recipe", DEF_RECIPE); }); var recipe = _r[0]; var setRecipe = _r[1];
  var _o = useState(function() { return load("cf_orders", []); }); var orders = _o[0]; var setOrders = _o[1];
  var _sh = useState(function() { return load("cf_shopping", []); }); var shopping = _sh[0]; var setShopping = _sh[1];
  var _ex = useState(function() { return load("cf_expenses", { luz: "", internet: "", gas: "", outros: "" }); }); var expenses = _ex[0]; var setExpenses = _ex[1];
  var _ai = useState(""); var aiResult = _ai[0]; var setAiResult = _ai[1];
  var _ail = useState(false); var isAiLoading = _ail[0]; var setIsAiLoading = _ail[1];
  var _aie = useState(null); var aiError = _aie[0]; var setAiError = _aie[1];
  var _cp = useState(false); var copied = _cp[0]; var setCopied = _cp[1];
  var _no = useState({ client: "", pickupDate: "", details: "", obs: "", value: "", paid: "" }); var newOrder = _no[0]; var setNewOrder = _no[1];
  var _om = useState(false); var orderModal = _om[0]; var setOrderModal = _om[1];
  var _ns = useState(""); var newShopItem = _ns[0]; var setNewShopItem = _ns[1];
  var _ni = useState({ name: "", packageWeight: "", cost: "" }); var newIng = _ni[0]; var setNewIng = _ni[1];

  useEffect(function() { save("cf_session", loggedIn); }, [loggedIn]);
  useEffect(function() { save("cf_biz", biz); }, [biz]);
  useEffect(function() { save("cf_ings", ingredients); }, [ingredients]);
  useEffect(function() { save("cf_recipe", recipe); }, [recipe]);
  useEffect(function() { save("cf_orders", orders); }, [orders]);
  useEffect(function() { save("cf_shopping", shopping); }, [shopping]);
  useEffect(function() { save("cf_expenses", expenses); }, [expenses]);

  if (!loggedIn) return React.createElement(Login, { onLogin: function() { setLoggedIn(true); } });

  var hourlyRate = (function() {
    var h = biz.hoursPerDay * biz.daysPerWeek * 4.28;
    return h > 0 ? (parseFloat(biz.salary || 0) + parseFloat(biz.fixedCosts || 0)) / h : 0;
  })();

  var R = (function() {
    var ing = 0;
    recipe.selectedIngredients.forEach(function(item) {
      var i = ingredients.find(function(x) { return x.id === item.id; });
      if (i) ing += (i.cost / i.packageWeight) * item.quantity;
    });
    var variable = ing * 0.10, labor = (recipe.timeSpentMinutes / 60) * hourlyRate;
    var production = ing + variable + labor, profit = production * (recipe.profitMargin / 100);
    var total = production + profit;
    return { ing: ing, variable: variable, labor: labor, production: production, profit: profit, total: total, unit: recipe.yields > 0 ? total / recipe.yields : 0 };
  })();

  var sortedOrders = orders.slice().sort(function(a, b) { return new Date(a.pickupDate) - new Date(b.pickupDate); });
  var pendingOrders = sortedOrders.filter(function(o) { return !o.done; });
  var doneOrders = sortedOrders.filter(function(o) { return o.done; });

  var cm = new Date().getMonth(), cy = new Date().getFullYear();
  var monthOrders = orders.filter(function(o) { var d = new Date(o.pickupDate); return d.getMonth() === cm && d.getFullYear() === cy; });
  var faturamento = monthOrders.reduce(function(s, o) { return s + parseFloat(o.value || 0); }, 0);
  var recebido = monthOrders.reduce(function(s, o) { return s + parseFloat(o.paid || 0); }, 0);
  var totalExp = Object.values(expenses).reduce(function(s, v) { return s + parseFloat(v || 0); }, 0);
  var lucro = recebido - totalExp;

  function urgColor(d) { var diff = (new Date(d) - new Date()) / 86400000; if (diff < 0) return C.rose; if (diff < 1) return C.amber; if (diff < 3) return "#F59E0B"; return C.teal; }
  function urgLabel(d) { var diff = (new Date(d) - new Date()) / 86400000; if (diff < 0) return "Atrasado"; if (diff < 1) return "Hoje!"; if (diff < 2) return "Amanha"; return "Agendado"; }

  function addOrder() {
    if (!newOrder.client || !newOrder.pickupDate) return;
    setOrders(orders.concat([Object.assign({}, newOrder, { id: Date.now(), done: false })]));
    setNewOrder({ client: "", pickupDate: "", details: "", obs: "", value: "", paid: "" });
    setOrderModal(false);
  }
  function toggleOrder(id) { setOrders(orders.map(function(o) { return o.id === id ? Object.assign({}, o, { done: !o.done }) : o; })); }
  function deleteOrder(id) { setOrders(orders.filter(function(o) { return o.id !== id; })); }
  function addShop() { if (!newShopItem.trim()) return; setShopping(shopping.concat([{ id: Date.now(), text: newShopItem.trim(), checked: false }])); setNewShopItem(""); }
  function toggleShop(id) { setShopping(shopping.map(function(i) { return i.id === id ? Object.assign({}, i, { checked: !i.checked }) : i; })); }
  function deleteShop(id) { setShopping(shopping.filter(function(i) { return i.id !== id; })); }
  function addIngToDB() {
    if (newIng.name && newIng.cost && newIng.packageWeight) {
      setIngredients(ingredients.concat([Object.assign({}, newIng, { id: Date.now(), packageWeight: parseFloat(newIng.packageWeight), cost: parseFloat(newIng.cost) })]));
      setNewIng({ name: "", packageWeight: "", cost: "" });
    }
  }
  function addIngToRecipe(id) {
    if (!id || recipe.selectedIngredients.find(function(i) { return i.id === parseInt(id); })) return;
    setRecipe(Object.assign({}, recipe, { selectedIngredients: recipe.selectedIngredients.concat([{ id: parseInt(id), quantity: 0 }]) }));
  }
  function updateQty(id, qty) { setRecipe(Object.assign({}, recipe, { selectedIngredients: recipe.selectedIngredients.map(function(i) { return i.id === id ? Object.assign({}, i, { quantity: parseFloat(qty) || 0 }) : i; }) })); }
  function removeFromRecipe(id) { setRecipe(Object.assign({}, recipe, { selectedIngredients: recipe.selectedIngredients.filter(function(i) { return i.id !== id; }) })); }

  function callAI(type) {
    setIsAiLoading(true); setAiError(null); setAiResult("");
    var prompts = {
      post: "Sugira 3 ideias de posts para Instagram de confeitaria artesanal em alta agora. Para cada ideia: tipo, legenda e hashtags.",
      stories: "Crie 3 ideias de Stories interativos para confeiteira postar hoje. Inclua enquete ou pergunta.",
      vendas: "Crie 3 mensagens de vendas curtas para WhatsApp para uma confeiteira. Tom pessoal e acolhedor."
    };
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000,
        system: "Especialista em marketing para confeitaria artesanal brasileira. Responda em Portugues do Brasil.",
        messages: [{ role: "user", content: prompts[type] }] })
    }).then(function(res) { return res.json(); }).then(function(data) {
      var text = data.content && data.content[0] && data.content[0].text;
      if (text) setAiResult(text); else throw new Error("sem resposta");
    }).catch(function() { setAiError("Tente novamente em alguns instantes."); })
    .finally(function() { setIsAiLoading(false); });
  }

  var inSt = { background: C.surface, border: "1.5px solid " + C.border, borderRadius: 10, padding: "11px 14px", fontSize: 14, color: C.text, width: "100%", transition: "border-color .2s", fontFamily: "'Outfit',sans-serif" };
  var lblSt = { display: "block", fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 };

  var TABS = [
    { id: "pedidos", label: "Pedidos", Icon: CalendarClock },
    { id: "compras", label: "Compras", Icon: ShoppingCart },
    { id: "calc", label: "Calculadora", Icon: Calculator },
    { id: "marketing", label: "Marketing IA", Icon: Zap },
    { id: "financeiro", label: "Financeiro", Icon: Wallet },
    { id: "config", label: "Negocio", Icon: Settings },
  ];

  return React.createElement("div", { style: { minHeight: "100vh", background: C.bg, fontFamily: "'Outfit',sans-serif", color: C.text, paddingBottom: 80 } },
    React.createElement("style", null, css),

    // HEADER
    React.createElement("header", { style: { background: C.surface, borderBottom: "1px solid " + C.border, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
        React.createElement(ConfeasyIcon, { size: 26 }),
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 18, fontWeight: 900, color: C.text, letterSpacing: -0.5, lineHeight: 1 } }, "Confeasy"),
          React.createElement("div", { style: { fontSize: 10, color: C.textMuted } }, "Sua confeitaria em um so lugar")
        )
      ),
      React.createElement("div", { style: { background: C.limeD, border: "1px solid " + C.lime + "44", borderRadius: 10, padding: "8px 14px", textAlign: "right" } },
        React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: C.lime, textTransform: "uppercase", letterSpacing: 1.5 } }, "Preco / un."),
        React.createElement("div", { style: { fontSize: 16, fontWeight: 800, color: C.lime } }, fmt(R.unit))
      )
    ),

    // NAV
    React.createElement("nav", { style: { background: C.surface, borderBottom: "1px solid " + C.border, display: "flex", overflowX: "auto", padding: "0 8px" } },
      TABS.map(function(t) {
        var active = tab === t.id;
        return React.createElement("button", { key: t.id, onClick: function() { setTab(t.id); },
          style: { display: "flex", alignItems: "center", gap: 7, padding: "12px 16px", background: "none", border: "none", borderBottom: active ? "2px solid " + C.lime : "2px solid transparent", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: active ? 700 : 500, fontSize: 13, color: active ? C.lime : C.textMuted, whiteSpace: "nowrap", transition: "all .2s", marginBottom: -1 } },
          React.createElement(t.Icon, { size: 15 }), t.label
        );
      })
    ),

    // MAIN
    React.createElement("main", { style: { maxWidth: 900, margin: "24px auto", padding: "0 16px" } },

      // ── PEDIDOS ──
      tab === "pedidos" && React.createElement("div", { className: "fade-up" },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 } },
          React.createElement("div", null,
            React.createElement("h2", { style: { fontSize: 22, fontWeight: 800 } }, "Pedidos"),
            React.createElement("p", { style: { fontSize: 13, color: C.textMuted, marginTop: 2 } }, pendingOrders.length + " pendente(s)")
          ),
          React.createElement("button", { onClick: function() { setOrderModal(true); }, style: { background: C.lime, color: C.bg, border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "'Outfit',sans-serif" } },
            React.createElement(Plus, { size: 16 }), "Novo pedido"
          )
        ),
        pendingOrders.length === 0 && React.createElement(Card, { style: { textAlign: "center", padding: "48px 24px" } },
          React.createElement(CalendarClock, { size: 32, color: C.textMuted, style: { margin: "0 auto 12px", opacity: .3 } }),
          React.createElement("p", { style: { fontWeight: 700, color: C.textMuted } }, "Nenhum pedido pendente"),
          React.createElement("p", { style: { fontSize: 13, color: C.textMuted, marginTop: 6 } }, "Toque em Novo pedido para comecar")
        ),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
          pendingOrders.map(function(o) {
            var urg = urgColor(o.pickupDate);
            var val = parseFloat(o.value || 0), paid = parseFloat(o.paid || 0), pend = val - paid;
            return React.createElement("div", { key: o.id, style: { background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: 16, display: "flex", gap: 14 } },
              React.createElement("div", { style: { width: 3, borderRadius: 4, background: urg, flexShrink: 0, alignSelf: "stretch" } }),
              React.createElement("div", { style: { flex: 1 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 } },
                  React.createElement("div", null,
                    React.createElement("div", { style: { fontWeight: 800, fontSize: 16 } }, o.client),
                    React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 5 } },
                      React.createElement(Badge, { color: urg }, urgLabel(o.pickupDate)),
                      React.createElement("span", { style: { fontSize: 12, color: C.textMuted } }, fmtDT(o.pickupDate))
                    )
                  ),
                  React.createElement("div", { style: { textAlign: "right" } },
                    React.createElement("div", { style: { fontWeight: 800, fontSize: 18, color: C.lime } }, fmt(val)),
                    pend > 0 && React.createElement("div", { style: { fontSize: 12, color: C.amber, fontWeight: 600 } }, "falta " + fmt(pend)),
                    pend <= 0 && val > 0 && React.createElement("div", { style: { fontSize: 12, color: C.teal, fontWeight: 600 } }, "pago")
                  )
                ),
                o.details && React.createElement("p", { style: { fontSize: 13, color: C.textMid, marginTop: 8 } }, o.details),
                o.obs && React.createElement("p", { style: { fontSize: 12, color: C.textMuted, marginTop: 4, fontStyle: "italic" } }, "Obs: " + o.obs),
                React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12 } },
                  React.createElement("button", { onClick: function() { toggleOrder(o.id); }, style: { background: C.tealD, color: C.teal, border: "1px solid " + C.teal + "44", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" } }, "Entregue"),
                  React.createElement("button", { className: "del-btn", onClick: function() { deleteOrder(o.id); }, style: { background: C.roseD, color: C.rose, border: "1px solid " + C.rose + "44", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" } }, "Excluir")
                )
              )
            );
          })
        ),
        doneOrders.length > 0 && React.createElement("div", { style: { marginTop: 28 } },
          React.createElement("p", { style: { fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 } }, "Entregues"),
          React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
            doneOrders.map(function(o) {
              return React.createElement("div", { key: o.id, style: { background: C.surface, border: "1px solid " + C.border, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: .5 } },
                React.createElement("div", null,
                  React.createElement("span", { style: { fontWeight: 700, fontSize: 13, textDecoration: "line-through", color: C.textMuted } }, o.client),
                  React.createElement("span", { style: { fontSize: 12, color: C.textMuted, marginLeft: 10 } }, fmtDate(o.pickupDate))
                ),
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
                  React.createElement("span", { style: { fontWeight: 700, color: C.lime, fontSize: 14 } }, fmt(parseFloat(o.value || 0))),
                  React.createElement("button", { onClick: function() { toggleOrder(o.id); }, style: { background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.textMuted, fontFamily: "'Outfit',sans-serif" } }, "Reabrir"),
                  React.createElement("button", { className: "del-btn", onClick: function() { deleteOrder(o.id); }, style: { background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex" } }, React.createElement(Trash2, { size: 13 }))
                )
              );
            })
          )
        ),
        orderModal && React.createElement("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 } },
          React.createElement("div", { style: { background: C.card, border: "1px solid " + C.border, borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 } },
              React.createElement("h3", { style: { fontSize: 20, fontWeight: 800 } }, "Novo Pedido"),
              React.createElement("button", { onClick: function() { setOrderModal(false); }, style: { background: C.surface, border: "1px solid " + C.border, borderRadius: 8, padding: 6, cursor: "pointer", color: C.textMuted, display: "flex" } }, React.createElement(X, { size: 18 }))
            ),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
              React.createElement("div", null, React.createElement("label", { style: lblSt }, "Nome da cliente"), React.createElement("input", { placeholder: "Ex: Ana Paula", value: newOrder.client, onChange: function(e) { setNewOrder(Object.assign({}, newOrder, { client: e.target.value })); }, style: inSt })),
              React.createElement("div", null, React.createElement("label", { style: lblSt }, "Data e hora da retirada"), React.createElement("input", { type: "datetime-local", value: newOrder.pickupDate, onChange: function(e) { setNewOrder(Object.assign({}, newOrder, { pickupDate: e.target.value })); }, style: inSt })),
              React.createElement("div", null, React.createElement("label", { style: lblSt }, "O que pediu"), React.createElement("textarea", { placeholder: "Ex: 50 brigadeiros...", value: newOrder.details, onChange: function(e) { setNewOrder(Object.assign({}, newOrder, { details: e.target.value })); }, style: Object.assign({}, inSt, { minHeight: 72, resize: "vertical" }) })),
              React.createElement("div", null, React.createElement("label", { style: lblSt }, "Observacoes"), React.createElement("input", { placeholder: "Ex: sem nozes...", value: newOrder.obs, onChange: function(e) { setNewOrder(Object.assign({}, newOrder, { obs: e.target.value })); }, style: inSt })),
              React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } },
                React.createElement("div", null, React.createElement("label", { style: lblSt }, "Valor cobrado"), React.createElement("input", { type: "number", placeholder: "0,00", value: newOrder.value, onChange: function(e) { setNewOrder(Object.assign({}, newOrder, { value: e.target.value })); }, style: inSt })),
                React.createElement("div", null, React.createElement("label", { style: lblSt }, "Ja pagou"), React.createElement("input", { type: "number", placeholder: "0,00", value: newOrder.paid, onChange: function(e) { setNewOrder(Object.assign({}, newOrder, { paid: e.target.value })); }, style: inSt }))
              ),
              React.createElement("button", { onClick: addOrder, style: { background: C.lime, color: C.bg, border: "none", borderRadius: 12, padding: 14, fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "'Outfit',sans-serif" } }, "Salvar pedido")
            )
          )
        )
      ),

      // ── COMPRAS ──
      tab === "compras" && React.createElement("div", { className: "fade-up" },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 } },
          React.createElement("div", null,
            React.createElement("h2", { style: { fontSize: 22, fontWeight: 800 } }, "Lista de Compras"),
            React.createElement("p", { style: { fontSize: 13, color: C.textMuted, marginTop: 2 } }, shopping.filter(function(i) { return !i.checked; }).length + " pendente(s)")
          ),
          shopping.some(function(i) { return i.checked; }) && React.createElement("button", { onClick: function() { setShopping(shopping.filter(function(i) { return !i.checked; })); }, style: { background: C.roseD, color: C.rose, border: "1px solid " + C.rose + "33", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" } }, "Limpar marcados")
        ),
        React.createElement(Card, { style: { marginBottom: 14 } },
          React.createElement("div", { style: { display: "flex", gap: 10 } },
            React.createElement("input", { placeholder: "Adicionar item... (Enter para confirmar)", value: newShopItem, onChange: function(e) { setNewShopItem(e.target.value); }, onKeyDown: function(e) { if (e.key === "Enter") addShop(); }, style: Object.assign({}, inSt, { flex: 1, fontSize: 15 }) }),
            React.createElement("button", { onClick: addShop, style: { background: C.lime, color: C.bg, border: "none", borderRadius: 10, padding: "0 18px", cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 } }, React.createElement(Plus, { size: 20 }))
          )
        ),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
          shopping.filter(function(i) { return !i.checked; }).map(function(item) {
            return React.createElement("div", { key: item.id, style: { background: C.card, border: "1.5px solid " + C.border, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 } },
              React.createElement("button", { onClick: function() { toggleShop(item.id); }, style: { width: 26, height: 26, borderRadius: 7, border: "2px solid " + C.border, background: "none", cursor: "pointer", flexShrink: 0 } }),
              React.createElement("span", { style: { flex: 1, fontSize: 15, fontWeight: 500 } }, item.text),
              React.createElement("button", { className: "del-btn", onClick: function() { deleteShop(item.id); }, style: { background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex" } }, React.createElement(Trash2, { size: 15 }))
            );
          }),
          shopping.filter(function(i) { return i.checked; }).map(function(item) {
            return React.createElement("div", { key: item.id, style: { background: C.surface, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, opacity: .45 } },
              React.createElement("button", { onClick: function() { toggleShop(item.id); }, style: { width: 26, height: 26, borderRadius: 7, border: "2px solid " + C.teal, background: C.tealD, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, React.createElement(Check, { size: 13, color: C.teal })),
              React.createElement("span", { style: { flex: 1, fontSize: 15, color: C.textMuted, textDecoration: "line-through" } }, item.text),
              React.createElement("button", { className: "del-btn", onClick: function() { deleteShop(item.id); }, style: { background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex" } }, React.createElement(Trash2, { size: 15 }))
            );
          })
        )
      ),

      // ── CALCULADORA ──
      tab === "calc" && React.createElement("div", { className: "fade-up", style: { display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", gap: 16 } },
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
          React.createElement(Card, null,
            React.createElement("input", { value: recipe.name, onChange: function(e) { setRecipe(Object.assign({}, recipe, { name: e.target.value })); },
              style: { background: "transparent", border: "none", borderBottom: "2px solid " + C.border, padding: "6px 0", fontSize: 22, fontWeight: 800, color: C.text, outline: "none", fontFamily: "'Outfit',sans-serif", width: "100%", marginBottom: 16 }, placeholder: "Nome da Receita..." }),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
              [{ label: "Rendimento", key: "yields", unit: "un", Icon: Package }, { label: "Tempo", key: "timeSpentMinutes", unit: "min", Icon: Clock }].map(function(f) {
                return React.createElement("div", { key: f.key, style: { background: C.surface, border: "1px solid " + C.border, borderRadius: 12, padding: 14 } },
                  React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 10 } },
                    React.createElement(f.Icon, { size: 12, color: C.lime }),
                    React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1.5 } }, f.label)
                  ),
                  React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 5 } },
                    React.createElement("input", { type: "number", value: recipe[f.key], onChange: function(e) { var upd = {}; upd[f.key] = parseFloat(e.target.value) || 0; setRecipe(Object.assign({}, recipe, upd)); },
                      style: { background: "transparent", border: "none", borderBottom: "2px solid " + C.border, fontSize: 26, fontWeight: 800, color: C.text, width: 68, outline: "none", fontFamily: "'Outfit',sans-serif" } }),
                    React.createElement("span", { style: { fontSize: 11, color: C.textMuted } }, f.unit)
                  )
                );
              })
            )
          ),
          React.createElement(Card, null,
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } },
              React.createElement("span", { style: { fontWeight: 700, fontSize: 15 } }, "Ingredientes"),
              React.createElement("select", { value: "", onChange: function(e) { addIngToRecipe(e.target.value); }, style: Object.assign({}, inSt, { width: "auto", padding: "7px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }) },
                React.createElement("option", { value: "", disabled: true }, "+ Adicionar"),
                ingredients.map(function(i) { return React.createElement("option", { key: i.id, value: i.id }, i.name); })
              )
            ),
            recipe.selectedIngredients.length === 0
              ? React.createElement("div", { style: { textAlign: "center", padding: "28px 0", color: C.textMuted, border: "1.5px dashed " + C.border, borderRadius: 10 } }, React.createElement(Package, { size: 22, style: { margin: "0 auto 8px", opacity: .3 } }), React.createElement("p", { style: { fontSize: 13 } }, "Adicione ingredientes"))
              : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7 } },
                  recipe.selectedIngredients.map(function(item) {
                    var ing = ingredients.find(function(i) { return i.id === item.id; });
                    if (!ing) return null;
                    var cost = (ing.cost / ing.packageWeight) * item.quantity;
                    return React.createElement("div", { key: item.id, style: { display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: C.surface, border: "1px solid " + C.border, borderRadius: 10 } },
                      React.createElement("div", { style: { flex: 1 } },
                        React.createElement("div", { style: { fontWeight: 700, fontSize: 13 } }, ing.name),
                        React.createElement("div", { style: { fontSize: 10, color: C.textMuted } }, "Emb. " + ing.packageWeight + "g")
                      ),
                      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, background: C.card, border: "1px solid " + C.border, borderRadius: 8, padding: "4px 9px" } },
                        React.createElement("input", { type: "number", value: item.quantity, onChange: function(e) { updateQty(item.id, e.target.value); },
                          style: { width: 48, textAlign: "right", background: "transparent", border: "none", fontWeight: 700, color: C.text, outline: "none", fontSize: 13, fontFamily: "'Outfit',sans-serif" } }),
                        React.createElement("span", { style: { fontSize: 10, color: C.textMuted } }, "g")
                      ),
                      React.createElement("span", { style: { width: 60, textAlign: "right", fontWeight: 700, color: C.lime, fontSize: 13 } }, fmt(cost)),
                      React.createElement("button", { className: "del-btn", onClick: function() { removeFromRecipe(item.id); }, style: { background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex" } }, React.createElement(Trash2, { size: 13 }))
                    );
                  })
                ),
            React.createElement("div", { style: { marginTop: 18, paddingTop: 14, borderTop: "1px solid " + C.border } },
              React.createElement("p", { style: { fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 } }, "Adicionar a despensa"),
              React.createElement("div", { style: { display: "flex", gap: 7, flexWrap: "wrap" } },
                React.createElement("input", { placeholder: "Ingrediente", value: newIng.name, onChange: function(e) { setNewIng(Object.assign({}, newIng, { name: e.target.value })); }, style: Object.assign({}, inSt, { flex: 1, minWidth: 100, fontSize: 13 }) }),
                React.createElement("input", { type: "number", placeholder: "g", value: newIng.packageWeight, onChange: function(e) { setNewIng(Object.assign({}, newIng, { packageWeight: e.target.value })); }, style: Object.assign({}, inSt, { width: 70, fontSize: 13 }) }),
                React.createElement("input", { type: "number", placeholder: "R$", value: newIng.cost, onChange: function(e) { setNewIng(Object.assign({}, newIng, { cost: e.target.value })); }, style: Object.assign({}, inSt, { width: 68, fontSize: 13 }) }),
                React.createElement("button", { onClick: addIngToDB, style: { background: C.lime, color: C.bg, border: "none", borderRadius: 10, padding: "0 14px", cursor: "pointer", display: "flex", alignItems: "center" } }, React.createElement(Plus, { size: 18 }))
              )
            )
          )
        ),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
          React.createElement(Card, null,
            React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 } },
              React.createElement("span", { style: { fontWeight: 700, fontSize: 14 } }, "Margem de Lucro"),
              React.createElement("span", { style: { fontSize: 24, fontWeight: 900, color: C.lime } }, recipe.profitMargin + "%")
            ),
            React.createElement("input", { type: "range", min: 0, max: 200, value: recipe.profitMargin, onChange: function(e) { setRecipe(Object.assign({}, recipe, { profitMargin: parseFloat(e.target.value) })); }, style: { width: "100%", marginBottom: 18 } }),
            [{ label: "Ingredientes", value: R.ing }, { label: "Custos var. (10%)", value: R.variable }, { label: "Mao de obra", value: R.labor }].map(function(row) {
              return React.createElement("div", { key: row.label, style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + C.border } },
                React.createElement("span", { style: { fontSize: 12, color: C.textMuted } }, row.label),
                React.createElement("span", { style: { fontSize: 12, fontWeight: 700 } }, fmt(row.value))
              );
            }),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid " + C.border } },
              React.createElement("span", { style: { fontWeight: 700, fontSize: 13 } }, "Custo total"),
              React.createElement("span", { style: { fontWeight: 700, fontSize: 13 } }, fmt(R.production))
            ),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", padding: "9px 11px", background: C.tealD, border: "1px solid " + C.teal + "33", borderRadius: 8, marginTop: 8 } },
              React.createElement("span", { style: { fontWeight: 700, color: C.teal, fontSize: 13 } }, "Seu lucro"),
              React.createElement("span", { style: { fontWeight: 700, color: C.teal, fontSize: 13 } }, "+" + fmt(R.profit))
            )
          ),
          React.createElement("div", { style: { background: C.limeD, border: "2px solid " + C.lime, borderRadius: 14, padding: 20, textAlign: "center" } },
            React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: C.lime, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 } }, "Preco sugerido"),
            React.createElement("div", { style: { fontSize: 40, fontWeight: 900, color: C.lime, lineHeight: 1 } }, fmt(R.unit)),
            React.createElement("div", { style: { fontSize: 11, color: C.lime, marginTop: 5, opacity: .6 } }, "por unidade"),
            React.createElement("div", { style: { marginTop: 14, paddingTop: 12, borderTop: "1px solid " + C.lime + "33", display: "flex", justifyContent: "space-between" } },
              React.createElement("span", { style: { fontSize: 12, color: C.textMuted } }, "Faturamento total"),
              React.createElement("span", { style: { fontSize: 14, fontWeight: 800, color: C.lime } }, fmt(R.total))
            )
          )
        )
      ),

      // ── MARKETING ──
      tab === "marketing" && React.createElement("div", { className: "fade-up" },
        React.createElement("div", { style: { marginBottom: 20 } },
          React.createElement("h2", { style: { fontSize: 22, fontWeight: 800 } }, "Marketing com IA"),
          React.createElement("p", { style: { fontSize: 13, color: C.textMuted, marginTop: 2 } }, "Conteudo pronto em segundos")
        ),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 } },
          [
            { id: "post", emoji: "📸", label: "O que postar hoje no Insta?", color: C.purple, colorD: C.purpleD },
            { id: "stories", emoji: "🎬", label: "Stories pra engajar hoje", color: C.teal, colorD: C.tealD },
            { id: "vendas", emoji: "💬", label: "Mensagem de vendas no Whats", color: C.amber, colorD: C.amberD },
          ].map(function(btn) {
            return React.createElement("button", { key: btn.id, onClick: function() { callAI(btn.id); }, disabled: isAiLoading,
              style: { background: btn.colorD, border: "1.5px solid " + btn.color + "44", borderRadius: 14, padding: "20px 14px", cursor: isAiLoading ? "not-allowed" : "pointer", textAlign: "center", opacity: isAiLoading ? .6 : 1, fontFamily: "'Outfit',sans-serif" } },
              React.createElement("div", { style: { fontSize: 28, marginBottom: 10 } }, btn.emoji),
              React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: btn.color, lineHeight: 1.3 } }, btn.label)
            );
          })
        ),
        React.createElement(Card, { style: { minHeight: 300 } },
          React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } },
            React.createElement("span", { style: { fontWeight: 700, fontSize: 15 } }, isAiLoading ? "Gerando..." : aiResult ? "Pronto para usar" : "Resultado"),
            aiResult && React.createElement("button", { onClick: function() { navigator.clipboard.writeText(aiResult); setCopied(true); setTimeout(function() { setCopied(false); }, 2000); },
              style: { display: "flex", alignItems: "center", gap: 6, background: C.limeD, border: "1px solid " + C.lime + "44", borderRadius: 8, padding: "7px 12px", color: C.lime, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Outfit',sans-serif" } },
              copied ? React.createElement(React.Fragment, null, React.createElement(Check, { size: 13 }), " Copiado!") : React.createElement(React.Fragment, null, React.createElement(Copy, { size: 13 }), " Copiar")
            )
          ),
          React.createElement("div", { style: { background: C.surface, borderRadius: 12, padding: 20, minHeight: 200, display: "flex", alignItems: isAiLoading || !aiResult ? "center" : "flex-start", justifyContent: isAiLoading || !aiResult ? "center" : "flex-start" } },
            isAiLoading
              ? React.createElement("div", { style: { textAlign: "center", color: C.textMuted } },
                  React.createElement("div", { style: { width: 30, height: 30, border: "3px solid " + C.border, borderTopColor: C.lime, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 12px" } }),
                  React.createElement("p", { style: { fontSize: 13 } }, "Criando conteudo...")
                )
              : aiResult
                ? React.createElement("p", { style: { color: C.textMid, whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: 14 } }, aiResult)
                : aiError
                  ? React.createElement("p", { style: { color: C.rose, fontSize: 13, textAlign: "center" } }, aiError)
                  : React.createElement("div", { style: { textAlign: "center", color: C.textMuted } },
                      React.createElement(Zap, { size: 32, style: { margin: "0 auto 12px", opacity: .2 } }),
                      React.createElement("p", { style: { fontWeight: 700 } }, "Clique em um botao acima"),
                      React.createElement("p", { style: { fontSize: 12, marginTop: 5 } }, "A IA gera sugestoes praticas pra voce")
                    )
          )
        )
      ),

      // ── FINANCEIRO ──
      tab === "financeiro" && React.createElement("div", { className: "fade-up" },
        React.createElement("div", { style: { marginBottom: 20 } },
          React.createElement("h2", { style: { fontSize: 22, fontWeight: 800 } }, "Financeiro"),
          React.createElement("p", { style: { fontSize: 13, color: C.textMuted, marginTop: 2 } }, new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }))
        ),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 20 } },
          React.createElement(StatCard, { label: "Faturamento", value: fmt(faturamento), accent: C.lime, sub: monthOrders.length + " pedidos" }),
          React.createElement(StatCard, { label: "Recebido", value: fmt(recebido), accent: C.teal }),
          React.createElement(StatCard, { label: "Gastos", value: fmt(totalExp), accent: C.rose }),
          React.createElement(StatCard, { label: "Lucro do mes", value: fmt(lucro), accent: lucro >= 0 ? C.lime : C.rose, sub: lucro >= 0 ? "no azul" : "no vermelho" })
        ),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 } },
          React.createElement(Card, null,
            React.createElement("h3", { style: { fontSize: 16, fontWeight: 700, marginBottom: 16 } }, "Gastos do Mes"),
            [{ key: "luz", label: "Energia eletrica" }, { key: "internet", label: "Internet" }, { key: "gas", label: "Gas" }, { key: "outros", label: "Outros" }].map(function(f) {
              return React.createElement("div", { key: f.key, style: { marginBottom: 12 } },
                React.createElement("label", { style: lblSt }, f.label),
                React.createElement("div", { style: { position: "relative" } },
                  React.createElement("span", { style: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 13, fontWeight: 700 } }, "R$"),
                  React.createElement("input", { type: "number", placeholder: "0,00", value: expenses[f.key], onChange: function(e) { var upd = {}; upd[f.key] = e.target.value; setExpenses(Object.assign({}, expenses, upd)); }, style: Object.assign({}, inSt, { paddingLeft: 34 }) })
                )
              );
            }),
            React.createElement("div", { style: { marginTop: 14, paddingTop: 12, borderTop: "1px solid " + C.border, display: "flex", justifyContent: "space-between" } },
              React.createElement("span", { style: { fontWeight: 700, color: C.rose, fontSize: 13 } }, "Total de gastos"),
              React.createElement("span", { style: { fontWeight: 800, color: C.rose } }, fmt(totalExp))
            )
          ),
          React.createElement(Card, null,
            React.createElement("h3", { style: { fontSize: 16, fontWeight: 700, marginBottom: 16 } }, "Pedidos do Mes"),
            monthOrders.length === 0
              ? React.createElement("div", { style: { textAlign: "center", padding: "28px 0", color: C.textMuted } }, React.createElement(Coins, { size: 24, style: { margin: "0 auto 8px", opacity: .3 } }), React.createElement("p", { style: { fontSize: 13 } }, "Nenhum pedido este mes"))
              : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7, maxHeight: 260, overflowY: "auto" } },
                  monthOrders.map(function(o) {
                    return React.createElement("div", { key: o.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: C.surface, borderRadius: 9, border: "1px solid " + C.border } },
                      React.createElement("div", null,
                        React.createElement("div", { style: { fontWeight: 700, fontSize: 13 } }, o.client),
                        React.createElement("div", { style: { fontSize: 11, color: C.textMuted } }, fmtDate(o.pickupDate))
                      ),
                      React.createElement("div", { style: { textAlign: "right" } },
                        React.createElement("div", { style: { fontWeight: 700, color: C.lime, fontSize: 14 } }, fmt(parseFloat(o.value || 0))),
                        parseFloat(o.paid || 0) < parseFloat(o.value || 0) && React.createElement("div", { style: { fontSize: 11, color: C.amber } }, "falta " + fmt(parseFloat(o.value || 0) - parseFloat(o.paid || 0)))
                      )
                    );
                  })
                ),
            React.createElement("div", { style: { marginTop: 14, paddingTop: 12, borderTop: "1px solid " + C.border } },
              React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 5 } }, React.createElement("span", { style: { fontSize: 13, color: C.textMuted } }, "Total faturado"), React.createElement("span", { style: { fontWeight: 700 } }, fmt(faturamento))),
              React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } }, React.createElement("span", { style: { fontSize: 13, color: C.textMuted } }, "Total recebido"), React.createElement("span", { style: { fontWeight: 700, color: C.lime } }, fmt(recebido)))
            )
          )
        ),
        React.createElement("div", { style: { background: lucro >= 0 ? C.limeD : C.roseD, border: "2px solid " + (lucro >= 0 ? C.lime : C.rose) + "55", borderRadius: 14, padding: 22, marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" } },
          React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: lucro >= 0 ? C.lime : C.rose, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 } }, "Resultado do mes"),
            React.createElement("div", { style: { fontSize: 36, fontWeight: 900, color: lucro >= 0 ? C.lime : C.rose, lineHeight: 1 } }, fmt(lucro)),
            React.createElement("div", { style: { fontSize: 13, color: C.textMuted, marginTop: 6 } }, "Recebido (" + fmt(recebido) + ") menos Gastos (" + fmt(totalExp) + ")")
          ),
          React.createElement("div", { style: { fontSize: 44 } }, lucro >= 0 ? "🎉" : "😬")
        )
      ),

      // ── NEGOCIO ──
      tab === "config" && React.createElement("div", { className: "fade-up", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } },
        React.createElement(Card, null,
          React.createElement("h3", { style: { fontSize: 18, fontWeight: 700, marginBottom: 18 } }, "Remuneracao"),
          [{ label: "Salario desejado (mensal)", key: "salary" }, { label: "Custos fixos (MEI, luz)", key: "fixedCosts" }].map(function(f) {
            return React.createElement("div", { key: f.key, style: { marginBottom: 14 } },
              React.createElement("label", { style: lblSt }, f.label),
              React.createElement("div", { style: { position: "relative" } },
                React.createElement("span", { style: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.lime, fontWeight: 700, fontSize: 13 } }, "R$"),
                React.createElement("input", { type: "number", value: biz[f.key], onChange: function(e) { var upd = {}; upd[f.key] = e.target.value; setBiz(Object.assign({}, biz, upd)); }, style: Object.assign({}, inSt, { paddingLeft: 40, fontSize: 20, fontWeight: 800 }) })
              )
            );
          })
        ),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
          React.createElement(Card, null,
            React.createElement("h3", { style: { fontSize: 18, fontWeight: 700, marginBottom: 16 } }, "Jornada"),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
              [{ label: "Horas/dia", key: "hoursPerDay" }, { label: "Dias/semana", key: "daysPerWeek" }].map(function(f) {
                return React.createElement("div", { key: f.key },
                  React.createElement("label", { style: lblSt }, f.label),
                  React.createElement("input", { type: "number", value: biz[f.key], onChange: function(e) { var upd = {}; upd[f.key] = e.target.value; setBiz(Object.assign({}, biz, upd)); }, style: Object.assign({}, inSt, { textAlign: "center", fontSize: 28, fontWeight: 800 }) })
                );
              })
            )
          ),
          React.createElement("div", { style: { background: C.limeD, border: "1px solid " + C.lime + "44", borderRadius: 14, padding: 20 } },
            React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: C.lime, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 } }, "Valor da sua hora"),
            React.createElement("div", { style: { fontSize: 36, fontWeight: 900, color: C.lime } }, fmt(hourlyRate)),
            React.createElement("p", { style: { color: C.lime, fontSize: 12, marginTop: 6, opacity: .6 } }, "Incluido em cada receita automaticamente")
          ),
          React.createElement(Card, null,
            React.createElement("h3", { style: { fontSize: 15, fontWeight: 700, marginBottom: 12 } }, "Despensa (" + ingredients.length + ")"),
            React.createElement("div", { style: { maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 } },
              ingredients.map(function(ing) {
                return React.createElement("div", { key: ing.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: C.surface, borderRadius: 8, border: "1px solid " + C.border } },
                  React.createElement("div", null,
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 13 } }, ing.name),
                    React.createElement("div", { style: { fontSize: 11, color: C.textMuted } }, ing.packageWeight + "g " + fmt(ing.cost))
                  ),
                  React.createElement("button", { className: "del-btn", onClick: function() { setIngredients(ingredients.filter(function(i) { return i.id !== ing.id; })); }, style: { background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex" } }, React.createElement(Trash2, { size: 13 }))
                );
              })
            )
          )
        )
      )
    )
  );
}
