const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/../fortress-game-ui.js','utf8');
const a=source.indexOf('/* >>> FEEDBACK PULSANTI (V61)'),b=source.indexOf('/* <<< FEEDBACK PULSANTI (V61)');
assert.ok(a>0&&b>a,'blocco feedback pulsanti presente');
const code=source.slice(a,b);

// AudioContext finto che registra cosa viene suonato
const log={sources:0,oscs:[],created:0,resumed:0};
function FakeCtx(){log.created++;this.state='suspended';this.sampleRate=8000;this.currentTime=1;this.destination={};}
FakeCtx.prototype.resume=function(){log.resumed++;this.state='running';};
FakeCtx.prototype.createBuffer=function(_,len){return {getChannelData(){return new Float32Array(len);}};};
FakeCtx.prototype.createBufferSource=function(){return {connect(){},start(){log.sources++;}};};
FakeCtx.prototype.createBiquadFilter=function(){return {frequency:{},Q:{},connect(){}};};
FakeCtx.prototype.createGain=function(){return {gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};};
FakeCtx.prototype.createOscillator=function(){const o={type:'',frequency:{setValueAtTime(f){o.f0=f;},exponentialRampToValueAtTime(){}},connect(){},start(){log.oscs.push(o);},stop(){}};return o;};

const listeners=[];
const ctx={window:{AudioContext:FakeCtx},document:{addEventListener(type,fn,opt){listeners.push({type,fn,opt});}},Math,Number,Float32Array};
vm.createContext(ctx);
vm.runInContext('let sfxEnabled=true;'+code+';this.api={buttonSoundFor,playButtonSound,setEnabled(v){sfxEnabled=v;}}',ctx);
const {playButtonSound,setEnabled}=ctx.api;
// Gli oggetti nascono nel contesto vm: si confrontano i campi, non i prototipi.
const buttonSoundFor=(btn)=>{const r=ctx.api.buttonSoundFor(btn);return r?{kind:r.kind,value:r.value}:r;};

// Quale suono per quale pulsante
assert.deepEqual(buttonSoundFor({dataset:{}}),{kind:'click',value:0});
assert.deepEqual(buttonSoundFor({dataset:{die:'5'}}),{kind:'die',value:5},'arena: data-die è il valore');
assert.deepEqual(buttonSoundFor({dataset:{die:'1',value:'6'}}),{kind:'die',value:6},'overlay attacco: data-die è l\'indice, il valore è data-value');
assert.equal(buttonSoundFor({disabled:true,dataset:{die:'3'}}),null,'pulsante disabilitato: silenzio');
assert.equal(buttonSoundFor({dataset:{noSfx:''}}),null,'data-no-sfx: silenzio');
assert.equal(buttonSoundFor(null),null);

// Ascoltatore globale in cattura su "click"
assert.equal(listeners.length,1);assert.equal(listeners[0].type,'click');assert.equal(listeners[0].opt.capture,true);

// Il dado fa toc-toc (2 colpi di rumore + 1 tono), il tono sale col numero; il click è un solo tono breve
playButtonSound('die',1);assert.equal(log.sources,2);assert.equal(log.oscs.length,1);const low=log.oscs[0].f0;
playButtonSound('die',6);assert.equal(log.sources,4);const high=log.oscs[1].f0;
assert.ok(high>low,'6 più acuto di 1');
playButtonSound('click');assert.equal(log.sources,4,'il click non usa rumore');assert.equal(log.oscs.length,3);
assert.equal(log.created,1,'un solo AudioContext riusato');assert.ok(log.resumed>=1,'sbloccato dal gesto utente');

// Audio disattivato: nessun suono
setEnabled(false);const before=log.oscs.length+log.sources;
playButtonSound('die',3);playButtonSound('click');
assert.equal(log.oscs.length+log.sources,before);

// Il gestore globale riesce a lavorare con target senza closest (nessun crash)
listeners[0].fn({target:{}});listeners[0].fn({target:null});
console.log('V61: feedback sonoro pulsanti e dadi OK');
