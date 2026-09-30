import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Bell, Box, CakeSlice, CheckCircle2, ChevronDown, ChevronRight,
  CircleDollarSign, ClipboardList, Clock3, Edit3, ImagePlus, LogOut, Menu,
  Package, Plus, Search, Settings, Sparkles, Trash2, TrendingUp, UserRound, X,
  AlertCircle, CalendarDays, WalletCards, ShoppingCart, BarChart3
} from 'lucide-react';
import { supabase } from './lib/supabase';
import './index.css';

const EMPTY_PROFILE = { full_name: '', business_name: 'Minha Confeitaria', email: '', expires_at: null, active: true, phone: '', instagram: '', city: '', address: '', logo_url: '' };
const CATEGORIES = ['Bolos','Doces','Tortas','Salgados','Cookies','Brownies','Sobremesas','Massas','Outros'];
const ORDER_STATUS = ['Pendente','Confirmado','Pago','Em produção','Pronto','Entregue','Cancelado'];
const EXPENSE_CATEGORIES = ['Ingredientes','Embalagens','Equipamentos','Marketing','Entrega','Taxas','Contas','Outros'];
const UNITS = ['g','kg','ml','l','un','pacote','caixa'];

function money(value = 0) { return Number(value || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
function dateBR(value) { if (!value) return '—'; return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR'); }
function todayISO() { return new Date().toISOString().slice(0,10); }
function clamp(n,min,max){ return Math.min(Math.max(Number(n)||0,min),max); }
function isExpired(profile){ return !profile?.active || (profile?.expires_at && new Date(profile.expires_at+'T23:59:59') < new Date()); }
function uid(){ return crypto.randomUUID(); }

export default function App(){
  const [session,setSession]=useState(null),[profile,setProfile]=useState(EMPTY_PROFILE),[booting,setBooting]=useState(true),[page,setPage]=useState('dashboard'),[toast,setToast]=useState('');
  useEffect(()=>{ let mounted=true; supabase.auth.getSession().then(({data})=>{if(mounted)setSession(data.session);if(mounted)setBooting(false)}); const {data:listener}=supabase.auth.onAuthStateChange((_e,next)=>setSession(next)); return()=>{mounted=false;listener.subscription.unsubscribe()}; },[]);
  useEffect(()=>{if(session?.user?.id) loadProfile(session.user.id)},[session?.user?.id]);
  async function loadProfile(id){const {data}=await supabase.from('profiles').select('*').eq('id',id).single();if(data)setProfile({...EMPTY_PROFILE,...data,email:data.email||session?.user?.email||''});}
  async function logout(){await supabase.auth.signOut();}
  function notify(msg){setToast(msg);window.setTimeout(()=>setToast(''),2600)}
  if(booting)return <Splash/>;
  if(!session)return <LoginScreen/>;
  if(isExpired(profile))return <ExpiredScreen profile={profile} onLogout={logout}/>;
  return <AppShell session={session} profile={profile} setProfile={setProfile} page={page} setPage={setPage} onLogout={logout} notify={notify} toast={toast}/>;
}

function Splash(){return <div className="splash"><div className="brand-word">confeasy<span>.</span></div><div className="loader"/></div>}
function LoginScreen(){const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[loading,setLoading]=useState(false),[error,setError]=useState('');async function submit(e){e.preventDefault();setError('');setLoading(true);const{error:err}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(err)setError('E-mail ou senha inválidos.');setLoading(false)}return <div className="login-page"><div className="login-card"><div className="brand-lockup">
  <img
    src="/confeasy-logo-login.png"
    alt="Confeasy — Sua confeitaria em um só lugar"
    className="login-logo"
  />
</div><div className="login-copy"><span className="eyebrow">Acesso da confeiteira</span><h1>Bem-vinda de volta.</h1><p>Entre com o e-mail usado na sua compra e a senha recebida.</p></div><form onSubmit={submit} className="form"><Field label="E-mail"><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email"/></Field><Field label="Senha"><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Sua senha" autoComplete="current-password"/></Field>{error&&<div className="error">{error}</div>}<button className="primary wide" disabled={loading}>{loading?'Entrando…':'Entrar no Confeasy'}<ArrowRight size={17}/></button></form><div className="login-note">Sua conta é individual. Não compartilhe sua senha.</div></div></div>}
function ExpiredScreen({profile,onLogout}){return <div className="login-page"><div className="login-card center"><div className="brand-word">confeasy<span>.</span></div><div className="expired-icon"><Clock3/></div><h1>Acesso encerrado</h1><p>O acesso desta conta terminou em <b>{dateBR(profile?.expires_at)}</b>.</p><button className="secondary wide" onClick={onLogout}><LogOut size={16}/> Sair</button></div></div>}

function AppShell({session,profile,setProfile,page,setPage,onLogout,notify,toast}){
 const items=[['dashboard','Visão geral',CakeSlice],['recipes','Receitas',CakeSlice],['orders','Pedidos',ClipboardList],['finance','Finanças',CircleDollarSign],['pantry','Despensa',Package],['marketing','Marketing com IA',Sparkles],['business','Meu negócio',UserRound]];
 const [mobile,setMobile]=useState(false); const title=items.find(x=>x[0]===page)?.[1]||'Visão geral';
 return <div className="shell"><aside className="sidebar"><Brand/><nav>{items.map(([id,label,Icon])=><button key={id} className={page===id?'active':''} onClick={()=>{setPage(id);setMobile(false)}}><Icon size={18}/><span>{label}</span></button>)}</nav><div className="sidebar-user"><div className="avatar">{(profile.full_name||session.user.email||'C')[0].toUpperCase()}</div><div><b>{profile.business_name||'Minha Confeitaria'}</b><small>{session.user.email}</small></div></div><button className="logout" onClick={onLogout}><LogOut size={16}/> Sair</button></aside><main className="main"><header className="topbar"><div><div className="eyebrow">Confeasy</div><h1>{title}</h1><p>Olá, {profile.full_name||'confeiteira'}. Vamos cuidar da sua confeitaria?</p></div><div className="top-actions"><button className="icon-button"><Bell size={18}/></button><button className="avatar top-avatar">{(profile.full_name||session.user.email||'C')[0].toUpperCase()}</button><button className="icon-button mobile-menu" onClick={()=>setMobile(v=>!v)}><Menu size={18}/></button></div></header>{mobile&&<div className="mobile-menu-panel">{items.map(([id,label,Icon])=><button key={id} className={page===id?'active':''} onClick={()=>{setPage(id);setMobile(false)}}><Icon size={17}/>{label}</button>)}</div>}<Page page={page} profile={profile} session={session} setPage={setPage} setProfile={setProfile} notify={notify}/></main><nav className="bottom-nav">{items.slice(0,5).map(([id,label,Icon])=><button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}><Icon size={18}/><span>{label.split(' ')[0]}</span></button>)}</nav>{toast&&<div className="toast">{toast}</div>}</div>
}
function Brand(){return <div className="brand"><img src="/confeasy-logo-login.png" alt="Confeasy" className="app-logo"/></div>}
function Page({page,...props}){const map={dashboard:Dashboard,recipes:Recipes,orders:Orders,finance:Finance,pantry:Pantry,marketing:Marketing,business:Business};const Component=map[page]||Dashboard;return <Component {...props}/>}

function Dashboard({profile,setPage}){
 const[orders,setOrders]=useState([]),[expenses,setExpenses]=useState([]),[recipes,setRecipes]=useState([]),[ingredients,setIngredients]=useState([]);
 useEffect(()=>{Promise.all([supabase.from('orders').select('*').order('delivery_date',{ascending:true}).limit(8),supabase.from('expenses').select('value'),supabase.from('recipes').select('id'),supabase.from('ingredients').select('id,quantity,min_quantity')]).then(([o,e,r,i])=>{setOrders(o.data||[]);setExpenses(e.data||[]);setRecipes(r.data||[]);setIngredients(i.data||[])})},[]);
 const sales=orders.reduce((s,x)=>s+Number(x.value||0),0),exp=expenses.reduce((s,x)=>s+Number(x.value||0),0),low=ingredients.filter(x=>Number(x.quantity||0)<=Number(x.min_quantity||0)).length;
 return <><section className="hero"><div><div className="eyebrow">Bom dia, confeiteira! ✨</div><h2>Sua confeitaria, organizada.</h2><p>Pedidos, receitas, estoque e dinheiro conectados em um só lugar.</p><div className="quick"><button className="primary" onClick={()=>setPage('orders')}><Plus size={17}/> Novo pedido</button><button className="secondary" onClick={()=>setPage('recipes')}><Plus size={17}/> Nova receita</button></div></div><div className="hero-orb"><Sparkles size={46}/></div></section><div className="stats"><Stat label="Vendas registradas" value={money(sales)} green/><Stat label="Pedidos" value={orders.length}/><Stat label="Despesas" value={money(exp)}/><Stat label="Resultado" value={money(sales-exp)} green/></div><section className="section"><div className="section-head"><div><h2>Resumo da operação</h2><span>Uma visão rápida dos principais números da sua confeitaria.</span></div></div><div className="dashboard-grid"><MiniCard icon={CakeSlice} title="Receitas" value={recipes.length} text="receitas cadastradas" onClick={()=>setPage('recipes')}/><MiniCard icon={ShoppingCart} title="Pedidos" value={orders.filter(o=>o.status!=='Entregue'&&o.status!=='Cancelado').length} text="em andamento" onClick={()=>setPage('orders')}/><MiniCard icon={Package} title="Despensa" value={low} text={low?'itens em estoque mínimo':'estoque controlado'} alert={low>0} onClick={()=>setPage('pantry')}/><MiniCard icon={WalletCards} title="Saldo" value={money(sales-exp)} text="resultado registrado" onClick={()=>setPage('finance')}/></div></section><section className="lower"><div className="panel"><div className="section-head"><div><h2>Próximos pedidos</h2><span>Agenda de produção e entrega</span></div><button className="link" onClick={()=>setPage('orders')}>Ver todos <ChevronRight size={14}/></button></div>{orders.length?<table><thead><tr><th>Cliente</th><th>Pedido</th><th>Entrega</th><th>Valor</th><th>Status</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>{o.client_name}</td><td>{o.item_name}</td><td>{dateBR(o.delivery_date)}</td><td>{money(o.value)}</td><td><span className={`pill ${o.status==='Pago'||o.status==='Entregue'?'ok':''}`}>{o.status}</span></td></tr>)}</tbody></table>:<Empty text="Você ainda não tem pedidos cadastrados." action="Novo pedido" onClick={()=>setPage('orders')}/>}</div><div className="panel"><div className="section-head"><div><h2>Seu plano</h2><span>Acesso ao Confeasy</span></div></div><div className="plan"><CheckCircle2 size={21}/><div><b>Acesso ativo</b><small>Válido até {dateBR(profile.expires_at)}</small></div></div><div className="mini-note">Seus dados ficam associados à sua conta e podem ser acessados em computador, tablet e celular.</div></div></section></>;
}
function Stat({label,value,green}){return <div className="stat"><span>{label}</span><b className={green?'green-text':''}>{value}</b></div>}
function MiniCard({icon:Icon,title,value,text,onClick,alert}){return <button className="mini-card" onClick={onClick} style={{minWidth:0,minHeight:112,padding:18,display:'grid',gridTemplateColumns:'42px minmax(0,1fr) 18px',alignItems:'center',gap:14,background:'#111314',border:'1px solid rgba(255,255,255,.08)',borderRadius:16,color:'#fff',textAlign:'left',overflow:'hidden'}}><div className="mini-icon" style={{width:42,height:42,borderRadius:12,display:'grid',placeItems:'center',background:'#202420',color:'var(--lime)',flex:'none'}}><Icon size={20}/></div><div style={{minWidth:0,display:'grid',gap:5}}><span style={{fontSize:11,color:'var(--muted)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{title}</span><b className={alert?'warning-text':''} style={{fontSize:20,lineHeight:1.1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{value}</b><small style={{fontSize:10,color:'var(--muted-2)',lineHeight:1.25}}>{text}</small></div><ChevronRight size={16} style={{color:'var(--muted-2)',justifySelf:'end'}}/></button>}
function Empty({text,action,onClick}){return <div className="empty"><div>{text}</div>{action&&<button className="secondary small" onClick={onClick}><Plus size={15}/>{action}</button>}</div>}

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
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState(blank);
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('Todas');
  const [uploading,setUploading]=useState(false);
  const [savingLabor,setSavingLabor]=useState(false);

  async function load(){
    const {data,error}=await supabase
      .from('recipes')
      .select('*, recipe_ingredients(*)')
      .order('created_at',{ascending:false});

    if(error) notify(error.message);
    else setRows(data||[]);
  }

  useEffect(()=>{
    load();
  },[]);

  const laborSettings={
    desired_monthly_income:Number(profile?.desired_monthly_income)||0,
    work_hours_per_day:Number(profile?.work_hours_per_day)||8,
    work_days_per_week:Number(profile?.work_days_per_week)||5
  };

  const monthlyHours=
    laborSettings.work_hours_per_day *
    laborSettings.work_days_per_week *
    4.33;

  const hourlyRate=
    monthlyHours>0
      ? laborSettings.desired_monthly_income/monthlyHours
      : 0;

  const filtered=rows.filter(r=>
    (!query || r.name.toLowerCase().includes(query.toLowerCase())) &&
    (category==='Todas' || r.category===category)
  );

  const calc=useMemo(()=>{
    const ingredientTotal=(form.ingredients||[]).reduce(
      (total,item)=>
        total+
        (Number(item.quantity)||0)*
        (Number(item.unit_cost)||0),
      0
    );

    const prepMinutes=Math.max(
      Number(form.prep_time_minutes)||0,
      0
    );

    const laborCost=
      prepMinutes>0
        ? (prepMinutes/60)*hourlyRate
        : 0;

    const totalCost=ingredientTotal+laborCost;

    const yieldAmount=
      Math.max(Number(form.yield_amount)||0,0);

    const unitCost=
      yieldAmount>0
        ? totalCost/yieldAmount
        : 0;

    const margin=clamp(
      form.desired_margin,
      0,
      99.99
    );

    const suggestedPrice=
      unitCost>0
        ? unitCost/(1-margin/100)
        : 0;

    return{
      ingredientTotal,
      laborCost,
      totalCost,
      unitCost,
      suggestedPrice,
      prepMinutes
    };
  },[
    form.ingredients,
    form.yield_amount,
    form.desired_margin,
    form.prep_time_minutes,
    hourlyRate
  ]);

  function setF(key,value){
    setForm(current=>({
      ...current,
      [key]:value
    }));
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

      notify('Configuração da sua hora de trabalho salva.');
    }

    setSavingLabor(false);
  }

  function openNew(){
    setEditing(null);

    setForm({
      ...blank,
      ingredients:[
        {
          id:uid(),
          name:'',
          quantity:'',
          unit:'g',
          unit_cost:''
        }
      ]
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

      ingredients:
        (recipe.recipe_ingredients||[]).map(item=>({
          id:item.id,
          name:item.name,
          quantity:item.quantity,
          unit:item.unit,
          unit_cost:item.unit_cost
        }))
    });

    setOpen(true);
  }

  async function upload(e){
    const file=e.target.files?.[0];

    if(!file) return;

    if(file.size>5*1024*1024){
      notify('A foto pode ter no máximo 5 MB.');
      return;
    }

    setUploading(true);

    const extension=
      file.name.split('.').pop()?.toLowerCase()||'jpg';

    const path=
      `${session.user.id}/${uid()}.${extension}`;

    const {error}=await supabase.storage
      .from('recipe-images')
      .upload(
        path,
        file,
        {
          upsert:false,
          contentType:file.type
        }
      );

    if(error){
      notify(error.message);
    }else{
      const {data}=supabase.storage
        .from('recipe-images')
        .getPublicUrl(path);

      setF('photo_url',data.publicUrl);

      notify('Foto adicionada.');
    }

    setUploading(false);
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

  async function save(e){
    e.preventDefault();

    if(!form.name.trim()){
      notify('Informe o nome da receita.');
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
        Number(form.sale_price)||0,

      desired_margin:
        clamp(form.desired_margin,0,99.99),

      preparation:
        form.preparation||null,

      notes:
        form.notes||null
    };

    let recipeId=editing?.id;
    let error;

    if(editing){

  ({error}=await supabase
    .from('recipes')
    .update(payload)
    .eq('id',editing.id));

  if(error){
    notify(error.message);
    return;
  }

  const {error: deleteError}=await supabase
    .from('recipe_ingredients')
    .delete()
    .eq('recipe_id',editing.id);

  if(deleteError){
    notify(deleteError.message);
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

    if(!error && recipeId){

      const ingredients=
        (form.ingredients||[])
          .filter(item=>item.name.trim())
          .map(item=>({
            recipe_id:recipeId,
            user_id:session.user.id,
            name:item.name.trim(),
            quantity:Number(item.quantity)||0,
            unit:item.unit,
            unit_cost:Number(item.unit_cost)||0
          }));

      if(ingredients.length){

        const result=await supabase
          .from('recipe_ingredients')
          .insert(ingredients);

        error=result.error;
      }
    }

    if(error){

      notify(error.message);

    }else{

      setOpen(false);

      notify(
        editing
          ? 'Cálculo atualizado.'
          : 'Cálculo salvo.'
      );

      load();
    }
  }

  async function remove(recipe){

    if(
      !window.confirm(
        `Excluir o cálculo “${recipe.name}”?`
      )
    ){
      return;
    }

    const {error}=await supabase
      .from('recipes')
      .delete()
      .eq('id',recipe.id);

    if(error){
      notify(error.message);
    }else{
      notify('Cálculo excluído.');
      load();
    }
  }

  return(
    <>
      <style>{`

        /* ==================================================
           CALCULADORA
        ================================================== */
/* ==================================================
   CAMPOS DA CALCULADORA — FUNDO BRANCO + TEXTO PRETO
================================================== */

.calculator-tools .search-box input,
.calculator-actions select,
.labor-panel input{
  background:#ffffff!important;
  color:#111111!important;
  -webkit-text-fill-color:#111111!important;
  border:1px solid #d7d7d7!important;
  box-shadow:none!important;
}

.calculator-tools .search-box input::placeholder,
.labor-panel input::placeholder{
  color:#777777!important;
  opacity:1!important;
  -webkit-text-fill-color:#777777!important;
}

.calculator-tools .search-box input:focus,
.calculator-actions select:focus,
.labor-panel input:focus{
  border-color:#b6d900!important;
  box-shadow:0 0 0 3px rgba(215,255,17,.15)!important;
  outline:none!important;
}

.calculator-actions select,
.calculator-actions option{
  color:#111111!important;
  background:#ffffff!important;
}
        .calculator-tools{
          display:grid!important;
          grid-template-columns:minmax(0,1fr) auto;
          align-items:center;
          gap:10px!important;
        }

        .calculator-search{
          min-width:0;
        }

        .calculator-search .search-box{
          width:100%;
        }

        .calculator-actions{
          display:grid;
          grid-template-columns:160px auto;
          gap:10px;
        }

        .calculator-actions select,
        .calculator-actions .primary{
          height:44px;
          min-width:0;
        }

        .calculator-actions .primary{
          white-space:nowrap;
        }

        /* ==================================================
           CONFIGURAÇÃO DA HORA
        ================================================== */

        .labor-panel{
          margin-top:14px;
          padding:20px;
          background:
            linear-gradient(
              135deg,
              #111414,
              #101210
            );
          border:1px solid rgba(215,255,17,.14);
          border-radius:16px;
        }

        .labor-head{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:15px;
          margin-bottom:15px;
        }

        .labor-head h2{
          margin:0;
          font-size:16px;
        }

        .labor-head p{
          margin:5px 0 0;
          color:var(--muted);
          font-size:11px;
          line-height:1.5;
        }

        .labor-grid{
          display:grid;
          grid-template-columns:
            1.2fr
            1fr
            1fr
            1fr
            auto;
          gap:10px;
          align-items:end;
        }

        .labor-rate{
          min-height:44px;
          padding:9px 12px;
          border-radius:10px;
          background:
            rgba(215,255,17,.07);
          border:
            1px solid rgba(215,255,17,.14);
        }

        .labor-rate small{
          display:block;
          color:var(--muted-2);
          font-size:9px;
          margin-bottom:3px;
        }

        .labor-rate b{
          color:var(--lime);
          font-size:15px;
        }

        .calculator-note{
          margin-top:9px;
          color:var(--muted-2);
          font-size:10px;
          line-height:1.5;
        }

        /* ==================================================
           MODAL
        ================================================== */

        .calculator-modal{
          width:min(920px,100%)!important;
        }

        .calculator-modal form{
          display:grid;
          gap:14px;
        }

        .calculator-form-grid{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
        }

        .calculator-section{
          padding:17px;
          border:
            1px solid var(--border);
          border-radius:15px;
          background:
            rgba(255,255,255,.012);
        }

        .calculator-section.full{
          grid-column:1/-1;
        }

        .calculator-section-head{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
          margin-bottom:15px;
        }

        .calculator-section-head h3{
          margin:0;
          font-size:15px;
        }

        .calculator-section-head span{
          display:block;
          margin-top:4px;
          color:var(--muted);
          font-size:10px;
        }

        /* ==================================================
           CAMPOS BRANCOS + TEXTO PRETO
        ================================================== */

        .calculator-modal input,
        .calculator-modal select,
        .calculator-modal textarea{

          background:#ffffff!important;

          color:#111111!important;

          -webkit-text-fill-color:#111111!important;

          border:
            1px solid #d7d7d7!important;

          box-shadow:
            none!important;
        }

        .calculator-modal input::placeholder,
        .calculator-modal textarea::placeholder{

          color:#777777!important;

          opacity:1!important;

          -webkit-text-fill-color:#777777!important;
        }

        .calculator-modal input:focus,
        .calculator-modal select:focus,
        .calculator-modal textarea:focus{

          border-color:
            #b6d900!important;

          box-shadow:
            0 0 0 3px
            rgba(215,255,17,.15)!important;

          outline:none!important;
        }

        .calculator-modal select{
          color:#111111!important;
        }

        .calculator-modal option{
          color:#111111!important;
          background:#ffffff!important;
        }

        /* ==================================================
           INFORMAÇÕES
        ================================================== */

        .calculator-info-grid{
          display:grid;
          grid-template-columns:
            1.5fr
            1fr
            .8fr
            .8fr;
          gap:10px;
        }

        .calculator-photo{
          display:flex;
          align-items:center;
          gap:12px;
          margin-top:13px;
          padding-top:13px;
          border-top:
            1px solid var(--border);
        }

        .calculator-photo-preview{
          width:66px;
          height:66px;
          display:grid;
          place-items:center;
          overflow:hidden;
          border-radius:12px;
          background:#0b0d0e;
          border:
            1px dashed var(--border-strong);
          color:var(--muted-2);
        }

        .calculator-photo-preview img{
          width:100%;
          height:100%;
          object-fit:cover;
        }

        .calculator-photo p{
          margin:4px 0 7px;
          color:var(--muted-2);
          font-size:9px;
        }

        /* ==================================================
           INGREDIENTES
        ================================================== */

        .ingredient-list{
          display:grid;
          gap:7px;
        }

        .ingredient-head,
        .ingredient-row{
          display:grid;
          grid-template-columns:
            minmax(170px,1.7fr)
            105px
            90px
            115px
            100px
            38px;
          gap:7px;
          align-items:center;
        }

        .ingredient-head{
          padding:0 8px;
          color:var(--muted-2);
          font-size:8px;
          font-weight:700;
          text-transform:uppercase;
          letter-spacing:.06em;
        }

        .ingredient-row{
          padding:7px;
          background:
            rgba(255,255,255,.018);
          border:
            1px solid rgba(255,255,255,.05);
          border-radius:10px;
        }

        .ingredient-row input,
        .ingredient-row select{
          height:40px!important;
          min-height:40px!important;
          padding:0 10px!important;
          border-radius:9px!important;
        }

        .ingredient-row b{
          color:#e5e8e6;
          font-size:11px;
          text-align:right;
        }

        .ingredient-total{
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-top:9px;
          padding:12px;
          border-radius:10px;
          background:#0d1010;
          border:1px solid var(--border);
        }

        .ingredient-total span{
          color:var(--muted);
          font-size:10px;
        }

        .ingredient-total b{
          color:#fff;
          font-size:15px;
        }

        /* ==================================================
           RESUMO DOS CUSTOS
        ================================================== */

        .cost-breakdown{
          display:grid;
          grid-template-columns:
            repeat(4,1fr);
          gap:8px;
          margin-top:12px;
        }

        .cost-box{
          padding:12px;
          border-radius:10px;
          background:#0d1010;
          border:
            1px solid var(--border);
        }

        .cost-box small{
          display:block;
          color:var(--muted-2);
          font-size:8px;
          margin-bottom:5px;
        }

        .cost-box b{
          font-size:13px;
        }

        .cost-box.highlight{
          background:
            rgba(215,255,17,.06);
          border-color:
            rgba(215,255,17,.20);
        }

        .cost-box.highlight b{
          color:var(--lime);
        }

        /* ==================================================
           PREÇO
        ================================================== */

        .price-layout{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
        }

        .price-card{
          padding:15px;
          border-radius:12px;
          background:#0d1010;
          border:1px solid var(--border);
        }

        .price-card small{
          display:block;
          color:var(--muted-2);
          font-size:9px;
          margin-bottom:5px;
        }

        .price-card b{
          font-size:20px;
        }

        .price-card.suggested{
          background:
            rgba(215,255,17,.07);
          border-color:
            rgba(215,255,17,.20);
        }

        .price-card.suggested b{
          color:var(--lime);
        }

        .calculator-modal textarea{
          min-height:100px;
        }

        .formula{
          margin-top:11px;
          padding:11px 12px;
          display:flex;
          gap:9px;
          align-items:flex-start;
          border-radius:10px;
          background:
            rgba(215,255,17,.035);
          color:var(--muted);
          font-size:9px;
          line-height:1.6;
        }

        .formula svg{
          flex:0 0 auto;
          color:var(--lime);
        }

        /* ==================================================
           MOBILE
        ================================================== */

        @media(max-width:760px){

          .calculator-tools{
            grid-template-columns:1fr!important;
            gap:9px!important;
            margin-top:14px!important;
            margin-bottom:12px!important;
          }

          .calculator-search .search-box{
            height:48px!important;
          }

          .calculator-actions{
            grid-template-columns:
              1fr 1.25fr!important;
            gap:8px;
          }

          .calculator-actions select,
          .calculator-actions .primary{
            height:48px!important;
            border-radius:13px!important;
          }

          .labor-panel{
            padding:15px;
          }

          .labor-head{
            display:block;
          }

          .labor-head .secondary{
            margin-top:10px;
          }

          .labor-grid{
            grid-template-columns:1fr 1fr;
          }

          .labor-grid .field:first-child{
            grid-column:1/-1;
          }

          .labor-rate{
            grid-column:1/-1;
          }

          .calculator-form-grid{
            grid-template-columns:1fr;
          }

          .calculator-section.full{
            grid-column:auto;
          }

          .calculator-info-grid{
            grid-template-columns:1fr 1fr;
          }

          .calculator-info-grid .field:first-child{
            grid-column:1/-1;
          }

          .ingredient-head{
            display:none;
          }

          .ingredient-row{
            grid-template-columns:
              minmax(0,1fr)
              80px
              80px
              38px;

            gap:7px;
            padding:9px;
          }

          .ingredient-row input:first-child{
            grid-column:1/-1;
          }

          .ingredient-row input:nth-child(2){
            grid-column:1/2;
          }

          .ingredient-row select{
            grid-column:2/3;
          }

          .ingredient-row input:nth-child(4){
            grid-column:1/2;
          }

          .ingredient-row b{
            grid-column:2/4;
            text-align:right;
            padding-right:4px;
          }

          .ingredient-row .danger{
            grid-column:4;
          }

          .cost-breakdown{
            grid-template-columns:1fr 1fr;
          }

          .price-layout{
            grid-template-columns:1fr 1fr;
          }
        }

        @media(max-width:420px){

          .labor-grid{
            grid-template-columns:1fr;
          }

          .labor-grid .field:first-child{
            grid-column:auto;
          }

          .calculator-info-grid{
            grid-template-columns:1fr;
          }

          .calculator-info-grid .field:first-child{
            grid-column:auto;
          }

          .ingredient-row{
            grid-template-columns:
              minmax(0,1fr)
              72px
              38px;
          }

          .ingredient-row input:nth-child(2){
            grid-column:1/2;
          }

          .ingredient-row select{
            grid-column:2/3;
          }

          .ingredient-row input:nth-child(4){
            grid-column:1/2;
          }

          .ingredient-row b{
            grid-column:2/3;
          }

          .ingredient-row .danger{
            grid-column:3;
          }

          .cost-breakdown,
          .price-layout{
            grid-template-columns:1fr;
          }
        }

      `}</style>

      <div className="page-tools calculator-tools">

        <div className="calculator-search">
          <div className="search-box">
            <Search size={17}/>
            <input
              value={query}
              onChange={e=>setQuery(e.target.value)}
              placeholder="Buscar cálculo ou receita..."
            />
          </div>
        </div>

        <div className="calculator-actions">

          <select
            value={category}
            onChange={e=>setCategory(e.target.value)}
          >
            <option>Todas</option>

            {CATEGORIES.map(item=>
              <option key={item}>{item}</option>
            )}
          </select>

          <button
            className="primary"
            onClick={openNew}
          >
            <Plus size={17}/>
            Calcular receita
          </button>

        </div>

      </div>

      <section className="labor-panel">

        <div className="labor-head">

          <div>
            <h2>
              Quanto vale sua hora de trabalho?
            </h2>

            <p>
              Informe sua meta mensal e o Confeasy
              transforma seu tempo em custo real de produção.
            </p>
          </div>

          <button
            className="secondary small"
            onClick={saveLaborSettings}
            disabled={savingLabor}
          >
            {savingLabor
              ? 'Salvando…'
              : 'Salvar configuração'}
          </button>

        </div>

        <div className="labor-grid">

          <Field label="Quanto quero ganhar por mês">
            <input
              type="number"
              min="0"
              step="0.01"
              value={profile?.desired_monthly_income||''}
              onChange={e=>
                setProfile(p=>({
                  ...p,
                  desired_monthly_income:e.target.value
                }))
              }
              placeholder="Ex.: 5.000"
            />
          </Field>

          <Field label="Horas por dia">
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={profile?.work_hours_per_day??8}
              onChange={e=>
                setProfile(p=>({
                  ...p,
                  work_hours_per_day:e.target.value
                }))
              }
            />
          </Field>

          <Field label="Dias por semana">
            <input
              type="number"
              min="0"
              max="7"
              step="0.5"
              value={profile?.work_days_per_week??5}
              onChange={e=>
                setProfile(p=>({
                  ...p,
                  work_days_per_week:e.target.value
                }))
              }
            />
          </Field>

          <div className="labor-rate">
            <small>
              Sua hora de trabalho
            </small>

            <b>
              {money(hourlyRate)}
            </b>
          </div>

        </div>

        <div className="calculator-note">
          Base de cálculo: 4,33 semanas por mês.
          Esse valor será aplicado automaticamente
          às receitas conforme o tempo de produção.
        </div>

      </section>

      {
        filtered.length
        ?
        <div className="recipe-grid">

          {filtered.map(recipe=>

            <article
              className="recipe-card"
              key={recipe.id}
            >

              <div className="recipe-photo">

                {
                  recipe.photo_url
                  ?
                  <img
                    src={recipe.photo_url}
                    alt=""
                  />
                  :
                  <CakeSlice size={34}/>
                }

                <span>
                  {recipe.category}
                </span>

              </div>

              <div className="recipe-card-body">

                <div className="recipe-title">

                  <h3>
                    {recipe.name}
                  </h3>

                  <button
                    className="icon-button"
                    onClick={()=>
                      openEdit(recipe)
                    }
                  >
                    <Edit3 size={16}/>
                  </button>

                </div>

                <p>
                  {
                    recipe.portion_size ||
                    `${recipe.yield_amount||1} ${recipe.yield_unit||'un'}`
                  }
                </p>

                <div className="recipe-metrics">

                  <div>
                    <small>
                      Custo/un.
                    </small>

                    <b>
                      {money(recipe.unit_cost)}
                    </b>
                  </div>

                  <div>
                    <small>
                      Preço sugerido
                    </small>

                    <b className="green-text">
                      {money(recipe.suggested_price)}
                    </b>
                  </div>

                </div>

                <div className="recipe-footer">

                  <span>
                    Venda: {money(recipe.sale_price)}
                  </span>

                  <button
                    className="danger-link"
                    onClick={()=>
                      remove(recipe)
                    }
                  >
                    <Trash2 size={14}/>
                  </button>

                </div>

              </div>

            </article>

          )}

        </div>

        :

        <section className="panel calculator-empty">

          <BarChart3
            size={30}
            style={{
              color:'var(--lime)',
              margin:'0 auto'
            }}
          />

          <h3>
            {
              rows.length
              ? 'Nenhum cálculo encontrado.'
              : 'Sua calculadora está pronta.'
            }
          </h3>

          <p>
            {
              rows.length
              ?
              'Tente outro nome ou categoria.'
              :
              'Cadastre uma receita, informe os ingredientes e o tempo de produção. O Confeasy calcula o custo real e o preço sugerido.'
            }
          </p>

          <button
            className="primary"
            onClick={openNew}
          >
            <Plus size={16}/>
            Calcular primeira receita
          </button>

        </section>
      }

      {
        open &&
        <RecipeModal
          form={form}
          setF={setF}
          calc={calc}
          editing={editing}
          close={()=>setOpen(false)}
          save={save}
          upload={upload}
          uploading={uploading}
          updateIng={updateIngredient}
          addIng={addIngredient}
          removeIng={removeIngredient}
        />
      }

    </>
  );
}


function RecipeModal({
  form,
  setF,
  calc,
  editing,
  close,
  save,
  upload,
  uploading,
  updateIng,
  addIng,
  removeIng
}){

  return(

    <div className="modal-bg">

      <div className="modal modal-xl calculator-modal">

        <div className="modal-head">

          <div>

            <span className="eyebrow">
              Calculadora de preço
            </span>

            <h2>
              {editing
                ? 'Editar cálculo'
                : 'Calcular receita'}
            </h2>

          </div>

          <button
            type="button"
            className="icon-button"
            onClick={close}
          >
            <X size={18}/>
          </button>

        </div>

        <form onSubmit={save}>

          <div className="calculator-form-grid">

            {/* =================================================
                1. RECEITA
            ================================================= */}

            <section className="calculator-section full">

              <div className="calculator-section-head">

                <div>

                  <h3>
                    1. Sua receita
                  </h3>

                  <span>
                    Primeiro informe o que você está produzindo.
                  </span>

                </div>

              </div>

              <div className="calculator-info-grid">

                <Field label="Nome da receita">
                  <input
                    required
                    value={form.name}
                    onChange={e=>
                      setF('name',e.target.value)
                    }
                    placeholder="Ex.: Brigadeiro gourmet"
                  />
                </Field>

                <Field label="Categoria">

                  <select
                    value={form.category}
                    onChange={e=>
                      setF('category',e.target.value)
                    }
                  >

                    {CATEGORIES.map(item=>
                      <option key={item}>
                        {item}
                      </option>
                    )}

                  </select>

                </Field>

                <Field label="Rendimento">

                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
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
                    <option>un</option>
                    <option>kg</option>
                    <option>g</option>
                    <option>fatia</option>
                    <option>porção</option>
                  </select>

                </Field>

                <Field label="Tamanho / porção">

                  <input
                    value={form.portion_size}
                    onChange={e=>
                      setF(
                        'portion_size',
                        e.target.value
                      )
                    }
                    placeholder="Ex.: 20 cm / 10 fatias"
                  />

                </Field>

                <Field label="Tempo de produção">

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.prep_time_minutes}
                    onChange={e=>
                      setF(
                        'prep_time_minutes',
                        e.target.value
                      )
                    }
                    placeholder="Minutos"
                  />

                </Field>

              </div>

              <div className="calculator-photo">

                <div className="calculator-photo-preview">

                  {
                    form.photo_url
                    ?
                    <img
                      src={form.photo_url}
                      alt="Receita"
                    />
                    :
                    <ImagePlus size={24}/>
                  }

                </div>

                <div>

                  <b>
                    Foto da receita
                  </b>

                  <p>
                    JPG, PNG ou WEBP · até 5 MB
                  </p>

                  <label className="secondary small upload-btn">

                    {uploading
                      ? 'Enviando…'
                      : 'Escolher foto'}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={upload}
                      hidden
                    />

                  </label>

                </div>

              </div>

            </section>


            {/* =================================================
                2. INGREDIENTES
            ================================================= */}

            <section className="calculator-section full">

              <div className="calculator-section-head">

                <div>

                  <h3>
                    2. Ingredientes
                  </h3>

                  <span>
                    Adicione os ingredientes usados na receita.
                  </span>

                </div>

                <button
                  type="button"
                  className="secondary small"
                  onClick={addIng}
                >
                  <Plus size={15}/>
                  Adicionar ingrediente
                </button>

              </div>

              <div className="ingredient-list">

                <div className="ingredient-head">

                  <span>Ingrediente</span>
                  <span>Quantidade</span>
                  <span>Unidade</span>
                  <span>Custo unit.</span>
                  <span>Total</span>
                  <span/>

                </div>

                {
                  (form.ingredients||[]).map(item=>

                    <div
                      className="ingredient-row"
                      key={item.id}
                    >

                      <input
                        placeholder="Ex.: Chocolate"
                        value={item.name}
                        onChange={e=>
                          updateIng(
                            item.id,
                            'name',
                            e.target.value
                          )
                        }
                      />

                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        placeholder="0"
                        value={item.quantity}
                        onChange={e=>
                          updateIng(
                            item.id,
                            'quantity',
                            e.target.value
                          )
                        }
                      />

                      <select
                        value={item.unit}
                        onChange={e=>
                          updateIng(
                            item.id,
                            'unit',
                            e.target.value
                          )
                        }
                      >

                        {UNITS.map(unit=>
                          <option key={unit}>
                            {unit}
                          </option>
                        )}

                      </select>

                      <input
                        type="number"
                        min="0"
                        step="0.0001"
                        placeholder="0,00"
                        value={item.unit_cost}
                        onChange={e=>
                          updateIng(
                            item.id,
                            'unit_cost',
                            e.target.value
                          )
                        }
                      />

                      <b>
                        {
                          money(
                            (Number(item.quantity)||0) *
                            (Number(item.unit_cost)||0)
                          )
                        }
                      </b>

                      <button
                        type="button"
                        className="icon-button danger"
                        onClick={()=>
                          removeIng(item.id)
                        }
                        aria-label="Remover ingrediente"
                      >
                        <Trash2 size={15}/>
                      </button>

                    </div>

                  )
                }

              </div>

              <div className="ingredient-total">

                <span>
                  Custo dos ingredientes
                </span>

                <b>
                  {money(calc.ingredientTotal)}
                </b>

              </div>

              <div className="cost-breakdown">

                <div className="cost-box">

                  <small>
                    Ingredientes
                  </small>

                  <b>
                    {money(calc.ingredientTotal)}
                  </b>

                </div>

                <div className="cost-box">

                  <small>
                    Mão de obra
                  </small>

                  <b>
                    {money(calc.laborCost)}
                  </b>

                </div>

                <div className="cost-box">

                  <small>
                    Tempo de produção
                  </small>

                  <b>
                    {
                      calc.prepMinutes
                        ? `${calc.prepMinutes} min`
                        : '—'
                    }
                  </b>

                </div>

                <div className="cost-box highlight">

                  <small>
                    Custo total
                  </small>

                  <b>
                    {money(calc.totalCost)}
                  </b>

                </div>

              </div>

            </section>


            {/* =================================================
                3. PREÇO
            ================================================= */}

            <section className="calculator-section">

              <div className="calculator-section-head">

                <div>

                  <h3>
                    3. Quanto cobrar?
                  </h3>

                  <span>
                    O Confeasy calcula um preço de referência.
                  </span>

                </div>

              </div>

              <div className="price-layout">

                <div className="price-card">

                  <small>
                    Custo por unidade
                  </small>

                  <b>
                    {money(calc.unitCost)}
                  </b>

                </div>

                <div className="price-card suggested">

                  <small>
                    Preço sugerido
                  </small>

                  <b>
                    {money(calc.suggestedPrice)}
                  </b>

                </div>

              </div>

              <div
                className="form-grid two"
                style={{marginTop:10}}
              >

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

                <Field label="Preço de venda">

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
                      calc.suggestedPrice.toFixed(2)
                    }
                  />

                </Field>

              </div>

              <div className="formula">

                <BarChart3 size={17}/>

                <span>

                  <b>
                    Como calculamos:
                  </b>

                  {' '}
                  custo total ÷ rendimento =
                  custo por unidade.

                  Depois o Confeasy aplica
                  a margem desejada para
                  chegar ao preço sugerido.

                </span>

              </div>

            </section>


            {/* =================================================
                4. PREPARO
            ================================================= */}

            <section className="calculator-section">

              <div className="calculator-section-head">

                <div>

                  <h3>
                    4. Preparo e observações
                  </h3>

                  <span>
                    Guarde o passo a passo junto do cálculo.
                  </span>

                </div>

              </div>

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
                  placeholder="Descreva o passo a passo..."
                />

              </Field>

              <div style={{height:10}}/>

              <Field label="Observações">

                <textarea
                  rows="3"
                  value={form.notes}
                  onChange={e=>
                    setF(
                      'notes',
                      e.target.value
                    )
                  }
                  placeholder="Validade, conservação, decoração..."
                />

              </Field>

            </section>

          </div>

          <div className="modal-actions">

            <button
              type="button"
              className="secondary"
              onClick={close}
            >
              Cancelar
            </button>

            <button className="primary">

              {editing
                ? 'Salvar alterações'
                : 'Salvar cálculo'}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

function Orders({session,notify,setPage}){const blank={client_name:'',client_phone:'',item_name:'',delivery_date:'',delivery_time:'',value:'',deposit:'',payment_method:'Pix',status:'Pendente',notes:''};const[rows,setRows]=useState([]),[open,setOpen]=useState(false),[editing,setEditing]=useState(null),[form,setForm]=useState(blank),[query,setQuery]=useState('');async function load(){const{data,error}=await supabase.from('orders').select('*').order('delivery_date',{ascending:true});if(error)notify(error.message);else setRows(data||[])}useEffect(()=>{load()},[]);const filtered=rows.filter(r=>!query||`${r.client_name} ${r.item_name}`.toLowerCase().includes(query.toLowerCase()));function openNew(){setEditing(null);setForm(blank);setOpen(true)}function edit(r){setEditing(r);setForm({...blank,...r});setOpen(true)}async function save(e){e.preventDefault();const payload={user_id:session.user.id,client_name:form.client_name.trim(),client_phone:form.client_phone||null,item_name:form.item_name.trim(),delivery_date:form.delivery_date||null,delivery_time:form.delivery_time||null,value:Number(form.value)||0,deposit:Number(form.deposit)||0,payment_method:form.payment_method,status:form.status,notes:form.notes||null};const res=editing?await supabase.from('orders').update(payload).eq('id',editing.id):await supabase.from('orders').insert(payload);if(res.error)notify(res.error.message);else{setOpen(false);notify(editing?'Pedido atualizado.':'Pedido cadastrado.');load()}}async function remove(r){if(!confirm(`Excluir o pedido de ${r.client_name}?`))return;const{error}=await supabase.from('orders').delete().eq('id',r.id);if(error)notify(error.message);else{notify('Pedido excluído.');load()}}return <><div className="page-tools standard-page-tools"><div className="standard-search-wrap"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar cliente ou pedido..."/></div></div><div className="standard-actions"><button className="primary" onClick={openNew}><Plus size={17}/> Novo pedido</button></div></div><section className="panel orders-page-panel"><div className="section-head"><div><h2>Agenda de pedidos</h2><span>{filtered.length} pedidos</span></div></div>{filtered.length?<><div className="table-wrap orders-table-desktop"><table><thead><tr><th>Cliente</th><th>Pedido</th><th>Entrega</th><th>Valor</th><th>Sinal</th><th>Status</th><th/></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td><b>{r.client_name}</b><small className="table-sub">{r.client_phone||'Sem WhatsApp'}</small></td><td>{r.item_name}</td><td>{dateBR(r.delivery_date)}{r.delivery_time&&<small className="table-sub">{r.delivery_time}</small>}</td><td>{money(r.value)}</td><td>{money(r.deposit)}</td><td><span className={`pill ${['Pago','Entregue'].includes(r.status)?'ok':''}`}>{r.status}</span></td><td><div className="row-actions"><button className="icon-button" onClick={()=>edit(r)}><Edit3 size={15}/></button><button className="icon-button danger" onClick={()=>remove(r.id)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div><div className="orders-mobile-list">{filtered.map(r=><article className="order-mobile-card" key={`mobile-${r.id}`}><div className="order-mobile-top"><div><strong>{r.client_name}</strong><small>{r.client_phone||'Sem WhatsApp'}</small></div><span className={`pill ${['Pago','Entregue'].includes(r.status)?'ok':''}`}>{r.status}</span></div><div className="order-mobile-product">{r.item_name}</div><div className="order-mobile-meta"><div><small>Entrega</small><strong>{dateBR(r.delivery_date)}{r.delivery_time?` • ${r.delivery_time}`:''}</strong></div><div><small>Valor</small><strong>{money(r.value)}</strong></div><div><small>Sinal</small><strong>{money(r.deposit)}</strong></div></div><div className="order-mobile-actions"><button className="secondary" onClick={()=>edit(r)}><Edit3 size={15}/> Editar</button><button className="secondary danger" onClick={()=>remove(r.id)}><Trash2 size={15}/> Excluir</button></div></article>)}</div></>:<Empty text="Nenhum pedido encontrado." action="Novo pedido" onClick={openNew}/>}</section>{open&&<Modal open={open} close={()=>setOpen(false)} title={editing?'Editar pedido':'Novo pedido'}><form className="form" onSubmit={save}><div className="form-grid two"><Field label="Cliente"><input required value={form.client_name} onChange={e=>setForm({...form,client_name:e.target.value})}/></Field><Field label="WhatsApp"><input value={form.client_phone} onChange={e=>setForm({...form,client_phone:e.target.value})} placeholder="(47) 99999-9999"/></Field><Field label="Produto / pedido"><input required value={form.item_name} onChange={e=>setForm({...form,item_name:e.target.value})}/></Field><Field label="Data de entrega"><input type="date" value={form.delivery_date} onChange={e=>setForm({...form,delivery_date:e.target.value})}/></Field><Field label="Horário"><input type="time" value={form.delivery_time} onChange={e=>setForm({...form,delivery_time:e.target.value})}/></Field><Field label="Valor total"><input type="number" step="0.01" value={form.value} onChange={e=>setForm({...form,value:e.target.value})}/></Field><Field label="Sinal recebido"><input type="number" step="0.01" value={form.deposit} onChange={e=>setForm({...form,deposit:e.target.value})}/></Field><Field label="Forma de pagamento"><select value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})}><option>Pix</option><option>Dinheiro</option><option>Cartão</option><option>Transferência</option><option>A combinar</option></select></Field><Field label="Status"><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{ORDER_STATUS.map(s=><option key={s}>{s}</option>)}</select></Field></div><Field label="Observações"><textarea rows="4" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></Field><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setOpen(false)}>Cancelar</button><button className="primary">Salvar pedido</button></div></form></Modal>}</>}

function Finance({session,notify}){const[orders,setOrders]=useState([]),[expenses,setExpenses]=useState([]),[open,setOpen]=useState(false),[form,setForm]=useState({description:'',category:'Ingredientes',value:'',date:todayISO()});async function load(){const[o,e]=await Promise.all([supabase.from('orders').select('value,deposit,status,delivery_date'),supabase.from('expenses').select('*').order('date',{ascending:false}).order('created_at',{ascending:false})]);setOrders(o.data||[]);setExpenses(e.data||[])}useEffect(()=>{load()},[]);const sales=orders.reduce((s,x)=>s+Number(x.value||0),0),received=orders.reduce((s,x)=>s+Number(x.deposit||0),0),exp=expenses.reduce((s,x)=>s+Number(x.value||0),0);async function add(e){e.preventDefault();const{error}=await supabase.from('expenses').insert({user_id:session.user.id,description:form.description.trim(),category:form.category,value:Number(form.value)||0,date:form.date});if(error)notify(error.message);else{setOpen(false);setForm({description:'',category:'Ingredientes',value:'',date:todayISO()});notify('Despesa lançada.');load()}}async function remove(id){if(!confirm('Excluir esta despesa?'))return;const{error}=await supabase.from('expenses').delete().eq('id',id);if(error)notify(error.message);else load()}return <><div className="stats"><Stat label="Pedidos registrados" value={money(sales)}/><Stat label="Recebido em sinais" value={money(received)} green/><Stat label="Despesas" value={money(exp)}/><Stat label="Resultado registrado" value={money(received-exp)} green/></div><section className="panel"><div className="section-head"><div><h2>Despesas</h2><span>Controle seus custos por categoria.</span></div><button className="primary" onClick={()=>setOpen(true)}><Plus size={16}/> Nova despesa</button></div>{expenses.length?<div className="table-wrap"><table><thead><tr><th>Descrição</th><th>Categoria</th><th>Data</th><th>Valor</th><th/></tr></thead><tbody>{expenses.map(e=><tr key={e.id}><td>{e.description}</td><td><span className="pill">{e.category}</span></td><td>{dateBR(e.date)}</td><td>{money(e.value)}</td><td><button className="icon-button danger" onClick={()=>remove(e.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>:<Empty text="Nenhuma despesa registrada." action="Nova despesa" onClick={()=>setOpen(true)}/>}</section>{open&&<Modal open={open} close={()=>setOpen(false)} title="Nova despesa"><form className="form" onSubmit={add}><Field label="Descrição"><input required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Ex.: chocolate, caixa, anúncio..."/></Field><div className="form-grid two"><Field label="Categoria"><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{EXPENSE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Field><Field label="Valor"><input required type="number" step="0.01" min="0" value={form.value} onChange={e=>setForm({...form,value:e.target.value})}/></Field><Field label="Data"><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></Field></div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setOpen(false)}>Cancelar</button><button className="primary">Lançar despesa</button></div></form></Modal>}</>}

const blank={
  name:'',
  package_quantity:'',
  package_unit:'g',
  package_cost:'',
  unit_family:'weight',
  base_unit:'g',
  quantity:'',
  min_quantity:'0'
};;const[rows,setRows]=useState([]),[open,setOpen]=useState(false),[editing,setEditing]=useState(null),[form,setForm]=useState(blank),[query,setQuery]=useState('');async function load(){const{data,error}=await supabase.from('ingredients').select('*').order('name');if(error)notify(error.message);else setRows(data||[])}useEffect(()=>{load()},[]);const filtered=rows.filter(r=>!query||r.name.toLowerCase().includes(query.toLowerCase()));function edit(r){setEditing(r);setForm({...blank,...r});setOpen(true)}async function save(e){
  e.preventDefault();

  const packageQuantity=Number(form.package_quantity)||0;
  const packageCost=Number(form.package_cost)||0;

  const conversion={
    g:{family:'weight',base:'g',factor:1},
    kg:{family:'weight',base:'g',factor:1000},
    ml:{family:'volume',base:'ml',factor:1},
    l:{family:'volume',base:'ml',factor:1000},
    un:{family:'count',base:'un',factor:1},
    pacote:{family:'other',base:'pacote',factor:1},
    caixa:{family:'other',base:'caixa',factor:1}
  };

  const selected=conversion[form.package_unit]||{
    family:'other',
    base:form.package_unit||'un',
    factor:1
  };

  const totalBaseQuantity=packageQuantity*selected.factor;

  const baseUnitCost=
    totalBaseQuantity>0
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
    ? await supabase
        .from('ingredients')
        .update(payload)
        .eq('id',editing.id)
    : await supabase
        .from('ingredients')
        .insert(payload);

  if(res.error){
    notify(res.error.message);
  }else{
    setOpen(false);
    notify(editing?'Ingrediente atualizado.':'Ingrediente adicionado.');
    load();
  }
}{if(!confirm('Excluir este ingrediente?'))return;const{error}=await supabase.from('ingredients').delete().eq('id',id);if(error)notify(error.message);else load()}return <><div className="page-tools standard-page-tools"><div className="standard-search-wrap"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar ingrediente..."/></div></div><div className="standard-actions"><button className="primary" onClick={()=>{setEditing(null);setForm(blank);setOpen(true)}}><Plus size={17}/> Novo ingrediente</button></div></div><section className="panel pantry-page-panel"><div className="section-head"><div><h2>Minha despensa</h2><span>{rows.length} ingredientes cadastrados</span></div></div>{filtered.length?<div className="table-wrap"><table><thead><tr><th>Ingrediente</th><th>Estoque</th><th>Unidade</th><th>Custo unit.</th><th>Estoque mínimo</th><th>Status</th><th/></tr></thead><tbody>{filtered.map(r=>{const low=Number(r.quantity||0)<=Number(r.min_quantity||0);return <tr key={r.id}><td><b>{r.name}</b></td><td>{r.quantity}</td><td>{r.unit}</td><td>{money(r.unit_cost)}</td><td>{r.min_quantity}</td><td><span className={`pill ${low?'warning':'ok'}`}>{low?'Repor':'OK'}</span></td><td><div className="row-actions"><button className="icon-button" onClick={()=>edit(r)}><Edit3 size={15}/></button><button className="icon-button danger" onClick={()=>remove(r.id)}><Trash2 size={15}/></button></div></td></tr>})}</tbody></table></div>:<Empty text="Sua despensa está vazia." action="Novo ingrediente" onClick={()=>setOpen(true)}/>}</section>{open&&<Modal open={open} close={()=>setOpen(false)} title={editing?'Editar ingrediente':'Novo ingrediente'}><form className="form" onSubmit={save}><Field label="Ingrediente"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ex.: Chocolate"/></Field><div className="form-grid two"><Field label="Quantidade disponível"><input type="number" min="0" step="0.001" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/></Field><Field label="Unidade"><select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></Field><Field label="Custo por unidade"><input type="number" min="0" step="0.0001" value={form.unit_cost} onChange={e=>setForm({...form,unit_cost:e.target.value})}/></Field><Field label="Estoque mínimo"><input type="number" min="0" step="0.001" value={form.min_quantity} onChange={e=>setForm({...form,min_quantity:e.target.value})}/></Field></div><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setOpen(false)}>Cancelar</button><button className="primary">Salvar ingrediente</button></div></form></Modal>}</>}

function Marketing(){const[topic,setTopic]=useState(''),[type,setType]=useState('Reels'),[out,setOut]=useState('');function generate(){const t=topic.trim()||'meus doces';setOut(`IDEIA DE ${type.toUpperCase()}\n\nGancho: Você também deixa ${t} para a última hora?\n\nDesenvolvimento: mostre o produto em detalhes, explique o diferencial e apresente uma situação real da cliente.\n\nCTA: Me chama no WhatsApp e veja as opções disponíveis.\n\nDica: use uma foto ou vídeo real do seu produto para aumentar a conexão.`)}return <section className="marketing-layout"><div className="panel ai-panel"><div className="eyebrow">Assistente</div><h2>Marketing com IA</h2><p>Crie rascunhos para divulgar seus produtos e sua confeitaria.</p><Field label="O que você quer divulgar?"><textarea value={topic} onChange={e=>setTopic(e.target.value)} rows="5" placeholder="Ex.: quero vender mais bolos de aniversário"/></Field><Field label="Formato"><select value={type} onChange={e=>setType(e.target.value)}><option>Reels</option><option>Post</option><option>Carrossel</option><option>Stories</option><option>WhatsApp</option></select></Field><button className="primary wide" onClick={generate}><Sparkles size={16}/> Gerar ideia</button></div><div className="panel ai-output-panel"><div className="section-head"><div><h2>Seu rascunho</h2><span>Revise antes de publicar.</span></div></div>{out?<pre className="ai-output">{out}</pre>:<div className="ai-placeholder"><Sparkles size={28}/><p>Digite um objetivo ao lado e o Confeasy prepara uma primeira ideia.</p></div>}</div></section>}

function Business({profile,setProfile,session,notify}){const[form,setForm]=useState(profile);useEffect(()=>setForm(profile),[profile]);async function save(e){e.preventDefault();const payload={full_name:form.full_name||'',business_name:form.business_name||'Minha Confeitaria',phone:form.phone||null,instagram:form.instagram||null,city:form.city||null,address:form.address||null,logo_url:form.logo_url||null};const{data,error}=await supabase.from('profiles').update(payload).eq('id',session.user.id).select().single();if(error)notify(error.message);else{setProfile({...profile,...data});notify('Dados do negócio atualizados.')}}return <section className="panel business-panel"><div className="section-head"><div><h2>Meu negócio</h2><span>Essas informações ficam vinculadas à sua conta.</span></div><Settings size={19}/></div><form className="form" onSubmit={save}><div className="form-grid two"><Field label="Confeiteira"><input value={form.full_name||''} onChange={e=>setForm({...form,full_name:e.target.value})} placeholder="Seu nome"/></Field><Field label="Nome do negócio"><input value={form.business_name||''} onChange={e=>setForm({...form,business_name:e.target.value})}/></Field><Field label="WhatsApp"><input value={form.phone||''} onChange={e=>setForm({...form,phone:e.target.value})}/></Field><Field label="Instagram"><input value={form.instagram||''} onChange={e=>setForm({...form,instagram:e.target.value})} placeholder="@suaempresa"/></Field><Field label="Cidade"><input value={form.city||''} onChange={e=>setForm({...form,city:e.target.value})}/></Field><Field label="Endereço"><input value={form.address||''} onChange={e=>setForm({...form,address:e.target.value})}/></Field></div><div className="account-info"><div><span>E-mail</span><b>{session.user.email}</b></div><div><span>Acesso até</span><b>{dateBR(profile.expires_at)}</b></div></div><button className="primary"><CheckCircle2 size={16}/> Salvar alterações</button></form></section>}

function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function Modal({open,close,title,children}){if(!open)return null;return <div className="modal-bg" onMouseDown={e=>e.target===e.currentTarget&&close()}><div className="modal"><div className="modal-head"><h2>{title}</h2><button type="button" className="icon-button" onClick={close}><X size={18}/></button></div>{children}</div></div>}
