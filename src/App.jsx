import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, BarChart3, Bell, Box, CakeSlice, CheckCircle2, ChevronRight,
  CircleDollarSign, ClipboardList, Clock3, LogOut, Menu, Package, Plus,
  Sparkles, TrendingUp, UserRound, X, ShoppingCart
} from 'lucide-react';
import { supabase } from './lib/supabase';

const BRAND = '#d7ff11';
const EMPTY_PROFILE = { full_name: '', business_name: 'Minha Confeitaria', expires_at: null, active: true };

function money(value = 0) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function dateBR(value) {
  if (!value) return '—';
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
}
function isExpired(profile) {
  return !profile?.active || (profile?.expires_at && new Date(profile.expires_at + 'T23:59:59') < new Date());
}

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [booting, setBooting] = useState(true);
  const [page, setPage] = useState('dashboard');
  const [toast, setToast] = useState('');

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
      if (mounted) setBooting(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    loadProfile(session.user.id);
  }, [session?.user?.id]);

  async function loadProfile(userId) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.error(error);
      return;
    }
    setProfile(data || EMPTY_PROFILE);
  }

  async function logout() { await supabase.auth.signOut(); }
  function notify(message) { setToast(message); window.setTimeout(() => setToast(''), 2200); }

  if (booting) return <Splash />;
  if (!session) return <LoginScreen />;
  if (isExpired(profile)) return <ExpiredScreen profile={profile} onLogout={logout} />;

  return <AppShell
    session={session}
    profile={profile}
    page={page}
    setPage={setPage}
    onLogout={logout}
    notify={notify}
    toast={toast}
  />;
}

function Splash() {
  return <div className="splash"><div className="brand-word">confeasy<span>.</span></div><div className="loader" /></div>;
}

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) setError('E-mail ou senha inválidos.');
    setLoading(false);
  }

  return <div className="login-page">
    <div className="login-card">
      <div className="brand-lockup"><div className="brand-mark"><CakeSlice size={30}/></div><div><div className="brand-word">confeasy<span>.</span></div><small>Sua confeitaria em um só lugar.</small></div></div>
      <div className="login-copy"><span className="eyebrow">Acesso da confeiteira</span><h1>Bem-vinda de volta.</h1><p>Entre com o e-mail usado na sua compra e a senha recebida.</p></div>
      <form onSubmit={submit} className="form">
        <label>E-mail<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email" /></label>
        <label>Senha<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Sua senha" autoComplete="current-password" /></label>
        {error && <div className="error">{error}</div>}
        <button className="primary wide" disabled={loading}>{loading ? 'Entrando…' : 'Entrar no Confeasy'} <ArrowRight size={17}/></button>
      </form>
      <div className="login-note">Sua conta é individual. Não compartilhe sua senha.</div>
    </div>
  </div>;
}

function ExpiredScreen({ profile, onLogout }) {
  return <div className="login-page"><div className="login-card center"><div className="brand-word">confeasy<span>.</span></div><div className="expired-icon"><Clock3/></div><h1>Acesso encerrado</h1><p>O acesso desta conta terminou em <b>{dateBR(profile?.expires_at)}</b>. Entre em contato para renovar seu plano.</p><button className="secondary wide" onClick={onLogout}><LogOut size={16}/> Sair</button></div></div>;
}

function AppShell({ session, profile, page, setPage, onLogout, notify, toast }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const items = [
    ['dashboard','Visão geral',CakeSlice], ['recipes','Receitas',CakeSlice], ['orders','Pedidos',ClipboardList],
    ['finance','Finanças',CircleDollarSign], ['pantry','Despensa',Package], ['marketing','Marketing com IA',Sparkles],
    ['business','Meu negócio',UserRound]
  ];
  const title = items.find(x=>x[0]===page)?.[1] || 'Visão geral';

  return <div className="shell">
    <aside className="sidebar">
      <Brand />
      <nav>{items.map(([id,label,Icon])=><button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}><Icon size={18}/><span>{label}</span></button>)}</nav>
      <div className="sidebar-user"><div className="avatar">{(profile.full_name || session.user.email || 'C')[0].toUpperCase()}</div><div><b>{profile.business_name || 'Minha Confeitaria'}</b><small>{session.user.email}</small></div></div>
      <button className="logout" onClick={onLogout}><LogOut size={16}/> Sair</button>
    </aside>
    <main className="main">
      <header className="topbar"><div><div className="eyebrow">Confeasy</div><h1>{title}</h1><p>Olá, {profile.full_name || 'confeiteira'}. Vamos cuidar da sua confeitaria?</p></div><div className="top-actions"><button className="icon-button"><Bell size={18}/></button><button className="avatar top-avatar">{(profile.full_name || session.user.email || 'C')[0].toUpperCase()}</button><button className="icon-button mobile-menu" onClick={()=>setMobileMenu(v=>!v)}><Menu size={18}/></button></div></header>
      {mobileMenu && <div className="mobile-menu-panel">{items.map(([id,label,Icon])=><button key={id} onClick={()=>{setPage(id);setMobileMenu(false)}} className={page===id?'active':''}><Icon size={17}/>{label}</button>)}</div>}
      <Page page={page} profile={profile} session={session} setPage={setPage} notify={notify}/>
    </main>
    <nav className="bottom-nav">{items.slice(0,5).map(([id,label,Icon])=><button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}><Icon size={18}/><span>{label.split(' ')[0]}</span></button>)}</nav>
    {toast && <div className="toast">{toast}</div>}
  </div>;
}

function Brand(){ return <div className="brand"><div className="brand-icon"><CakeSlice size={22}/></div><div><div className="brand-word">confeasy<span>.</span></div><small>Sua confeitaria em um só lugar.</small></div></div>; }

function Page({page,...props}) {
  const map = {dashboard: Dashboard, recipes: Recipes, orders: Orders, finance: Finance, pantry: Pantry, marketing: Marketing, business: Business};
  const Component = map[page] || Dashboard;
  return <Component {...props}/>;
}

function Dashboard({profile,setPage,notify}) {
  const [stats,setStats]=useState({sales:0,expenses:0,orders:0});
  const [orders,setOrders]=useState([]);
  useEffect(()=>{(async()=>{
    const [{data:o},{data:e}] = await Promise.all([
      supabase.from('orders').select('id,client_name,item_name,delivery_date,value,status').order('delivery_date',{ascending:true}).limit(6),
      supabase.from('expenses').select('value')
    ]);
    const sales=(o||[]).reduce((s,x)=>s+Number(x.value||0),0), expenses=(e||[]).reduce((s,x)=>s+Number(x.value||0),0);
    setStats({sales,expenses,orders:(o||[]).length}); setOrders(o||[]);
  })()},[]);
  return <>
    <section className="hero"><div><div className="eyebrow">Bom dia, confeiteira! ✨</div><h2>Sua confeitaria, organizada.</h2><p>Tenha seus pedidos, receitas, estoque e dinheiro em um só lugar.</p><div className="quick"><button className="primary" onClick={()=>setPage('orders')}><Plus size={17}/> Novo pedido</button><button className="secondary" onClick={()=>setPage('recipes')}><Plus size={17}/> Nova receita</button></div></div><div className="hero-orb"><Sparkles size={46}/></div></section>
    <div className="stats"><Stat label="Vendas registradas" value={money(stats.sales)}/><Stat label="Pedidos" value={stats.orders}/><Stat label="Despesas" value={money(stats.expenses)}/><Stat label="Saldo" value={money(stats.sales-stats.expenses)} green/></div>
    <section className="section"><div className="section-head"><h2>O que você quer fazer?</h2><span>Acesso rápido</span></div><div className="modules"><Module icon={CakeSlice} color="purple" title="Receitas" text="Calcule custos e defina o preço ideal." onClick={()=>setPage('recipes')}/><Module icon={ClipboardList} color="cyan" title="Pedidos" text="Organize encomendas e prazos." onClick={()=>setPage('orders')}/><Module icon={TrendingUp} color="yellow" title="Finanças" text="Controle seu dinheiro e seu lucro." onClick={()=>setPage('finance')}/><Module icon={Box} color="pink" title="Despensa" text="Mantenha seu estoque em dia." onClick={()=>setPage('pantry')}/><Module icon={Sparkles} color="green" title="Marketing com IA" text="Ideias, textos e estratégia." onClick={()=>setPage('marketing')}/></div></section>
    <section className="lower"><div className="panel"><div className="section-head"><h2>Próximos pedidos</h2><button className="link" onClick={()=>setPage('orders')}>Ver todos <ChevronRight size={14}/></button></div>{orders.length?<table><thead><tr><th>Cliente</th><th>Pedido</th><th>Entrega</th><th>Status</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>{o.client_name}</td><td>{o.item_name}</td><td>{dateBR(o.delivery_date)}</td><td><span className={`pill ${o.status==='Pago'?'ok':''}`}>{o.status}</span></td></tr>)}</tbody></table>:<Empty text="Você ainda não tem pedidos cadastrados."/>}</div><div className="panel"><div className="section-head"><h2>Seu plano</h2></div><div className="plan"><CheckCircle2 size={21}/><div><b>Acesso ativo</b><small>Válido até {dateBR(profile.expires_at)}</small></div></div><div className="mini-note">Todos os seus dados ficam associados à sua conta e podem ser acessados em outros dispositivos.</div></div></section>
  </>;
}
function Stat({label,value,green}){return <div className="stat"><span>{label}</span><b className={green?'green-text':''}>{value}</b></div>}
function Module({icon:Icon,color,title,text,onClick}){return <button className="module" onClick={onClick}><div className={`module-icon ${color}`}><Icon size={22}/></div><div><h3>{title}</h3><p>{text}</p></div><ArrowRight className="module-arrow" size={17}/></button>}
function Empty({text}){return <div className="empty">{text}</div>}

function Recipes({notify}){
  const [rows,setRows]=useState([]),[open,setOpen]=useState(false),[form,setForm]=useState({name:'',yield_units:'',cost:''});
  const load=async()=>{const {data}=await supabase.from('recipes').select('*').order('created_at',{ascending:false});setRows(data||[])};
  useEffect(()=>{load()},[]);
  async function add(e){e.preventDefault();const {error}=await supabase.from('recipes').insert({name:form.name,yield_units:form.yield_units,cost:Number(form.cost||0)});if(error)notify(error.message);else{setForm({name:'',yield_units:'',cost:''});setOpen(false);load();notify('Receita cadastrada.')}}
  return <Crud title="Minhas receitas" action="Nova receita" open={open} setOpen={setOpen}><table><thead><tr><th>Receita</th><th>Rendimento</th><th>Custo</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.name}</td><td>{r.yield_units||'—'}</td><td>{money(r.cost)}</td></tr>)}</tbody></table>{!rows.length&&<Empty text="Cadastre sua primeira receita."/>}<Modal open={open} close={()=>setOpen(false)} title="Nova receita"><form className="form" onSubmit={add}><label>Nome<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Rendimento<input value={form.yield_units} onChange={e=>setForm({...form,yield_units:e.target.value})} placeholder="Ex.: 20 unidades"/></label><label>Custo total<input type="number" step="0.01" value={form.cost} onChange={e=>setForm({...form,cost:e.target.value})}/></label><button className="primary wide">Salvar receita</button></form></Modal></Crud>
}

function Orders({notify}){
  const [rows,setRows]=useState([]),[open,setOpen]=useState(false),[form,setForm]=useState({client_name:'',item_name:'',delivery_date:'',value:'',status:'Pendente'});
  const load=async()=>{const {data}=await supabase.from('orders').select('*').order('delivery_date',{ascending:true});setRows(data||[])}; useEffect(()=>{load()},[]);
  async function add(e){e.preventDefault();const {error}=await supabase.from('orders').insert({...form,value:Number(form.value||0)});if(error)notify(error.message);else{setOpen(false);setForm({client_name:'',item_name:'',delivery_date:'',value:'',status:'Pendente'});load();notify('Pedido cadastrado.')}}
  return <Crud title="Pedidos" action="Novo pedido" open={open} setOpen={setOpen}><table><thead><tr><th>Cliente</th><th>Pedido</th><th>Entrega</th><th>Valor</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.client_name}</td><td>{r.item_name}</td><td>{dateBR(r.delivery_date)}</td><td>{money(r.value)}</td><td><span className={`pill ${r.status==='Pago'?'ok':''}`}>{r.status}</span></td></tr>)}</tbody></table>{!rows.length&&<Empty text="Cadastre seu primeiro pedido."/>}<Modal open={open} close={()=>setOpen(false)} title="Novo pedido"><form className="form" onSubmit={add}><label>Cliente<input required value={form.client_name} onChange={e=>setForm({...form,client_name:e.target.value})}/></label><label>Pedido<input required value={form.item_name} onChange={e=>setForm({...form,item_name:e.target.value})}/></label><label>Entrega<input type="date" value={form.delivery_date} onChange={e=>setForm({...form,delivery_date:e.target.value})}/></label><label>Valor<input type="number" step="0.01" value={form.value} onChange={e=>setForm({...form,value:e.target.value})}/></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Pendente</option><option>Pago</option><option>Concluído</option></select></label><button className="primary wide">Salvar pedido</button></form></Modal></Crud>
}
function Finance(){const [orders,setOrders]=useState([]),[expenses,setExpenses]=useState([]);useEffect(()=>{Promise.all([supabase.from('orders').select('value'),supabase.from('expenses').select('*').order('created_at',{ascending:false})]).then(([o,e])=>{setOrders(o.data||[]);setExpenses(e.data||[])})},[]);const sales=orders.reduce((a,x)=>a+Number(x.value||0),0), exp=expenses.reduce((a,x)=>a+Number(x.value||0),0);return <><div className="stats"><Stat label="Entradas" value={money(sales)} green/><Stat label="Despesas" value={money(exp)}/><Stat label="Resultado" value={money(sales-exp)} green/></div><section className="panel section"><div className="section-head"><h2>Despesas</h2></div>{expenses.length?<table><thead><tr><th>Descrição</th><th>Valor</th></tr></thead><tbody>{expenses.map(e=><tr key={e.id}><td>{e.description}</td><td>{money(e.value)}</td></tr>)}</tbody></table>:<Empty text="Nenhuma despesa registrada."/>}</section></>}
function Pantry(){const [rows,setRows]=useState([]);useEffect(()=>{supabase.from('ingredients').select('*').order('name').then(({data})=>setRows(data||[]))},[]);return <section className="panel"><div className="section-head"><h2>Minha despensa</h2><span>{rows.length} itens</span></div>{rows.length?<table><thead><tr><th>Ingrediente</th><th>Quantidade</th><th>Unidade</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.name}</td><td>{r.quantity}</td><td>{r.unit}</td></tr>)}</tbody></table>:<Empty text="Sua despensa está vazia."/>}</section>}
function Marketing(){const [topic,setTopic]=useState(''),[out,setOut]=useState('');function generate(){const t=topic||'meus doces';setOut(`Ideia de conteúdo para ${t}: comece com uma situação real da cliente, mostre seu produto como solução e finalize com uma chamada para o WhatsApp.\n\nGancho: “Você também deixa ${t} para a última hora?”\n\nCTA: “Me chama e veja as opções disponíveis.”`)}return <section className="panel ai-panel"><div className="eyebrow">Assistente</div><h2>Marketing com IA</h2><p>Crie rascunhos de conteúdo para sua confeitaria.</p><textarea value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Ex.: quero vender mais bolos de aniversário"/><button className="primary" onClick={generate}><Sparkles size={16}/> Gerar ideia</button>{out&&<div className="ai-output">{out}</div>}</section>}
function Business({profile}){return <section className="panel"><div className="section-head"><h2>Meu negócio</h2></div><div className="profile-grid"><div><span>Confeiteira</span><b>{profile.full_name||'—'}</b></div><div><span>Negócio</span><b>{profile.business_name||'—'}</b></div><div><span>E-mail</span><b>{profile.email||'—'}</b></div><div><span>Acesso até</span><b>{dateBR(profile.expires_at)}</b></div></div></section>}
function Crud({title,action,open,setOpen,children}){return <section className="panel"><div className="section-head"><h2>{title}</h2><button className="primary" onClick={()=>setOpen(true)}><Plus size={16}/>{action}</button></div>{children}</section>}
function Modal({open,close,title,children}){if(!open)return null;return <div className="modal-bg" onMouseDown={e=>e.target===e.currentTarget&&close()}><div className="modal"><div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={close}><X size={18}/></button></div>{children}</div></div>}
