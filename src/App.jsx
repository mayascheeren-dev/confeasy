import {
  ArrowRight, Bell, CakeSlice, CheckCircle2, ChevronRight,
  CircleDollarSign, ClipboardList, Clock3, Edit3, ImagePlus, LogOut,
  Menu, Package, Plus, Search, Settings, Sparkles, Trash2, UserRound,
  X, ShoppingCart, WalletCards, MessageCircle, Image, FileText,
  Smartphone, Tag, Lightbulb, Send, Bot, Gift, CalendarDays,
  Megaphone, WandSparkles, Pencil, Check, ChevronDown
} from 'lucide-react';
import { supabase } from './lib/supabase';
import './index.css';

const EMPTY_PROFILE = {
  full_name:'', business_name:'Minha Confeitaria', email:'',
  expires_at:null, active:true, phone:'', instagram:'',
  city:'', address:'', logo_url:'',
  desired_monthly_income:0, work_hours_per_day:8, work_days_per_week:5
};

const CATEGORIES = ['Bolos','Doces','Tortas','Salgados','Cookies','Brownies','Sobremesas','Massas','Outros'];
const ORDER_STATUS = ['Pendente','Confirmado','Pago','Em produção','Pronto','Entregue','Cancelado'];
const EXPENSE_CATEGORIES = ['Ingredientes','Embalagens','Equipamentos','Marketing','Entrega','Taxas','Contas','Outros'];

function money(value=0){
  return Number(value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}
function dateBR(value){
  if(!value) return '—';
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
}
function todayISO(){ return new Date().toISOString().slice(0,10); }
function clamp(n,min,max){ return Math.min(Math.max(Number(n)||0,min),max); }
function uid(){ return crypto.randomUUID(); }
function isExpired(profile){
  return !profile?.active ||
    (profile?.expires_at && new Date(profile.expires_at+'T23:59:59') < new Date());
}

const UNIT_INFO = {
  g:{family:'weight',base:'g',factor:1},
  kg:{family:'weight',base:'g',factor:1000},
  ml:{family:'volume',base:'ml',factor:1},
  l:{family:'volume',base:'ml',factor:1000},
  un:{family:'count',base:'un',factor:1},
  pacote:{family:'other',base:'pacote',factor:1},
  caixa:{family:'other',base:'caixa',factor:1}
};

function convertToBase(quantity,unit){
  const info=UNIT_INFO[unit];
  return (Number(quantity)||0)*(info?.factor||1);
}

function LandingPage(){
  const plans = [
    {days:'30 DIAS',price:'R$ 19,90',description:'Comece a organizar sua confeitaria agora.',cta:'COMEÇAR POR R$ 19,90',link:'https://www.asaas.com/000/c/tqgg1c884dx1h4j1'},
    {days:'90 DIAS',price:'R$ 44,90',description:'Mais tempo para colocar sua rotina em ordem.',cta:'QUERO 90 DIAS',link:'https://www.asaas.com/000/c/spq8l5cw7qblvjes',featured:true},
    {days:'365 DIAS',price:'R$ 97,00',description:'Um ano inteiro para cuidar melhor do seu negócio.',cta:'QUERO 1 ANO',link:'https://www.asaas.com/000/c/ggrrovd9q8ozwprr'}
  ];

  const features = [
    {icon:<ClipboardList size={21}/>,title:'Pedidos',text:'Clientes, produtos, datas, valores e status em um só lugar.'},
    {icon:<CakeSlice size={21}/>,title:'Receitas',text:'Cadastre receitas, acompanhe custos e organize sua produção.'},
    {icon:<Package size={21}/>,title:'Despensa',text:'Controle ingredientes, estoque mínimo e custos dos insumos.'},
    {icon:<CircleDollarSign size={21}/>,title:'Finanças',text:'Visualize vendas, despesas e o resultado registrado.'},
    {icon:<Sparkles size={21}/>,title:'Marketing com IA',text:'Tenha ideias de conteúdo para divulgar seus produtos.'},
    {icon:<UserRound size={21}/>,title:'Meu negócio',text:'Deixe as informações da sua confeitaria organizadas.'}
  ];

  const MiniScreen=({type='dashboard'})=>{
    if(type==='orders') return <div className="lp-mini-screen"><div className="lp-mini-top"><span></span><b>Pedidos</b></div><h4>Agenda de pedidos</h4><div className="lp-order"><b>Maria • Bolo</b><strong>R$ 180</strong><small>18/10 • Confirmado</small></div><div className="lp-order"><b>Ana • Doces</b><strong>R$ 95</strong><small>19/10 • Pago</small></div><div className="lp-order"><b>Julia • Kit festa</b><strong>R$ 240</strong><small>21/10 • Em produção</small></div></div>;
    if(type==='recipes') return <div className="lp-mini-screen"><div className="lp-mini-top"><span></span><b>Receitas</b></div><h4>Minhas receitas</h4><div className="lp-recipe">🍰 <b>Bolo de chocolate</b><small>Custo R$ 42,80</small></div><div className="lp-recipe">🧁 <b>Cupcake de baunilha</b><small>Custo R$ 18,40</small></div><div className="lp-recipe">🍪 <b>Cookies</b><small>Custo R$ 12,90</small></div></div>;
    return <div className="lp-mini-screen"><div className="lp-mini-top"><span></span><b>Dashboard</b></div><h4>Bom dia! 👋</h4><div className="lp-stats"><div><small>Pedidos</small><strong>24</strong><em>+12%</em></div><div><small>Vendas</small><strong>R$ 2.480</strong><em>este mês</em></div></div><div className="lp-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div className="lp-mini-list"><span>● Bolo de aniversário <b>R$ 180</b></span><span>● Doces personalizados <b>R$ 95</b></span><span>● Kit festa <b>R$ 240</b></span></div></div>;
  };

  return <div className="lp">
    <header className="lp-header"><div className="lp-container lp-nav">
      <a href="/" className="lp-logo">confeasy<span>.</span></a>
      <nav className="lp-nav-links"><a href="#recursos">Recursos</a><a href="#como-funciona">Como funciona</a><a href="#planos">Planos</a></nav>
      <a href="/app" className="lp-login">Já sou cliente <ArrowRight size={14}/></a>
    </div></header>

    <main>
      <section className="lp-hero"><div className="lp-container lp-hero-grid">
        <div className="lp-hero-copy">
          <div className="lp-eyebrow">Feito para a rotina da confeiteira</div>
          <h1>Sua confeitaria.<br/><em>Em um só lugar.</em></h1>
          <p>Pedidos, receitas, ingredientes, finanças e marketing com IA reunidos em uma única ferramenta para deixar sua rotina mais organizada.</p>
          <div className="lp-actions"><a className="lp-btn lp-btn-main" href="#planos">Quero começar agora <ArrowRight size={15}/></a><a className="lp-btn lp-btn-ghost" href="#recursos">Conhecer o Confeasy</a></div>
          <div className="lp-proof"><span><CheckCircle2 size={13}/><b>6</b> áreas integradas</span><span><CheckCircle2 size={13}/>Celular e computador</span></div>
        </div>

        <div className="lp-device-stage"><div className="lp-glow"></div>
          <div className="lp-laptop"><div className="lp-laptop-screen"><div className="lp-app-window">
            <aside className="lp-sidebar"><div className="lp-side-logo">confeasy<span>.</span></div><div className="lp-side-item active">● Dashboard</div><div className="lp-side-item">▣ Pedidos</div><div className="lp-side-item">◉ Receitas</div><div className="lp-side-item">□ Despensa</div><div className="lp-side-item">$ Finanças</div><div className="lp-side-item">✦ Marketing IA</div></aside>
            <div className="lp-app-main"><div className="lp-app-head"><strong>Visão geral</strong><span>Minha Confeitaria</span></div><div className="lp-app-cards"><div><small>Pedidos</small><b>24</b></div><div><small>Vendas</small><b>R$ 2.480</b></div><div><small>Resultado</small><b className="lime">R$ 1.540</b></div></div><div className="lp-app-chart"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div className="lp-app-list"><span>● Bolo de aniversário <b>R$ 180</b></span><span>● Doces personalizados <b>R$ 95</b></span><span>● Kit festa <b>R$ 240</b></span></div></div>
          </div></div><div className="lp-laptop-base"></div></div>

          <div className="lp-phone"><div className="lp-notch"></div><div className="lp-phone-screen"><div className="lp-phone-logo">confeasy<span>.</span></div><div className="lp-phone-card"><small>Pedidos do mês</small><b>24 pedidos</b><i></i></div><div className="lp-phone-card"><small>Vendas</small><b className="lime">R$ 2.480,00</b></div><div className="lp-phone-card"><small>Próxima entrega</small><b>Bolo de aniversário</b></div><div className="lp-phone-card"><small>Estoque</small><b>8 itens para repor</b></div></div></div>
        </div>
      </div></section>

      <section className="lp-strip"><div className="lp-container lp-strip-inner"><div><ClipboardList size={16}/>Pedidos</div><div><CakeSlice size={16}/>Receitas</div><div><Package size={16}/>Despensa</div><div><WalletCards size={16}/>Finanças</div><div><Sparkles size={16}/>Marketing com IA</div><div><UserRound size={16}/>Meu negócio</div></div></section>

      <section id="recursos" className="lp-section"><div className="lp-container">
        <div className="lp-section-head"><div className="lp-eyebrow center">Tudo conectado</div><h2>Menos ferramentas espalhadas.<br/>Mais visão do seu negócio.</h2><p>O Confeasy reúne tarefas que normalmente ficam em planilhas, cadernos e aplicativos diferentes.</p></div>
        <div className="lp-features">{features.map(feature=><article className="lp-feature" key={feature.title}><div className="lp-feature-icon">{feature.icon}</div><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div>
      </div></section>

      <section className="lp-showcase"><div className="lp-container lp-showcase-grid"><div className="lp-showcase-copy"><div className="lp-eyebrow">Do planejamento à entrega</div><h2>Veja sua confeitaria <em>em movimento.</em></h2><p>Tenha uma visão mais clara do que está acontecendo: pedidos entrando, receitas sendo organizadas, ingredientes controlados e números registrados.</p><div className="lp-checks"><div><CheckCircle2 size={15}/>Organize pedidos e datas de entrega.</div><div><CheckCircle2 size={15}/>Conheça melhor o custo das suas receitas.</div><div><CheckCircle2 size={15}/>Acompanhe ingredientes e despesas.</div><div><CheckCircle2 size={15}/>Crie ideias para divulgar seus produtos.</div></div></div><div className="lp-screen-wall"><MiniScreen type="dashboard"/><MiniScreen type="orders"/><MiniScreen type="recipes"/><MiniScreen type="dashboard"/></div></div></section>

      <section className="lp-benefit"><div className="lp-container"><div className="lp-benefit-card"><div><div className="lp-eyebrow">Mais clareza na rotina</div><h2>Você faz os doces.<br/><em>O Confeasy organiza o resto.</em></h2><p>Centralize informações importantes e tenha uma rotina mais prática para cuidar do seu negócio sem depender de anotações espalhadas.</p><div className="lp-benefit-list"><div><CheckCircle2 size={15}/>Pedidos e clientes organizados.</div><div><CheckCircle2 size={15}/>Receitas e custos em um só lugar.</div><div><CheckCircle2 size={15}/>Estoque e despesas acompanhados.</div><div><CheckCircle2 size={15}/>Marketing com ideias para adaptar.</div></div></div><div className="lp-floating-phone"><div className="lp-notch"></div><div className="lp-phone-screen"><div className="lp-phone-logo">confeasy<span>.</span></div><div className="lp-phone-card"><small>Resultado registrado</small><b className="lime">R$ 3.240,00</b></div><div className="lp-phone-card"><small>Próximas entregas</small><b>3 pedidos</b></div><div className="lp-phone-card"><small>Despensa</small><b>8 itens para repor</b></div><div className="lp-phone-card"><small>Marketing</small><b>Nova ideia disponível ✦</b></div></div></div></div></div></section>

      <section id="como-funciona" className="lp-how"><div className="lp-container"><div className="lp-section-head"><div className="lp-eyebrow center">Comece sem complicação</div><h2>Do pagamento ao seu primeiro acesso.</h2><p>Um processo simples para começar a usar a ferramenta.</p></div><div className="lp-steps"><article><strong>01</strong><h3>Escolha seu plano</h3><p>Selecione 30, 90 ou 365 dias de acesso.</p></article><article><strong>02</strong><h3>Faça o pagamento</h3><p>Você será direcionada ao ambiente seguro de pagamento do Asaas.</p></article><article><strong>03</strong><h3>Comece a organizar</h3><p>Depois da confirmação, seu acesso ao Confeasy é liberado para você entrar e começar.</p></article></div></div></section>

      <section id="planos" className="lp-pricing"><div className="lp-container"><div className="lp-section-head"><div className="lp-eyebrow center">Escolha seu acesso</div><h2>Seu próximo passo começa aqui.</h2><p>Três opções de acesso. Escolha a que faz sentido para sua rotina.</p></div><div className="lp-plans">{plans.map(plan=><article className={plan.featured?'lp-plan featured':'lp-plan'} key={plan.days}>{plan.featured&&<div className="lp-badge">Mais escolhido</div>}<div className="lp-plan-tag">{plan.days}</div><div className="lp-price">{plan.price}</div><small>acesso Confeasy</small><p>{plan.description}</p><div className="lp-plan-list"><span><CheckCircle2 size={14}/>Pedidos e clientes</span><span><CheckCircle2 size={14}/>Receitas e custos</span><span><CheckCircle2 size={14}/>Despensa e ingredientes</span><span><CheckCircle2 size={14}/>Finanças e marketing</span></div><a className="lp-btn lp-btn-main" href={plan.link} target="_blank" rel="noopener noreferrer">{plan.cta} <ArrowRight size={15}/></a></article>)}</div><div className="lp-payments"><span><CheckCircle2 size={13}/>Pagamento via Asaas</span><span><WalletCards size={13}/>Boleto / Pix</span><span><CheckCircle2 size={13}/>Acesso após confirmação</span></div></div></section>

      <section className="lp-final"><div className="lp-container"><h2>Menos tempo procurando.<br/><em>Mais tempo fazendo.</em></h2><p>Escolha seu plano e coloque sua confeitaria em ordem.</p><div className="lp-final-plans">{plans.map(plan=><a key={plan.days} className="lp-btn lp-btn-main" href={plan.link} target="_blank" rel="noopener noreferrer">{plan.cta} <ArrowRight size={14}/></a>)}</div></div></section>
    </main>

    <footer className="lp-footer"><div className="lp-container lp-footer-inner"><span>© {new Date().getFullYear()} Confeasy. Organização para sua confeitaria.</span><a href="/app">Já sou cliente →</a></div></footer>
    <div className="lp-mobile-cta"><a href="#planos">VER PLANOS • A PARTIR DE R$ 19,90</a></div>
  </div>;
}



function App(){
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if(path !== '/app') return <LandingPage/>;

  const [session,setSession]=useState(null);
  const [profile,setProfile]=useState(EMPTY_PROFILE);
  const [booting,setBooting]=useState(true);
  const [page,setPage]=useState('dashboard');
  const [toast,setToast]=useState('');

  useEffect(()=>{
    let mounted=true;
    supabase.auth.getSession().then(({data})=>{
      if(mounted) setSession(data.session);
      if(mounted) setBooting(false);
    });
    const {data:listener}=supabase.auth.onAuthStateChange((_e,next)=>setSession(next));
    return()=>{mounted=false;listener.subscription.unsubscribe()};
  },[]);

  useEffect(()=>{
    if(session?.user?.id) loadProfile(session.user.id);
  },[session?.user?.id]);

  async function loadProfile(id){
    const {data}=await supabase.from('profiles').select('*').eq('id',id).single();
    if(data) setProfile({...EMPTY_PROFILE,...data,email:data.email||session?.user?.email||''});
  }

  async function logout(){ await supabase.auth.signOut(); }
  function notify(msg){
    setToast(msg);
    window.setTimeout(()=>setToast(''),2600);
  }

  if(booting) return <Splash/>;
  if(!session) return <LoginScreen/>;
  if(isExpired(profile)) return <ExpiredScreen profile={profile} onLogout={logout}/>;

  return <AppShell
    session={session}
    profile={profile}
    setProfile={setProfile}
    page={page}
    setPage={setPage}
    onLogout={logout}
    notify={notify}
    toast={toast}
  />;
}

function Splash(){
  return <div className="splash">
    <div className="brand-word">confeasy<span>.</span></div>
    <div className="loader"/>
  </div>;
}

function LoginScreen(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  async function submit(e){
    e.preventDefault();
    setError('');
    setLoading(true);
    const {error:err}=await supabase.auth.signInWithPassword({
      email:email.trim(),password
    });
    if(err) setError('E-mail ou senha inválidos.');
    setLoading(false);
  }

  return <div className="login-page">
    <div className="login-card">
      <div className="brand-lockup">
        <img src="/confeasy-logo-login.png"
          alt="Confeasy — Sua confeitaria em um só lugar"
          className="login-logo"/>
      </div>
      <div className="login-copy">
        <span className="eyebrow">Acesso da confeiteira</span>
        <h1>Bem-vinda de volta.</h1>
        <p>Entre com o e-mail usado na sua compra e a senha recebida.</p>
      </div>
      <form onSubmit={submit} className="form">
        <Field label="E-mail">
          <input type="email" required value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="voce@email.com" autoComplete="email"/>
        </Field>
        <Field label="Senha">
          <input type="password" required value={password}
            onChange={e=>setPassword(e.target.value)}
            placeholder="Sua senha" autoComplete="current-password"/>
        </Field>
        {error&&<div className="error">{error}</div>}
        <button className="primary wide" disabled={loading}>
          {loading?'Entrando…':'Entrar no Confeasy'} <ArrowRight size={17}/>
        </button>
      </form>
      <div className="login-note">Sua conta é individual. Não compartilhe sua senha.</div>
    </div>
  </div>;
}

function ExpiredScreen({profile,onLogout}){
  return <div className="login-page">
    <div className="login-card center">
      <div className="brand-word">confeasy<span>.</span></div>
      <div className="expired-icon"><Clock3/></div>
      <h1>Acesso encerrado</h1>
      <p>O acesso desta conta terminou em <b>{dateBR(profile?.expires_at)}</b>.</p>
      <button className="secondary wide" onClick={onLogout}><LogOut size={16}/> Sair</button>
    </div>
  </div>;
}

function AppShell({session,profile,setProfile,page,setPage,onLogout,notify,toast}){
  const items=[
    ['dashboard','Visão geral',CakeSlice],
    ['recipes','Calculadora',CakeSlice],
    ['orders','Pedidos',ClipboardList],
    ['finance','Finanças',CircleDollarSign],
    ['pantry','Despensa',Package],
    ['marketing','Marketing com IA',Sparkles],
    ['business','Meu negócio',UserRound]
  ];
  const [mobile,setMobile]=useState(false);
  const title=items.find(x=>x[0]===page)?.[1]||'Visão geral';

  return <div className="shell">
    <aside className="sidebar">
      <Brand/>
      <nav>
        {items.map(([id,label,Icon])=>
          <button key={id} className={page===id?'active':''}
            onClick={()=>{setPage(id);setMobile(false)}}>
            <Icon size={18}/><span>{label}</span>
          </button>
        )}
      </nav>
      <div className="sidebar-user">
        <div className="avatar">{(profile.full_name||session.user.email||'C')[0].toUpperCase()}</div>
        <div><b>{profile.business_name||'Minha Confeitaria'}</b><small>{session.user.email}</small></div>
      </div>
      <button className="logout" onClick={onLogout}><LogOut size={16}/> Sair</button>
    </aside>

    <main className="main">
      <header className="topbar">
        <div>
          <div className="eyebrow">Confeasy</div>
          <h1>{title}</h1>
          <p>Olá, {profile.full_name||'confeiteira'}. Vamos cuidar da sua confeitaria?</p>
        </div>
        <div className="top-actions">
          <button className="icon-button"><Bell size={18}/></button>
          <button className="avatar top-avatar">{(profile.full_name||session.user.email||'C')[0].toUpperCase()}</button>
          <button className="icon-button mobile-menu" onClick={()=>setMobile(v=>!v)}><Menu size={18}/></button>
        </div>
      </header>

      {mobile&&<div className="mobile-menu-panel">
        {items.map(([id,label,Icon])=>
          <button key={id} className={page===id?'active':''}
            onClick={()=>{setPage(id);setMobile(false)}}>
            <Icon size={17}/>{label}
          </button>
        )}
      </div>}

      <Page page={page} profile={profile} session={session}
        setPage={setPage} setProfile={setProfile} notify={notify}/>
    </main>

    <nav className="bottom-nav">
      {items.slice(0,5).map(([id,label,Icon])=>
        <button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}>
          <Icon size={18}/><span>{label.split(' ')[0]}</span>
        </button>
      )}
    </nav>

    {toast&&<div className="toast">{toast}</div>}
  </div>;
}

function Brand(){
  return <div className="brand">
    <img src="/confeasy-logo-login.png" alt="Confeasy" className="app-logo"/>
  </div>;
}

function Page({page,...props}){
  const map={
    dashboard:Dashboard,
    recipes:Recipes,
    orders:Orders,
    finance:Finance,
    pantry:Pantry,
    marketing:Marketing,
    business:Business
  };
  const Component=map[page]||Dashboard;
  return <Component {...props}/>;
}

function Dashboard({profile,setPage}){
  const [orders,setOrders]=useState([]);
  const [expenses,setExpenses]=useState([]);
  const [recipes,setRecipes]=useState([]);
  const [ingredients,setIngredients]=useState([]);

  useEffect(()=>{
    Promise.all([
      supabase.from('orders').select('*').order('delivery_date',{ascending:true}).limit(8),
      supabase.from('expenses').select('value'),
      supabase.from('recipes').select('id'),
      supabase.from('ingredients').select('id,quantity,min_quantity')
    ]).then(([o,e,r,i])=>{
      setOrders(o.data||[]);
      setExpenses(e.data||[]);
      setRecipes(r.data||[]);
      setIngredients(i.data||[]);
    });
  },[]);

  const sales=orders.reduce((s,x)=>s+Number(x.value||0),0);
  const exp=expenses.reduce((s,x)=>s+Number(x.value||0),0);
  const low=ingredients.filter(x=>Number(x.quantity||0)<=Number(x.min_quantity||0)).length;

  return <>
    <section className="hero">
      <div>
        <div className="eyebrow">Bom dia, confeiteira! ✨</div>
        <h2>Sua confeitaria, organizada.</h2>
        <p>Pedidos, receitas, estoque e dinheiro conectados em um só lugar.</p>
        <div className="quick">
          <button className="primary" onClick={()=>setPage('orders')}><Plus size={17}/> Novo pedido</button>
          <button className="secondary" onClick={()=>setPage('recipes')}><Plus size={17}/> Nova receita</button>
        </div>
      </div>
      <div className="hero-orb"><Sparkles size={46}/></div>
    </section>

    <div className="stats">
      <Stat label="Vendas registradas" value={money(sales)} green/>
      <Stat label="Pedidos" value={orders.length}/>
      <Stat label="Despesas" value={money(exp)}/>
      <Stat label="Resultado" value={money(sales-exp)} green/>
    </div>

    <section className="section">
      <div className="section-head">
        <div><h2>Resumo da operação</h2><span>Uma visão rápida dos principais números.</span></div>
      </div>
      <div className="dashboard-grid">
        <MiniCard icon={CakeSlice} title="Receitas" value={recipes.length}
          text="receitas cadastradas" onClick={()=>setPage('recipes')}/>
        <MiniCard icon={ShoppingCart} title="Pedidos"
          value={orders.filter(o=>o.status!=='Entregue'&&o.status!=='Cancelado').length}
          text="em andamento" onClick={()=>setPage('orders')}/>
        <MiniCard icon={Package} title="Despensa" value={low}
          text={low?'itens em estoque mínimo':'estoque controlado'}
          alert={low>0} onClick={()=>setPage('pantry')}/>
        <MiniCard icon={WalletCards} title="Saldo" value={money(sales-exp)}
          text="resultado registrado" onClick={()=>setPage('finance')}/>
      </div>
    </section>

    <section className="lower">
      <div className="panel">
        <div className="section-head">
          <div><h2>Próximos pedidos</h2><span>Agenda de produção e entrega</span></div>
          <button className="link" onClick={()=>setPage('orders')}>Ver todos <ChevronRight size={14}/></button>
        </div>
        {orders.length?
          <table><thead><tr><th>Cliente</th><th>Pedido</th><th>Entrega</th><th>Valor</th><th>Status</th></tr></thead>
            <tbody>{orders.map(o=>
              <tr key={o.id}>
                <td>{o.client_name}</td><td>{o.item_name}</td><td>{dateBR(o.delivery_date)}</td>
                <td>{money(o.value)}</td>
                <td><span className={`pill ${o.status==='Pago'||o.status==='Entregue'?'ok':''}`}>{o.status}</span></td>
              </tr>
            )}</tbody>
          </table>
          :<Empty text="Você ainda não tem pedidos cadastrados." action="Novo pedido" onClick={()=>setPage('orders')}/>}
      </div>

      <div className="panel">
        <div className="section-head"><div><h2>Seu plano</h2><span>Acesso ao Confeasy</span></div></div>
        <div className="plan"><CheckCircle2 size={21}/><div><b>Acesso ativo</b><small>Válido até {dateBR(profile.expires_at)}</small></div></div>
        <div className="mini-note">Seus dados ficam associados à sua conta e podem ser acessados em computador, tablet e celular.</div>
      </div>
    </section>
  </>;
}

function Stat({label,value,green}){
  return <div className="stat"><span>{label}</span><b className={green?'green-text':''}>{value}</b></div>;
}

function MiniCard({icon:Icon,title,value,text,onClick,alert}){
  return <button className="mini-card" onClick={onClick}
    style={{minWidth:0,minHeight:112,padding:18,display:'grid',
      gridTemplateColumns:'42px minmax(0,1fr) 18px',alignItems:'center',
      gap:14,background:'#111314',border:'1px solid rgba(255,255,255,.08)',
      borderRadius:16,color:'#fff',textAlign:'left',overflow:'hidden'}}>
    <div className="mini-icon" style={{width:42,height:42,borderRadius:12,
      display:'grid',placeItems:'center',background:'#202420',color:'var(--lime)'}}>
      <Icon size={20}/>
    </div>
    <div style={{minWidth:0,display:'grid',gap:5}}>
      <span style={{fontSize:11,color:'var(--muted)'}}>{title}</span>
      <b className={alert?'warning-text':''} style={{fontSize:20,lineHeight:1.1}}>{value}</b>
      <small style={{fontSize:10,color:'var(--muted-2)'}}>{text}</small>
    </div>
    <ChevronRight size={16} style={{color:'var(--muted-2)'}}/>
  </button>;
}

function Empty({text,action,onClick}){
  return <div className="empty"><div>{text}</div>{action&&
    <button className="secondary small" onClick={onClick}><Plus size={15}/>{action}</button>}
  </div>;
}

/* =========================================================
   CALCULADORA
========================================================= */

function Recipes({session,notify,profile,setProfile}){
  const blank={
    name:'',
    category:'Bolos',
    photo_url:'',
    yield_amount:'1',
    yield_unit:'un',
    portion_size:'',
    prep_time_minutes:'',
    desired_margin:'40',
    sale_price:'',
    preparation:'',
    notes:'',
    ingredients:[]
  };

  const [rows,setRows]=useState([]);
  const [ingredientsCatalog,setIngredientsCatalog]=useState([]);
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState(blank);
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('Todas');
  const [uploading,setUploading]=useState(false);
  const [savingLabor,setSavingLabor]=useState(false);

  const [additionalCosts,setAdditionalCosts]=useState({
    packaging:0,
    energy:0,
    delivery:0,
    other:0
  });
  const [ifoodRate,setIfoodRate]=useState(null);

  async function load(){
    const {data,error}=await supabase
      .from('recipes')
      .select('*, recipe_ingredients(*)')
      .order('created_at',{ascending:false});

    if(error) notify(error.message);
    else setRows(data||[]);
  }

  async function loadCatalog(){
    const {data,error}=await supabase
      .from('ingredients')
      .select('*')
      .order('name');

    if(error) notify(error.message);
    else setIngredientsCatalog(data||[]);
  }

  useEffect(()=>{
    load();
    loadCatalog();
  },[]);

  const monthlyHours=
    Math.max(Number(profile?.work_hours_per_day)||0,0) *
    Math.max(Number(profile?.work_days_per_week)||0,0) *
    4.33;

  const hourlyRate=
    monthlyHours>0
      ? (Number(profile?.desired_monthly_income)||0)/monthlyHours
      : 0;

  function ingredientCost(item){
    const catalog=ingredientsCatalog.find(
      x=>x.id===item.ingredient_id
    );

    if(!catalog){
      return Number(item.quantity||0)*Number(item.unit_cost||0);
    }

    const recipeBase=convertToBase(
      item.quantity,
      item.unit
    );

    if(
      catalog.base_unit &&
      UNIT_INFO[item.unit]?.base===catalog.base_unit
    ){
      return recipeBase*Number(catalog.base_unit_cost||0);
    }

    if(catalog.base_unit===item.unit){
      return Number(item.quantity||0)*
        Number(catalog.base_unit_cost||0);
    }

    return Number(item.quantity||0)*
      Number(catalog.base_unit_cost||0);
  }

  const calc=useMemo(()=>{
    const ingredientTotal=(form.ingredients||[]).reduce(
      (sum,item)=>sum+ingredientCost(item),
      0
    );

    const prepMinutes=Math.max(
      Number(form.prep_time_minutes)||0,
      0
    );

    const laborCost=
      (prepMinutes/60)*hourlyRate;

    const additionalTotal=
      Number(additionalCosts.packaging||0)+
      Number(additionalCosts.energy||0)+
      Number(additionalCosts.delivery||0)+
      Number(additionalCosts.other||0);

    const totalCost=
      ingredientTotal+
      laborCost+
      additionalTotal;

    const yieldAmount=
      Math.max(Number(form.yield_amount)||0,0);

    const unitCost=
      yieldAmount>0
        ? totalCost/yieldAmount
        : 0;

    const margin=
      clamp(form.desired_margin,0,99.99);

    const suggestedPrice=
      unitCost>0
        ? unitCost/(1-margin/100)
        : 0;

    const roundedPrice=
      suggestedPrice>0
        ? Math.ceil(suggestedPrice*2)/2
        : 0;

    const psychologicalPrice=
      roundedPrice>0
        ? Math.floor(roundedPrice)+0.99
        : 0;

    const ifoodBasic=
  suggestedPrice>0
    ? suggestedPrice/(1-0.152)
    : 0;

const ifoodDelivery=
  suggestedPrice>0
    ? suggestedPrice/(1-0.262)
    : 0;

const ifoodSelectedPrice=
  suggestedPrice>0 && ifoodRate
    ? suggestedPrice/(1-ifoodRate)
    : 0;

    return {
      ingredientTotal,
      laborCost,
      additionalTotal,
      totalCost,
      unitCost,
      suggestedPrice,
      roundedPrice,
      psychologicalPrice,
      ifoodBasic,
ifoodDelivery,
ifoodSelectedPrice,
prepMinutes
    };
  },[
    form.ingredients,
    form.prep_time_minutes,
    form.yield_amount,
    form.desired_margin,
    hourlyRate,
    ingredientsCatalog,
    additionalCosts,
    ifoodRate
  ]);

  function setF(key,value){
    setForm(current=>({
      ...current,
      [key]:value
    }));
  }

  function setAdditional(key,value){
    setAdditionalCosts(current=>({
      ...current,
      [key]:Number(value)||0
    }));
  }

  function openNew(){
    setEditing(null);

    setForm({
      ...blank,
      ingredients:[{
        id:uid(),
        ingredient_id:'',
        name:'',
        quantity:'',
        unit:'g',
        unit_cost:''
      }]
    });

    setAdditionalCosts({
      packaging:0,
      energy:0,
      delivery:0,
      other:0
    });

    setOpen(true);
  }

  function openEdit(recipe){
    setEditing(recipe);

    setForm({
      name:recipe.name||'',
      category:recipe.category||'Outros',
      photo_url:recipe.photo_url||'',
      yield_amount:recipe.yield_amount||1,
      yield_unit:recipe.yield_unit||'un',
      portion_size:recipe.portion_size||'',
      prep_time_minutes:recipe.prep_time_minutes||'',
      desired_margin:recipe.desired_margin||40,
      sale_price:recipe.sale_price||'',
      preparation:recipe.preparation||'',
      notes:recipe.notes||'',
      ingredients:(recipe.recipe_ingredients||[]).map(item=>({
        id:item.id,
        ingredient_id:item.ingredient_id||'',
        name:item.name||'',
        quantity:item.quantity||'',
        unit:item.unit||'g',
        unit_cost:item.unit_cost||''
      }))
    });

    setAdditionalCosts({
      packaging:0,
      energy:0,
      delivery:0,
      other:0
    });

    setOpen(true);
  }

  async function upload(e){
    const file=e.target.files?.[0];

    if(!file)return;

    if(file.size>5*1024*1024){
      notify('A foto pode ter no máximo 5 MB.');
      return;
    }

    setUploading(true);

    const extension=
      file.name.split('.').pop()?.toLowerCase()||'jpg';

    const path=
      `${session.user.id}/${uid()}.${extension}`;

    const {error}=await supabase
      .storage
      .from('recipe-images')
      .upload(path,file,{
        upsert:false,
        contentType:file.type
      });

    if(error){
      notify(error.message);
    }else{
      const {data}=supabase
        .storage
        .from('recipe-images')
        .getPublicUrl(path);

      setF('photo_url',data.publicUrl);

      notify('Foto adicionada.');
    }

    setUploading(false);
  }

  function selectIngredient(id,rowId){
    const selected=
      ingredientsCatalog.find(x=>x.id===id);

    setF(
      'ingredients',
      (form.ingredients||[]).map(item=>{
        if(item.id!==rowId)return item;

        return {
          ...item,
          ingredient_id:id,
          name:selected?.name||'',
          unit:selected?.base_unit||'g',
          unit_cost:Number(
            selected?.base_unit_cost||0
          )
        };
      })
    );
  }

  function updateIngredient(id,key,value){
    setF(
      'ingredients',
      (form.ingredients||[]).map(item=>
        item.id===id
          ? {...item,[key]:value}
          : item
      )
    );
  }

  function addIngredient(){
    setF(
      'ingredients',
      [
        ...(form.ingredients||[]),
        {
          id:uid(),
          ingredient_id:'',
          name:'',
          quantity:'',
          unit:'g',
          unit_cost:''
        }
      ]
    );
  }

  function removeIngredient(id){
    setF(
      'ingredients',
      (form.ingredients||[]).filter(
        item=>item.id!==id
      )
    );
  }

  async function saveLaborSettings(){
    setSavingLabor(true);

    const payload={
      desired_monthly_income:
        Math.max(
          Number(profile?.desired_monthly_income)||0,
          0
        ),

      work_hours_per_day:
        Math.max(
          Number(profile?.work_hours_per_day)||0,
          0
        ),

      work_days_per_week:
        Math.max(
          Number(profile?.work_days_per_week)||0,
          0
        )
    };

    const {error}=await supabase
      .from('profiles')
      .update(payload)
      .eq('id',session.user.id);

    if(error){
      notify(error.message);
    }else{
      setProfile(current=>({
        ...current,
        ...payload
      }));

      notify(
        'Configuração da sua hora de trabalho salva.'
      );
    }

    setSavingLabor(false);
  }

  async function save(e){
    e.preventDefault();

    if(!form.name.trim()){
      notify('Informe o nome do produto.');
      return;
    }

    const payload={
      user_id:session.user.id,
      name:form.name.trim(),
      category:form.category,
      photo_url:form.photo_url||null,

      yield_amount:
        Number(form.yield_amount)||1,

      yield_unit:form.yield_unit,

      yield_units:
        `${Number(form.yield_amount)||1} ${form.yield_unit}`,

      portion_size:
        form.portion_size||null,

      prep_time_minutes:
        Number(form.prep_time_minutes)||0,

      ingredient_cost:
        calc.ingredientTotal,

      labor_cost:
        calc.laborCost,

      cost:
        calc.totalCost,

      unit_cost:
        calc.unitCost,

      suggested_price:
        calc.suggestedPrice,

      sale_price:
        Number(form.sale_price)||
        calc.psychologicalPrice,

      desired_margin:
        clamp(
          form.desired_margin,
          0,
          99.99
        ),

      preparation:
        form.preparation||null,

      notes:
        form.notes||null
    };

    let recipeId=editing?.id;
    let error=null;

    if(editing){
      const result=await supabase
        .from('recipes')
        .update(payload)
        .eq('id',editing.id);

      error=result.error;

      if(error){
        notify(error.message);
        return;
      }

      const deleted=await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id',editing.id);

      if(deleted.error){
        notify(deleted.error.message);
        return;
      }
    }else{
      const result=await supabase
        .from('recipes')
        .insert(payload)
        .select('id')
        .single();

      recipeId=result.data?.id;
      error=result.error;
    }

    if(error||!recipeId)return;

    const recipeRows=(form.ingredients||[])
      .filter(item=>item.name.trim())
      .map(item=>({
        recipe_id:recipeId,
        user_id:session.user.id,
        ingredient_id:item.ingredient_id||null,
        name:item.name.trim(),
        quantity:Number(item.quantity)||0,
        unit:item.unit,
        unit_cost:Number(item.unit_cost)||0
      }));

    if(recipeRows.length){
      const result=await supabase
        .from('recipe_ingredients')
        .insert(recipeRows);

      if(result.error){
        notify(result.error.message);
        return;
      }
    }

    setOpen(false);

    notify(
      editing
        ? 'Produto atualizado.'
        : 'Produto salvo.'
    );

    await load();
  }

  async function remove(id){
    if(!confirm('Excluir este produto?'))return;

    const {error}=await supabase
      .from('recipes')
      .delete()
      .eq('id',id);

    if(error){
      notify(error.message);
    }else{
      notify('Produto excluído.');
      load();
    }
  }

  const liveRows=useMemo(()=>{
    return rows.map(recipe=>{
      const ingredientTotal=
        (recipe.recipe_ingredients||[])
          .reduce(
            (sum,item)=>
              sum+ingredientCost(item),
            0
          );

      const prepMinutes=
        Math.max(
          Number(recipe.prep_time_minutes)||0,
          0
        );

      const laborCost=
        (prepMinutes/60)*hourlyRate;

      const totalCost=
        ingredientTotal+laborCost;

      const yieldAmount=
        Math.max(
          Number(recipe.yield_amount)||0,
          0
        );

      const unitCost=
        yieldAmount>0
          ? totalCost/yieldAmount
          : 0;

      const margin=
        clamp(
          recipe.desired_margin,
          0,
          99.99
        );

      const suggestedPrice=
        unitCost>0
          ? unitCost/(1-margin/100)
          : 0;

      return {
        ...recipe,
        ingredient_cost:ingredientTotal,
        labor_cost:laborCost,
        cost:totalCost,
        unit_cost:unitCost,
        suggested_price:suggestedPrice
      };
    });
  },[
    rows,
    ingredientsCatalog,
    hourlyRate
  ]);

  const filtered=liveRows.filter(r=>
    (
      !query ||
      String(r.name||'')
        .toLowerCase()
        .includes(query.toLowerCase())
    ) &&
    (
      category==='Todas' ||
      r.category===category
    )
  );

  return <>
    <style>{`
  /* =========================================================
     CONFEASY — CALCULADORA
     Layout premium + desktop + mobile
  ========================================================= */

  .calc-page{
    display:grid;
    gap:22px;
    width:100%;
  }

  /* =========================
     BARRA SUPERIOR
  ========================= */

  .calc-toolbar{
    display:grid;
    grid-template-columns:minmax(0,1fr) auto;
    align-items:center;
    gap:14px;
  }

  .calc-search{
    min-width:0;
    max-width:680px;
  }

  .calc-search .search-box{
    width:100%;
    min-height:48px;
    border-radius:14px;
  }

  .calc-search .search-box input{
    min-width:0;
    width:100%;
  }

  .calc-actions{
    display:flex;
    align-items:center;
    gap:10px;
  }

  .calc-actions select{
    min-width:190px;
    min-height:48px;
  }

  .calc-actions .primary{
    min-height:48px;
    white-space:nowrap;
  }

  /* =========================
     HERO
  ========================= */

  .calc-hero{
    position:relative;
    overflow:hidden;
    border:1px solid rgba(255,255,255,.08);
    border-radius:24px;
    padding:30px;
    background:
      radial-gradient(
        circle at 90% 0%,
        rgba(215,255,17,.16),
        transparent 34%
      ),
      radial-gradient(
        circle at 55% 100%,
        rgba(255,255,255,.025),
        transparent 40%
      ),
      linear-gradient(135deg,#181b19,#0d0f0f);
    box-shadow:0 18px 50px rgba(0,0,0,.18);
  }

  .calc-hero::after{
    content:'';
    position:absolute;
    width:260px;
    height:260px;
    right:-120px;
    bottom:-150px;
    border-radius:50%;
    background:rgba(215,255,17,.06);
    pointer-events:none;
  }

  .calc-hero-grid{
    position:relative;
    z-index:1;
    display:grid;
    grid-template-columns:minmax(0,1fr) 250px;
    gap:28px;
    align-items:center;
  }

  .calc-eyebrow{
    color:var(--lime);
    font-size:10px;
    font-weight:900;
    letter-spacing:.16em;
    text-transform:uppercase;
    margin-bottom:9px;
  }

  .calc-hero h2{
    max-width:700px;
    margin:0 0 10px;
    font-size:32px;
    line-height:1.08;
    letter-spacing:-.045em;
  }

  .calc-hero p{
    max-width:690px;
    margin:0;
    color:var(--muted);
    font-size:13px;
    line-height:1.65;
  }

  .calc-settings{
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:10px;
    margin-top:22px;
  }

  .calc-setting{
    min-width:0;
    padding:14px 15px;
    border:1px solid rgba(255,255,255,.07);
    border-radius:14px;
    background:rgba(255,255,255,.025);
  }

  .calc-setting span{
    display:block;
    margin-bottom:6px;
    color:var(--muted);
    font-size:10px;
  }

  .calc-setting b{
    display:block;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    font-size:14px;
  }

  .calc-hour-card{
    padding:20px;
    border:1px solid rgba(215,255,17,.18);
    border-radius:18px;
    background:
      linear-gradient(
        145deg,
        rgba(215,255,17,.09),
        rgba(255,255,255,.025)
      );
  }

  .calc-hour-card span{
    display:block;
    margin-bottom:6px;
    color:var(--muted);
    font-size:10px;
    text-transform:uppercase;
    letter-spacing:.08em;
  }

  .calc-hour-card strong{
    display:block;
    color:var(--lime);
    font-size:29px;
    line-height:1.1;
    letter-spacing:-.04em;
  }

  .calc-hour-card .secondary{
    width:100%;
    margin-top:15px;
  }

  /* =========================
     PRODUTOS
  ========================= */

  .calc-products{
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:16px;
  }

  .calc-product{
    position:relative;
    overflow:hidden;
    padding:0;
    border:1px solid rgba(255,255,255,.08);
    border-radius:20px;
    background:#111414;
    color:#fff;
    text-align:left;
    cursor:pointer;
    transition:
      transform .2s ease,
      border-color .2s ease,
      box-shadow .2s ease;
  }

  .calc-product:hover{
    transform:translateY(-3px);
    border-color:rgba(215,255,17,.30);
    box-shadow:0 15px 35px rgba(0,0,0,.18);
  }

  .calc-product-image{
    height:185px;
    display:grid;
    place-items:center;
    overflow:hidden;
    background:
      radial-gradient(
        circle at 50% 20%,
        rgba(215,255,17,.06),
        transparent 45%
      ),
      linear-gradient(135deg,#202421,#101212);
  }

  .calc-product-image img{
    width:100%;
    height:100%;
    object-fit:cover;
    display:block;
  }

  .calc-product-placeholder{
    display:grid;
    place-items:center;
    gap:8px;
    color:var(--muted-2);
    font-size:11px;
  }

  .calc-product-body{
    display:grid;
    gap:10px;
    padding:17px;
  }

  .calc-product-top{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
  }

  .calc-category{
    display:inline-flex;
    width:max-content;
    max-width:75%;
    padding:5px 9px;
    border:1px solid rgba(255,255,255,.06);
    border-radius:999px;
    background:#202420;
    color:var(--muted);
    font-size:9px;
    font-weight:700;
  }

  .calc-product-body h3{
    margin:0;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    font-size:17px;
    letter-spacing:-.02em;
  }

  .calc-product-meta{
    display:flex;
    justify-content:space-between;
    gap:10px;
    color:var(--muted);
    font-size:10px;
  }

  .calc-product-meta span{
    min-width:0;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }

  .calc-product-price{
    display:flex;
    align-items:flex-end;
    justify-content:space-between;
    gap:10px;
    padding-top:11px;
    border-top:1px solid rgba(255,255,255,.07);
  }

  .calc-product-price span{
    color:var(--muted);
    font-size:9px;
  }

  .calc-product-price strong{
    color:var(--lime);
    font-size:19px;
    letter-spacing:-.03em;
  }

  .calc-empty{
    display:grid;
    justify-items:center;
    gap:10px;
    padding:55px 20px;
    border:1px dashed rgba(255,255,255,.12);
    border-radius:18px;
    color:var(--muted);
    text-align:center;
  }

  /* =========================
     MODAL
  ========================= */

  .calc-modal{
    width:min(1120px,calc(100vw - 32px));
    max-height:calc(100vh - 32px);
    overflow:auto;
    padding:26px;
    border-radius:22px;
  }

  .calc-modal-head{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:18px;
    margin-bottom:20px;
  }

  .calc-modal-head h2{
    margin:0;
    font-size:25px;
    letter-spacing:-.035em;
  }

  .calc-modal-head p{
    margin:5px 0 0;
    color:var(--muted);
    font-size:11px;
    line-height:1.5;
  }

  /* =========================
     ETAPAS
  ========================= */

  .calc-step{
    position:relative;
    padding:20px;
    margin-bottom:13px;
    border:1px solid rgba(255,255,255,.075);
    border-radius:18px;
    background:#111414;
  }

  .calc-step-title{
    display:flex;
    align-items:center;
    gap:11px;
    margin-bottom:17px;
  }

  .calc-step-number{
    flex:0 0 32px;
    width:32px;
    height:32px;
    display:grid;
    place-items:center;
    border-radius:10px;
    background:var(--lime);
    color:#101310;
    font-size:10px;
    font-weight:900;
  }

  .calc-step-title h3{
    margin:0;
    font-size:15px;
    letter-spacing:-.015em;
  }

  .calc-step-title span{
    display:block;
    margin-top:3px;
    color:var(--muted);
    font-size:10px;
  }

  /* =========================
     PRODUTO + FOTO
  ========================= */

  .calc-product-head{
    display:grid;
    grid-template-columns:170px minmax(0,1fr);
    gap:22px;
    align-items:start;
  }

  .calc-photo{
    position:relative;
    height:170px;
    overflow:hidden;
    border:1px solid rgba(255,255,255,.09);
    border-radius:17px;
    background:#202420;
  }

  .calc-photo img{
    width:100%;
    height:100%;
    display:block;
    object-fit:cover;
  }

  .calc-photo-empty{
    height:100%;
    display:grid;
    place-items:center;
    align-content:center;
    gap:8px;
    padding:12px;
    color:var(--muted);
    font-size:10px;
    text-align:center;
  }

  .calc-photo-upload{
    position:absolute;
    right:8px;
    bottom:8px;
    left:8px;
  }

  .calc-photo-upload label{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:6px;
    padding:8px;
    border:1px solid rgba(255,255,255,.12);
    border-radius:10px;
    background:rgba(10,12,12,.90);
    color:#fff;
    font-size:10px;
    cursor:pointer;
    backdrop-filter:blur(8px);
  }

  .calc-photo-upload input{
    display:none;
  }

  /* =========================
     INGREDIENTES
  ========================= */

  .calc-ingredients{
    display:grid;
    gap:8px;
  }

  .calc-ingredient{
    display:grid;
    grid-template-columns:minmax(200px,1fr) 130px 130px 42px;
    gap:10px;
    align-items:end;
    padding:11px;
    border:1px solid rgba(255,255,255,.06);
    border-radius:13px;
    background:#0c0f0f;
  }

  .calc-ingredient .field{
    min-width:0;
  }

  /* =========================
     CUSTOS
  ========================= */

  .calc-cost-grid{
    display:grid;
    grid-template-columns:repeat(4,minmax(0,1fr));
    gap:10px;
  }

  .calc-cost-card{
    min-width:0;
    padding:16px;
    border:1px solid rgba(255,255,255,.07);
    border-radius:14px;
    background:#0c0f0f;
  }

  .calc-cost-card span{
    display:block;
    margin-bottom:7px;
    color:var(--muted);
    font-size:9px;
  }

  .calc-cost-card strong{
    font-size:17px;
    letter-spacing:-.02em;
  }

  .calc-cost-card.highlight{
    border-color:rgba(215,255,17,.28);
    background:
      linear-gradient(
        135deg,
        rgba(215,255,17,.08),
        rgba(215,255,17,.02)
      );
  }

  .calc-cost-card.highlight strong{
    color:var(--lime);
  }

  /* =========================
     RESUMO
  ========================= */

  .calc-summary{
    display:grid;
    grid-template-columns:1.25fr repeat(3,1fr);
    gap:10px;
  }

  .calc-summary-card{
    min-width:0;
    padding:15px;
    border:1px solid rgba(255,255,255,.07);
    border-radius:14px;
    background:#111414;
  }

  .calc-summary-card span{
    display:block;
    overflow:hidden;
    margin-bottom:6px;
    color:var(--muted);
    font-size:9px;
    text-overflow:ellipsis;
    white-space:nowrap;
  }

  .calc-summary-card strong{
    display:block;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    font-size:16px;
  }

  /* =========================
     PREÇOS
  ========================= */

  .calc-price-grid{
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:12px;
    margin-top:15px;
  }

  .calc-price-card{
    min-width:0;
    padding:19px;
    border:1px solid rgba(255,255,255,.07);
    border-radius:16px;
    background:#0c0f0f;
  }

  .calc-price-card span{
    display:block;
    margin-bottom:8px;
    color:var(--muted);
    font-size:9px;
  }

  .calc-price-card strong{
    display:block;
    overflow:hidden;
    color:#fff;
    font-size:24px;
    line-height:1;
    letter-spacing:-.04em;
    text-overflow:ellipsis;
    white-space:nowrap;
  }

  .calc-price-card.featured{
    position:relative;
    overflow:hidden;
    border-color:rgba(215,255,17,.30);
    background:
      radial-gradient(
        circle at 100% 0%,
        rgba(215,255,17,.13),
        transparent 45%
      ),
      linear-gradient(
        135deg,
        rgba(215,255,17,.10),
        rgba(215,255,17,.025)
      );
  }

  .calc-price-card.main::after{
    content:'RECOMENDADO';
    position:absolute;
    top:10px;
    right:10px;
    padding:4px 6px;
    border-radius:999px;
    background:rgba(215,255,17,.12);
    color:var(--lime);
    font-size:7px;
    font-weight:900;
    letter-spacing:.08em;
  }

  .calc-price-card.featured strong{
    color:var(--lime);
  }

  /* =========================
     IFOOD
  ========================= */

  .calc-ifood{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:12px;
    margin-top:12px;
  }

  .calc-ifood-card{
    min-width:0;
    padding:17px;
    border:1px solid rgba(255,255,255,.07);
    border-radius:16px;
    background:#0c0f0f;
    transition:
      border-color .2s ease,
      background .2s ease,
      transform .2s ease;
  }

  .calc-ifood-card:hover{
    transform:translateY(-1px);
    border-color:rgba(215,255,17,.25);
  }

  .calc-ifood-card>div{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
  }

  .calc-ifood-card span{
    color:var(--muted);
    font-size:10px;
    font-weight:700;
  }

  .calc-ifood-card strong{
    color:var(--lime);
    font-size:20px;
    letter-spacing:-.03em;
  }

  .calc-ifood-card small{
    display:block;
    margin-top:7px;
    color:var(--muted-2);
    font-size:9px;
  }

  /* =========================
     AÇÕES
  ========================= */

  .calc-modal-actions{
    position:sticky;
    bottom:0;
    z-index:10;
    display:flex;
    justify-content:flex-end;
    gap:10px;
    padding-top:18px;
    background:
      linear-gradient(
        to bottom,
        transparent,
        #0b0d0d 25%
      );
  }

  /* =========================
     TABLET
  ========================= */

  @media(max-width:1000px){

    .calc-products{
      grid-template-columns:repeat(2,minmax(0,1fr));
    }

    .calc-hero-grid{
      grid-template-columns:1fr;
    }

    .calc-hour-card{
      max-width:320px;
    }

    .calc-settings{
      grid-template-columns:repeat(3,minmax(0,1fr));
    }

    .calc-cost-grid{
      grid-template-columns:repeat(2,minmax(0,1fr));
    }

    .calc-summary{
      grid-template-columns:repeat(2,minmax(0,1fr));
    }
  }

  /* =========================
     CELULAR
  ========================= */

  @media(max-width:700px){

    .calc-page{
      gap:16px;
    }

    .calc-toolbar{
      grid-template-columns:1fr;
      gap:10px;
    }

    .calc-search{
      max-width:none;
    }

    .calc-actions{
      display:grid;
      grid-template-columns:1fr 1fr;
      width:100%;
    }

    .calc-actions select,
    .calc-actions .primary{
      width:100%;
      min-width:0;
    }

    .calc-hero{
      padding:20px;
      border-radius:19px;
    }

    .calc-hero h2{
      font-size:25px;
    }

    .calc-hero p{
      font-size:12px;
    }

    .calc-settings{
      grid-template-columns:1fr;
      gap:8px;
    }

    .calc-hour-card{
      max-width:none;
    }

    .calc-products{
      grid-template-columns:1fr;
    }

    .calc-product-image{
      height:210px;
    }

    .calc-modal{
      width:calc(100vw - 14px);
      max-height:calc(100vh - 14px);
      padding:16px;
      border-radius:18px;
    }

    .calc-modal-head{
      margin-bottom:15px;
    }

    .calc-modal-head h2{
      font-size:21px;
    }

    .calc-step{
      padding:14px;
      border-radius:15px;
    }

    .calc-step-title{
      align-items:flex-start;
    }

    .calc-step-title h3{
      font-size:14px;
    }

    .calc-product-head{
      grid-template-columns:1fr;
      gap:14px;
    }

    .calc-photo{
      height:230px;
    }

    .calc-ingredient{
      grid-template-columns:1fr 1fr;
      gap:8px;
    }

    .calc-ingredient .field:first-child{
      grid-column:1/-1;
    }

    .calc-ingredient .icon-button{
      min-height:42px;
    }

    .calc-cost-grid,
    .calc-price-grid,
    .calc-ifood,
    .calc-summary{
      grid-template-columns:1fr;
    }

    .calc-price-card strong{
      font-size:22px;
    }

    .calc-ifood-card>div{
      align-items:flex-start;
    }

    .calc-modal-actions{
      display:grid;
      grid-template-columns:1fr 1fr;
    }

    .calc-modal-actions button{
      width:100%;
    }
  }

  /* =========================
     CELULAR PEQUENO
  ========================= */

  @media(max-width:420px){

    .calc-actions{
      grid-template-columns:1fr;
    }

    .calc-product-image{
      height:190px;
    }

    .calc-photo{
      height:200px;
    }

    .calc-ingredient{
      grid-template-columns:1fr;
    }

    .calc-ingredient .field:first-child{
      grid-column:auto;
    }

    .calc-modal-actions{
      grid-template-columns:1fr;
    }
  }
`}</style>

    <div className="calc-page">

      <div className="calc-toolbar">
        <div className="calc-search">
          <div className="search-box">
            <Search size={17}/>
            <input
              value={query}
              onChange={e=>setQuery(e.target.value)}
              placeholder="Buscar produto ou receita..."
            />
          </div>
        </div>

        <div className="calc-actions">
          <select
            value={category}
            onChange={e=>setCategory(e.target.value)}
          >
            <option value="Todas">
              Todas as categorias
            </option>

            {CATEGORIES.map(c=>
              <option key={c} value={c}>
                {c}
              </option>
            )}
          </select>

          <button
            className="primary"
            onClick={openNew}
          >
            <Plus size={17}/>
            Nova calculadora
          </button>
        </div>
      </div>

      <section className="calc-hero">
        <div className="calc-hero-grid">

          <div>
            <div className="calc-eyebrow">
              Calculadora de preço
            </div>

            <h2>
              Descubra quanto realmente custa
              o seu produto.
            </h2>

            <p>
              Considere ingredientes, sua hora de trabalho,
              custos adicionais e margem de lucro antes de
              definir o preço de venda.
            </p>

            <div className="calc-settings">

              <div className="calc-setting">
                <span>Renda mensal desejada</span>
                <b>
                  {money(profile?.desired_monthly_income)}
                </b>
              </div>

              <div className="calc-setting">
                <span>Jornada</span>
                <b>
                  {profile?.work_hours_per_day||0}h/dia
                  {' • '}
                  {profile?.work_days_per_week||0} dias
                </b>
              </div>

              <div className="calc-setting">
                <span>Sua hora de trabalho</span>
                <b>
                  {money(hourlyRate)}
                </b>
              </div>

            </div>
          </div>

          <div className="calc-hour-card">
            <span>Valor da sua hora</span>
            <strong>{money(hourlyRate)}</strong>

            <button
              className="secondary"
              style={{
                width:'100%',
                marginTop:14
              }}
              onClick={saveLaborSettings}
              disabled={savingLabor}
            >
              {savingLabor
                ? 'Salvando…'
                : 'Salvar configuração'}
            </button>
          </div>

        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <h2>Seus produtos</h2>
            <span>
              {filtered.length} produtos encontrados
            </span>
          </div>
        </div>

        {filtered.length ? (

          <div className="calc-products">

            {filtered.map(r=>
              <article
                key={r.id}
                className="calc-product"
                onClick={()=>openEdit(r)}
              >

                <div className="calc-product-image">

                  {r.photo_url ? (
                    <img
                      src={r.photo_url}
                      alt={r.name}
                    />
                  ) : (
                    <div className="calc-product-placeholder">
                      <CakeSlice size={32}/>
                      <span>
                        Adicione uma foto
                      </span>
                    </div>
                  )}

                </div>

                <div className="calc-product-body">

                  <div className="calc-product-top">
                    <span className="calc-category">
                      {r.category}
                    </span>

                    <button
                      type="button"
                      className="icon-button danger"
                      onClick={e=>{
                        e.stopPropagation();
                        remove(r.id);
                      }}
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>

                  <h3>{r.name}</h3>

                  <div className="calc-product-meta">
                    <span>
                      Rendimento:
                      {' '}
                      {r.yield_amount}
                      {' '}
                      {r.yield_unit}
                    </span>

                    <span>
                      Custo:
                      {' '}
                      {money(r.cost)}
                    </span>
                  </div>

                  <div className="calc-product-price">
                    <span>Preço sugerido</span>
                    <strong>
                      {money(r.suggested_price)}
                    </strong>
                  </div>

                </div>

              </article>
            )}

          </div>

        ) : (

          <div className="calc-empty">
            <CakeSlice size={34}/>
            <p>
              Nenhum produto cadastrado ainda.
            </p>

            <button
              className="primary"
              onClick={openNew}
            >
              <Plus size={16}/>
              Criar primeira calculadora
            </button>
          </div>

        )}

      </section>

    </div>

    {open&&
      <div
        className="modal-bg"
        onMouseDown={e=>{
          if(e.target===e.currentTarget){
            setOpen(false);
          }
        }}
      >

        <div className="modal calc-modal">

          <div className="calc-modal-head">
            <div>
              <h2>
                {editing
                  ? 'Editar calculadora'
                  : 'Nova calculadora'}
              </h2>

              <p>
                Monte o custo completo e descubra
                quanto cobrar.
              </p>
            </div>

            <button
              type="button"
              className="icon-button"
              onClick={()=>setOpen(false)}
            >
              <X size={18}/>
            </button>
          </div>

          <form
            className="form"
            onSubmit={save}
          >

            {/* ETAPA 1 */}

            <section className="calc-step">

              <div className="calc-step-title">
                <div className="calc-step-number">
                  01
                </div>

                <div>
                  <h3>Produto</h3>
                  <span>
                    Nome, categoria, foto e rendimento.
                  </span>
                </div>
              </div>

              <div className="calc-product-head">

                <div className="calc-photo">

                  {form.photo_url ? (
                    <img
                      src={form.photo_url}
                      alt={form.name||'Produto'}
                    />
                  ) : (
                    <div className="calc-photo-empty">
                      <ImagePlus size={30}/>
                      <span>
                        Adicione a foto do produto
                      </span>
                    </div>
                  )}

                  <div className="calc-photo-upload">
                    <label>
                      <ImagePlus size={13}/>
                      {uploading
                        ? 'Enviando…'
                        : 'Adicionar foto'}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={upload}
                        disabled={uploading}
                      />
                    </label>
                  </div>

                </div>

                <div className="form-grid two">

                  <Field label="Nome do produto">
                    <input
                      required
                      value={form.name}
                      onChange={e=>
                        setF('name',e.target.value)
                      }
                      placeholder="Ex.: Bolo de chocolate"
                    />
                  </Field>

                  <Field label="Categoria">
                    <select
                      value={form.category}
                      onChange={e=>
                        setF('category',e.target.value)
                      }
                    >
                      {CATEGORIES.map(c=>
                        <option key={c}>
                          {c}
                        </option>
                      )}
                    </select>
                  </Field>

                  <Field label="Rendimento">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.yield_amount}
                      onChange={e=>
                        setF(
                          'yield_amount',
                          e.target.value
                        )
                      }
                    />
                  </Field>

                  <Field label="Unidade">
                    <select
                      value={form.yield_unit}
                      onChange={e=>
                        setF(
                          'yield_unit',
                          e.target.value
                        )
                      }
                    >
                      <option value="un">
                        Unidade
                      </option>
                      <option value="fatia">
                        Fatia
                      </option>
                      <option value="kg">
                        Kg
                      </option>
                      <option value="g">
                        Gramas
                      </option>
                      <option value="ml">
                        Ml
                      </option>
                    </select>
                  </Field>

                  <Field label="Tamanho da porção">
                    <input
                      value={form.portion_size}
                      onChange={e=>
                        setF(
                          'portion_size',
                          e.target.value
                        )
                      }
                      placeholder="Ex.: 100 g"
                    />
                  </Field>

                  <Field label="Tempo de produção">
                    <input
                      type="number"
                      min="0"
                      value={form.prep_time_minutes}
                      onChange={e=>
                        setF(
                          'prep_time_minutes',
                          e.target.value
                        )
                      }
                      placeholder="Ex.: 120"
                    />
                  </Field>

                </div>

              </div>

            </section>

            {/* ETAPA 2 */}

            <section className="calc-step">

              <div className="calc-step-title">
                <div className="calc-step-number">
                  02
                </div>

                <div>
                  <h3>Ingredientes</h3>
                  <span>
                    Os valores são puxados da sua Despensa.
                  </span>
                </div>
              </div>

              <div className="calc-ingredients">

                {(form.ingredients||[]).map(item=>{

                  const selected=
                    ingredientsCatalog.find(
                      x=>x.id===item.ingredient_id
                    );

                  const cost=
                    ingredientCost(item);

                  return (
                    <div
                      className="calc-ingredient"
                      key={item.id}
                    >

                      <Field label="Ingrediente">
                        <select
                          value={
                            item.ingredient_id||''
                          }
                          onChange={e=>
                            selectIngredient(
                              e.target.value,
                              item.id
                            )
                          }
                        >
                          <option value="">
                            Selecione da Despensa
                          </option>

                          {ingredientsCatalog.map(i=>
                            <option
                              key={i.id}
                              value={i.id}
                            >
                              {i.name}
                            </option>
                          )}
                        </select>
                      </Field>

                      <Field
                        label={
                          selected?.base_unit
                            ? `Quantidade (${selected.base_unit})`
                            : 'Quantidade'
                        }
                      >
                        <input
                          type="number"
                          min="0"
                          step="0.001"
                          value={item.quantity}
                          onChange={e=>
                            updateIngredient(
                              item.id,
                              'quantity',
                              e.target.value
                            )
                          }
                        />
                      </Field>

                      <Field label="Custo">
                        <input
                          readOnly
                          value={money(cost)}
                        />
                      </Field>

                      <button
                        type="button"
                        className="icon-button danger"
                        onClick={()=>
                          removeIngredient(item.id)
                        }
                      >
                        <Trash2 size={15}/>
                      </button>

                    </div>
                  );
                })}

              </div>

              <button
                type="button"
                className="secondary"
                style={{marginTop:12}}
                onClick={addIngredient}
              >
                <Plus size={15}/>
                Adicionar ingrediente
              </button>

              {!ingredientsCatalog.length&&
                <div className="mini-note">
                  Cadastre os ingredientes primeiro
                  na Despensa.
                </div>
              }

            </section>

            {/* ETAPA 3 */}

            <section className="calc-step">

              <div className="calc-step-title">
                <div className="calc-step-number">
                  03
                </div>

                <div>
                  <h3>Custos adicionais</h3>
                  <span>
                    Inclua gastos que também fazem parte
                    da produção.
                  </span>
                </div>
              </div>

              <div className="form-grid two">

                <Field label="Embalagem">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={additionalCosts.packaging}
                    onChange={e=>
                      setAdditional(
                        'packaging',
                        e.target.value
                      )
                    }
                    placeholder="R$ 0,00"
                  />
                </Field>

                <Field label="Energia / gás">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={additionalCosts.energy}
                    onChange={e=>
                      setAdditional(
                        'energy',
                        e.target.value
                      )
                    }
                    placeholder="R$ 0,00"
                  />
                </Field>

                <Field label="Entrega / deslocamento">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={additionalCosts.delivery}
                    onChange={e=>
                      setAdditional(
                        'delivery',
                        e.target.value
                      )
                    }
                    placeholder="R$ 0,00"
                  />
                </Field>

                <Field label="Outros custos">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={additionalCosts.other}
                    onChange={e=>
                      setAdditional(
                        'other',
                        e.target.value
                      )
                    }
                    placeholder="R$ 0,00"
                  />
                </Field>

              </div>

            </section>

            {/* ETAPA 4 */}

            <section className="calc-step">

              <div className="calc-step-title">
                <div className="calc-step-number">
                  04
                </div>

                <div>
                  <h3>Seu custo real</h3>
                  <span>
                    Ingredientes + mão de obra + custos adicionais.
                  </span>
                </div>
              </div>

              <div className="calc-cost-grid">

                <div className="calc-cost-card">
                  <span>Ingredientes</span>
                  <strong>
                    {money(calc.ingredientTotal)}
                  </strong>
                </div>

                <div className="calc-cost-card">
                  <span>Mão de obra</span>
                  <strong>
                    {money(calc.laborCost)}
                  </strong>
                </div>

                <div className="calc-cost-card">
                  <span>Custos adicionais</span>
                  <strong>
                    {money(calc.additionalTotal)}
                  </strong>
                </div>

                <div className="calc-cost-card highlight">
                  <span>Custo total</span>
                  <strong>
                    {money(calc.totalCost)}
                  </strong>
                </div>

              </div>

              <div
                className="calc-summary"
                style={{marginTop:10}}
              >

                <div className="calc-summary-card">
                  <span>
                    Custo por unidade
                  </span>
                  <strong>
                    {money(calc.unitCost)}
                  </strong>
                </div>

                <div className="calc-summary-card">
                  <span>
                    Tempo de produção
                  </span>
                  <strong>
                    {calc.prepMinutes} min
                  </strong>
                </div>

                <div className="calc-summary-card">
                  <span>
                    Sua hora
                  </span>
                  <strong>
                    {money(hourlyRate)}
                  </strong>
                </div>

                <div className="calc-summary-card">
                  <span>
                    Rendimento
                  </span>
                  <strong>
                    {form.yield_amount||0}
                    {' '}
                    {form.yield_unit}
                  </strong>
                </div>

              </div>

            </section>

            {/* ETAPA 5 */}

            <section className="calc-step">

              <div className="calc-step-title">
                <div className="calc-step-number">
                  05
                </div>

                <div>
                  <h3>Preço</h3>
                  <span>
                    Defina sua margem e veja diferentes
                    formas de precificar.
                  </span>
                </div>
              </div>

              <div className="form-grid two">

                <Field label="Margem desejada (%)">
                  <input
                    type="number"
                    min="0"
                    max="99.99"
                    step="0.01"
                    value={form.desired_margin}
                    onChange={e=>
                      setF(
                        'desired_margin',
                        e.target.value
                      )
                    }
                  />
                </Field>

                <Field label="Preço que você vai cobrar">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.sale_price}
                    onChange={e=>
                      setF(
                        'sale_price',
                        e.target.value
                      )
                    }
                    placeholder={
                      money(calc.psychologicalPrice)
                    }
                  />
                </Field>

              </div>

              <div className="calc-price-grid">

              <div className="calc-price-card featured">
                  <span>
                    Preço sugerido
                  </span>
                  <strong>
                    {money(calc.suggestedPrice)}
                  </strong>
                </div>

                <div className="calc-price-card">
                  <span>
                    Preço arredondado
                  </span>
                  <strong>
                    {money(calc.roundedPrice)}
                  </strong>
                </div>

                <div className="calc-price-card">
                  <span>
                    Preço psicológico
                  </span>
                  <strong>
                    {money(calc.psychologicalPrice)}
                  </strong>
                </div>

              </div>

        <div className="calc-ifood">

  <button
    type="button"
    className="calc-ifood-card"
    onClick={()=>setIfoodRate(0.152)}
    style={{
      cursor:'pointer',
      textAlign:'left',
      width:'100%',
      background:ifoodRate===0.152
        ? 'rgba(215,255,17,.12)'
        : undefined,
      borderColor:ifoodRate===0.152
        ? 'rgba(215,255,17,.55)'
        : undefined
    }}
  >
    <div>
      <span>
        iFood • 15,2%
      </span>

      <strong>
        {money(calc.ifoodBasic)}
      </strong>
    </div>

    <small>
      Clique para selecionar esta taxa
    </small>
  </button>

  <button
    type="button"
    className="calc-ifood-card"
    onClick={()=>setIfoodRate(0.262)}
    style={{
      cursor:'pointer',
      textAlign:'left',
      width:'100%',
      background:ifoodRate===0.262
        ? 'rgba(215,255,17,.12)'
        : undefined,
      borderColor:ifoodRate===0.262
        ? 'rgba(215,255,17,.55)'
        : undefined
    }}
  >
    <div>
      <span>
        iFood • 26,2%
      </span>

      <strong>
        {money(calc.ifoodDelivery)}
      </strong>
    </div>

    <small>
      Clique para selecionar esta taxa
    </small>
  </button>

</div>

            </section>

            {/* ETAPA 6 */}

            <section className="calc-step">

              <div className="calc-step-title">
                <div className="calc-step-number">
                  06
                </div>

                <div>
                  <h3>Resumo</h3>
                  <span>
                    Confira tudo antes de salvar.
                  </span>
                </div>
              </div>

              <div className="calc-summary">

                <div className="calc-summary-card">
                  <span>Produto</span>
                  <strong>
                    {form.name||'—'}
                  </strong>
                </div>

                <div className="calc-summary-card">
                  <span>Custo total</span>
                  <strong>
                    {money(calc.totalCost)}
                  </strong>
                </div>

                <div className="calc-summary-card">
                  <span>Margem</span>
                  <strong>
                    {Number(form.desired_margin||0).toFixed(1)}%
                  </strong>
                </div>

                <div className="calc-summary-card">
                  <span>Preço final sugerido</span>
                  <strong>
                    {money(
                      calc.psychologicalPrice
                    )}
                  </strong>
                </div>

              </div>

            </section>

            <section className="calc-step">

              <div className="form-grid two">

                <Field label="Modo de preparo">
                  <textarea
                    rows="5"
                    value={form.preparation}
                    onChange={e=>
                      setF(
                        'preparation',
                        e.target.value
                      )
                    }
                  />
                </Field>

                <Field label="Observações">
                  <textarea
                    rows="5"
                    value={form.notes}
                    onChange={e=>
                      setF(
                        'notes',
                        e.target.value
                      )
                    }
                  />
                </Field>

              </div>

            </section>

            <div className="calc-modal-actions">

              <button
                type="button"
                className="secondary"
                onClick={()=>setOpen(false)}
              >
                Cancelar
              </button>

              <button className="primary">
                {editing
                  ? 'Salvar alterações'
                  : 'Salvar calculadora'}
              </button>

            </div>

          </form>

        </div>

      </div>
    }

  </>;
}

/* =========================================================
   PEDIDOS
========================================================= */

function Orders({session,notify}){
  const blank={client_name:'',client_phone:'',item_name:'',delivery_date:'',
    delivery_time:'',value:'',deposit:'',payment_method:'Pix',status:'Pendente',notes:''};
  const [rows,setRows]=useState([]);
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState(blank);
  const [query,setQuery]=useState('');

  async function load(){
    const {data,error}=await supabase.from('orders').select('*').order('delivery_date',{ascending:true});
    if(error)notify(error.message);else setRows(data||[]);
  }
  useEffect(()=>{load()},[]);

  function openNew(){setEditing(null);setForm(blank);setOpen(true);}
  function edit(r){setEditing(r);setForm({...blank,...r});setOpen(true);}
  async function save(e){
    e.preventDefault();
    const payload={user_id:session.user.id,client_name:form.client_name.trim(),
      client_phone:form.client_phone||null,item_name:form.item_name.trim(),
      delivery_date:form.delivery_date||null,delivery_time:form.delivery_time||null,
      value:Number(form.value)||0,deposit:Number(form.deposit)||0,
      payment_method:form.payment_method,status:form.status,notes:form.notes||null};
    const res=editing?await supabase.from('orders').update(payload).eq('id',editing.id):
      await supabase.from('orders').insert(payload);
    if(res.error)notify(res.error.message);
    else{setOpen(false);notify(editing?'Pedido atualizado.':'Pedido cadastrado.');load();}
  }
  async function remove(r){
    if(!confirm(`Excluir o pedido de ${r.client_name}?`))return;
    const {error}=await supabase.from('orders').delete().eq('id',r.id);
    if(error)notify(error.message);else{notify('Pedido excluído.');load();}
  }

  const filtered=rows.filter(r=>!query||
    `${r.client_name} ${r.item_name}`.toLowerCase().includes(query.toLowerCase()));

  return <>
    <div className="page-tools standard-page-tools">
      <div className="standard-search-wrap"><div className="search-box"><Search size={17}/>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar cliente ou pedido..."/>
      </div></div>
      <div className="standard-actions"><button className="primary" onClick={openNew}><Plus size={17}/> Novo pedido</button></div>
    </div>
    <section className="panel orders-page-panel">
      <div className="section-head"><div><h2>Agenda de pedidos</h2><span>{filtered.length} pedidos</span></div></div>
      {filtered.length?<div className="table-wrap">
        <table><thead><tr><th>Cliente</th><th>Pedido</th><th>Entrega</th><th>Valor</th><th>Sinal</th><th>Status</th><th/></tr></thead>
        <tbody>{filtered.map(r=><tr key={r.id}>
          <td><b>{r.client_name}</b><small className="table-sub">{r.client_phone||'Sem WhatsApp'}</small></td>
          <td>{r.item_name}</td>
          <td>{dateBR(r.delivery_date)}{r.delivery_time&&<small className="table-sub">{r.delivery_time}</small>}</td>
          <td>{money(r.value)}</td><td>{money(r.deposit)}</td>
          <td><span className={`pill ${['Pago','Entregue'].includes(r.status)?'ok':''}`}>{r.status}</span></td>
          <td><div className="row-actions"><button className="icon-button" onClick={()=>edit(r)}><Edit3 size={15}/></button>
            <button className="icon-button danger" onClick={()=>remove(r)}><Trash2 size={15}/></button></div></td>
        </tr>)}</tbody></table>
      </div>:<Empty text="Nenhum pedido encontrado." action="Novo pedido" onClick={openNew}/>}
    </section>

    {open&&<Modal open={open} close={()=>setOpen(false)} title={editing?'Editar pedido':'Novo pedido'}>
      <form className="form" onSubmit={save}>
        <div className="form-grid two">
          <Field label="Cliente"><input required value={form.client_name} onChange={e=>setForm({...form,client_name:e.target.value})}/></Field>
          <Field label="WhatsApp"><input value={form.client_phone} onChange={e=>setForm({...form,client_phone:e.target.value})}/></Field>
          <Field label="Produto / pedido"><input required value={form.item_name} onChange={e=>setForm({...form,item_name:e.target.value})}/></Field>
          <Field label="Data de entrega"><input type="date" value={form.delivery_date} onChange={e=>setForm({...form,delivery_date:e.target.value})}/></Field>
          <Field label="Horário"><input type="time" value={form.delivery_time} onChange={e=>setForm({...form,delivery_time:e.target.value})}/></Field>
          <Field label="Valor total"><input type="number" step="0.01" value={form.value} onChange={e=>setForm({...form,value:e.target.value})}/></Field>
          <Field label="Sinal recebido"><input type="number" step="0.01" value={form.deposit} onChange={e=>setForm({...form,deposit:e.target.value})}/></Field>
          <Field label="Forma de pagamento"><select value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})}><option>Pix</option><option>Dinheiro</option><option>Cartão</option><option>Transferência</option><option>A combinar</option></select></Field>
          <Field label="Status"><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{ORDER_STATUS.map(s=><option key={s}>{s}</option>)}</select></Field>
        </div>
        <Field label="Observações"><textarea rows="4" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></Field>
        <div className="modal-actions"><button type="button" className="secondary" onClick={()=>setOpen(false)}>Cancelar</button><button className="primary">Salvar pedido</button></div>
      </form>
    </Modal>}
  </>;
}

/* =========================================================
   FINANÇAS
========================================================= */

function Finance({session,notify}){
  const [orders,setOrders]=useState([]);
  const [expenses,setExpenses]=useState([]);
  const [open,setOpen]=useState(false);
  const [form,setForm]=useState({description:'',category:'Ingredientes',value:'',date:todayISO()});

  async function load(){
    const [o,e]=await Promise.all([
      supabase.from('orders').select('value,deposit,status,delivery_date'),
      supabase.from('expenses').select('*').order('date',{ascending:false}).order('created_at',{ascending:false})
    ]);
    setOrders(o.data||[]);setExpenses(e.data||[]);
  }
  useEffect(()=>{load()},[]);
  const sales=orders.reduce((s,x)=>s+Number(x.value||0),0);
  const received=orders.reduce((s,x)=>s+Number(x.deposit||0),0);
  const exp=expenses.reduce((s,x)=>s+Number(x.value||0),0);

  async function add(e){
    e.preventDefault();
    const {error}=await supabase.from('expenses').insert({
      user_id:session.user.id,description:form.description.trim(),
      category:form.category,value:Number(form.value)||0,date:form.date
    });
    if(error)notify(error.message);
    else{setOpen(false);setForm({description:'',category:'Ingredientes',value:'',date:todayISO()});notify('Despesa lançada.');load();}
  }
  async function remove(id){
    if(!confirm('Excluir esta despesa?'))return;
    const {error}=await supabase.from('expenses').delete().eq('id',id);
    if(error)notify(error.message);else load();
  }

  return <>
    <div className="stats">
      <Stat label="Pedidos registrados" value={money(sales)}/>
      <Stat label="Recebido em sinais" value={money(received)} green/>
      <Stat label="Despesas" value={money(exp)}/>
      <Stat label="Resultado registrado" value={money(received-exp)} green/>
    </div>
    <section className="panel">
      <div className="section-head"><div><h2>Despesas</h2><span>Controle seus custos por categoria.</span></div>
        <button className="primary" onClick={()=>setOpen(true)}><Plus size={16}/> Nova despesa</button>
      </div>
      {expenses.length?<div className="table-wrap"><table><thead><tr><th>Descrição</th><th>Categoria</th><th>Data</th><th>Valor</th><th/></tr></thead>
        <tbody>{expenses.map(e=><tr key={e.id}><td>{e.description}</td><td><span className="pill">{e.category}</span></td><td>{dateBR(e.date)}</td><td>{money(e.value)}</td>
          <td><button className="icon-button danger" onClick={()=>remove(e.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>
        :<Empty text="Nenhuma despesa registrada." action="Nova despesa" onClick={()=>setOpen(true)}/>}
    </section>

    {open&&<Modal open={open} close={()=>setOpen(false)} title="Nova despesa">
      <form className="form" onSubmit={add}>
        <Field label="Descrição"><input required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Ex.: chocolate, caixa, anúncio..."/></Field>
        <div className="form-grid two">
          <Field label="Categoria"><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{EXPENSE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Field>
          <Field label="Valor"><input required type="number" step="0.01" min="0" value={form.value} onChange={e=>setForm({...form,value:e.target.value})}/></Field>
          <Field label="Data"><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></Field>
        </div>
        <div className="modal-actions"><button type="button" className="secondary" onClick={()=>setOpen(false)}>Cancelar</button><button className="primary">Lançar despesa</button></div>
      </form>
    </Modal>}
  </>;
}

/* =========================================================
   DESPENSA — FONTE MESTRA DOS INGREDIENTES
========================================================= */

function Pantry({session,notify}){
  const blank={
    name:'',
    package_quantity:'',
    package_unit:'g',
    package_cost:'',
    unit_family:'weight',
    base_unit:'g',
    quantity:'',
    min_quantity:'0'
  };

  const [rows,setRows]=useState([]);
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState(blank);
  const [query,setQuery]=useState('');

  async function load(){
    const {data,error}=await supabase.from('ingredients').select('*').order('name');
    if(error)notify(error.message);
    else setRows(data||[]);
  }

  useEffect(()=>{load()},[]);

  function openNew(){
    setEditing(null);
    setForm({...blank});
    setOpen(true);
  }

  function edit(r){
    setEditing(r);
    setForm({...blank,...r});
    setOpen(true);
  }

  async function save(e){
    e.preventDefault();

    if(!form.name.trim()){
      notify('Informe o nome do ingrediente.');
      return;
    }

    const packageQuantity=Number(form.package_quantity)||0;
    const packageCost=Number(form.package_cost)||0;
    const selected=UNIT_INFO[form.package_unit]||{
      family:'other',base:form.package_unit||'un',factor:1
    };

    const totalBaseQuantity=packageQuantity*selected.factor;
    const baseUnitCost=totalBaseQuantity>0
      ? packageCost/totalBaseQuantity
      : 0;

    const payload={
      user_id:session.user.id,
      name:form.name.trim(),
      package_quantity:packageQuantity,
      package_unit:form.package_unit,
      package_cost:packageCost,
      unit_family:selected.family,
      base_unit:selected.base,
      base_unit_cost:baseUnitCost,
      quantity:Number(form.quantity)||0,
      min_quantity:Number(form.min_quantity)||0
    };

    const res=editing
      ? await supabase.from('ingredients').update(payload).eq('id',editing.id)
      : await supabase.from('ingredients').insert(payload);

    if(res.error) notify(res.error.message);
    else{
      setOpen(false);
      notify(editing?'Ingrediente atualizado.':'Ingrediente adicionado.');
      load();
    }
  }

  async function remove(id){
    if(!confirm('Excluir este ingrediente?'))return;
    const {error}=await supabase.from('ingredients').delete().eq('id',id);
    if(error)notify(error.message);
    else load();
  }

  const filtered=rows.filter(r=>
    !query||r.name.toLowerCase().includes(query.toLowerCase())
  );

  return <>
    <div className="page-tools standard-page-tools">
      <div className="standard-search-wrap">
        <div className="search-box"><Search size={17}/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar ingrediente..."/>
        </div>
      </div>
      <div className="standard-actions">
        <button className="primary" onClick={openNew}><Plus size={17}/> Novo ingrediente</button>
      </div>
    </div>

    <section className="panel pantry-page-panel">
      <div className="section-head">
        <div><h2>Minha despensa</h2><span>{rows.length} ingredientes cadastrados</span></div>
      </div>

      {filtered.length?<div className="table-wrap">
        <table><thead><tr>
          <th>Ingrediente</th><th>Embalagem</th><th>Custo base</th>
          <th>Estoque</th><th>Mínimo</th><th>Status</th><th/>
        </tr></thead>
        <tbody>{filtered.map(r=>{
          const low=Number(r.quantity||0)<=Number(r.min_quantity||0);
          return <tr key={r.id}>
            <td><b>{r.name}</b></td>
            <td>{r.package_quantity} {r.package_unit}</td>
            <td>{money(r.base_unit_cost)} / {r.base_unit||r.package_unit}</td>
            <td>{r.quantity} {r.base_unit||r.package_unit}</td>
            <td>{r.min_quantity} {r.base_unit||r.package_unit}</td>
            <td><span className={`pill ${low?'warning':'ok'}`}>{low?'Repor':'OK'}</span></td>
            <td><div className="row-actions">
              <button className="icon-button" onClick={()=>edit(r)}><Edit3 size={15}/></button>
              <button className="icon-button danger" onClick={()=>remove(r.id)}><Trash2 size={15}/></button>
            </div></td>
          </tr>;
        })}</tbody></table>
      </div>:<Empty text="Sua despensa está vazia." action="Novo ingrediente" onClick={openNew}/>}
    </section>

    {open&&<Modal open={open} close={()=>setOpen(false)} title={editing?'Editar ingrediente':'Novo ingrediente'}>
      <form className="form" onSubmit={save}>
        <Field label="Ingrediente">
          <input required value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})}
            placeholder="Ex.: Chocolate"/>
        </Field>

        <div className="form-grid two">
          <Field label="Quantidade da embalagem">
            <input type="number" min="0" step="0.001"
              value={form.package_quantity}
              onChange={e=>setForm({...form,package_quantity:e.target.value})}
              placeholder="Ex.: 1000"/>
          </Field>

          <Field label="Unidade da embalagem">
            <select value={form.package_unit}
              onChange={e=>setForm({...form,package_unit:e.target.value})}>
              <option value="g">g — gramas</option>
              <option value="kg">kg — quilos</option>
              <option value="ml">ml — mililitros</option>
              <option value="l">L — litros</option>
              <option value="un">un — unidade</option>
              <option value="pacote">pacote</option>
              <option value="caixa">caixa</option>
            </select>
          </Field>

          <Field label="Preço da embalagem">
            <input type="number" min="0" step="0.01"
              value={form.package_cost}
              onChange={e=>setForm({...form,package_cost:e.target.value})}
              placeholder="R$ 0,00"/>
          </Field>

          <Field label="Estoque disponível">
            <input type="number" min="0" step="0.001"
              value={form.quantity}
              onChange={e=>setForm({...form,quantity:e.target.value})}
              placeholder="Ex.: 2000"/>
          </Field>

          <Field label="Estoque mínimo">
            <input type="number" min="0" step="0.001"
              value={form.min_quantity}
              onChange={e=>setForm({...form,min_quantity:e.target.value})}
              placeholder="Ex.: 500"/>
          </Field>
        </div>

        <div className="mini-note">
          O Confeasy calcula automaticamente o custo por unidade base.
          Ex.: 1 kg por R$ 37,00 = R$ 0,037 por grama.
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary" onClick={()=>setOpen(false)}>Cancelar</button>
          <button className="primary">Salvar ingrediente</button>
        </div>
      </form>
    </Modal>}
  </>;
}

/* =========================================================
   MARKETING
========================================================= */

function Marketing({profile,setPage}){

  const [activeTab,setActiveTab]=useState('assistant');
  const [message,setMessage]=useState('');
  const [messages,setMessages]=useState([
    {
      role:'ai',
      text:`Olá, ${profile?.full_name?.split(' ')[0]||'confeiteira'}! Sou a assistente da sua confeitaria. Posso ajudar você com receitas, marketing, promoções, clientes e muito mais.`
    }
  ]);

  const [format,setFormat]=useState('Feed');
  const [style,setStyle]=useState('Elegante');
  const [artText,setArtText]=useState(
    'Bolos feitos para momentos especiais'
  );

  function sendMessage(e){
    e?.preventDefault();

    const text=message.trim();

    if(!text)return;

    setMessages(prev=>[
      ...prev,
      {
        role:'user',
        text
      },
      {
        role:'ai',
        text:'Perfeito! Vou considerar isso na criação. Em breve esta conversa estará conectada à IA do Confeasy para gerar respostas, campanhas, receitas e conteúdos personalizados.'
      }
    ]);

    setMessage('');
  }

  function quickMessage(text){
    setMessages(prev=>[
      ...prev,
      {
        role:'user',
        text
      },
      {
        role:'ai',
        text:'Ótimo! Posso transformar essa ideia em um conteúdo completo para sua confeitaria.'
      }
    ]);
  }

  function openCreator(){
    setActiveTab('create');
  }

  const quickActions=[
    {
      title:'Criar publicação',
      description:'Post pronto para Instagram',
      icon:Smartphone,
      action:openCreator
    },
    {
      title:'Criar uma arte',
      description:'Escolha produto, formato e estilo',
      icon:Image,
      action:openCreator
    },
    {
      title:'Criar legenda',
      description:'Texto com CTA para vender',
      icon:FileText,
      action:openCreator
    },
    {
      title:'Criar Stories',
      description:'Sequência de Stories para divulgar',
      icon:MessageCircle,
      action:openCreator
    },
    {
      title:'Criar promoção',
      description:'Oferta pensada para seu produto',
      icon:Tag,
      action:()=>quickMessage(
        'Quero criar uma promoção para um dos meus produtos.'
      )
    },
    {
      title:'Ideias para hoje',
      description:'Conteúdo rápido para publicar',
      icon:Lightbulb,
      action:()=>quickMessage(
        'Me dê ideias de conteúdo para publicar hoje.'
      )
    }
  ];

  return (
    <section className="marketing-ai-page">

      <div className="marketing-ai-header">

        <div>
          <div className="marketing-ai-kicker">
            CONFEASY • INTELIGÊNCIA PARA SUA CONFEITARIA
          </div>

          <h2>
            Marketing <span>IA</span>
          </h2>

          <p>
            Crie conteúdo, tire dúvidas e transforme ideias em vendas.
          </p>
        </div>

        <div className="marketing-ai-business">

          <div className="marketing-ai-business-avatar">
            {(profile?.business_name||'M')[0].toUpperCase()}
          </div>

          <div>
            <strong>
              {profile?.business_name||'Minha Confeitaria'}
            </strong>

            <small>
              Minha confeitaria
            </small>
          </div>

          <ChevronDown size={15}/>

        </div>

      </div>


      <div className="marketing-ai-tabs">

        <button
          type="button"
          className={activeTab==='assistant'?'active':''}
          onClick={()=>setActiveTab('assistant')}
        >
          <MessageCircle size={17}/>
          Assistente
        </button>

        <button
          type="button"
          className={activeTab==='create'?'active':''}
          onClick={()=>setActiveTab('create')}
        >
          <Image size={17}/>
          Criar conteúdo
        </button>

        <button
          type="button"
          className={activeTab==='library'?'active':''}
          onClick={()=>setActiveTab('library')}
        >
          <ImagePlus size={17}/>
          Minhas criações
        </button>

      </div>


      {activeTab==='assistant'&&(

        <>

          <div className="marketing-ai-main-grid">

            <div className="marketing-ai-chat panel">

              <div className="marketing-ai-chat-head">

                <div className="marketing-ai-bot">
                  <Bot size={22}/>
                </div>

                <div>
                  <strong>
                    Assistente Confeasy
                  </strong>

                  <span>
                    Sua parceira para cuidar do negócio
                  </span>
                </div>

                <div className="marketing-ai-status">
                  <span></span>
                  pronta para ajudar
                </div>

              </div>


              <div className="marketing-ai-messages">

                {messages.map((item,index)=>(
                  <div
                    key={index}
                    className={
                      item.role==='user'
                        ? 'marketing-ai-message user'
                        : 'marketing-ai-message ai'
                    }
                  >

                    {item.role==='ai'&&(
                      <div className="marketing-ai-message-icon">
                        <Bot size={15}/>
                      </div>
                    )}

                    <div>
                      {item.text}
                    </div>

                  </div>
                ))}


                {messages.length===1&&(

                  <div className="marketing-ai-suggestions">

                    <button
                      type="button"
                      onClick={()=>
                        quickMessage(
                          'Quero uma ideia de conteúdo.'
                        )
                      }
                    >
                      <Lightbulb size={14}/>
                      Ideias de conteúdo
                    </button>

                    <button
                      type="button"
                      onClick={()=>
                        quickMessage(
                          'Preciso de uma receita.'
                        )
                      }
                    >
                      <FileText size={14}/>
                      Preciso de uma receita
                    </button>

                    <button
                      type="button"
                      onClick={()=>
                        quickMessage(
                          'Quero responder uma cliente.'
                        )
                      }
                    >
                      <MessageCircle size={14}/>
                      Responder uma cliente
                    </button>

                  </div>

                )}

              </div>


              <div className="marketing-ai-chat-input">

                <button
                  type="button"
                  className="marketing-ai-input-icon"
                  title="Anexar"
                >
                  <ImagePlus size={18}/>
                </button>

                <form onSubmit={sendMessage}>
                  <input
                    value={message}
                    onChange={e=>setMessage(e.target.value)}
                    placeholder="Digite sua mensagem aqui..."
                  />

                  <button
                    type="submit"
                    className="marketing-ai-send"
                    title="Enviar"
                  >
                    <Send size={18}/>
                  </button>
                </form>

              </div>

            </div>


            <div className="marketing-ai-side">

              <div className="marketing-ai-create-banner">

                <div className="marketing-ai-banner-content">

                  <span>
                    TRANSFORME<br/>
                    SUAS IDEIAS EM
                  </span>

                  <h3>
                    Conteúdo<br/>
                    <b>que vende</b>
                  </h3>

                  <p>
                    Crie imagens, legendas, Stories e campanhas
                    completas para sua confeitaria em segundos.
                  </p>

                  <button
                    type="button"
                    onClick={openCreator}
                  >
                    Começar a criar
                    <ArrowRight size={16}/>
                  </button>

                </div>

                <div className="marketing-ai-banner-decoration">
                  <CakeSlice size={150}/>
                </div>

              </div>


              <div className="marketing-ai-today panel">

                <div className="marketing-ai-section-title">

                  <div>
                    <h3>
                      <Lightbulb size={19}/>
                      O que postar hoje?
                    </h3>

                    <p>
                      Sugestões personalizadas para sua confeitaria.
                    </p>
                  </div>

                  <button type="button">
                    <CalendarDays size={14}/>
                    Ver mais sugestões
                  </button>

                </div>


                <div className="marketing-ai-mini-grid">

                  <button type="button">
                    <CakeSlice size={23}/>
                    <strong>Produto em destaque</strong>
                    <span>
                      Mostre seu bolo mais vendido do momento.
                    </span>
                    <ChevronRight size={15}/>
                  </button>

                  <button type="button">
                    <Image size={23}/>
                    <strong>Bastidores</strong>
                    <span>
                      Mostre um pouco do seu dia na confeitaria.
                    </span>
                    <ChevronRight size={15}/>
                  </button>

                  <button type="button">
                    <Gift size={23}/>
                    <strong>Oferta especial</strong>
                    <span>
                      Crie uma promoção para o fim de semana.
                    </span>
                    <ChevronRight size={15}/>
                  </button>

                </div>

              </div>

            </div>

          </div>


          <div className="marketing-ai-quick">

            <div className="marketing-ai-quick-head">

              <div>
                <h3>
                  <WandSparkles size={21}/>
                  Ações rápidas
                </h3>

                <p>
                  Escolha o que você quer criar agora.
                </p>
              </div>

              <span>
                Tudo que você precisa para divulgar sua
                confeitaria em um só lugar.
              </span>

            </div>


            <div className="marketing-ai-quick-grid">

              {quickActions.map((item,index)=>{

                const Icon=item.icon;

                return (
                  <button
                    type="button"
                    key={index}
                    className="marketing-ai-quick-card"
                    onClick={item.action}
                  >

                    <div className="marketing-ai-quick-icon">
                      <Icon size={28}/>
                    </div>

                    <ChevronRight
                      className="marketing-ai-quick-arrow"
                      size={17}
                    />

                    <strong>
                      {item.title}
                    </strong>

                    <span>
                      {item.description}
                    </span>

                  </button>
                );

              })}

            </div>

          </div>

        </>

      )}


      {activeTab==='create'&&(

        <div className="marketing-ai-create-page">

          <div className="marketing-ai-create-config panel">

            <div className="marketing-ai-create-heading">
              <div className="marketing-ai-icon-title">
                <WandSparkles size={20}/>
              </div>

              <div>
                <h3>
                  Criar conteúdo
                </h3>

                <p>
                  Você escolhe o objetivo. A IA cuida da criação.
                </p>
              </div>
            </div>


            <Field label="O que você quer divulgar?">

              <select>
                <option>Bolo de aniversário</option>
                <option>Brigadeiros gourmet</option>
                <option>Brownie</option>
                <option>Produto personalizado</option>
                <option>Outro produto</option>
              </select>

            </Field>


            <div className="marketing-ai-field">

              <label>
                FORMATO
              </label>

              <div className="marketing-ai-format-grid">

                {[
                  ['Feed','1080 × 1350'],
                  ['Story','1080 × 1920'],
                  ['Quadrado','1080 × 1080']
                ].map(([name,size])=>(
                  <button
                    type="button"
                    key={name}
                    className={format===name?'active':''}
                    onClick={()=>setFormat(name)}
                  >
                    <strong>
                      {name}
                    </strong>

                    <span>
                      {size}
                    </span>
                  </button>
                ))}

              </div>

            </div>


            <div className="marketing-ai-field">

              <label>
                ESTILO DA ARTE
              </label>

              <div className="marketing-ai-style-list">

                {[
                  'Elegante',
                  'Delicado',
                  'Luxuoso',
                  'Artesanal',
                  'Minimalista',
                  'Colorido'
                ].map(item=>(
                  <button
                    type="button"
                    key={item}
                    className={style===item?'active':''}
                    onClick={()=>setStyle(item)}
                  >
                    {item}
                  </button>
                ))}

              </div>

            </div>


            <div className="marketing-ai-field">

              <label>
                TEXTO NA ARTE
              </label>

              <input
                value={artText}
                onChange={e=>setArtText(e.target.value)}
                placeholder="Ex.: Feito para momentos especiais"
              />

            </div>


            <button
              type="button"
              className="marketing-ai-photo-button"
            >
              <ImagePlus size={17}/>
              Usar foto cadastrada no produto
            </button>


            <button
              type="button"
              className="marketing-ai-generate"
            >
              <WandSparkles size={17}/>
              Gerar minha arte
            </button>

          </div>


          <div className="marketing-ai-preview panel">

            <div className="marketing-ai-preview-head">

              <div>
                <strong>
                  Prévia da criação
                </strong>

                <span>
                  {format} • {
                    format==='Feed'
                      ? '1080 × 1350'
                      : format==='Story'
                        ? '1080 × 1920'
                        : '1080 × 1080'
                  }
                </span>
              </div>

            </div>


            <div className="marketing-ai-art">

              <div className="marketing-ai-art-product">
                <CakeSlice size={105}/>
              </div>

              <div className="marketing-ai-art-copy">

                <small>
                  {profile?.business_name||'MINHA CONFEITARIA'}
                </small>

                <h3>
                  {artText||'Momentos especiais.'}
                </h3>

                <p>
                  Bolos feitos com carinho para celebrar.
                </p>

              </div>

            </div>


            <div className="marketing-ai-preview-actions">

              <button type="button">
                <WandSparkles size={15}/>
                Gerar outra
              </button>

              <button type="button">
                <Pencil size={15}/>
                Editar
              </button>

              <button
                type="button"
                className="primary"
              >
                <Check size={15}/>
                Usar criação
              </button>

            </div>

          </div>

        </div>

      )}


      {activeTab==='library'&&(

        <div className="marketing-ai-library">

          <div className="marketing-ai-library-head">

            <div>
              <h3>
                Minhas criações
              </h3>

              <p>
                Tudo que você criou com a IA em um só lugar.
              </p>
            </div>

            <button
              type="button"
              className="primary"
              onClick={openCreator}
            >
              <Plus size={16}/>
              Nova criação
            </button>

          </div>


          <div className="marketing-ai-gallery">

            {[
              ['Bolo de aniversário','Feed','Bolos especiais.'],
              ['Brigadeiros gourmet','Story','Seu doce momento.'],
              ['Promoção de fim de semana','Feed','Feito para celebrar.']
            ].map((item,index)=>(
              <article
                className="marketing-ai-gallery-card"
                key={index}
              >

                <div className={`marketing-ai-gallery-image gallery-${index+1}`}>

                  <span>
                    {item[2]}
                  </span>

                </div>

                <div className="marketing-ai-gallery-info">

                  <strong>
                    {item[0]}
                  </strong>

                  <small>
                    {item[1]} • criado recentemente
                  </small>

                  <div>

                    <button type="button">
                      Abrir
                    </button>

                    <button type="button">
                      Editar
                    </button>

                    <button type="button">
                      …
                    </button>

                  </div>

                </div>

              </article>
            ))}

          </div>

        </div>

      )}

    </section>
  );
}

/* =========================================================
   MEU NEGÓCIO
========================================================= */

function Business({profile,setProfile,session,notify}){
  const [form,setForm]=useState(profile);
  useEffect(()=>setForm(profile),[profile]);

  async function save(e){
    e.preventDefault();
    const payload={
      full_name:form.full_name||'',
      business_name:form.business_name||'Minha Confeitaria',
      phone:form.phone||null,instagram:form.instagram||null,
      city:form.city||null,address:form.address||null,logo_url:form.logo_url||null
    };
    const {data,error}=await supabase.from('profiles').update(payload)
      .eq('id',session.user.id).select().single();
    if(error)notify(error.message);
    else{setProfile({...profile,...data});notify('Dados do negócio atualizados.');}
  }

  return <section className="panel business-panel">
    <div className="section-head"><div><h2>Meu negócio</h2><span>Essas informações ficam vinculadas à sua conta.</span></div><Settings size={19}/></div>
    <form className="form" onSubmit={save}>
      <div className="form-grid two">
        <Field label="Confeiteira"><input value={form.full_name||''} onChange={e=>setForm({...form,full_name:e.target.value})} placeholder="Seu nome"/></Field>
        <Field label="Nome do negócio"><input value={form.business_name||''} onChange={e=>setForm({...form,business_name:e.target.value})}/></Field>
        <Field label="WhatsApp"><input value={form.phone||''} onChange={e=>setForm({...form,phone:e.target.value})}/></Field>
        <Field label="Instagram"><input value={form.instagram||''} onChange={e=>setForm({...form,instagram:e.target.value})} placeholder="@suaempresa"/></Field>
        <Field label="Cidade"><input value={form.city||''} onChange={e=>setForm({...form,city:e.target.value})}/></Field>
        <Field label="Endereço"><input value={form.address||''} onChange={e=>setForm({...form,address:e.target.value})}/></Field>
      </div>
      <div className="account-info">
        <div><span>E-mail</span><b>{session.user.email}</b></div>
        <div><span>Acesso até</span><b>{dateBR(profile.expires_at)}</b></div>
      </div>
      <button className="primary"><CheckCircle2 size={16}/> Salvar alterações</button>
    </form>
  </section>;
}

function Field({label,children}){
  return <label className="field"><span>{label}</span>{children}</label>;
}

function Modal({open,close,title,children}){
  if(!open)return null;
  return <div className="modal-bg" onMouseDown={e=>e.target===e.currentTarget&&close()}>
    <div className="modal">
      <div className="modal-head">
        <h2>{title}</h2>
        <button type="button" className="icon-button" onClick={close}><X size={18}/></button>
      </div>
      {children}
    </div>
  </div>;
}

export default App;
