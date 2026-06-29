import React, { useMemo, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Animated, Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

const { width } = Dimensions.get('window');
const navy = '#061f56';
const navy2 = '#0b2d75';
const gold = '#f2bf2e';
const green = '#008b63';
const red = '#d7263d';
const lightBlue = '#8db8f2';

const holdings = [
  { type:'מניות ישראל', name:'לאומי', value: 52200, weight: 8.08, day: 0.77 },
  { type:'מניות ישראל', name:'פועלים', value: 47800, weight: 7.40, day: 0.52 },
  { type:'מניות ישראל', name:'שטראוס', value: 18000, weight: 2.79, day: -0.31 },
  { type:'מניות חו״ל', name:'NVIDIA', value: 36400, weight: 5.64, day: 1.22 },
  { type:'מניות חו״ל', name:'S&P 500 ETF', value: 32300, weight: 5.00, day: 0.58 },
  { type:'מניות חו״ל', name:'NASDAQ 100 ETF', value: 24900, weight: 3.86, day: 0.74 },
  { type:'אג״ח ממשלתי', name:'ממשלתי שקלי 0142', value: 81700, weight: 12.65, day: -0.05 },
  { type:'אג״ח קונצרני', name:'בנק לאומי אג״ח', value: 108400, weight: 16.79, day: 0.10 },
  { type:'אג״ח קונצרני', name:'חברת חשמל אג״ח', value: 97500, weight: 15.10, day: 0.03 },
  { type:'אג״ח קונצרני', name:'בזק אג״ח', value: 83200, weight: 12.89, day: -0.08 },
  { type:'מזומן', name:'מזומן שקלי', value: 10083, weight: 1.55, day: 0.00 },
];

const indicesIL = [
  ['ת״א 35','2,103.45','+0.45%'], ['ת״א 125','2,045.32','+0.63%'], ['SME60','655.23','-0.12%']
];
const indicesWorld = [
  ['S&P 500','5,445.21','+0.58%'], ['NASDAQ 100','19,657.82','+0.74%'], ['DOW JONES','39,118.86','+0.22%'], ['DAX','18,236.41','-0.34%']
];
const news = [
  ['TheMarker','הבורסה בתל אביב ננעלה בעליות קלות; מדד ת״א 35 עלה 0.4%','לפני 35 דקות'],
  ['גלובס','הפד הותיר את הריבית ללא שינוי; צופה שתי הורדות ב-2026','לפני שעה'],
  ['TheMarker','מחירי הנפט יורדים על רקע חשש מהאטה בצמיחה הגלובלית','לפני שעתיים'],
  ['גלובס','אנבידיה צפויה לפרסם תוצאות לרבעון הראשון','לפני 3 שעות']
];

function fmt(n){ return '₪' + n.toLocaleString('he-IL'); }
function Header({title, sub, back, onBack}){
  return <View style={styles.header}>
    <View style={styles.topRow}>
      <TouchableOpacity onPress={back?onBack:undefined} style={styles.iconBtn}>{back?<Ionicons name="chevron-forward" size={26} color="white"/>:<Ionicons name="menu" size={26} color="white"/>}</TouchableOpacity>
      <Image source={require('./assets/logo.png')} resizeMode="contain" style={styles.logoSmall}/>
      <Ionicons name="notifications-outline" size={22} color="white"/>
    </View>
    <Text style={styles.headerTitle}>{title}</Text>
    {sub && <Text style={styles.headerSub}>{sub}</Text>}
  </View>
}
function Card({children, style}){ return <View style={[styles.card, style]}>{children}</View> }
function Pie({parts, size=150}){
  const radius = size/2-13, cx=size/2, cy=size/2, circ=2*Math.PI*radius;
  let offset=0;
  return <Svg width={size} height={size}>
    <Circle cx={cx} cy={cy} r={radius} stroke="#e9eef6" strokeWidth="24" fill="none"/>
    {parts.map((p,i)=>{ const dash=(p.value/100)*circ; const el=<Circle key={i} cx={cx} cy={cy} r={radius} stroke={p.color} strokeWidth="24" fill="none" strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={-offset} strokeLinecap="butt" transform={`rotate(-90 ${cx} ${cy})`}/>; offset+=dash; return el; })}
  </Svg>
}
function LineChart({big=false}){
  const pts1 = [[0,75],[25,70],[55,78],[90,55],[125,66],[160,45],[195,51],[230,32],[265,36],[300,18]];
  const pts2 = [[0,78],[25,74],[55,82],[90,72],[125,76],[160,63],[195,70],[230,54],[265,57],[300,38]];
  const w = width - 70, h=big?230:150;
  const scale = (pts)=>pts.map(([x,y])=>`${(x/300)*w},${(y/100)*(h-40)+20}`).join(' ');
  return <Svg width={w} height={h}>
    {[20,55,90].map((y,i)=><Line key={i} x1="0" x2={w} y1={y/100*(h-40)+20} y2={y/100*(h-40)+20} stroke="#e6ebf3" strokeWidth="1"/>)}
    <Polyline points={scale(pts2)} fill="none" stroke={lightBlue} strokeWidth="3"/>
    <Polyline points={scale(pts1)} fill="none" stroke={navy} strokeWidth="3"/>
  </Svg>
}
function BottomNav({screen,setScreen}){
  const items=[['home','בית','home-outline'],['portfolio','התיק שלי','briefcase-outline'],['market','שוק ההון','stats-chart-outline'],['alerts','התראות','notifications-outline'],['more','עוד','ellipsis-horizontal']];
  return <View style={styles.nav}>{items.map(([key,label,icon])=><TouchableOpacity key={key} onPress={()=>setScreen(key)} style={styles.navItem}><Ionicons name={icon} size={22} color={screen===key?navy: '#6d7890'}/><Text style={[styles.navText,screen===key&&{color:navy,fontWeight:'800'}]}>{label}</Text></TouchableOpacity>)}</View>
}
function Login({onLogin}){
  const [u,setU]=useState('yair'), [p,setP]=useState('1234'), [err,setErr]=useState('');
  return <SafeAreaView style={styles.loginWrap}><StatusBar style="dark"/>
    <View style={styles.wave}/><Image source={require('./assets/logo.png')} resizeMode="contain" style={styles.logoLogin}/>
    <Text style={styles.hello}>שלום יאיר,</Text><Text style={styles.loginSub}>ברוך הבא לאזור האישי שלך</Text>
    <Card style={styles.loginCard}><Text style={styles.loginTitle}>התחברות לאזור אישי</Text>
      <Text style={styles.inputLabel}>שם משתמש</Text><TextInput value={u} onChangeText={setU} style={styles.input} textAlign="left" autoCapitalize="none"/>
      <Text style={styles.inputLabel}>סיסמה</Text><TextInput value={p} onChangeText={setP} style={styles.input} textAlign="left" secureTextEntry/>
      {!!err&&<Text style={styles.err}>{err}</Text>}
      <TouchableOpacity style={styles.goldBtn} onPress={()=> u==='yair'&&p==='1234'?onLogin():setErr('שם משתמש או סיסמה שגויים')}><Text style={styles.goldBtnText}>התחבר</Text></TouchableOpacity>
      <Text style={styles.forgot}>שכחתי סיסמה</Text>
    </Card>
  </SafeAreaView>
}
function Portfolio({setScreen}){
  return <ScrollView style={styles.body}><Header title="התיק שלי" sub="יאיר קורנפלד | 317-495838"/>
    <Card><Text style={styles.cardTitle}>שווי התיק</Text><Text style={styles.bigValue}>₪ 645,583</Text><Text style={styles.date}>נכון ל-27.06.2026</Text><View style={styles.divider}/><Text style={styles.policy}>מדיניות השקעה</Text><Text style={styles.policyMain}>עוקב 3 <Text style={styles.policySmall}>(עד 30% חשיפה למניות)</Text></Text>
      <View style={styles.kpis}><Kpi label="מניות" val="29.08%"/><Kpi label="אג״ח" val="69.37%"/><Kpi label="מזומן" val="1.55%" gold/></View><Text style={styles.green}>▲ +6.72% מתחילת השנה</Text>
      <TouchableOpacity onPress={()=>setScreen('exposure')} style={styles.primaryBtn}><Text style={styles.primaryText}>פירוט החשיפות בתיק</Text></TouchableOpacity></Card>
    <Card><Text style={styles.cardTitle}>ביצועי התיק</Text><Tabs/><LineChart/><View style={styles.legend}><Text>━━ התיק שלי</Text><Text style={{color:lightBlue}}>━━ מדד ייחוס</Text></View></Card>
    <TouchableOpacity onPress={()=>setScreen('holdings')}><Card><View style={styles.rowBetween}><Text style={styles.cardTitle}>אחזקות התיק</Text><Ionicons name="chevron-back" size={22} color={navy}/></View><Text style={styles.muted}>מניות, אג״ח, קרנות ומזומן לפי שווי ומשקל בתיק</Text></Card></TouchableOpacity>
  </ScrollView>
}
function Kpi({label,val,gold: g}){return <View style={styles.kpi}><Text style={styles.kpiLabel}>{label}</Text><Text style={[styles.kpiVal,g&&{color:gold}]}>{val}</Text></View>}
function Tabs(){return <View style={styles.tabs}>{['YTD','שנה','3 שנים','מפתיחה'].map((t,i)=><Text key={t} style={[styles.tab,i===0&&styles.tabActive]}>{t}</Text>)}</View>}
function Exposure({setScreen}){return <ScrollView style={styles.body}><Header title="פירוט חשיפות בתיק" sub="יאיר קורנפלד | 317-495838" back onBack={()=>setScreen('portfolio')}/>
  <Card><Text style={styles.cardTitle}>סה״כ מניות 29.08%</Text><View style={styles.row}><Pie parts={[{value:38.63,color:navy},{value:61.37,color:lightBlue}]}/><View style={styles.list}><Bullet color={navy} t="מניות בארץ" v="38.63%"/><Bullet color={lightBlue} t="מניות בחו״ל" v="61.37%"/></View></View></Card>
  <Card><Text style={styles.cardTitle}>סה״כ אג״ח 69.37%</Text><View style={styles.row}><Pie parts={[{value:18.30,color:'#00a383'},{value:81.63,color:navy}]}/><View style={styles.list}><Bullet color="#00a383" t="אג״ח ממשלתי" v="18.30%"/><Bullet color={navy} t="אג״ח קונצרני" v="81.63%"/></View></View></Card>
  <Card><Bullet color={gold} t="מזומן" v="1.55%"/></Card>
</ScrollView>}
function Bullet({color,t,v}){return <View style={styles.bulletRow}><View style={[styles.dot,{backgroundColor:color}]}/><Text style={styles.bulletText}>{t}</Text><Text style={styles.bulletVal}>{v}</Text></View>}
function Performance({setScreen}){return <ScrollView style={styles.body}><Header title="ביצועי התיק" sub="יאיר קורנפלד | 317-495838"/><Card><Tabs/><LineChart big/><View style={styles.table}>{[['חודש','+1.20%','+0.80%'],['מתחילת שנה','+6.72%','+5.32%'],['שנה','+12.40%','+10.80%'],['3 שנים','+22.18%','+18.90%'],['מפתיחה','+31.44%','+25.19%']].map((r,i)=><View key={i} style={styles.tableRow}><Text>{r[0]}</Text><Text style={styles.green}>{r[1]}</Text><Text>{r[2]}</Text></View>)}</View></Card></ScrollView>}
function Holdings({setScreen}){const [filter,setFilter]=useState('הכל'); const types=['הכל','מניות','אג״ח','קרנות','מזומן']; const rows=holdings.filter(h=>filter==='הכל'||(filter==='מניות'&&h.type.includes('מניות'))||(filter==='אג״ח'&&h.type.includes('אג״ח'))||(filter==='מזומן'&&h.type==='מזומן')||(filter==='קרנות'&&h.name.includes('ETF'))); return <ScrollView style={styles.body}><Header title="אחזקות התיק" sub="יאיר קורנפלד | 317-495838" back onBack={()=>setScreen('portfolio')}/><View style={styles.tabs}>{types.map((t)=><TouchableOpacity onPress={()=>setFilter(t)} key={t}><Text style={[styles.tab,filter===t&&styles.tabActive]}>{t}</Text></TouchableOpacity>)}</View>{rows.map((h,i)=><Card key={i}><View style={styles.rowBetween}><View><Text style={styles.hName}>{h.name}</Text><Text style={styles.muted}>{h.type}</Text></View><View style={{alignItems:'flex-start'}}><Text style={styles.hValue}>{fmt(h.value)}</Text><Text style={styles.muted}>{h.weight.toFixed(2)}% מהתיק</Text><Text style={{color:h.day>=0?green:red}}>{h.day>=0?'▲':'▼'} {Math.abs(h.day).toFixed(2)}%</Text></View></View></Card>)}</ScrollView>}
function Market(){return <ScrollView style={styles.body}><Header title="שוק ההון" sub="317-495838"/><Card><View style={styles.rowBetween}><View><Text style={styles.cardTitle}>סקירה חודשית</Text><Text style={styles.policyMain}>סקירת חודש מאי 2026</Text><Text style={styles.date}>עודכן: 27.06.2026</Text></View><Ionicons name="document-text-outline" size={54} color={navy}/></View><View style={styles.row}><TouchableOpacity style={styles.primaryBtn}><Text style={styles.primaryText}>קריאה</Text></TouchableOpacity><TouchableOpacity style={styles.outlineBtn}><Text style={styles.outlineText}>הורד PDF</Text></TouchableOpacity></View></Card><IndexCard title="מדדים בארץ" data={indicesIL}/><IndexCard title="מדדים בעולם" data={indicesWorld}/></ScrollView>}
function IndexCard({title,data}){return <Card><Text style={styles.cardTitle}>{title}</Text>{data.map((r,i)=><View key={i} style={styles.indexRow}><Text style={styles.indexName}>{r[0]}</Text><Text>{r[1]}</Text><Text style={{color:r[2].startsWith('+')?green:red}}>{r[2]}</Text></View>)}</Card>}
function News(){return <ScrollView style={styles.body}><Header title="חדשות" sub="יאיר קורנפלד | 317-495838"/><Card><View style={styles.tabs}>{['הכל','ישראל','עולם','שווקים','ריבית'].map((t,i)=><Text key={t} style={[styles.tab,i===0&&styles.tabActive]}>{t}</Text>)}</View>{news.map((n,i)=><View key={i} style={styles.newsRow}><View style={[styles.source,{backgroundColor:n[0]==='גלובס'?'#b30000':'#5fbf28'}]}><Text style={styles.sourceText}>{n[0]}</Text></View><View style={{flex:1}}><Text style={styles.newsTitle}>{n[1]}</Text><Text style={styles.muted}>{n[2]}</Text></View></View>)}</Card></ScrollView>}
function Monthly(){return <ScrollView style={styles.body}><Header title="סקירה חודשית" sub="מאי 2026"/><Card><Text style={styles.reviewTitle}>סקירת חודש מאי 2026</Text><Text style={styles.date}>עודכן: 27.06.2026</Text><Text style={styles.reviewH}>ארה״ב: האטה בצמיחה והמשך מדיניות מכסים</Text><Text style={styles.reviewP}>מאי התאפיין בתנודתיות בשווקים, לצד המשך אי-ודאות סביב סביבת הריבית ומדיניות הסחר. מדדי המניות בארה״ב הציגו ביצועים מעורבים, כאשר מניות הטכנולוגיה המשיכו להוביל.</Text><Text style={styles.reviewH}>ישראל: יציבות יחסית עם אתגרים מתמשכים</Text><Text style={styles.reviewP}>המשק הישראלי ממשיך להציג יציבות יחסית, תוך שמירה על ריבית גבוהה והמתנה להתמתנות נוספת באינפלציה. שוק המניות המקומי רשם חודש חיובי.</Text><Text style={styles.reviewH}>לסיכום</Text><Text style={styles.reviewP}>אנו ממשיכים לנהל את התיקים בהתאם למדיניות ההשקעה, תוך שמירה על פיזור, איכות נכסים והתאמה לרמת הסיכון שנקבעה ללקוח.</Text><TouchableOpacity style={styles.primaryBtn}><Text style={styles.primaryText}>הורד PDF</Text></TouchableOpacity></Card></ScrollView>}
function Insights(){return <ScrollView style={styles.body}><Header title="התובנות שלי" sub="יאיר קורנפלד | 317-495838"/>{[['pie-chart-outline','רמת החשיפה למניות','החשיפה עומדת על 29.08%, קרובה למקסימום במדיניות עוקב 3.'],['earth-outline','פיזור גאוגרפי','61% מחשיפת המניות מושקעת בחו״ל.'],['trending-up-outline','ביצועי התיק','מתחילת השנה התיק מציג תשואה גבוהה ממדד הייחוס ב-1.4%.'],['calendar-outline','אירועי מאקרו קרובים','השבוע צפויים להתפרסם נתוני CPI בארה״ב והחלטת ריבית של בנק ישראל.']].map((x,i)=><Card key={i}><View style={styles.rowBetween}><Ionicons name={x[0]} size={34} color={navy}/><View style={{flex:1,marginRight:12}}><Text style={styles.cardTitle}>{x[1]}</Text><Text style={styles.muted}>{x[2]}</Text></View></View></Card>)}</ScrollView>}
function More({setScreen}){return <ScrollView style={styles.body}><Header title="עוד" sub="יאיר קורנפלד | 317-495838"/>{[['performance','ביצועי התיק'],['holdings','אחזקות התיק'],['exposure','פירוט חשיפות'],['monthly','סקירה חודשית'],['insights','תובנות AI']].map(([s,t])=><TouchableOpacity key={s} onPress={()=>setScreen(s)}><Card><View style={styles.rowBetween}><Text style={styles.cardTitle}>{t}</Text><Ionicons name="chevron-back" size={22} color={navy}/></View></Card></TouchableOpacity>)}</ScrollView>}
export default function App(){const [logged,setLogged]=useState(false); const [screen,setScreen]=useState('portfolio'); const fade=useRef(new Animated.Value(1)).current; const go=(s)=>{Animated.sequence([Animated.timing(fade,{toValue:.25,duration:90,useNativeDriver:true}),Animated.timing(fade,{toValue:1,duration:160,useNativeDriver:true})]).start(); setScreen(s)}; if(!logged) return <Login onLogin={()=>setLogged(true)}/>; let C=Portfolio; if(screen==='exposure')C=Exposure; if(screen==='performance')C=Performance; if(screen==='holdings')C=Holdings; if(screen==='market')C=Market; if(screen==='alerts')C=News; if(screen==='monthly')C=Monthly; if(screen==='insights')C=Insights; if(screen==='more'||screen==='home')C=More; return <SafeAreaView style={{flex:1,backgroundColor:'#f4f7fb'}}><StatusBar style="light"/><Animated.View style={{flex:1,opacity:fade}}><C setScreen={go}/></Animated.View><BottomNav screen={screen} setScreen={go}/></SafeAreaView>}

const styles = StyleSheet.create({
  loginWrap:{flex:1,backgroundColor:'#f4f7fb',alignItems:'center'}, wave:{position:'absolute',bottom:0,width:'100%',height:'66%',backgroundColor:'#0b3b76',borderTopLeftRadius:220,opacity:.92}, logoLogin:{width:245,height:70,marginTop:55}, hello:{fontSize:32,fontWeight:'800',color:navy,marginTop:35}, loginSub:{fontSize:16,color:'#4e5f7c',marginTop:8}, loginCard:{width:width-54,marginTop:28,padding:22}, loginTitle:{fontSize:18,fontWeight:'800',color:navy,textAlign:'center',marginBottom:14}, inputLabel:{color:navy,textAlign:'right',marginTop:10,marginBottom:6}, input:{height:46,borderWidth:1,borderColor:'#d4dbe8',borderRadius:10,paddingHorizontal:12,backgroundColor:'#fbfdff'}, goldBtn:{backgroundColor:gold,borderRadius:11,padding:15,alignItems:'center',marginTop:20}, goldBtnText:{color:navy,fontSize:18,fontWeight:'800'}, forgot:{textAlign:'center',marginTop:15,color:navy,textDecorationLine:'underline'}, err:{color:red,textAlign:'center',marginTop:8},
  body:{flex:1,backgroundColor:'#f4f7fb'}, header:{backgroundColor:navy,paddingTop:18,paddingBottom:18,paddingHorizontal:16}, topRow:{flexDirection:'row-reverse',alignItems:'center',justifyContent:'space-between'}, logoSmall:{width:170,height:42}, iconBtn:{width:34,alignItems:'center'}, headerTitle:{color:'#fff',fontSize:22,fontWeight:'800',textAlign:'center',marginTop:5}, headerSub:{color:'#dbe5ff',fontSize:13,textAlign:'center',marginTop:3},
  card:{backgroundColor:'#fff',borderRadius:17,margin:10,padding:16,shadowColor:'#000',shadowOpacity:.08,shadowRadius:8,elevation:3}, cardTitle:{fontSize:17,fontWeight:'800',color:navy,textAlign:'right'}, bigValue:{fontSize:42,fontWeight:'800',color:navy,textAlign:'center',marginTop:8}, date:{textAlign:'center',color:'#51617a',marginTop:2}, divider:{height:1,backgroundColor:'#e4e9f2',marginVertical:15}, policy:{textAlign:'center',fontWeight:'800',color:navy}, policyMain:{textAlign:'center',fontSize:18,fontWeight:'800',color:navy,marginTop:6}, policySmall:{fontSize:14}, kpis:{flexDirection:'row-reverse',gap:10,marginVertical:16}, kpi:{flex:1,borderWidth:1,borderColor:'#dce3ef',borderRadius:12,padding:12,alignItems:'center'}, kpiLabel:{color:navy,fontWeight:'700'}, kpiVal:{fontSize:20,color:navy,fontWeight:'800',marginTop:5}, green:{color:green,fontWeight:'800',textAlign:'center',fontSize:16}, primaryBtn:{backgroundColor:navy,borderRadius:10,padding:13,alignItems:'center',marginTop:14,flex:1}, primaryText:{color:'white',fontWeight:'800'}, outlineBtn:{borderWidth:1,borderColor:'#c9d3e3',borderRadius:10,padding:13,alignItems:'center',marginTop:14,flex:1,marginRight:10}, outlineText:{color:navy,fontWeight:'800'},
  tabs:{flexDirection:'row-reverse',justifyContent:'space-between',gap:8,marginVertical:12}, tab:{borderWidth:1,borderColor:'#dfe6f1',borderRadius:9,paddingVertical:8,paddingHorizontal:13,color:navy,textAlign:'center',overflow:'hidden'}, tabActive:{backgroundColor:navy,color:'#fff',fontWeight:'800'}, legend:{flexDirection:'row-reverse',justifyContent:'center',gap:28}, row:{flexDirection:'row-reverse',alignItems:'center',gap:18}, rowBetween:{flexDirection:'row-reverse',alignItems:'center',justifyContent:'space-between'}, list:{flex:1}, bulletRow:{flexDirection:'row-reverse',alignItems:'center',paddingVertical:9}, dot:{width:11,height:11,borderRadius:6,marginLeft:8}, bulletText:{flex:1,color:navy,fontWeight:'700',textAlign:'right'}, bulletVal:{color:navy,fontWeight:'800'}, muted:{color:'#61708a',textAlign:'right',lineHeight:21},
  table:{marginTop:10,borderTopWidth:1,borderColor:'#e3e9f2'}, tableRow:{flexDirection:'row-reverse',justifyContent:'space-between',padding:12,borderBottomWidth:1,borderColor:'#e3e9f2'}, hName:{fontSize:17,fontWeight:'800',color:navy,textAlign:'right'}, hValue:{fontSize:16,fontWeight:'800',color:navy}, indexRow:{flexDirection:'row-reverse',justifyContent:'space-between',paddingVertical:12,borderBottomWidth:1,borderColor:'#e8edf5'}, indexName:{fontWeight:'800',color:navy}, newsRow:{flexDirection:'row-reverse',gap:12,paddingVertical:14,borderBottomWidth:1,borderColor:'#e8edf5'}, source:{width:82,height:28,borderRadius:4,alignItems:'center',justifyContent:'center'}, sourceText:{color:'#fff',fontWeight:'800',fontSize:12}, newsTitle:{color:navy,fontWeight:'700',textAlign:'right',lineHeight:22}, reviewTitle:{fontSize:21,fontWeight:'800',color:navy,textAlign:'center'}, reviewH:{fontSize:16,fontWeight:'800',color:navy,textAlign:'right',marginTop:20}, reviewP:{color:'#203554',textAlign:'right',lineHeight:24,marginTop:8}, nav:{height:68,backgroundColor:'#fff',flexDirection:'row-reverse',justifyContent:'space-around',alignItems:'center',borderTopWidth:1,borderColor:'#e1e7f0'}, navItem:{alignItems:'center',gap:3}, navText:{fontSize:11,color:'#6d7890'}
});
