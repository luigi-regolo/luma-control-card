/**
 * Luma Control Card — a custom Home Assistant dashboard card.
 * Copyright (c) 2026 luigi-regolo.
 * SPDX-License-Identifier: GPL-3.0-only
 * No remote resources, telemetry or stored credentials.
 */
const LC_TAG = 'luma-control-card';
const LC_EDITOR_TAG = 'luma-control-card-editor';
const LC_MODES = ['auto', 'light', 'dark'];
const LC_LAYOUTS = ['auto', 'one', 'two'];
const LC_COLOR = new Set(['hs', 'xy', 'rgb', 'rgbw', 'rgbww']);
const LC_DEFAULTS = {
  title: 'Luci', eyebrow: 'LUMA CONTROL CARD', theme_mode: 'auto',
  layout: 'auto', lights: [], automation_entity: '', show_automation: true,
  controls_enabled: true,
};
function lcText(v, n=80) { return String(v ?? '').trim().slice(0, n); }
function lcEsc(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
function lcEntity(v, domains=['light','switch']) {
  const id=lcText(v, 160);
  return domains.includes(id.split('.')[0]) && /^[a-z0-9_]+\.[a-z0-9_]+$/.test(id) ? id : '';
}
function lcLight(v={}) {
  const x=v && typeof v==='object' && !Array.isArray(v) ? v : {};
  return {entity:lcEntity(x.entity), name:lcText(x.name,60), icon:/^mdi:[a-z0-9-]{1,70}$/.test(x.icon||'')?x.icon:''};
}
function lcConfig(v={}) {
  const x=v && typeof v==='object' && !Array.isArray(v) ? v : {};
  const items=Array.isArray(x.lights)?x.lights.map(lcLight):[];
  return {
    type:'custom:luma-control-card',
    title:lcText(x.title??LC_DEFAULTS.title,60),
    eyebrow:lcText(x.eyebrow??LC_DEFAULTS.eyebrow,60),
    theme_mode:LC_MODES.includes(x.theme_mode)?x.theme_mode:'auto',
    layout:LC_LAYOUTS.includes(x.layout)?x.layout:'auto',
    lights:items.filter((x,i,a)=>!x.entity||a.findIndex(y=>y.entity===x.entity)===i).slice(0,64),
    automation_entity:lcEntity(x.automation_entity,['automation']),
    show_automation:x.show_automation!==false,
    controls_enabled:x.controls_enabled!==false,
  };
}
function lcKnown(e) {return !!e && e.state!=='unknown' && e.state!=='unavailable' && e.state!=='';}
function lcCapabilities(e) {
  if (!e || !e.entity_id?.startsWith('light.')) return {dim:false,rgb:false,temp:false};
  const modes=Array.isArray(e.attributes?.supported_color_modes)?e.attributes.supported_color_modes:[];
  const rgb=modes.some(m=>LC_COLOR.has(m));
  const temp=modes.includes('color_temp');
  const dim=modes.some(m=>m!=='onoff'&&m!=='unknown');
  return {dim,rgb,temp};
}
function lcBrightness(e) {
  if (!lcKnown(e)||e.state!=='on') return 0;
  const b=e.attributes?.brightness;
  return typeof b==='number'&&Number.isFinite(b)?Math.max(1,Math.min(100,Math.round(b*100/255))):null;
}
function lcRgb(e) {
  const rgb=e?.attributes?.rgb_color;
  if(!Array.isArray(rgb)||rgb.length<3||!rgb.slice(0,3).every(n=>Number.isFinite(n)))return '';
  return `rgb(${rgb.slice(0,3).map(n=>Math.max(0,Math.min(255,Math.round(n)))).join(',')})`;
}
function lcClamped(v,min,max){return Math.min(max,Math.max(min,Number(v)||0));}
const LC_CSS=`
:host{display:block;box-sizing:border-box;font-family:var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,system-ui,"Segoe UI Variable","Segoe UI",Roboto,Arial,sans-serif)}
*,*:before,*:after{box-sizing:border-box}button,input,select{font:inherit}button{cursor:pointer}button:disabled,input:disabled{opacity:.45;cursor:not-allowed}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--lc-emerald);outline-offset:2px}ha-icon{display:inline-flex;vertical-align:middle;--mdc-icon-size:20px;width:20px;height:20px;flex:none}
.lc-root{--lc-bg:var(--card-background-color,#fff);--lc-tile:var(--secondary-background-color,#F1F3EF);--lc-orb:#fff;--lc-border:var(--ha-card-border-color,#E3E7E2);--lc-text:var(--primary-text-color,#19221E);--lc-muted:var(--secondary-text-color,#68716C);--lc-light:var(--edera-light-color,#9A7C4F);--lc-emerald:var(--edera-emerald-color,#0E6B52);--lc-track:#dde2de;background:var(--lc-bg);color:var(--lc-text);border:1px solid var(--lc-border);border-radius:26px;padding:18px;min-width:0;font-size:14px}
.lc-root.lc-dark{--lc-bg:#101211;--lc-tile:#191c1a;--lc-orb:#282b29;--lc-border:#2b302c;--lc-text:#f5f7f4;--lc-muted:#bbc5bd;--lc-light:var(--edera-light-color,#D3C29D);--lc-emerald:#0e795d;--lc-track:#343a35}
.lc-head{padding:2px 4px 16px;display:flex;justify-content:space-between;align-items:end;gap:9px}.lc-eyebrow{font-size:10px;letter-spacing:1.7px;font-weight:750;color:var(--lc-muted);margin-bottom:7px}.lc-title{font-size:25px;font-weight:780;letter-spacing:-.7px;line-height:1.14;overflow-wrap:anywhere}.lc-dot{color:var(--lc-emerald)}.lc-count{font-size:11px;color:var(--lc-muted);white-space:nowrap;padding-bottom:3px}
.lc-grid-host{container:lc/inline-size;min-width:0}.lc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.lc-grid.lc-single,.lc-grid.lc-one{grid-template-columns:1fr}
.lc-cell{background:var(--lc-tile);border:1px solid var(--lc-border);border-radius:16px;padding:11px 12px;display:flex;flex-direction:column;gap:10px;min-width:0}.lc-top{display:flex;gap:9px;align-items:center;min-width:0}.lc-orb{width:39px;height:39px;border-radius:50%;background:var(--lc-orb);display:grid;place-items:center;flex:none;color:var(--lc-light)}.lc-orb.off{color:var(--lc-muted)}.lc-name{flex:1;min-width:0}.lc-device-name{display:block;font-size:13px;font-weight:650;line-height:1.35;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.lc-device-state{display:block;font-size:11px;margin-top:3px;color:var(--lc-muted)}.lc-name-btn{display:block;background:none;border:0;text-align:left;padding:0;color:inherit;width:100%;min-width:0}.lc-power{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--lc-orb);border:1px solid var(--lc-border);color:var(--lc-muted);padding:0;flex:none}.lc-power.on{background:var(--lc-light);border-color:var(--lc-light);color:#19221e}.lc-power ha-icon{--mdc-icon-size:17px;width:17px;height:17px}.lc-info{font-size:12px;line-height:1.4;color:var(--lc-muted)}.lc-bright-head{display:flex;justify-content:space-between;align-items:center;gap:9px;color:var(--lc-muted);font-size:11px}.lc-bright-head strong{color:var(--lc-text);font-variant-numeric:tabular-nums;font-size:11.5px}
.lc-range{-webkit-appearance:none;appearance:none;display:block;width:100%;height:17px;min-height:17px;cursor:pointer;border:0;border-radius:999px;background:linear-gradient(to right,var(--lc-light) 0,var(--lc-light) var(--percent,50%),var(--lc-track) var(--percent,50%),var(--lc-track) 100%);touch-action:pan-y;margin:3px 0}.lc-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:25px;height:25px;border-radius:50%;border:4px solid var(--lc-bg);background:var(--lc-light);box-shadow:0 1px 5px #0003}.lc-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;border:3px solid var(--lc-bg);background:var(--lc-light);box-shadow:0 1px 5px #0003}
.lc-color-btn{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--lc-border);border-radius:999px;padding:5px 10px;background:var(--lc-orb);color:var(--lc-text);font-size:11px;font-weight:650;align-self:flex-end}.lc-swatch{display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--actual-color,var(--lc-light));border:1px solid #0001}.lc-autom{display:flex;align-items:center;gap:6px;color:var(--lc-emerald);padding:12px 4px 0;border:0;background:none;font-size:11.5px;font-weight:700}.lc-autom ha-icon{--mdc-icon-size:16px;width:16px;height:16px}.lc-empty{padding:12px 4px;color:var(--lc-muted);font-size:12px}.lc-error{font-size:11px;color:var(--error-color,#B85D55);margin-top:10px;line-height:1.45}
.lc-backdrop{position:fixed;inset:0;background:#0009;z-index:9999;display:grid;place-items:center;padding:16px}.lc-dialog{width:min(390px,100%);max-height:min(90dvh,700px);overflow:hidden;display:flex;flex-direction:column;background:var(--lc-bg);border:1px solid var(--lc-border);border-radius:26px;box-shadow:0 18px 60px #0005;color:var(--lc-text);opacity:1}.lc-dialog-head{display:flex;align-items:center;gap:9px;min-height:58px;padding:12px 16px 12px 18px;background:var(--lc-bg);border-bottom:1px solid var(--lc-border);flex:none}.lc-dialog-head strong{flex:1;min-width:0;font-size:17px;font-weight:650;overflow-wrap:anywhere}.lc-close{width:36px;height:36px;flex:none;border:0;border-radius:50%;background:var(--lc-tile);color:var(--lc-text);display:grid;place-items:center}.lc-close ha-icon{--mdc-icon-size:19px}.lc-dialog-body{padding:17px;overflow-y:auto;min-height:0}.lc-panel{border:1px solid var(--lc-border);border-radius:16px;background:var(--lc-tile);padding:15px;margin-bottom:10px}.lc-panel:last-child{margin-bottom:0}.lc-panel-title{font-size:13px;font-weight:650;margin-bottom:12px}.lc-wheel{width:min(190px,100%);aspect-ratio:1;border-radius:50%;position:relative;margin:14px auto 18px;background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red);cursor:crosshair;touch-action:none}.lc-wheel:before{content:"";position:absolute;inset:22%;border-radius:50%;background:var(--lc-tile);pointer-events:none}.lc-wheel:after{content:"";position:absolute;width:44px;height:44px;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%);background:var(--chosen-color,var(--lc-light));border:1px solid var(--lc-border);pointer-events:none}.lc-presets{display:flex;justify-content:center;flex-wrap:wrap;gap:9px;margin:12px 0 2px}.lc-preset{width:30px;height:30px;border-radius:50%;border:3px solid var(--lc-tile);box-shadow:0 0 0 1px var(--lc-border);background:var(--color)}.lc-preset:focus-visible{outline-offset:4px}.lc-temp-row{display:flex;justify-content:space-between;gap:9px;color:var(--lc-muted);font-size:11px;margin-top:12px}.lc-auto-status{color:var(--lc-muted);font-size:12px;margin:0 0 13px}.lc-auto-toggle{border:0;border-radius:14px;padding:12px 16px;background:var(--lc-emerald);color:#fff;font-weight:650;width:100%}.lc-auto-toggle.off{background:var(--lc-orb);color:var(--lc-text);border:1px solid var(--lc-border)}
@container lc (max-width:420px){.lc-grid:not(.lc-single){grid-template-columns:1fr}.lc-count{display:none}.lc-cell{padding:10px}.lc-orb{width:35px;height:35px}.lc-head{padding-bottom:13px}}@media(max-width:420px){.lc-root{padding:13px;border-radius:23px}.lc-title{font-size:23px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{transition:none!important;animation:none!important}}
`;
function lcIcon(name){return `<ha-icon icon="${lcEsc(name)}" aria-hidden="true"></ha-icon>`;}
class LumaControlCard extends HTMLElement {
  static getStubConfig(){const {type,...rest}=lcConfig();return rest;}
  static getConfigElement(){return document.createElement(LC_EDITOR_TAG);}
  constructor(){
    super();this.attachShadow({mode:'open'});this._config=lcConfig();this._hass=null;this._opened=null;this._busy=new Set();this._error='';this._signature='';this._isDragging=false;this._lastFocus=null;
    this._pref=typeof matchMedia==='function'?matchMedia('(prefers-color-scheme:dark)'):null;
    this._themeChange=()=>this._paint(true);
    this.shadowRoot.addEventListener('click',e=>this._click(e));
    this.shadowRoot.addEventListener('input',e=>this._input(e));
    this.shadowRoot.addEventListener('change',e=>this._change(e));
    this.shadowRoot.addEventListener('pointerdown',e=>{if(e.target.matches('.lc-range,.lc-wheel'))this._isDragging=true;});
    this.shadowRoot.addEventListener('pointerup',()=>{this._isDragging=false;});
    this.shadowRoot.addEventListener('pointercancel',()=>{this._isDragging=false;});
    this.shadowRoot.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&this._opened){this._close();return;}
      if(this._opened?.type==='light'&&e.target.matches('.lc-wheel')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
        e.preventDefault();const light=this._config.lights[this._opened.index],state=this._entity(light?.entity);
        if(!light||!lcCapabilities(state).rgb)return;const current=Number(state.attributes?.hs_color?.[0]||0);
        const step=['ArrowRight','ArrowUp'].includes(e.key)?5:-5;this._service(light.entity,'turn_on',{hs_color:[(current+step+360)%360,100]});
      }
    });
  }
  connectedCallback(){this._pref?.addEventListener?.('change',this._themeChange);this._paint(true);}
  disconnectedCallback(){this._pref?.removeEventListener?.('change',this._themeChange);}
  setConfig(v){this._config=lcConfig(v);this._opened=null;this._paint(true);}
  set hass(h){this._hass=h;this._paint();}
  getCardSize(){return Math.max(2,Math.ceil(this._config.lights.length/2)*2+1+(this._config.automation_entity?1:0));}
  getGridOptions(){return {columns:12,min_columns:3};}
  _entity(id){return id?this._hass?.states?.[id]:undefined;}
  _dark(){return this._config.theme_mode==='dark'||(this._config.theme_mode==='auto'&&(this._hass?.themes?.darkMode===true||(!this._hass?.themes&&!!this._pref?.matches)));}
  _snapshot(){return JSON.stringify([this._config,this._config.lights.map(x=>{const s=this._entity(x.entity);return [x.entity,s?.state,s?.attributes?.brightness,s?.attributes?.supported_color_modes,s?.attributes?.rgb_color,s?.attributes?.hs_color,s?.attributes?.color_temp_kelvin];}),this._entity(this._config.automation_entity)?.state,this._opened,[...this._busy],this._error,this._dark()]);}
  _tile(item,index){
    const e=this._entity(item.entity);const known=lcKnown(e);const on=known&&e.state==='on';const c=lcCapabilities(e);const id=item.entity;
    const label=item.name||e?.attributes?.friendly_name||id||`Luce ${index+1}`;
    const icon=item.icon||(id.startsWith('switch.')?'mdi:light-switch':'mdi:lightbulb-outline');
    const level=lcBrightness(e),hasLevel=Number.isFinite(level);
    const color=lcRgb(e);const hasDetails=c.rgb||c.temp;
    const disabled=!known||!this._config.controls_enabled||this._busy.has(id);
    return `<article class="lc-cell" data-index="${index}"><div class="lc-top"><div class="lc-orb ${on?'':'off'}">${lcIcon(icon)}</div><div class="lc-name">${hasDetails?`<button type="button" class="lc-name-btn" data-open-light="${index}" aria-label="Controlli di ${lcEsc(label)}"><span class="lc-device-name">${lcEsc(label)}</span></button>`:`<span class="lc-device-name">${lcEsc(label)}</span>`}<span class="lc-device-state">${!known?'Non disponibile':on?'Accesa':'Spenta'}${c.rgb?' · RGB':''}</span></div><button class="lc-power ${on?'on':''}" type="button" data-toggle="${index}" title="${on?'Spegni':'Accendi'}" aria-label="${on?'Spegni':'Accendi'} ${lcEsc(label)}" ${disabled?'disabled':''}>${lcIcon('mdi:power')}</button></div>${c.dim?`<div class="lc-bright-head"><span>Luminosità</span><strong data-pct="${index}">${hasLevel?`${level}%`:'—'}</strong></div><input class="lc-range" type="range" min="0" max="100" step="1" value="${hasLevel?level:0}" style="--percent:${hasLevel?level:0}%" data-bright="${index}" aria-label="Luminosità ${lcEsc(label)}" ${(disabled||(on&&!hasLevel))?'disabled':''}/>`:''}${c.rgb||c.temp?`<button type="button" class="lc-color-btn" data-open-light="${index}" ${!known?'disabled':''}>${color?`<i class="lc-swatch" style="--actual-color:${color}"></i>`:''}${c.rgb?'Colore':'Temperatura'}</button>`:''}</article>`;
  }
  _popup(){
    if(!this._opened)return '';
    const idx=this._opened.index;const auto=this._opened.type==='automation';
    const item=auto?null:this._config.lights[idx],e=auto?this._entity(this._config.automation_entity):this._entity(item?.entity);
    const label=auto?(e?.attributes?.friendly_name||'Automazione'):(item?.name||e?.attributes?.friendly_name||item?.entity||'Luce');
    let content='';
    if(auto){
      const enabled=e?.state==='on',known=lcKnown(e);
      content=`<div class="lc-panel"><div class="lc-panel-title">${lcEsc(label)}</div><p class="lc-auto-status">${known?(enabled?'Attivata':'Disattivata'):'Non disponibile'}</p><button type="button" class="lc-auto-toggle ${enabled?'off':''}" data-auto-toggle ${(!known||!this._config.controls_enabled||this._busy.has(this._config.automation_entity))?'disabled':''}>${enabled?'Disattiva automazione':'Attiva automazione'}</button></div>`;
    }else{
      const c=lcCapabilities(e),color=lcRgb(e)||'var(--lc-light)';
      if(c.rgb){
        const colors=[['Arancione',30,'#ff9138'],['Giallo',55,'#f2de45'],['Verde',120,'#44e65d'],['Ciano',180,'#34d9eb'],['Blu',225,'#4c7bee'],['Viola',280,'#bd4ce5'],['Rosa',325,'#eb4d9c']];
        content+=`<div class="lc-panel"><div class="lc-panel-title">Colore RGB</div><div class="lc-wheel" role="slider" tabindex="0" aria-label="Tonalità colore" aria-valuemin="0" aria-valuemax="360" aria-valuenow="${Math.round(e?.attributes?.hs_color?.[0]||0)}" style="--chosen-color:${color}"></div><div class="lc-presets">${colors.map(([name,hue,hex])=>`<button type="button" data-hue="${hue}" class="lc-preset" style="--color:${hex}" aria-label="${name}" title="${name}" ${this._busy.has(item.entity)?'disabled':''}></button>`).join('')}</div></div>`;
      }
      if(c.temp){
        const a=e?.attributes||{},min=lcClamped(a.min_color_temp_kelvin||2000,1000,10000),max=Math.max(min+100,lcClamped(a.max_color_temp_kelvin||6500,1000,10000));
        const v=lcClamped(a.color_temp_kelvin||Math.round((min+max)/2),min,max);
        content+=`<div class="lc-panel"><div class="lc-panel-title">Temperatura colore <span data-temp-text>${v} K</span></div><input class="lc-range" type="range" data-temp="${idx}" min="${min}" max="${max}" value="${v}" step="50" style="--percent:${(v-min)*100/(max-min)}%" aria-label="Temperatura colore" ${this._busy.has(item.entity)?'disabled':''}/><div class="lc-temp-row"><span>Calda</span><span>Fredda</span></div></div>`;
      }
      if(!content)content='<p class="lc-info">Nessun controllo avanzato disponibile.</p>';
    }
    return `<div class="lc-backdrop" data-backdrop><section class="lc-dialog" role="dialog" aria-modal="true" aria-label="${lcEsc(label)}"><header class="lc-dialog-head">${lcIcon(auto?'mdi:robot-outline':'mdi:lightbulb-outline')}<strong>${lcEsc(label)}</strong><button class="lc-close" type="button" aria-label="Chiudi" data-close>${lcIcon('mdi:close')}</button></header><div class="lc-dialog-body">${content}</div></section></div>`;
  }
  _paint(force=false){
    if(!this.isConnected||this._isDragging)return;
    const sig=this._snapshot();if(!force&&sig===this._signature)return;this._signature=sig;
    const configured=this._config.lights.map((item,index)=>({item,index})).filter(x=>x.item.entity);
    const on=configured.filter(x=>this._entity(x.item.entity)?.state==='on').length;
    const mode=configured.length===1?'lc-single':this._config.layout==='one'?'lc-one':'';
    this.shadowRoot.innerHTML=`<style>${LC_CSS}</style><div class="lc-root ${this._dark()?'lc-dark':'lc-light'}"><header class="lc-head"><div><div class="lc-eyebrow">${lcEsc(this._config.eyebrow)}</div><div class="lc-title">${lcEsc(this._config.title)}<span class="lc-dot">.</span></div></div>${configured.length?`<div class="lc-count">${on} ${on===1?'acceso':'accesi'}</div>`:''}</header>${configured.length?`<div class="lc-grid-host"><div class="lc-grid ${mode}">${configured.map(x=>this._tile(x.item,x.index)).join('')}</div></div>`:'<div class="lc-empty">Aggiungi una luce o uno switch dall’editor della card.</div>'}${this._config.show_automation&&this._config.automation_entity?`<button type="button" class="lc-autom" data-open-autom>${lcIcon('mdi:robot-outline')} Automazione ${lcIcon('mdi:chevron-right')}</button>`:''}${this._error?`<div class="lc-error" role="alert">${lcEsc(this._error)}</div>`:''}${this._popup()}</div>`;
    if(this._opened)this.shadowRoot.querySelector('.lc-close')?.focus({preventScroll:true});
  }
  _open(type,index){this._lastFocus=this.shadowRoot.activeElement;this._opened={type,index};this._error='';this._paint(true);}
  _close(){this._opened=null;this._error='';this._paint(true);this._lastFocus?.focus?.({preventScroll:true});this._lastFocus=null;}
  async _service(id,action,data={}){
    if(!this._config.controls_enabled||!id||this._busy.has(id)||!lcKnown(this._entity(id))||typeof this._hass?.callService!=='function')return;
    const domain=id.split('.')[0];if(!['light','switch','automation'].includes(domain))return;
    if(!['turn_on','turn_off'].includes(action))return;
    this._busy.add(id);this._error='';
    try{await this._hass.callService(domain,action,{entity_id:id,...data});}
    catch(err){this._error=`Comando non riuscito: ${lcText(err?.message||'Errore Home Assistant',120)}`;}
    finally{this._busy.delete(id);this._paint(true);}
  }
  _click(ev){
    if(ev.target.closest('[data-close]')||ev.target.matches('[data-backdrop]')){this._close();return;}
    const light=ev.target.closest('[data-open-light]');if(light){this._open('light',Number(light.dataset.openLight));return;}
    if(ev.target.closest('[data-open-autom]')){this._open('automation',0);return;}
    if(ev.target.closest('[data-auto-toggle]')){const id=this._config.automation_entity;const state=this._entity(id)?.state;this._service(id,state==='on'?'turn_off':'turn_on');return;}
    const toggle=ev.target.closest('[data-toggle]');if(toggle){const x=this._config.lights[Number(toggle.dataset.toggle)];const s=this._entity(x?.entity);if(s)this._service(x.entity,s.state==='on'?'turn_off':'turn_on');return;}
    const preset=ev.target.closest('[data-hue]');if(preset&&this._opened?.type==='light'){
      const x=this._config.lights[this._opened.index],s=this._entity(x?.entity);
      if(lcCapabilities(s).rgb)this._service(x.entity,'turn_on',{hs_color:[Number(preset.dataset.hue),100]});return;
    }
    const wheel=ev.target.closest('.lc-wheel');if(wheel)this._wheel(ev,wheel);
  }
  _wheel(ev,wheel){
    if(this._opened?.type!=='light')return;
    const box=wheel.getBoundingClientRect(),dx=ev.clientX-(box.left+box.width/2),dy=ev.clientY-(box.top+box.height/2);
    if(Math.hypot(dx,dy)<box.width*.2)return;
    const deg=(Math.atan2(dx,-dy)*180/Math.PI+360)%360;
    const x=this._config.lights[this._opened.index];if(x&&lcCapabilities(this._entity(x.entity)).rgb)this._service(x.entity,'turn_on',{hs_color:[Math.round(deg),100]});
  }
  _input(ev){
    const range=ev.target.closest('[data-bright],[data-temp]');if(!range)return;
    const val=Number(range.value);
    const pct=range.hasAttribute('data-bright')?val:((val-Number(range.min))*100/(Number(range.max)-Number(range.min)));
    range.style.setProperty('--percent',`${pct}%`);
    if(range.hasAttribute('data-bright')){const el=this.shadowRoot.querySelector(`[data-pct="${Number(range.dataset.bright)}"]`);if(el)el.textContent=`${val}%`;}
    else {const el=this.shadowRoot.querySelector('[data-temp-text]');if(el)el.textContent=`${val} K`;}
  }
  _change(ev){
    const range=ev.target.closest('[data-bright],[data-temp]');if(!range)return;
    this._isDragging=false;
    const item=this._config.lights[Number(range.dataset.bright??range.dataset.temp)],e=this._entity(item?.entity);if(!item||!lcKnown(e))return;
    if(range.hasAttribute('data-bright')&&lcCapabilities(e).dim){const v=lcClamped(range.value,0,100);this._service(item.entity,v===0?'turn_off':'turn_on',v===0?{}:{brightness_pct:v});}
    if(range.hasAttribute('data-temp')&&lcCapabilities(e).temp){this._service(item.entity,'turn_on',{color_temp_kelvin:Number(range.value)});}
  }
}
const LC_EDITOR_CSS=`
:host{display:block;color:var(--primary-text-color,#19221E);font-family:var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,system-ui,Roboto,Arial,sans-serif);font-size:14px}
*,*:before,*:after{box-sizing:border-box}button,input,select{font:inherit}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--primary-color,#0E6B52);outline-offset:2px}button{cursor:pointer}button:disabled{opacity:.4;cursor:not-allowed}.lc-edit{min-width:0}.lc-tabs{display:flex;gap:4px;overflow-x:auto;border-bottom:1px solid var(--divider-color,#dfe5df);padding-bottom:12px}.lc-tab{white-space:nowrap;border:0;background:transparent;color:var(--secondary-text-color,#68716C);padding:10px 13px;border-radius:13px;font-size:13px}.lc-tab.active{font-weight:650;background:var(--secondary-background-color,#f1f3ef);color:var(--primary-text-color,#19221e)}
.lc-heading{font-size:21px;letter-spacing:-.45px;font-weight:600;margin:24px 0 8px}.lc-sub{font-size:12px;line-height:1.5;color:var(--secondary-text-color,#68716c);margin-bottom:18px}.lc-field{margin:19px 0}.lc-field>label{font-size:13px;display:block;font-weight:600;margin-bottom:10px}.lc-input{width:100%;display:block;padding:13px;background:var(--secondary-background-color,#f1f3ef);border:1px solid var(--divider-color,#e3e7e2);border-radius:12px;color:var(--primary-text-color,#19221e);outline-offset:1px}.lc-input option{background:var(--card-background-color,#fff);color:var(--primary-text-color,#19221e)}.lc-help{font-size:11px;color:var(--secondary-text-color,#68716c);margin-top:7px;line-height:1.45}.lc-picker{display:flex;align-items:center;gap:8px}.lc-picker ha-selector{display:block;flex:1;min-width:0;--mdc-theme-primary:var(--primary-color,#0e6b52)}.lc-picker .lc-input{flex:1;min-width:0}.lc-remove{border:1px solid var(--divider-color,#e3e7e2);border-radius:50%;width:36px;height:36px;flex:none;display:grid;place-items:center;background:var(--secondary-background-color,#f1f3ef);color:var(--primary-text-color,#19221e)}.lc-remove ha-icon{width:17px;height:17px;--mdc-icon-size:17px}
.lc-rows{display:flex;gap:6px;overflow-x:auto;padding:9px 0 14px;margin-bottom:10px}.lc-rowtab{background:transparent;color:var(--secondary-text-color,#68716c);border:0;padding:9px 12px;border-radius:12px;white-space:nowrap;font-size:12px}.lc-rowtab.active{background:var(--secondary-background-color,#f1f3ef);color:var(--primary-text-color,#19221e);font-weight:650}.lc-rowgroup{display:inline-flex;flex:none;align-items:center;border:1px solid var(--divider-color,#e3e7e2);border-radius:12px;overflow:hidden}.lc-rowgroup .lc-rowtab{border-radius:0}.lc-delete-x{width:30px;height:35px;display:grid;place-items:center;padding:0;border:0;border-left:1px solid var(--divider-color,#e3e7e2);background:var(--secondary-background-color,#f1f3ef);color:var(--primary-text-color,#19221e)}.lc-delete-x ha-icon{--mdc-icon-size:15px;width:15px;height:15px}.lc-buttons{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px}.lc-action{background:var(--secondary-background-color,#f1f3ef);border:1px solid var(--divider-color,#e3e7e2);padding:9px 13px;border-radius:12px;color:var(--primary-text-color,#19221e);font-size:12px}.lc-switchrow{display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid var(--divider-color,#e3e7e2);padding:16px 0}.lc-switchrow:last-child{border-bottom:0}.lc-switchrow label{flex:1;font-size:13px}.lc-switchrow small{display:block;color:var(--secondary-text-color,#68716c);font-size:11px;margin-top:5px;line-height:1.5}.lc-switchrow input{width:18px;height:18px;accent-color:var(--primary-color,#0e6b52)}.lc-empty{padding:12px;color:var(--secondary-text-color,#68716c);font-size:12px}
.lc-fallback{position:relative;flex:1;min-width:0}.lc-fallback-list{max-height:185px;overflow:auto;display:block;border:1px solid var(--divider-color,#dfe5df);border-radius:12px;background:var(--card-background-color,#fff);margin-top:4px}.lc-fallback-list button{display:block;width:100%;padding:10px 12px;text-align:left;border:0;background:transparent;border-bottom:1px solid var(--divider-color,#dfe5df);color:var(--primary-text-color,#19221e);font-size:12px}.lc-fallback-list button:last-child{border-bottom:0}.lc-fallback-list button:hover{background:var(--secondary-background-color,#f1f3ef)}.lc-fallback-list small{display:block;margin-top:3px;color:var(--secondary-text-color,#68716c);font-size:11px}
`;
class LumaControlCardEditor extends HTMLElement {
  constructor(){
    super();this.attachShadow({mode:'open'});this._config=lcConfig();this._hass=null;this._tab='dispositivi';this._index=0;this._selectorReady=false;
    this.shadowRoot.addEventListener('click',e=>this._click(e));this.shadowRoot.addEventListener('change',e=>this._change(e));
    this.shadowRoot.addEventListener('input',e=>this._search(e));
  }
  connectedCallback(){this._paint();this._prepareSelector();}
  set hass(h){this._hass=h;this.shadowRoot.querySelectorAll('ha-selector').forEach(x=>x.hass=h);this._refreshFallbacks();}
  setConfig(x){const c=lcConfig(x);if(JSON.stringify(c)===JSON.stringify(this._config)&&this.shadowRoot.querySelector('.lc-edit'))return;this._config=c;this._index=Math.min(this._index,Math.max(0,c.lights.length-1));this._paint();}
  _update(patch){this._config=lcConfig({...this._config,...patch});this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this._config},bubbles:true,composed:true}));this._paint();}
  _field(label,body,help=''){return `<div class="lc-field"><label>${lcEsc(label)}</label>${body}${help?`<div class="lc-help">${lcEsc(help)}</div>`:''}</div>`;}
  _picker(domain,id){return `<div class="lc-picker"><div class="lc-picker-slot" style="flex:1;min-width:0" data-picker="${domain}"></div>${id?`<button class="lc-remove" data-clear="${domain}" type="button" aria-label="Rimuovi entità" title="Rimuovi entità">${lcIcon('mdi:close')}</button>`:''}</div>`;}
  _switch(label,key,help=''){return `<div class="lc-switchrow"><label for="lc-${key}">${lcEsc(label)}${help?`<small>${lcEsc(help)}</small>`:''}</label><input id="lc-${key}" type="checkbox" data-key="${key}" ${this._config[key]?'checked':''}/></div>`;}
  _paint(){
    if(!this.isConnected)return;
    const tabs=[['dispositivi','Dispositivi'],['aspetto','Aspetto'],['automazioni','Automazioni'],['avanzate','Avanzate']];
    let body='';const c=this._config;
    if(this._tab==='dispositivi'){
      const x=c.lights[this._index];
      body=`<div class="lc-heading">Configurazione luci</div><div class="lc-sub">Seleziona un'entità light o switch e personalizza il dispositivo.</div>`+
        (c.lights.length?`<div class="lc-rows">${c.lights.map((d,i)=>`<span class="lc-rowgroup"><button type="button" class="lc-rowtab ${this._index===i?'active':''}" data-select="${i}">${lcEsc(d.name||d.entity||`Dispositivo ${i+1}`)}</button><button type="button" class="lc-delete-x" data-delete-index="${i}" aria-label="Rimuovi ${lcEsc(d.name||d.entity||`dispositivo ${i+1}`)}" title="Rimuovi dispositivo">${lcIcon('mdi:close')}</button></span>`).join('')}</div>`:'')+
        (x?this._field('Entità Home Assistant (light / switch)',this._picker('device',x.entity))+this._field('Nome visualizzato',`<input class="lc-input" type="text" data-item-field="name" maxlength="60" value="${lcEsc(x.name)}"/>`)+this._field('Icona MDI (facoltativa)',`<input class="lc-input" type="text" data-item-field="icon" placeholder="mdi:lightbulb-outline" value="${lcEsc(x.icon)}"/>`)+`<div class="lc-buttons"><button class="lc-action" type="button" data-move="-1" ${this._index===0?'disabled':''}>↑ Sposta su</button><button class="lc-action" type="button" data-move="1" ${this._index===c.lights.length-1?'disabled':''}>↓ Sposta giù</button></div>`:'<div class="lc-empty">Nessun dispositivo configurato.</div>')+
        '<div class="lc-buttons"><button class="lc-action" type="button" data-add>+ Aggiungi dispositivo</button></div>';
    }
    if(this._tab==='aspetto'){
      body=`<div class="lc-heading">Aspetto Edera</div><div class="lc-sub">Tipografia, colori e disposizione coerenti con le altre card.</div>`+
        this._field('Intestazione superiore',`<input class="lc-input" type="text" maxlength="60" data-key="eyebrow" value="${lcEsc(c.eyebrow)}"/>`)+
        this._field('Titolo',`<input class="lc-input" type="text" maxlength="60" data-key="title" value="${lcEsc(c.title)}"/>`)+
        this._field('Tema',`<select class="lc-input" data-key="theme_mode">${[['auto','Automatico (Home Assistant)'],['light','Edera Light'],['dark','Graphite Dark']].map(([v,l])=>`<option value="${v}" ${c.theme_mode===v?'selected':''}>${l}</option>`).join('')}</select>`)+
        this._field('Disposizione',`<select class="lc-input" data-key="layout">${[['auto','Automatico'],['one','Una luce per riga'],['two','Due luci per riga (quarta posizione vuota)']].map(([v,l])=>`<option value="${v}" ${c.layout===v?'selected':''}>${l}</option>`).join('')}</select>`);
    }
    if(this._tab==='automazioni'){
      body=`<div class="lc-heading">Automazioni</div><div class="lc-sub">Collega un'automazione Home Assistant già esistente.</div>`+
        this._field('Entità automazione',this._picker('automation',c.automation_entity))+
        this._switch('Mostra nella card','show_automation','Accesso verde al popup dell’automazione.');
    }
    if(this._tab==='avanzate'){
      body=`<div class="lc-heading">Avanzate</div><div class="lc-sub">Comportamento dei controlli.</div>`+
        this._switch('Abilita i comandi','controls_enabled','Accensione, regolazione luminosa e attivazione delle automazioni collegate.');
    }
    this.shadowRoot.innerHTML=`<style>${LC_EDITOR_CSS}</style><div class="lc-edit"><nav class="lc-tabs" aria-label="Configurazione">${tabs.map(([id,name])=>`<button type="button" class="lc-tab ${id===this._tab?'active':''}" data-tab="${id}">${name}</button>`).join('')}</nav>${body}</div>`;
    this._mountSelectors();
  }
  async _prepareSelector(){
    if(customElements.get('ha-selector')){this._selectorReady=true;this._paint();return;}
    try{const h=await window.loadCardHelpers?.();await h?.importSelector?.();}
    catch{/* Use the safe local entity list if HA's selector is not loaded. */}
    this._selectorReady=!!customElements.get('ha-selector');this._paint();
  }
  _mountSelectors(){
    this.shadowRoot.querySelectorAll('[data-picker]').forEach(slot=>{
      const kind=slot.dataset.picker,domain=kind==='device'?['light','switch']:['automation'];
      const value=kind==='device'?(this._config.lights[this._index]?.entity||''):this._config.automation_entity;
      if(this._selectorReady&&customElements.get('ha-selector')){
        const el=document.createElement('ha-selector');el.hass=this._hass;
        el.selector={entity:{domain:domain.length===1?domain[0]:domain}};el.value=value||'';
        el.addEventListener('value-changed',e=>{
          e.stopPropagation();if(!e.detail||!Object.prototype.hasOwnProperty.call(e.detail,'value'))return;
          this._setEntity(kind,lcEntity(e.detail.value,domain));
        });slot.appendChild(el);
      }else{
        slot.innerHTML=`<div class="lc-fallback"><input class="lc-input" type="search" data-search="${kind}" placeholder="Cerca entità ${domain.join(' / ')}" autocomplete="off" value="${lcEsc(value)}" aria-label="Cerca entità"/><div class="lc-fallback-list" data-options="${kind}"></div></div>`;
      }
    });
    this._refreshFallbacks();
  }
  _refreshFallbacks(){
    this.shadowRoot.querySelectorAll('[data-options]').forEach(box=>{
      const kind=box.dataset.options,domain=kind==='device'?['light','switch']:['automation'];
      const query=String(this.shadowRoot.querySelector(`[data-search="${kind}"]`)?.value||'').toLowerCase();
      const entities=Object.entries(this._hass?.states||{}).filter(([id,e])=>domain.includes(id.split('.')[0])&&(id.toLowerCase().includes(query)||String(e.attributes?.friendly_name||'').toLowerCase().includes(query))).sort((a,b)=>a[0].localeCompare(b[0])).slice(0,150);
      box.innerHTML=entities.length?entities.map(([id,e])=>`<button type="button" data-pick="${lcEsc(kind)}" data-entity="${lcEsc(id)}">${lcEsc(e.attributes?.friendly_name||id)}<small>${lcEsc(id)}</small></button>`).join(''):'<div class="lc-empty">Nessuna entità disponibile.</div>';
    });
  }
  _setEntity(kind,id){
    if(kind==='automation'){this._update({automation_entity:lcEntity(id,['automation'])});return;}
    const items=[...this._config.lights];if(!items[this._index])return;
    items[this._index]={...items[this._index],entity:lcEntity(id)};
    this._update({lights:items});
  }
  _click(ev){
    const tab=ev.target.closest('[data-tab]');if(tab){this._tab=tab.dataset.tab;this._paint();return;}
    const select=ev.target.closest('[data-select]');if(select){this._index=Number(select.dataset.select);this._paint();return;}
    const pick=ev.target.closest('[data-pick]');if(pick){this._setEntity(pick.dataset.pick,pick.dataset.entity);return;}
    const clear=ev.target.closest('[data-clear]');if(clear){this._setEntity(clear.dataset.clear,'');return;}
    if(ev.target.closest('[data-add]')){this._index=this._config.lights.length;this._update({lights:[...this._config.lights,lcLight()]});return;}
    const remove=ev.target.closest('[data-delete-index]');if(remove){const removed=Number(remove.dataset.deleteIndex);if(!Number.isInteger(removed)||removed<0||removed>=this._config.lights.length)return;this._index=Math.max(0,Math.min(this._index>removed?this._index-1:this._index,this._config.lights.length-2));this._update({lights:this._config.lights.filter((_,i)=>i!==removed)});return;}
    const move=ev.target.closest('[data-move]');if(move){const j=this._index+Number(move.dataset.move),arr=[...this._config.lights];if(j<0||j>=arr.length)return;[arr[j],arr[this._index]]=[arr[this._index],arr[j]];this._index=j;this._update({lights:arr});}
  }
  _search(ev){if(ev.target.hasAttribute('data-search'))this._refreshFallbacks();}
  _change(ev){
    const el=ev.target;
    if(el.hasAttribute('data-item-field')){const arr=[...this._config.lights],item=arr[this._index];if(!item)return;arr[this._index]={...item,[el.dataset.itemField]:el.value};this._update({lights:arr});return;}
    const key=el.dataset.key;if(!key||!(key in LC_DEFAULTS))return;
    const value=el.type==='checkbox'?el.checked:el.value;this._update({[key]:value});
  }
}
if(typeof customElements!=='undefined'){
  if(!customElements.get(LC_TAG))customElements.define(LC_TAG,LumaControlCard);
  if(!customElements.get(LC_EDITOR_TAG))customElements.define(LC_EDITOR_TAG,LumaControlCardEditor);
}
if(typeof window!=='undefined'){
  window.customCards=window.customCards||[];
  if(!window.customCards.some(x=>x.type===LC_TAG))window.customCards.push({type:LC_TAG,name:'Luma Control Card',description:'Controllo luci e automazioni in stile Edera.',preview:true});
}
export {lcConfig,lcEntity,lcCapabilities,lcBrightness};