import { useState, useEffect } from "react";
import {
  Calculator, Settings, Plus, Trash2, Package, Clock,
  Sparkles, Share2, Lightbulb, Type, TrendingUp, Lock,
  Eye, EyeOff, Copy, Check, ShoppingCart,
  X, BarChart2, CalendarClock, Coins, Zap,
  ChevronRight, Circle, CheckCircle2, MessageSquare,
  LayoutDashboard, ListChecks, Wallet
} from 'lucide-react';

const PASSWORD = "doceLucro123";

const C = {
  bg:        "#0D0D0D",
  surface:   "#161616",
  card:      "#1E1E1E",
  cardHov:   "#252525",
  border:    "#2A2A2A",
  borderL:   "#383838",
  // accents
  lime:      "#C8F135",
  limeD:     "#1A2200",
  purple:    "#8B5CF6",
  purpleD:   "#1A1030",
  teal:      "#2DD4BF",
  tealD:     "#0A1F1C",
  rose:      "#F43F5E",
  roseD:     "#1F0A10",
  amber:     "#F59E0B",
  amberD:    "#1F1500",
  // text
  text:      "#F0F0F0",
  textMid:   "#A0A0A0",
  textMuted: "#606060",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:${C.bg};font-family:'Outfit',sans-serif;}
  input,select,textarea{font-family:'Outfit',sans-serif;}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
  input[type=range]{-webkit-appearance:none;appearance:none;height:4px;border-radius:99px;background:${C.border};outline:none;cursor:pointer;}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${C.lime};cursor:pointer;box-shadow:0 0 0 4px ${C.limeD};}
  select option{background:${C.card};color:${C.text};}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shake{0%,100%{transform:translateX(0)}25%,75%{transform:translateX(-6px)}50%{transform:translateX(6px)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .fade-up{animation:fadeUp .2s ease forwards;}
  .shake{animation:shake .35s ease;}
  .nav-item:hover{background:${C.cardHov} !important;}
  .hover-row:hover{background:${C.cardHov} !important;}
  .del-btn:hover{color:${C.rose} !important;}
  .chip-btn:hover{background:${C.borderL} !important;}
  input:focus,select:focus,textarea:focus{outline:none;border-color:${C.lime} !important;box-shadow:0 0 0 3px ${C.limeD};}
`;

const fmt = v => (v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const fmtDate = d => new Date(d).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit'});
const fmtDT   = d => new Date(d).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});

function load(k,def){try{const v=localStorage.getItem(k);return v?JSON.parse(v):def;}catch{return def;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}

const DEF_INGS=[
  {id:1,name:'Leite Condensado',packageWeight:395,cost:5.50},
  {id:2,name:'Creme de Leite',packageWeight:200,cost:3.20},
  {id:3,name:'Chocolate em Po 50%',packageWeight:1000,cost:35.00},
  {id:4,name:'Manteiga',packageWeight:200,cost:12.00},
  {id:5,name:'Farinha de Trigo',packageWeight:1000,cost:5.00},
  {id:6,name:'Ovos',packageWeight:1,cost:0.80},
  {id:7,name:'Embalagem',packageWeight:1,cost:1.50},
];

const DEF_BIZ={salary:3000,fixedCosts:800,hoursPerDay:8,daysPerWeek:5};

const DEF_RECIPE={
  name:'Brigadeiro Gourmet',
  yields:20,
  timeSpentMinutes:60,
  profitMargin:30,
  selectedIngredients:[
    {id:1,quantity:395},
    {id:2,quantity:100},
    {id:3,quantity:40},
    {id:4,quantity:20}
  ]
};

// ── SHARED COMPONENTS ─────────────────────────────────

const Inp = ({label, ...p}) => (
  <div>
    {label && <label style={{display:'block',fontSize:11,fontWeight:600,color:C.textMuted,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6}}>{label}</label>}
    <input {...p} style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:10,padding:'11px 14px',fontSize:14,color:C.text,width:'100%',transition:'border-color .2s, box-shadow .2s',...p.style}}/>
  </div>
);

const Card = ({children,accent,style}) => (
  <div style={{background:C.card,border:`1px solid ${accent||C.border}`,borderRadius:16,padding:20,...style}}>
    {children}
  </div>
);

const Badge = ({children,color}) => (
  <span style={{background:color+'22',color,fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:6,letterSpacing:.5}}>{children}</span>
);

const StatCard = ({label,value,accent=C.lime,icon,sub}) => (
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:18,display:'flex',flexDirection:'column',gap:8}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <span style={{fontSize:12,fontWeight:600,color:C.textMuted,textTransform:'uppercase',letterSpacing:1}}>{label}</span>
      {icon && <div style={{background:accent+'22',borderRadius:8,padding:6,display:'flex'}}>{icon}</div>}
    </div>
    <div style={{fontFamily:"'Outfit',sans-serif",fontSize:26,fontWeight:800,color:accent,lineHeight:1}}>{value}</div>
    {sub && <div style={{fontSize:11,color:C.textMuted}}>{sub}</div>}
  </div>
);

// ── LOGO ICON ─────────────────────────────────────────

const ConfeasyIcon = ({size=28}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect x="4" y="18" width="24" height="10" rx="4" fill={C.lime}/>
    <path d="M10 18V14C10 10.686 12.686 8 16 8C19.314 8 22 10.686 22 14V18" stroke={C.lime} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M13 8C13 6.343 14.343 5 16 5C17.657 5 19 6.343 19 8" stroke={C.lime} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="16" cy="22" r="2" fill={C.bg}/>
  </svg>
);

// ── LOGIN ─────────────────────────────────────────────

function Login({onLogin}){
  const [pwd,setPwd]=useState('');
  const [show,setShow]=useState(false);
  const [err,setErr]=useState('');
  const [shake,setShake]=useState(false);

  const attempt=()=>{
    if(pwd===PASSWORD)onLogin();
    else{
      setErr('Senha incorreta.');
      setShake(true);
      setTimeout(()=>setShake(false),400);
    }
  };

  return(
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:"'Outfit',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <style>{css}</style>

      <div className={shake?'shake':''} style={{width:'100%',maxWidth:380}}>

        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:12}}>
            <ConfeasyIcon size={36}/>
            <span style={{fontSize:32,fontWeight:900,color:C.text,letterSpacing:-1}}>Confeasy</span>
          </div>
          <p style={{color:C.textMuted,fontSize:13,letterSpacing:.5}}>Sua confeitaria em um só lugar</p>
        </div>

        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:28}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:22}}>
            <Lock size={13} color={C.lime}/>
            <span style={{fontSize:11,fontWeight:700,color:C.textMuted,letterSpacing:2,textTransform:'uppercase'}}>Acesso privado</span>
          </div>

          <div style={{position:'relative',marginBottom:err?10:16}}>
            <input
              type={show?'text':'password'}
              placeholder="Digite sua senha"
              value={pwd}
              onChange={e=>{setPwd(e.target.value);setErr('');}}
              onKeyDown={e=>e.key==='Enter'&&attempt()}
              style={{
                width:'100%',
                background:C.surface,
                border:`1.5px solid ${err?C.rose:C.border}`,
                borderRadius:12,
                padding:'13px 44px 13px 16px',
                fontSize:15,
                color:C.text,
                outline:'none',
                fontFamily:"'Outfit',sans-serif",
                transition:'border-color .2s'
              }}
            />

            <button
              onClick={()=>setShow(!show)}
              style={{
                position:'absolute',
                right:14,
                top:'50%',
                transform:'translateY(-50%)',
                background:'none',
                border:'none',
                cursor:'pointer',
                color:C.textMuted,
                display:'flex'
              }}
            >
              {show?<EyeOff size={17}/>:<Eye size={17}/>}
            </button>
          </div>

          {err&&<p style={{color:C.rose,fontSize:12,marginBottom:14}}>{err}</p>}

          <button
            onClick={attempt}
            style={{
              width:'100%',
              background:C.lime,
              color:C.bg,
              border:'none',
              borderRadius:12,
              padding:14,
              fontWeight:800,
              fontSize:15,
              cursor:'pointer',
              fontFamily:"'Outfit',sans-serif",
              letterSpacing:.5,
              transition:'opacity .2s'
            }}
          >
            Entrar
          </button>
        </div>

        <p style={{textAlign:'center',fontSize:11,color:C.textMuted,marginTop:20,letterSpacing:1,textTransform:'uppercase'}}>
          Acesso anual · Renovação automática
        </p>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────

export default function App(){

  const [loggedIn,setLoggedIn]=useState(()=>load('cf_session',false));
  const [tab,setTab]=useState('pedidos');

  const [biz,setBiz]=useState(()=>load('cf_biz',DEF_BIZ));
  const [ingredients,setIngredients]=useState(()=>load('cf_ings',DEF_INGS));
  const [recipe,setRecipe]=useState(()=>load('cf_recipe',DEF_RECIPE));
  const [orders,setOrders]=useState(()=>load('cf_orders',[]));
  const [shopping,setShopping]=useState(()=>load('cf_shopping',[]));
  const [expenses,setExpenses]=useState(()=>load('cf_expenses',{luz:'',internet:'',gas:'',outros:''}));

  const [aiResult,setAiResult]=useState('');
  const [isAiLoading,setIsAiLoading]=useState(false);
  const [aiError,setAiError]=useState(null);
  const [copied,setCopied]=useState(false);

  const [newOrder,setNewOrder]=useState({
    client:'',
    pickupDate:'',
    details:'',
    obs:'',
    value:'',
    paid:''
  });

  const [orderModal,setOrderModal]=useState(false);
  const [newShopItem,setNewShopItem]=useState('');
  const [newIng,setNewIng]=useState({
    name:'',
    packageWeight:'',
    cost:''
  });

  useEffect(()=>{save('cf_session',loggedIn);},[loggedIn]);
  useEffect(()=>{save('cf_biz',biz);},[biz]);
  useEffect(()=>{save('cf_ings',ingredients);},[ingredients]);
  useEffect(()=>{save('cf_recipe',recipe);},[recipe]);
  useEffect(()=>{save('cf_orders',orders);},[orders]);
  useEffect(()=>{save('cf_shopping',shopping);},[shopping]);
  useEffect(()=>{save('cf_expenses',expenses);},[expenses]);

  if(!loggedIn) return <Login onLogin={()=>setLoggedIn(true)}/>;

  // Calcs
  const hourlyRate=(()=>{
    const h=biz.hoursPerDay*biz.daysPerWeek*4.28;
    return h>0
      ?(parseFloat(biz.salary||0)+parseFloat(biz.fixedCosts||0))/h
      :0;
  })();

  const R=(()=>{
    let ing=0;

    recipe.selectedIngredients.forEach(item=>{
      const i=ingredients.find(x=>x.id===item.id);
      if(i) ing+=(i.cost/i.packageWeight)*item.quantity;
    });

    const variable=ing*.10;
    const labor=(recipe.timeSpentMinutes/60)*hourlyRate;
    const production=ing+variable+labor;
    const profit=production*(recipe.profitMargin/100);
    const total=production+profit;

    return{
      ing,
      variable,
      labor,
      production,
      profit,
      total,
      unit:recipe.yields>0?total/recipe.yields:0
    };
  })();

  const sortedOrders=[...orders].sort(
    (a,b)=>new Date(a.pickupDate)-new Date(b.pickupDate)
  );

  const pendingOrders=sortedOrders.filter(o=>!o.done);
  const doneOrders=sortedOrders.filter(o=>o.done);

  const cm=new Date().getMonth();
  const cy=new Date().getFullYear();

  const monthOrders=orders.filter(o=>{
    const d=new Date(o.pickupDate);
    return d.getMonth()===cm&&d.getFullYear()===cy;
  });

  const faturamento=monthOrders.reduce(
    (s,o)=>s+parseFloat(o.value||0),0
  );

  const recebido=monthOrders.reduce(
    (s,o)=>s+parseFloat(o.paid||0),0
  );

  const totalExp=Object.values(expenses).reduce(
    (s,v)=>s+parseFloat(v||0),0
  );

  const lucro=recebido-totalExp;

  const urgColor=d=>{
    const diff=(new Date(d)-new Date())/86400000;

    if(diff<0)return C.rose;
    if(diff<1)return C.amber;
    if(diff<3)return '#F59E0B';

    return C.teal;
  };

  const urgLabel=d=>{
    const diff=(new Date(d)-new Date())/86400000;

    if(diff<0)return'Atrasado';
    if(diff<1)return'Hoje!';
    if(diff<2)return'Amanhã';

    return'Agendado';
  };

  const addOrder=()=>{
    if(!newOrder.client||!newOrder.pickupDate)return;

    setOrders([
      ...orders,
      {
        ...newOrder,
        id:Date.now(),
        done:false
      }
    ]);

    setNewOrder({
      client:'',
      pickupDate:'',
      details:'',
      obs:'',
      value:'',
      paid:''
    });

    setOrderModal(false);
  };

  const toggleOrder=id=>
    setOrders(
      orders.map(o=>
        o.id===id
          ?{...o,done:!o.done}
          :o
      )
    );

  const deleteOrder=id=>
    setOrders(orders.filter(o=>o.id!==id));

  const addShop=()=>{
    if(!newShopItem.trim())return;

    setShopping([
      ...shopping,
      {
        id:Date.now(),
        text:newShopItem.trim(),
        checked:false
      }
    ]);

    setNewShopItem('');
  };

  const toggleShop=id=>
    setShopping(
      shopping.map(i=>
        i.id===id
          ?{...i,checked:!i.checked}
          :i
      )
    );

  const deleteShop=id=>
    setShopping(shopping.filter(i=>i.id!==id));

  const addIngToDB=()=>{
    if(newIng.name&&newIng.cost&&newIng.packageWeight){

      setIngredients([
        ...ingredients,
        {
          ...newIng,
          id:Date.now(),
          packageWeight:parseFloat(newIng.packageWeight),
          cost:parseFloat(newIng.cost)
        }
      ]);

      setNewIng({
        name:'',
        packageWeight:'',
        cost:''
      });
    }
  };

  const addIngToRecipe=id=>{
    if(
      !id ||
      recipe.selectedIngredients.find(
        i=>i.id===parseInt(id)
      )
    )return;

    setRecipe({
      ...recipe,
      selectedIngredients:[
        ...recipe.selectedIngredients,
        {
          id:parseInt(id),
          quantity:0
        }
      ]
    });
  };

  const updateQty=(id,qty)=>
    setRecipe({
      ...recipe,
      selectedIngredients:
        recipe.selectedIngredients.map(i=>
          i.id===id
            ?{...i,quantity:parseFloat(qty)||0}
            :i
        )
    });

  const removeFromRecipe=id=>
    setRecipe({
      ...recipe,
      selectedIngredients:
        recipe.selectedIngredients.filter(
          i=>i.id!==id
        )
    });

  const callAI=async(type)=>{
    setIsAiLoading(true);
    setAiError(null);
    setAiResult('');

    const prompts={
      post:'Sugira 3 ideias de posts para Instagram de confeitaria artesanal que estao em alta agora. Para cada ideia: tipo de conteudo, legenda pronta e hashtags. Seja pratico e direto.',

      stories:'Crie 3 ideias de Stories interativos para uma confeiteira artesanal postar hoje. Inclua enquete, pergunta ou contagem regressiva.',

      vendas:'Crie 3 mensagens de vendas curtas para uma confeiteira enviar no WhatsApp para clientes hoje. Tom pessoal e acolhedor.'
    };

    try{

      const res=await fetch(
        "https://api.anthropic.com/v1/messages",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            model:"claude-sonnet-4-20250514",
            max_tokens:1000,
            system:"Voce e especialista em marketing digital para confeitaria artesanal brasileira. Responda em Portugues do Brasil.",
            messages:[
              {
                role:"user",
                content:prompts[type]
              }
            ]
          })
        }
      );

      const data=await res.json();

      const text=
        data.content &&
        data.content[0] &&
        data.content[0].text;

      if(text)
        setAiResult(text);
      else
        throw new Error();

    }catch(e){
      setAiError("Tente novamente em alguns instantes.");
    }finally{
      setIsAiLoading(false);
    }
  };

  const inSt={
    background:C.surface,
    border:`1.5px solid ${C.border}`,
    borderRadius:10,
    padding:'11px 14px',
    fontSize:14,
    color:C.text,
    width:'100%',
    transition:'border-color .2s, box-shadow .2s',
    fontFamily:"'Outfit',sans-serif"
  };

  const TABS=[
    {id:'pedidos',label:'Pedidos',Icon:CalendarClock},
    {id:'compras',label:'Compras',Icon:ShoppingCart},
    {id:'calc',label:'Calculadora',Icon:Calculator},
    {id:'marketing',label:'Marketing IA',Icon:Zap},
    {id:'financeiro',label:'Financeiro',Icon:Wallet},
    {id:'config',label:'Negócio',Icon:Settings},
  ];

  return(
    <div style={{
      minHeight:'100vh',
      background:C.bg,
      fontFamily:"'Outfit',sans-serif",
      color:C.text,
      paddingBottom:80
    }}>

      <style>{css}</style>

      {/* HEADER */}

      <header style={{
        background:C.surface,
        borderBottom:`1px solid ${C.border}`,
        padding:'12px 20px',
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between',
        position:'sticky',
        top:0,
        zIndex:50
      }}>

        <div style={{
          display:'flex',
          alignItems:'center',
          gap:10
        }}>
          <ConfeasyIcon size={26}/>

          <div>
            <div style={{
              fontSize:18,
              fontWeight:900,
              color:C.text,
              letterSpacing:-0.5,
              lineHeight:1
            }}>
              Confeasy
            </div>

            <div style={{
              fontSize:10,
              color:C.textMuted,
              letterSpacing:.5
            }}>
              Sua confeitaria em um só lugar
            </div>
          </div>
        </div>

        <div style={{
          background:C.limeD,
          border:`1px solid ${C.lime}44`,
          borderRadius:10,
          padding:'8px 14px',
          textAlign:'right'
        }}>
          <div style={{
            fontSize:9,
            fontWeight:700,
            color:C.lime,
            textTransform:'uppercase',
            letterSpacing:1.5
          }}>
            Preço / un.
          </div>

          <div style={{
            fontSize:16,
            fontWeight:800,
            color:C.lime
          }}>
            {fmt(R.unit)}
          </div>
        </div>
      </header>

      {/* NAV */}

      <nav style={{
        background:C.surface,
        borderBottom:`1px solid ${C.border}`,
        display:'flex',
        overflowX:'auto',
        padding:'0 8px'
      }}>

        {TABS.map(t=>{

          const active=tab===t.id;

          return(
            <button
              key={t.id}
              onClick={()=>setTab(t.id)}
              style={{
                display:'flex',
                alignItems:'center',
                gap:7,
                padding:'12px 16px',
                background:'none',
                border:'none',
                borderBottom:
                  active
                    ?`2px solid ${C.lime}`
                    :'2px solid transparent',
                cursor:'pointer',
                fontFamily:"'Outfit',sans-serif",
                fontWeight:active?700:500,
                fontSize:13,
                color:active?C.lime:C.textMuted,
                whiteSpace:'nowrap',
                transition:'all .2s',
                marginBottom:-1
              }}
            >
              <t.Icon size={15}/>
              {t.label}
            </button>
          );
        })}
      </nav>

      <main style={{
        maxWidth:900,
        margin:'24px auto',
        padding:'0 16px'
      }}>

        {/* ══ PEDIDOS ══════════════════════════════════ */}

        {tab==='pedidos'&&(
          <div className="fade-up">

            <div style={{
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center',
              marginBottom:20
            }}>

              <div>
                <h2 style={{
                  fontSize:22,
                  fontWeight:800,
                  color:C.text
                }}>
                  Pedidos
                </h2>

                <p style={{
                  fontSize:13,
                  color:C.textMuted,
                  marginTop:2
                }}>
                  {pendingOrders.length} pendente
                  {pendingOrders.length!==1?'s':''}
                </p>
              </div>

              <button
                onClick={()=>setOrderModal(true)}
                style={{
                  background:C.lime,
                  color:C.bg,
                  border:'none',
                  borderRadius:10,
                  padding:'10px 18px',
                  fontWeight:700,
                  fontSize:13,
                  cursor:'pointer',
                  display:'flex',
                  alignItems:'center',
                  gap:7,
                  fontFamily:"'Outfit',sans-serif"
                }}
              >
                <Plus size={16}/>
                Novo pedido
              </button>

            </div>

            {pendingOrders.length===0&&(
              <Card style={{
                textAlign:'center',
                padding:'48px 24px'
              }}>
                <CalendarClock
                  size={32}
                  color={C.textMuted}
                  style={{
                    margin:'0 auto 12px',
                    opacity:.3
                  }}
                />

                <p style={{
                  fontWeight:700,
                  color:C.textMuted
                }}>
                  Nenhum pedido pendente
                </p>

                <p style={{
                  fontSize:13,
                  color:C.textMuted,
                  marginTop:6
                }}>
                  Toque em "Novo pedido" para começar
                </p>
              </Card>
            )}

            <div style={{
              display:'flex',
              flexDirection:'column',
              gap:10
            }}>

              {pendingOrders.map(o=>{

                const urg=urgColor(o.pickupDate);
                const val=parseFloat(o.value||0);
                const paid=parseFloat(o.paid||0);
                const pend=val-paid;

                return(
                  <div
                    key={o.id}
                    className="hover-row"
                    style={{
                      background:C.card,
                      border:`1px solid ${C.border}`,
                      borderRadius:14,
                      padding:16,
                      display:'flex',
                      gap:14,
                      transition:'background .15s',
                      cursor:'default'
                    }}
                  >

                    <div style={{
                      width:3,
                      borderRadius:4,
                      background:urg,
                      flexShrink:0,
                      alignSelf:'stretch'
                    }}/>

                    <div style={{flex:1}}>

                      <div style={{
                        display:'flex',
                        justifyContent:'space-between',
                        flexWrap:'wrap',
                        gap:8
                      }}>

                        <div>

                          <div style={{
                            fontWeight:800,
                            fontSize:16
                          }}>
                            {o.client}
                          </div>

                          <div style={{
                            display:'flex',
                            gap:8,
                            marginTop:5,
                            flexWrap:'wrap'
                          }}>
                            <Badge color={urg}>
                              {urgLabel(o.pickupDate)}
                            </Badge>

                            <span style={{
                              fontSize:12,
                              color:C.textMuted
                            }}>
                              🕐 {fmtDT(o.pickupDate)}
                            </span>
                          </div>

                        </div>

                        <div style={{textAlign:'right'}}>

                          <div style={{
                            fontWeight:800,
                            fontSize:18,
                            color:C.lime
                          }}>
                            {fmt(val)}
                          </div>

                          {pend>0&&(
                            <div style={{
                              fontSize:12,
                              color:C.amber,
                              fontWeight:600
                            }}>
                              falta {fmt(pend)}
                            </div>
                          )}

                          {pend<=0&&val>0&&(
                            <div style={{
                              fontSize:12,
                              color:C.teal,
                              fontWeight:600
                            }}>
                              ✓ pago
                            </div>
                          )}

                        </div>
                      </div>

                      {o.details&&(
                        <p style={{
                          fontSize:13,
                          color:C.textMid||C.textMuted,
                          marginTop:8,
                          lineHeight:1.5
                        }}>
                          {o.details}
                        </p>
                      )}

                      {o.obs&&(
                        <p style={{
                          fontSize:12,
                          color:C.textMuted,
                          marginTop:4,
                          fontStyle:'italic'
                        }}>
                          Obs: {o.obs}
                        </p>
                      )}

                      <div style={{
                        display:'flex',
                        gap:8,
                        marginTop:12
                      }}>

                        <button
                          onClick={()=>toggleOrder(o.id)}
                          style={{
                            background:C.tealD,
                            color:C.teal,
                            border:`1px solid ${C.teal}44`,
                            borderRadius:8,
                            padding:'6px 14px',
                            fontSize:12,
                            fontWeight:700,
                            cursor:'pointer',
                            fontFamily:"'Outfit',sans-serif"
                          }}
                        >
                          ✓ Entregue
                        </button>

                        <button
                          className="del-btn"
                          onClick={()=>deleteOrder(o.id)}
                          style={{
                            background:C.roseD,
                            color:C.rose,
                            border:`1px solid ${C.rose}44`,
                            borderRadius:8,
                            padding:'6px 14px',
                            fontSize:12,
                            fontWeight:700,
                            cursor:'pointer',
                            fontFamily:"'Outfit',sans-serif",
                            transition:'color .2s'
                          }}
                        >
                          Excluir
                        </button>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {doneOrders.length>0&&(
              <div style={{marginTop:28}}>

                <p style={{
                  fontSize:11,
                  fontWeight:700,
                  color:C.textMuted,
                  textTransform:'uppercase',
                  letterSpacing:2,
                  marginBottom:12
                }}>
                  Entregues
                </p>

                <div style={{
                  display:'flex',
                  flexDirection:'column',
                  gap:6
                }}>

                  {doneOrders.map(o=>(
                    <div
                      key={o.id}
                      style={{
                        background:C.surface,
                        border:`1px solid ${C.border}`,
                        borderRadius:10,
                        padding:'10px 14px',
                        display:'flex',
                        justifyContent:'space-between',
                        alignItems:'center',
                        opacity:.5
                      }}
                    >

                      <div>
                        <span style={{
                          fontWeight:700,
                          fontSize:13,
                          textDecoration:'line-through',
                          color:C.textMuted
                        }}>
                          {o.client}
                        </span>

                        <span style={{
                          fontSize:12,
                          color:C.textMuted,
                          marginLeft:10
                        }}>
                          {fmtDate(o.pickupDate)}
                        </span>
                      </div>

                      <div style={{
                        display:'flex',
                        alignItems:'center',
                        gap:10
                      }}>

                        <span style={{
                          fontWeight:700,
                          color:C.lime,
                          fontSize:14
                        }}>
                          {fmt(parseFloat(o.value||0))}
                        </span>

                        <button
                          onClick={()=>toggleOrder(o.id)}
                          style={{
                            background:'none',
                            border:'none',
                            cursor:'pointer',
                            fontSize:12,
                            color:C.textMuted,
                            fontFamily:"'Outfit',sans-serif"
                          }}
                        >
                          ↩
                        </button>

                        <button
                          className="del-btn"
                          onClick={()=>deleteOrder(o.id)}
                          style={{
                            background:'none',
                            border:'none',
                            cursor:'pointer',
                            color:C.textMuted,
                            display:'flex',
                            transition:'color .2s'
                          }}
                        >
                          <Trash2 size={13}/>
                        </button>

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ORDER MODAL */}

            {orderModal&&(
              <div style={{
                position:'fixed',
                inset:0,
                background:'rgba(0,0,0,.7)',
                zIndex:200,
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                padding:16
              }}>

                <div style={{
                  background:C.card,
                  border:`1px solid ${C.border}`,
                  borderRadius:20,
                  padding:28,
                  width:'100%',
                  maxWidth:480,
                  maxHeight:'90vh',
                  overflowY:'auto'
                }}>

                  <div style={{
                    display:'flex',
                    justifyContent:'space-between',
                    alignItems:'center',
                    marginBottom:24
                  }}>

                    <h3 style={{
                      fontSize:20,
                      fontWeight:800
                    }}>
                      Novo Pedido
                    </h3>

                    <button
                      onClick={()=>setOrderModal(false)}
                      style={{
                        background:C.surface,
                        border:`1px solid ${C.border}`,
                        borderRadius:8,
                        padding:6,
                        cursor:'pointer',
                        color:C.textMuted,
                        display:'flex'
                      }}
                    >
                      <X size={18}/>
                    </button>

                  </div>

                  <div style={{
                    display:'flex',
                    flexDirection:'column',
                    gap:14
                  }}>

                    <div>
                      <label style={{
                        display:'block',
                        fontSize:11,
                        fontWeight:600,
                        color:C.textMuted,
                        textTransform:'uppercase',
                        letterSpacing:1.5,
                        marginBottom:6
                      }}>
                        Nome da cliente *
                      </label>

                      <input
                        placeholder="Ex: Ana Paula"
                        value={newOrder.client}
                        onChange={e=>setNewOrder({...newOrder,client:e.target.value})}
                        style={inSt}
                      />
                    </div>

                    <div>
                      <label style={{
                        display:'block',
                        fontSize:11,
                        fontWeight:600,
                        color:C.textMuted,
                        textTransform:'uppercase',
                        letterSpacing:1.5,
                        marginBottom:6
                      }}>
                        Data e hora da retirada *
                      </label>

                      <input
                        type="datetime-local"
                        value={newOrder.pickupDate}
                        onChange={e=>setNewOrder({...newOrder,pickupDate:e.target.value})}
                        style={inSt}
                      />
                    </div>

                    <div>
                      <label style={{
                        display:'block',
                        fontSize:11,
                        fontWeight:600,
                        color:C.textMuted,
                        textTransform:'uppercase',
                        letterSpacing:1.5,
                        marginBottom:6
                      }}>
                        O que pediu
                      </label>

                      <textarea
                        placeholder="Ex: 50 brigadeiros, 1 bolo..."
                        value={newOrder.details}
                        onChange={e=>setNewOrder({...newOrder,details:e.target.value})}
                        style={{
                          ...inSt,
                          minHeight:72,
                          resize:'vertical'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display:'block',
                        fontSize:11,
                        fontWeight:600,
                        color:C.textMuted,
                        textTransform:'uppercase',
                        letterSpacing:1.5,
                        marginBottom:6
                      }}>
                        Observações
                      </label>

                      <input
                        placeholder="Ex: sem nozes, entregar em casa..."
                        value={newOrder.obs}
                        onChange={e=>setNewOrder({...newOrder,obs:e.target.value})}
                        style={inSt}
                      />
                    </div>

                    <div style={{
                      display:'grid',
                      gridTemplateColumns:'1fr 1fr',
                      gap:12
                    }}>

                      <div>
                        <label style={{
                          display:'block',
                          fontSize:11,
                          fontWeight:600,
                          color:C.textMuted,
                          textTransform:'uppercase',
                          letterSpacing:1.5,
                          marginBottom:6
                        }}>
                          Valor cobrado
                        </label>

                        <input
                          type="number"
                          placeholder="0,00"
                          value={newOrder.value}
                          onChange={e=>setNewOrder({...newOrder,value:e.target.value})}
                          style={inSt}
                        />
                      </div>

                      <div>
                        <label style={{
                          display:'block',
                          fontSize:11,
                          fontWeight:600,
                          color:C.textMuted,
                          textTransform:'uppercase',
                          letterSpacing:1.5,
                          marginBottom:6
                        }}>
                          Já pagou
                        </label>

                        <input
                          type="number"
                          placeholder="0,00"
                          value={newOrder.paid}
                          onChange={e=>setNewOrder({...newOrder,paid:e.target.value})}
                          style={inSt}
                        />
                      </div>

                    </div>

                    <button
                      onClick={addOrder}
                      style={{
                        background:C.lime,
                        color:C.bg,
                        border:'none',
                        borderRadius:12,
                        padding:14,
                        fontWeight:800,
                        fontSize:15,
                        cursor:'pointer',
                        fontFamily:"'Outfit',sans-serif",
                        marginTop:4
                      }}
                    >
                      Salvar pedido
                    </button>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ COMPRAS ══════════════════════════════════ */}

        {tab==='compras'&&(
          <div className="fade-up">

            <div style={{
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center',
              marginBottom:20
            }}>

              <div>
                <h2 style={{
                  fontSize:22,
                  fontWeight:800
                }}>
                  Lista de Compras
                </h2>

                <p style={{
                  fontSize:13,
                  color:C.textMuted,
                  marginTop:2
                }}>
                  {shopping.filter(i=>!i.checked).length} item(ns) pendente(s)
                </p>
              </div>

              {shopping.some(i=>i.checked)&&(
                <button
                  onClick={()=>setShopping(shopping.filter(i=>!i.checked))}
                  style={{
                    background:C.roseD,
                    color:C.rose,
                    border:`1px solid ${C.rose}33`,
                    borderRadius:10,
                    padding:'8px 14px',
                    fontSize:12,
                    fontWeight:700,
                    cursor:'pointer',
                    fontFamily:"'Outfit',sans-serif"
                  }}
                >
                  Limpar marcados
                </button>
              )}
            </div>

            <Card style={{marginBottom:14}}>
              <div style={{
                display:'flex',
                gap:10
              }}>

                <input
                  placeholder="Adicionar item... (Enter para confirmar)"
                  value={newShopItem}
                  onChange={e=>setNewShopItem(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&addShop()}
                  style={{
                    ...inSt,
                    flex:1,
                    fontSize:15
                  }}
                />

                <button
                  onClick={addShop}
                  style={{
                    background:C.lime,
                    color:C.bg,
                    border:'none',
                    borderRadius:10,
                    padding:'0 18px',
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    flexShrink:0
                  }}
                >
                  <Plus size={20}/>
                </button>

              </div>
            </Card>

            {shopping.length===0&&(
              <Card style={{
                textAlign:'center',
                padding:'48px 24px'
              }}>
                <ShoppingCart
                  size={32}
                  color={C.textMuted}
                  style={{
                    margin:'0 auto 12px',
                    opacity:.3
                  }}
                />

                <p style={{
                  fontWeight:700,
                  color:C.textMuted
                }}>
                  Lista vazia
                </p>

                <p style={{
                  fontSize:13,
                  color:C.textMuted,
                  marginTop:6
                }}>
                  Adicione itens acima
                </p>
              </Card>
            )}

            <div style={{
              display:'flex',
              flexDirection:'column',
              gap:8
            }}>

              {shopping.filter(i=>!i.checked).map(item=>(
                <div
                  key={item.id}
                  style={{
                    background:C.card,
                    border:`1.5px solid ${C.border}`,
                    borderRadius:12,
                    padding:'14px 16px',
                    display:'flex',
                    alignItems:'center',
                    gap:14
                  }}
                >

                  <button
                    onClick={()=>toggleShop(item.id)}
                    style={{
                      width:26,
                      height:26,
                      borderRadius:7,
                      border:`2px solid ${C.border}`,
                      background:'none',
                      cursor:'pointer',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      flexShrink:0,
                      transition:'all .2s'
                    }}
                  />

                  <span style={{
                    flex:1,
                    fontSize:15,
                    fontWeight:500
                  }}>
                    {item.text}
                  </span>

                  <button
                    className="del-btn"
                    onClick={()=>deleteShop(item.id)}
                    style={{
                      background:'none',
                      border:'none',
                      cursor:'pointer',
                      color:C.textMuted,
                      display:'flex',
                      transition:'color .2s'
                    }}
                  >
                    <Trash2 size={15}/>
                  </button>

                </div>
              ))}

              {shopping.filter(i=>i.checked).map(item=>(
                <div
                  key={item.id}
                  style={{
                    background:C.surface,
                    border:`1px solid ${C.border}`,
                    borderRadius:12,
                    padding:'14px 16px',
                    display:'flex',
                    alignItems:'center',
                    gap:14,
                    opacity:.45
                  }}
                >

                  <button
                    onClick={()=>toggleShop(item.id)}
                    style={{
                      width:26,
                      height:26,
                      borderRadius:7,
                      border:`2px solid ${C.teal}`,
                      background:C.tealD,
                      cursor:'pointer',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      flexShrink:0
                    }}
                  >
                    <Check size={13} color={C.teal}/>
                  </button>

                  <span style={{
                    flex:1,
                    fontSize:15,
                    color:C.textMuted,
                    textDecoration:'line-through'
                  }}>
                    {item.text}
                  </span>

                  <button
                    className="del-btn"
                    onClick={()=>deleteShop(item.id)}
                    style={{
                      background:'none',
                      border:'none',
                      cursor:'pointer',
                      color:C.textMuted,
                      display:'flex',
                      transition:'color .2s'
                    }}
                  >
                    <Trash2 size={15}/>
                  </button>

                </div>
              ))}

            </div>
          </div>
        )}

        {/* ══ CALCULADORA ══════════════════════════════ */}

        {tab==='calc'&&(
          <div
            className="fade-up"
            style={{
              display:'grid',
              gridTemplateColumns:'minmax(0,1.6fr) minmax(0,1fr)',
              gap:16
            }}
          >

            <div style={{
              display:'flex',
              flexDirection:'column',
              gap:14
            }}>

              <Card>

                <input
                  value={recipe.name}
                  onChange={e=>setRecipe({...recipe,name:e.target.value})}
                  style={{
                    background:'transparent',
                    border:'none',
                    borderBottom:`2px solid ${C.border}`,
                    padding:'6px 0',
                    fontSize:22,
                    fontWeight:800,
                    color:C.text,
                    outline:'none',
                    fontFamily:"'Outfit',sans-serif",
                    width:'100%',
                    marginBottom:16
                  }}
                  placeholder="Nome da Receita..."
                />

                <div style={{
                  display:'grid',
                  gridTemplateColumns:'1fr 1fr',
                  gap:10
                }}>

                  {[
                    {
                      label:'Rendimento',
                      key:'yields',
                      unit:'un',
                      Icon:Package
                    },
                    {
                      label:'Tempo',
                      key:'timeSpentMinutes',
                      unit:'min',
                      Icon:Clock
                    }
                  ].map(f=>(
                    <div
                      key={f.key}
                      style={{
                        background:C.surface,
                        border:`1px solid ${C.border}`,
                        borderRadius:12,
                        padding:14
                      }}
                    >

                      <div style={{
                        display:'flex',
                        alignItems:'center',
                        gap:6,
                        marginBottom:10
                      }}>
                        <f.Icon size={12} color={C.lime}/>
                        <span style={{
                          fontSize:10,
                          fontWeight:700,
                          color:C.textMuted,
                          textTransform:'uppercase',
                          letterSpacing:1.5
                        }}>
                          {f.label}
                        </span>
                      </div>

                      <div style={{
                        display:'flex',
                        alignItems:'baseline',
                        gap:5
                      }}>

                        <input
                          type="number"
                          value={recipe[f.key]}
                          onChange={e=>setRecipe({
                            ...recipe,
                            [f.key]:parseFloat(e.target.value)||0
                          })}
                          style={{
                            background:'transparent',
                            border:'none',
                            borderBottom:`2px solid ${C.border}`,
                            fontSize:26,
                            fontWeight:800,
                            color:C.text,
                            width:68,
                            outline:'none',
                            fontFamily:"'Outfit',sans-serif"
                          }}
                        />

                        <span style={{
                          fontSize:11,
                          color:C.textMuted
                        }}>
                          {f.unit}
                        </span>

                      </div>
                    </div>
                  ))}

                </div>
              </Card>

              <Card>

                <div style={{
                  display:'flex',
                  justifyContent:'space-between',
                  alignItems:'center',
                  marginBottom:14
                }}>

                  <span style={{
                    fontWeight:700,
                    fontSize:15
                  }}>
                    Ingredientes
                  </span>

                  <select
                    value=""
                    onChange={e=>addIngToRecipe(e.target.value)}
                    style={{
                      ...inSt,
                      width:'auto',
                      padding:'7px 12px',
                      borderRadius:8,
                      fontSize:12,
                      cursor:'pointer'
                    }}
                  >
                    <option value="" disabled>
                      + Adicionar
                    </option>

                    {ingredients.map(i=>(
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>

                </div>

                {recipe.selectedIngredients.length===0?(
                  <div style={{
                    textAlign:'center',
                    padding:'28px 0',
                    color:C.textMuted,
                    border:`1.5px dashed ${C.border}`,
                    borderRadius:10
                  }}>
                    <Package
                      size={22}
                      style={{
                        margin:'0 auto 8px',
                        opacity:.3
                      }}
                    />

                    <p style={{
                      fontSize:13
                    }}>
                      Adicione ingredientes
                    </p>
                  </div>
                ):(
                  <div style={{
                    display:'flex',
                    flexDirection:'column',
                    gap:7
                  }}>

                    {recipe.selectedIngredients.map(item=>{

                      const ing=ingredients.find(
                        i=>i.id===item.id
                      );

                      if(!ing)return null;

                      const cost=
                        (ing.cost/ing.packageWeight)*
                        item.quantity;

                      return(
                        <div
                          key={item.id}
                          style={{
                            display:'flex',
                            alignItems:'center',
                            gap:10,
                            padding:'9px 12px',
                            background:C.surface,
                            border:`1px solid ${C.border}`,
                            borderRadius:10
                          }}
                        >

                          <div style={{flex:1}}>
                            <div style={{
                              fontWeight:700,
                              fontSize:13
                            }}>
                              {ing.name}
                            </div>

                            <div style={{
                              fontSize:10,
                              color:C.textMuted
                            }}>
                              Emb. {ing.packageWeight}g
                            </div>
                          </div>

                          <div style={{
                            display:'flex',
                            alignItems:'center',
                            gap:4,
                            background:C.card,
                            border:`1px solid ${C.border}`,
                            borderRadius:8,
                            padding:'4px 9px'
                          }}>

                            <input
                              type="number"
                              value={item.quantity}
                              onChange={e=>updateQty(
                                item.id,
                                e.target.value
                              )}
                              style={{
                                width:48,
                                textAlign:'right',
                                background:'transparent',
                                border:'none',
                                fontWeight:700,
                                color:C.text,
                                outline:'none',
                                fontSize:13,
                                fontFamily:"'Outfit',sans-serif"
                              }}
                            />

                            <span style={{
                              fontSize:10,
                              color:C.textMuted
                            }}>
                              g
                            </span>

                          </div>

                          <span style={{
                            width:60,
                            textAlign:'right',
                            fontWeight:700,
                            color:C.lime,
                            fontSize:13
                          }}>
                            {fmt(cost)}
                          </span>

                          <button
                            className="del-btn"
                            onClick={()=>removeFromRecipe(item.id)}
                            style={{
                              background:'none',
                              border:'none',
                              cursor:'pointer',
                              color:C.textMuted,
                              display:'flex',
                              transition:'color .2s'
                            }}
                          >
                            <Trash2 size={13}/>
                          </button>

                        </div>
                      );
                    })}

                  </div>
                )}

                <div style={{
                  marginTop:18,
                  paddingTop:14,
                  borderTop:`1px solid ${C.border}`
                }}>

                  <p style={{
                    fontSize:11,
                    fontWeight:600,
                    color:C.textMuted,
                    textTransform:'uppercase',
                    letterSpacing:1.5,
                    marginBottom:10
                  }}>
                    Adicionar à despensa
                  </p>

                  <div style={{
                    display:'flex',
                    gap:7,
                    flexWrap:'wrap'
                  }}>

                    <input
                      placeholder="Ingrediente"
                      value={newIng.name}
                      onChange={e=>setNewIng({
                        ...newIng,
                        name:e.target.value
                      })}
                      style={{
                        ...inSt,
                        flex:1,
                        minWidth:100,
                        fontSize:13
                      }}
                    />

                    <input
                      type="number"
                      placeholder="g"
                      value={newIng.packageWeight}
                      onChange={e=>setNewIng({
                        ...newIng,
                        packageWeight:e.target.value
                      })}
                      style={{
                        ...inSt,
                        width:72,
                        fontSize:13
                      }}
                    />

                    <input
                      type="number"
                      placeholder="R$"
                      value={newIng.cost}
                      onChange={e=>setNewIng({
                        ...newIng,
                        cost:e.target.value
                      })}
                      style={{
                        ...inSt,
                        width:68,
                        fontSize:13
                      }}
                    />

                    <button
                      onClick={addIngToDB}
                      style={{
                        background:C.lime,
                        color:C.bg,
                        border:'none',
                        borderRadius:10,
                        padding:'0 14px',
                        cursor:'pointer',
                        display:'flex',
                        alignItems:'center'
                      }}
                    >
                      <Plus size={18}/>
                    </button>

                  </div>
                </div>
              </Card>
            </div>

            <div style={{
              display:'flex',
              flexDirection:'column',
              gap:12
            }}>

              <Card>

                <div style={{
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'space-between',
                  marginBottom:12
                }}>

                  <span style={{
                    fontWeight:700,
                    fontSize:14
                  }}>
                    Margem de Lucro
                  </span>

                  <span style={{
                    fontSize:24,
                    fontWeight:900,
                    color:C.lime
                  }}>
                    {recipe.profitMargin}%
                  </span>

                </div>

                <input
                  type="range"
                  min="0"
                  max="200"
                  value={recipe.profitMargin}
                  onChange={e=>setRecipe({
                    ...recipe,
                    profitMargin:parseFloat(e.target.value)
                  })}
                  style={{
                    width:'100%',
                    marginBottom:18
                  }}
                />

                {[
                  {
                    label:'Ingredientes',
                    value:R.ing
                  },
                  {
                    label:'Custos var. (10%)',
                    value:R.variable
                  },
                  {
                    label:'Mão de obra',
                    value:R.labor
                  }
                ].map(row=>(
                  <div
                    key={row.label}
                    style={{
                      display:'flex',
                      justifyContent:'space-between',
                      padding:'8px 0',
                      borderBottom:`1px solid ${C.border}`
                    }}
                  >
                    <span style={{
                      fontSize:12,
                      color:C.textMuted
                    }}>
                      {row.label}
                    </span>

                    <span style={{
                      fontSize:12,
                      fontWeight:700
                    }}>
                      {fmt(row.value)}
                    </span>
                  </div>
                ))}

                <div style={{
                  display:'flex',
                  justifyContent:'space-between',
                  padding:'10px 0',
                  borderBottom:`1px solid ${C.border}`
                }}>
                  <span style={{
                    fontWeight:700,
                    fontSize:13
                  }}>
                    Custo total
                  </span>

                  <span style={{
                    fontWeight:700,
                    fontSize:13
                  }}>
                    {fmt(R.production)}
                  </span>
                </div>

                <div style={{
                  display:'flex',
                  justifyContent:'space-between',
                  padding:'9px 11px',
                  background:C.tealD,
                  border:`1px solid ${C.teal}33`,
                  borderRadius:8,
                  marginTop:8
                }}>
                  <span style={{
                    fontWeight:700,
                    color:C.teal,
                    fontSize:13
                  }}>
                    Seu lucro
                  </span>

                  <span style={{
                    fontWeight:700,
                    color:C.teal,
                    fontSize:13
                  }}>
                    +{fmt(R.profit)}
                  </span>
                </div>

              </Card>

              <div style={{
                background:C.limeD,
                border:`2px solid ${C.lime}`,
                borderRadius:14,
                padding:20,
                textAlign:'center'
              }}>

                <div style={{
                  fontSize:10,
                  fontWeight:700,
                  color:C.lime,
                  textTransform:'uppercase',
                  letterSpacing:2,
                  marginBottom:8
                }}>
                  Preço sugerido
                </div>

                <div style={{
                  fontSize:40,
                  fontWeight:900,
                  color:C.lime,
                  lineHeight:1
                }}>
                  {fmt(R.unit)}
                </div>

                <div style={{
                  fontSize:11,
                  color:C.lime,
                  marginTop:5,
                  opacity:.6
                }}>
                  por unidade
                </div>

                <div style={{
                  marginTop:14,
                  paddingTop:12,
                  borderTop:`1px solid ${C.lime}33`,
                  display:'flex',
                  justifyContent:'space-between'
                }}>

                  <span style={{
                    fontSize:12,
                    color:C.textMuted
                  }}>
                    Faturamento total
                  </span>

                  <span style={{
                    fontSize:14,
                    fontWeight:800,
                    color:C.lime
                  }}>
                    {fmt(R.total)}
                  </span>

                </div>
              </div>

              <div style={{
                display:'grid',
                gridTemplateColumns:'1fr 1fr',
                gap:8
              }}>

                {[
                  {
                    label:'Custo/un.',
                    value:fmt(
                      R.production/(recipe.yields||1)
                    )
                  },
                  {
                    label:'Margem',
                    value:recipe.profitMargin+'%'
                  }
                ].map(s=>(
                  <div
                    key={s.label}
                    style={{
                      background:C.card,
                      border:`1px solid ${C.border}`,
                      borderRadius:12,
                      padding:14
                    }}
                  >
                    <div style={{
                      fontSize:10,
                      fontWeight:700,
                      color:C.textMuted,
                      textTransform:'uppercase',
                      letterSpacing:1.5,
                      marginBottom:5
                    }}>
                      {s.label}
                    </div>

                    <div style={{
                      fontSize:20,
                      fontWeight:800,
                      color:C.text
                    }}>
                      {s.value}
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>
        )}

        {/* ══ MARKETING IA ══════════════════════════════ */}

        {tab==='marketing'&&(
          <div className="fade-up">

            <div style={{marginBottom:20}}>
              <h2 style={{
                fontSize:22,
                fontWeight:800
              }}>
                Marketing com IA
              </h2>

              <p style={{
                fontSize:13,
                color:C.textMuted,
                marginTop:2
              }}>
                Conteúdo pronto em segundos
              </p>
            </div>

            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(3,1fr)',
              gap:12,
              marginBottom:18
            }}>

              {[
                {
                  id:'post',
                  emoji:'📸',
                  label:'O que postar hoje no Insta?',
                  color:C.purple,
                  colorD:C.purpleD
                },
                {
                  id:'stories',
                  emoji:'🎬',
                  label:'Stories pra engajar hoje',
                  color:C.teal,
                  colorD:C.tealD
                },
                {
                  id:'vendas',
                  emoji:'💬',
                  label:'Mensagem de vendas no Whats',
                  color:C.amber,
                  colorD:C.amberD
                }
              ].map(btn=>(
                <button
                  key={btn.id}
                  onClick={()=>callAI(btn.id)}
                  disabled={isAiLoading}
                  style={{
                    background:btn.colorD,
                    border:`1.5px solid ${btn.color}44`,
                    borderRadius:14,
                    padding:'20px 14px',
                    cursor:isAiLoading?'not-allowed':'pointer',
                    textAlign:'center',
                    opacity:isAiLoading?.6:1,
                    transition:'all .2s',
                    fontFamily:"'Outfit',sans-serif"
                  }}
                >

                  <div style={{
                    fontSize:28,
                    marginBottom:10
                  }}>
                    {btn.emoji}
                  </div>

                  <div style={{
                    fontWeight:700,
                    fontSize:13,
                    color:btn.color,
                    lineHeight:1.3
                  }}>
                    {btn.label}
                  </div>

                </button>
              ))}

            </div>

            <Card style={{minHeight:300}}>

              <div style={{
                display:'flex',
                justifyContent:'space-between',
                alignItems:'center',
                marginBottom:14
              }}>

                <span style={{
                  fontWeight:700,
                  fontSize:15
                }}>
                  {
                    isAiLoading
                      ?'Gerando...'
                      :aiResult
                        ?'Pronto para usar'
                        :'Resultado'
                  }
                </span>

                {aiResult&&(
                  <button
                    onClick={()=>{
                      navigator.clipboard.writeText(aiResult);
                      setCopied(true);
                      setTimeout(()=>setCopied(false),2000);
                    }}
                    style={{
                      display:'flex',
                      alignItems:'center',
                      gap:6,
                      background:C.limeD,
                      border:`1px solid ${C.lime}44`,
                      borderRadius:8,
                      padding:'7px 12px',
                      color:C.lime,
                      fontWeight:700,
                      fontSize:12,
                      cursor:'pointer',
                      fontFamily:"'Outfit',sans-serif"
                    }}
                  >
                    {copied
                      ?<><Check size={13}/> Copiado!</>
                      :<><Copy size={13}/> Copiar</>
                    }
                  </button>
                )}

              </div>

              <div style={{
                background:C.surface,
                borderRadius:12,
                padding:20,
                minHeight:200,
                display:'flex',
                alignItems:isAiLoading||!aiResult?'center':'flex-start',
                justifyContent:isAiLoading||!aiResult?'center':'flex-start'
              }}>

                {isAiLoading?(
                  <div style={{
                    textAlign:'center',
                    color:C.textMuted
                  }}>
                    <div style={{
                      width:30,
                      height:30,
                      border:`3px solid ${C.border}`,
                      borderTopColor:C.lime,
                      borderRadius:'50%',
                      animation:'spin .8s linear infinite',
                      margin:'0 auto 12px'
                    }}/>

                    <p style={{fontSize:13}}>
                      Criando conteúdo...
                    </p>
                  </div>

                ):aiResult?(
                  <p style={{
                    color:C.textMuted,
                    whiteSpace:'pre-wrap',
                    lineHeight:1.8,
                    fontSize:14
                  }}>
                    {aiResult}
                  </p>

                ):aiError?(
                  <p style={{
                    color:C.rose,
                    fontSize:13,
                    textAlign:'center'
                  }}>
                    {aiError}
                  </p>

                ):(
                  <div style={{
                    textAlign:'center',
                    color:C.textMuted
                  }}>

                    <Zap
                      size={32}
                      style={{
                        margin:'0 auto 12px',
                        opacity:.2
                      }}
                    />

                    <p style={{fontWeight:700}}>
                      Clique em um dos botões acima
                    </p>

                    <p style={{
                      fontSize:12,
                      marginTop:5
                    }}>
                      A IA gera sugestões práticas pra você
                    </p>

                  </div>
                )}

              </div>
            </Card>
          </div>
        )}

        {/* ══ FINANCEIRO ════════════════════════════════ */}

        {tab==='financeiro'&&(
          <div className="fade-up">

            <div style={{marginBottom:20}}>
              <h2 style={{
                fontSize:22,
                fontWeight:800
              }}>
                Financeiro
              </h2>

              <p style={{
                fontSize:13,
                color:C.textMuted,
                marginTop:2
              }}>
                {new Date().toLocaleDateString(
                  'pt-BR',
                  {
                    month:'long',
                    year:'numeric'
                  }
                )}
              </p>
            </div>

            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
              gap:10,
              marginBottom:20
            }}>

              <StatCard
                label="Faturamento"
                value={fmt(faturamento)}
                accent={C.lime}
                sub={`${monthOrders.length} pedidos`}
                icon={<Package size={14} color={C.lime}/>}
              />

              <StatCard
                label="Recebido"
                value={fmt(recebido)}
                accent={C.teal}
                icon={<Check size={14} color={C.teal}/>}
              />

              <StatCard
                label="Gastos"
                value={fmt(totalExp)}
                accent={C.rose}
                icon={<TrendingUp size={14} color={C.rose}/>}
              />

              <StatCard
                label="Lucro do mês"
                value={fmt(lucro)}
                accent={lucro>=0?C.lime:C.rose}
                icon={
                  <Wallet
                    size={14}
                    color={lucro>=0?C.lime:C.rose}
                  />
                }
                sub={
                  lucro>=0
                    ?'no azul 🎉'
                    :'no vermelho 😬'
                }
              />

            </div>

            <div style={{
              display:'grid',
              gridTemplateColumns:'1fr 1fr',
              gap:14
            }}>

              <Card>

                <h3 style={{
                  fontSize:16,
                  fontWeight:700,
                  marginBottom:16
                }}>
                  Gastos do Mês
                </h3>

                {[
                  {
                    key:'luz',
                    label:'💡 Energia elétrica'
                  },
                  {
                    key:'internet',
                    label:'📶 Internet'
                  },
                  {
                    key:'gas',
                    label:'🔥 Gás'
                  },
                  {
                    key:'outros',
                    label:'📎 Outros'
                  }
                ].map(f=>(
                  <div
                    key={f.key}
                    style={{marginBottom:12}}
                  >

                    <label style={{
                      display:'block',
                      fontSize:11,
                      fontWeight:600,
                      color:C.textMuted,
                      textTransform:'uppercase',
                      letterSpacing:1.5,
                      marginBottom:5
                    }}>
                      {f.label}
                    </label>

                    <div style={{
                      position:'relative'
                    }}>

                      <span style={{
                        position:'absolute',
                        left:12,
                        top:'50%',
                        transform:'translateY(-50%)',
                        color:C.textMuted,
                        fontSize:13,
                        fontWeight:700
                      }}>
                        R$
                      </span>

                      <input
                        type="number"
                        placeholder="0,00"
                        value={expenses[f.key]}
                        onChange={e=>setExpenses({
                          ...expenses,
                          [f.key]:e.target.value
                        })}
                        style={{
                          ...inSt,
                          paddingLeft:34
                        }}
                      />

                    </div>
                  </div>
                ))}

                <div style={{
                  marginTop:14,
                  paddingTop:12,
                  borderTop:`1px solid ${C.border}`,
                  display:'flex',
                  justifyContent:'space-between'
                }}>

                  <span style={{
                    fontWeight:700,
                    color:C.rose,
                    fontSize:13
                  }}>
                    Total de gastos
                  </span>

                  <span style={{
                    fontWeight:800,
                    color:C.rose
                  }}>
                    {fmt(totalExp)}
                  </span>

                </div>
              </Card>

              <Card>

                <h3 style={{
                  fontSize:16,
                  fontWeight:700,
                  marginBottom:16
                }}>
                  Pedidos do Mês
                </h3>

                {monthOrders.length===0?(
                  <div style={{
                    textAlign:'center',
                    padding:'28px 0',
                    color:C.textMuted
                  }}>
                    <Coins
                      size={24}
                      style={{
                        margin:'0 auto 8px',
                        opacity:.3
                      }}
                    />

                    <p style={{fontSize:13}}>
                      Nenhum pedido este mês
                    </p>
                  </div>

                ):(
                  <div style={{
                    display:'flex',
                    flexDirection:'column',
                    gap:7,
                    maxHeight:260,
                    overflowY:'auto'
                  }}>

                    {monthOrders.map(o=>(
                      <div
                        key={o.id}
                        style={{
                          display:'flex',
                          justifyContent:'space-between',
                          alignItems:'center',
                          padding:'9px 12px',
                          background:C.surface,
                          borderRadius:9,
                          border:`1px solid ${C.border}`
                        }}
                      >

                        <div>
                          <div style={{
                            fontWeight:700,
                            fontSize:13
                          }}>
                            {o.client}
                          </div>

                          <div style={{
                            fontSize:11,
                            color:C.textMuted
                          }}>
                            {fmtDate(o.pickupDate)}
                          </div>
                        </div>

                        <div style={{
                          textAlign:'right'
                        }}>

                          <div style={{
                            fontWeight:700,
                            color:C.lime,
                            fontSize:14
                          }}>
                            {fmt(parseFloat(o.value||0))}
                          </div>

                          {parseFloat(o.paid||0)<parseFloat(o.value||0)&&(
                            <div style={{
                              fontSize:11,
                              color:C.amber
                            }}>
                              falta {fmt(
                                parseFloat(o.value||0)-
                                parseFloat(o.paid||0)
                              )}
                            </div>
                          )}

                        </div>

                      </div>
                    ))}

                  </div>
                )}

                <div style={{
                  marginTop:14,
                  paddingTop:12,
                  borderTop:`1px solid ${C.border}`
                }}>

                  <div style={{
                    display:'flex',
                    justifyContent:'space-between',
                    marginBottom:5
                  }}>
                    <span style={{
                      fontSize:13,
                      color:C.textMuted
                    }}>
                      Total faturado
                    </span>

                    <span style={{fontWeight:700}}>
                      {fmt(faturamento)}
                    </span>
                  </div>

                  <div style={{
                    display:'flex',
                    justifyContent:'space-between'
                  }}>
                    <span style={{
                      fontSize:13,
                      color:C.textMuted
                    }}>
                      Total recebido
                    </span>

                    <span style={{
                      fontWeight:700,
                      color:C.lime
                    }}>
                      {fmt(recebido)}
                    </span>
                  </div>

                </div>
              </Card>
            </div>

            <div style={{
              background:lucro>=0?C.limeD:C.roseD,
              border:`2px solid ${lucro>=0?C.lime:C.rose}55`,
              borderRadius:14,
              padding:22,
              marginTop:14,
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center'
            }}>

              <div>

                <div style={{
                  fontSize:11,
                  fontWeight:700,
                  color:lucro>=0?C.lime:C.rose,
                  textTransform:'uppercase',
                  letterSpacing:2,
                  marginBottom:6
                }}>
                  Resultado do mês
                </div>

                <div style={{
                  fontSize:36,
                  fontWeight:900,
                  color:lucro>=0?C.lime:C.rose,
                  lineHeight:1
                }}>
                  {fmt(lucro)}
                </div>

                <div style={{
                  fontSize:13,
                  color:C.textMuted,
                  marginTop:6
                }}>
                  Recebido ({fmt(recebido)}) − Gastos ({fmt(totalExp)})
                </div>

              </div>

              <div style={{fontSize:44}}>
                {lucro>=0?'🎉':'😬'}
              </div>

            </div>
          </div>
        )}

        {/* ══ NEGÓCIO ══════════════════════════════════ */}

        {tab==='config'&&(
          <div
            className="fade-up"
            style={{
              display:'grid',
              gridTemplateColumns:'1fr 1fr',
              gap:16
            }}
          >

            <Card>

              <h3 style={{
                fontSize:18,
                fontWeight:700,
                marginBottom:18
              }}>
                💼 Remuneração
              </h3>

              {[
                {
                  label:'Salário desejado (mensal)',
                  key:'salary'
                },
                {
                  label:'Custos fixos (MEI, luz)',
                  key:'fixedCosts'
                }
              ].map(f=>(
                <div
                  key={f.key}
                  style={{marginBottom:14}}
                >

                  <label style={{
                    display:'block',
                    fontSize:11,
                    fontWeight:600,
                    color:C.textMuted,
                    textTransform:'uppercase',
                    letterSpacing:1.5,
                    marginBottom:6
                  }}>
                    {f.label}
                  </label>

                  <div style={{
                    position:'relative'
                  }}>

                    <span style={{
                      position:'absolute',
                      left:12,
                      top:'50%',
                      transform:'translateY(-50%)',
                      color:C.lime,
                      fontWeight:700,
                      fontSize:13
                    }}>
                      R$
                    </span>

                    <input
                      type="number"
                      value={biz[f.key]}
                      onChange={e=>setBiz({
                        ...biz,
                        [f.key]:e.target.value
                      })}
                      style={{
                        ...inSt,
                        paddingLeft:40,
                        fontSize:20,
                        fontWeight:800,
                        color:C.text
                      }}
                    />

                  </div>
                </div>
              ))}
            </Card>

            <div style={{
              display:'flex',
              flexDirection:'column',
              gap:14
            }}>

              <Card>

                <h3 style={{
                  fontSize:18,
                  fontWeight:700,
                  marginBottom:16
                }}>
                  ⏰ Jornada
                </h3>

                <div style={{
                  display:'grid',
                  gridTemplateColumns:'1fr 1fr',
                  gap:10
                }}>

                  {[
                    {
                      label:'Horas/dia',
                      key:'hoursPerDay'
                    },
                    {
                      label:'Dias/semana',
                      key:'daysPerWeek'
                    }
                  ].map(f=>(
                    <div key={f.key}>

                      <label style={{
                        display:'block',
                        fontSize:11,
                        fontWeight:600,
                        color:C.textMuted,
                        textTransform:'uppercase',
                        letterSpacing:1.5,
                        marginBottom:6
                      }}>
                        {f.label}
                      </label>

                      <input
                        type="number"
                        value={biz[f.key]}
                        onChange={e=>setBiz({
                          ...biz,
                          [f.key]:e.target.value
                        })}
                        style={{
                          ...inSt,
                          textAlign:'center',
                          fontSize:28,
                          fontWeight:800
                        }}
                      />

                    </div>
                  ))}

                </div>
              </Card>

              <div style={{
                background:C.limeD,
                border:`1px solid ${C.lime}44`,
                borderRadius:14,
                padding:20
              }}>

                <div style={{
                  fontSize:10,
                  fontWeight:700,
                  color:C.lime,
                  textTransform:'uppercase',
                  letterSpacing:2,
                  marginBottom:8
                }}>
                  Valor da sua hora
                </div>

                <div style={{
                  fontSize:36,
                  fontWeight:900,
                  color:C.lime
                }}>
                  {fmt(hourlyRate)}
                </div>

                <p style={{
                  color:C.lime,
                  fontSize:12,
                  marginTop:6,
                  opacity:.6
                }}>
                  Incluído em cada receita automaticamente
                </p>

              </div>

              <Card>

                <h3 style={{
                  fontSize:15,
                  fontWeight:700,
                  marginBottom:12
                }}>
                  🧂 Despensa ({ingredients.length})
                </h3>

                <div style={{
                  maxHeight:200,
                  overflowY:'auto',
                  display:'flex',
                  flexDirection:'column',
                  gap:6
                }}>

                  {ingredients.map(ing=>(
                    <div
                      key={ing.id}
                      style={{
                        display:'flex',
                        justifyContent:'space-between',
                        alignItems:'center',
                        padding:'8px 10px',
                        background:C.surface,
                        borderRadius:8,
                        border:`1px solid ${C.border}`
                      }}
                    >

                      <div>

                        <div style={{
                          fontWeight:700,
                          fontSize:13
                        }}>
                          {ing.name}
                        </div>

                        <div style={{
                          fontSize:11,
                          color:C.textMuted
                        }}>
                          {ing.packageWeight}g · {fmt(ing.cost)}
                        </div>

                      </div>

                      <button
                        className="del-btn"
                        onClick={()=>setIngredients(
                          ingredients.filter(
                            i=>i.id!==ing.id
                          )
                        )}
                        style={{
                          background:'none',
                          border:'none',
                          cursor:'pointer',
                          color:C.textMuted,
                          display:'flex',
                          transition:'color .2s'
                        }}
                      >
                        <Trash2 size={13}/>
                      </button>

                    </div>
                  ))}

                </div>
              </Card>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
