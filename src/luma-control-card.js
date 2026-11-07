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
  layout: 'auto', // deprecated: kept so saved configurations stay valid, no longer used (the Fader layout replaces it)
  show_eyebrow: true, show_title: true, ambient_glow: false,
  lights: [], automation_entity: '', automation_entities: [], show_automation: true,
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
  const automations=[...new Set((Array.isArray(x.automations)?x.automations:[]).map(v=>lcEntity(v,['automation'])).filter(Boolean))].slice(0,16);
  return {entity:lcEntity(x.entity), name:lcText(x.name,60), icon:/^mdi:[a-z0-9-]{1,70}$/.test(x.icon||'')?x.icon:'', timer_entity:lcEntity(x.timer_entity,['timer']), automations};
}
function lcConfig(v={}) {
  const x=v && typeof v==='object' && !Array.isArray(v) ? v : {};
  const items=Array.isArray(x.lights)?x.lights.map(lcLight):[];
  // Keep the original single-automation configuration working without duplicating it.
  const previous=lcEntity(x.automation_entity,['automation']);
  const autos=Array.isArray(x.automation_entities)?x.automation_entities:[previous];
  const automation_entities=[...new Set(autos.map(v=>lcEntity(v,['automation'])).filter(Boolean))].slice(0,64);
  return {
    ...x,
    type:'custom:luma-control-card',
    title:lcText(x.title??LC_DEFAULTS.title,60),
    eyebrow:lcText(x.eyebrow??LC_DEFAULTS.eyebrow,60),
    theme_mode:LC_MODES.includes(x.theme_mode)?x.theme_mode:'auto',
    layout:LC_LAYOUTS.includes(x.layout)?x.layout:'auto',
    show_eyebrow:x.show_eyebrow!==false, show_title:x.show_title!==false, ambient_glow:x.ambient_glow===true,
    lights:items.filter((x,i,a)=>!x.entity||a.findIndex(y=>y.entity===x.entity)===i).slice(0,64),
    automation_entity:automation_entities[0]||'', automation_entities,
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
:host{display:block;min-width:0;box-sizing:border-box;font-family:var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,system-ui,"Segoe UI Variable","Segoe UI",Roboto,Arial,sans-serif)}
*,*:before,*:after{box-sizing:border-box}button,input,select{font:inherit}button{cursor:pointer}button:disabled,input:disabled{opacity:.45;cursor:not-allowed}button:focus-visible,input:focus-visible,select:focus-visible,[role="slider"]:focus-visible{outline:2px solid var(--lc-emerald);outline-offset:2px}[hidden]{display:none!important}
ha-icon{display:inline-flex;vertical-align:middle;--mdc-icon-size:20px;width:20px;height:20px;flex:none}
.lc-root{--lc-bg:var(--card-background-color,#fff);--lc-tile:var(--secondary-background-color,#F1F3EF);--lc-orb:#fff;--lc-border:var(--ha-card-border-color,#E3E7E2);--lc-text:var(--primary-text-color,#19221E);--lc-muted:var(--secondary-text-color,#68716C);--lc-light:var(--edera-light-color,#9A7C4F);--lc-emerald:var(--edera-emerald-color,#0E6B52);--lc-track:#dde2de;background:var(--lc-bg);color:var(--lc-text);border:1px solid var(--lc-border);border-radius:26px;padding:16px;min-width:0;font-size:14px;position:relative}.lc-root:not(.lc-modal-scope){container:lc/inline-size}.lc-root.lc-glow{background:radial-gradient(90% 70% at 100% 0%,color-mix(in srgb,var(--lc-light) calc(var(--avg,0)*24%),transparent) 0,transparent 72%),var(--lc-bg)}
.lc-root.lc-dark{--lc-bg:#101211;--lc-tile:#191c1a;--lc-orb:#282b29;--lc-border:#2b302c;--lc-text:#f5f7f4;--lc-muted:#bbc5bd;--lc-light:var(--edera-light-color,#D3C29D);--lc-emerald:#0e795d;--lc-track:#343a35}
.lc-head{padding:2px 4px 14px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:8px}.lc-hd{min-width:0}.lc-eyebrow{font-size:10px;letter-spacing:1.7px;font-weight:750;color:var(--lc-muted);margin-bottom:7px;white-space:nowrap}.lc-title{font-size:25px;font-weight:780;letter-spacing:-.7px;line-height:1.14;overflow-wrap:anywhere}.lc-dot{color:var(--lc-emerald)}
.lc-alloff{margin-left:auto;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;border:1px solid var(--lc-border);border-radius:999px;background:var(--lc-tile);color:var(--lc-text);padding:7px 9px;font-size:11px;font-weight:600}.lc-alloff ha-icon{--mdc-icon-size:16px;width:16px;height:16px}
.lc-col{min-width:0;display:grid;gap:8px}.lc-faders{--fh:168px;--tw:48px;position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(74px,1fr);gap:10px;overflow-x:auto;scroll-snap-type:x proximity;scrollbar-width:none;overscroll-behavior-x:contain;padding-bottom:2px}.lc-faders::-webkit-scrollbar{display:none}.lc-faders.few{grid-auto-columns:minmax(74px,170px)}.lc-faders.many{grid-auto-columns:minmax(84px,1fr)}.lc-faders.solo{display:block;overflow:visible;--tw:84px}
.lc-fd{container:fd/inline-size;background:var(--lc-tile);border:1px solid var(--lc-border);border-radius:18px;padding:10px 1px;display:flex;flex-direction:column;align-items:center;gap:9px;min-width:0;scroll-snap-align:start;--f:0;--lcol:var(--lc-light)}
.lc-fd-top{display:flex;align-items:center;justify-content:center;gap:4px;min-width:0}.lc-fd-ic{display:inline-flex;color:var(--lc-light)}.lc-fd.off .lc-fd-ic,.lc-fd.na .lc-fd-ic{color:var(--lc-muted)}.lc-fd-ic ha-icon{--mdc-icon-size:18px;width:18px;height:18px}.lc-fd-pct{font-size:12px;font-weight:700;font-variant-numeric:tabular-nums}
.lc-fd-track{position:relative;width:min(100%,var(--tw));height:var(--fh);border-radius:16px;background:var(--lc-track);overflow:hidden;touch-action:pan-x;cursor:ns-resize;user-select:none;-webkit-user-select:none}.lc-fd-track[aria-disabled="true"]{cursor:default}.lc-fd-track.drag{outline:2px solid var(--lc-emerald);outline-offset:2px}
.lc-fd-fill{position:absolute;left:0;right:0;bottom:0;height:calc(var(--f,0)*100%);background:linear-gradient(0deg,color-mix(in srgb,var(--lcol) 58%,var(--lc-track)),var(--lcol));transition:height .18s}.lc-fd-fill:after{content:"";position:absolute;top:7px;left:25%;right:25%;height:4px;border-radius:2px;background:#fff;opacity:.85}.lc-fd.z .lc-fd-fill:after{display:none}.lc-fd-track.drag .lc-fd-fill{transition:none}
.lc-fd-track.basic{cursor:default;display:grid;place-items:center;touch-action:pan-x pan-y}.lc-fd-track.basic span{writing-mode:vertical-rl;font-size:11px;font-weight:700;letter-spacing:.12em;color:var(--lc-muted);text-transform:uppercase}.lc-fd:not(.off):not(.na) .lc-fd-track.basic{background:color-mix(in srgb,var(--lc-light) 30%,var(--lc-track))}
.lc-fd-name{max-width:100%;padding:0 2px;font-size:11px;font-weight:600;text-align:center;line-height:1.25;hyphens:auto;-webkit-hyphens:auto;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:break-word;min-height:2.5em}.lc-fd.na{opacity:.7}
.lc-det{width:30px;height:30px;border-radius:50%;border:1px solid var(--lc-border);background:var(--lc-orb);color:var(--lc-text);display:grid;place-items:center;padding:0;flex:none}.lc-det ha-icon{--mdc-icon-size:16px;width:16px;height:16px}.lc-det .lc-swatch{width:16px;height:16px}.lc-det.ph,.lc-det-pill.ph{visibility:hidden}
.lc-det-pill{display:none;align-items:center;justify-content:center;gap:8px;width:calc(100% - 16px);min-height:36px;padding:0 10px;border-radius:999px;border:1px solid color-mix(in srgb,var(--lc-emerald) 45%,transparent);background:color-mix(in srgb,var(--lc-emerald) 12%,transparent);color:var(--lc-emerald);font-size:11px;font-weight:650;white-space:nowrap}.lc-dark .lc-det-pill{color:var(--lc-text)}.lc-det-pill ha-icon{--mdc-icon-size:16px;width:16px;height:16px}
@container fd (min-width:140px){.lc-det{display:none}.lc-det-pill{display:inline-flex}}
.lc-fd.lc-solo{flex-direction:row;flex-wrap:wrap;align-items:center;justify-content:flex-start;gap:20px;padding:16px;max-width:560px;scroll-snap-align:none}.lc-solo .lc-fd-info{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}.lc-fd-head{display:flex;align-items:center;gap:9px;min-width:0}.lc-fd-head .lc-fd-ic{width:37px;height:37px;border-radius:50%;background:var(--lc-orb);align-items:center;justify-content:center;flex:none}.lc-fd-head .lc-fd-ic ha-icon{--mdc-icon-size:20px;width:20px;height:20px}.lc-fd-n{font-size:17px;font-weight:700;letter-spacing:-.2px;line-height:1.25;overflow-wrap:anywhere;min-width:0}.lc-fd-st{font-size:12px;color:var(--lc-muted)}.lc-fd-big{font-size:44px;line-height:1;font-weight:780;letter-spacing:-1.5px;font-variant-numeric:tabular-nums;margin-top:10px}.lc-fd-act{display:flex;align-items:center;gap:10px;margin-top:14px}.lc-solo .lc-power{width:44px;height:44px}.lc-solo .lc-power ha-icon{--mdc-icon-size:20px;width:20px;height:20px}.lc-fd-pillrow{flex:1 0 100%;display:flex}.lc-fd-pillrow .lc-det-pill{width:100%}
.lc-pager{display:flex;align-items:center;justify-content:center;gap:12px}.lc-pager button{width:44px;height:36px;border-radius:999px;border:1px solid var(--lc-border);background:var(--lc-tile);color:var(--lc-text);display:grid;place-items:center;padding:0}.lc-pager ha-icon{--mdc-icon-size:18px;width:18px;height:18px}.lc-pager span{font-size:11.5px;color:var(--lc-muted);font-variant-numeric:tabular-nums;min-width:104px;text-align:center}
.lc-power{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--lc-orb);border:1px solid var(--lc-border);color:var(--lc-muted);padding:0;flex:none}.lc-power.on{background:var(--lc-light);border-color:var(--lc-light);color:#19221e}.lc-power ha-icon{--mdc-icon-size:17px;width:17px;height:17px}.lc-info{font-size:12px;line-height:1.4;color:var(--lc-muted)}
@media(pointer:coarse){.lc-fd:not(.lc-solo) .lc-power{width:42px;height:42px}.lc-det{width:38px;height:38px}}
.lc-range{-webkit-appearance:none;appearance:none;display:block;width:100%;height:17px;min-height:17px;cursor:pointer;border:0;border-radius:999px;background:linear-gradient(to right,var(--lc-light) 0,var(--lc-light) var(--percent,50%),var(--lc-track) var(--percent,50%),var(--lc-track) 100%);touch-action:pan-y;margin:3px 0}.lc-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:25px;height:25px;border-radius:50%;border:4px solid var(--lc-bg);background:var(--lc-light);box-shadow:0 1px 5px #0003}.lc-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;border:3px solid var(--lc-bg);background:var(--lc-light);box-shadow:0 1px 5px #0003}
.lc-swatch{display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--actual-color,var(--lc-light));border:1px solid #0001}.lc-empty{padding:12px 4px;color:var(--lc-muted);font-size:12px}.lc-error{font-size:11px;color:var(--error-color,#B85D55);margin-top:10px;line-height:1.45}
.lc-autos{display:grid;gap:8px;margin-top:14px}.lc-ac-h{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;font-size:11px;color:var(--lc-muted)}.lc-ac-h b{font-size:10px;letter-spacing:1.7px;font-weight:750}.lc-ac-row{display:flex;flex-wrap:wrap;gap:8px}.lc-ac{display:inline-flex;align-items:center;gap:7px;min-height:34px;max-width:100%;border:1px solid var(--lc-border);background:var(--lc-tile);color:var(--lc-text);border-radius:999px;padding:7px 12px;font-size:12px;font-weight:600;line-height:1.2;text-align:left}.lc-ac span{min-width:0;overflow-wrap:anywhere}.lc-ac i{width:8px;height:8px;border-radius:50%;background:var(--lc-muted);flex:none}.lc-ac.on{border-color:color-mix(in srgb,var(--lc-emerald) 55%,transparent);background:color-mix(in srgb,var(--lc-emerald) 12%,transparent)}.lc-ac.on i{background:var(--lc-emerald)}.lc-ac.na{border-style:dashed;color:var(--lc-muted)}.lc-ac.na:disabled{opacity:.8}.lc-panel-title.lc-ac-h{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;color:var(--lc-text)}.lc-panel-title.lc-ac-h [data-asum-l]{font-size:11px;font-weight:400;color:var(--lc-muted)}.lc-ac.na i{background:var(--warning-color,#A8650B)}
.lc-state-row{display:flex;align-items:center;gap:12px}.lc-state-row .lc-swatch{width:42px;height:42px;flex:none}.lc-state-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;font-size:13px}.lc-state-t b{font-weight:650}.lc-state-t small{font-size:11px;color:var(--lc-muted)}
.lc-backdrop{position:fixed;inset:0;background:#0009;z-index:9999;display:grid;place-items:center;padding:16px}.lc-dialog{width:min(390px,100%);max-height:min(90dvh,700px);overflow:hidden;display:flex;flex-direction:column;background:var(--lc-bg);border:1px solid var(--lc-border);border-radius:26px;box-shadow:0 18px 60px #0005;color:var(--lc-text);opacity:1}.lc-dialog-head{display:flex;align-items:center;gap:9px;min-height:58px;padding:12px 16px 12px 18px;background:var(--lc-bg);border-bottom:1px solid var(--lc-border);flex:none}.lc-dialog-head strong{flex:1;min-width:0;font-size:17px;font-weight:650;overflow-wrap:anywhere}.lc-close{width:36px;height:36px;flex:none;border:0;border-radius:50%;background:var(--lc-tile);color:var(--lc-text);display:grid;place-items:center}.lc-close{padding:0;line-height:0;align-items:center;justify-content:center}.lc-close ha-icon{display:block;width:19px;height:19px;--mdc-icon-size:19px;margin:0}.lc-dialog-body{padding:16px;overflow-y:auto;min-height:0;background:var(--lc-bg)}
.lc-panel{border:1px solid var(--lc-border);border-radius:16px;background:var(--lc-bg);padding:14px;margin-bottom:10px}.lc-panel+.lc-panel{border-top:1px solid var(--lc-border)}.lc-panel:last-child{margin-bottom:0}.lc-panel-title{font-size:13px;font-weight:650;margin-bottom:12px}.lc-wheel{width:min(194px,100%);aspect-ratio:1;border-radius:50%;position:relative;margin:13px auto 17px;background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red);cursor:crosshair;touch-action:none}.lc-wheel:before{content:"";position:absolute;inset:22%;border-radius:50%;background:var(--lc-bg);pointer-events:none}.lc-wheel:after{content:"";position:absolute;width:44px;height:44px;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%);background:var(--chosen-color,var(--lc-light));border:1px solid var(--lc-border);pointer-events:none}.lc-presets{display:flex;justify-content:center;flex-wrap:wrap;gap:9px;margin:12px 0 2px}.lc-preset{width:30px;height:30px;border-radius:50%;border:3px solid var(--lc-bg);box-shadow:0 0 0 1px var(--lc-border);background:var(--color)}.lc-preset:focus-visible{outline-offset:4px}.lc-color-info{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:13px;font-size:11px;color:var(--lc-muted)}.lc-color-info .lc-swatch{width:18px;height:18px}
.lc-temp-row{display:flex;justify-content:space-between;gap:9px;color:var(--lc-muted);font-size:11px;margin-top:12px}.lc-quick{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:14px}.lc-quick button{background:var(--lc-orb);color:var(--lc-text);border:1px solid var(--lc-border);border-radius:12px;padding:9px 5px;font-size:11px}
.lc-timer-status{font-size:11px;color:var(--lc-muted);margin:0 0 9px}.lc-timer-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.lc-timer-actions button{background:var(--lc-orb);color:var(--lc-text);border:1px solid var(--lc-border);border-radius:11px;padding:9px 2px;font-size:11px}.lc-timer-cancel{margin-top:9px;width:100%;padding:9px;border-radius:11px;border:1px solid var(--lc-border);background:var(--lc-orb);color:var(--lc-muted);font-size:11px}
@media(max-width:420px){.lc-root{padding:13px;border-radius:23px}}@container lc (max-width:479px){.lc-faders.many{grid-auto-columns:calc((100% - 20px)/3);scroll-snap-type:x mandatory}}@container lc (min-width:480px){.lc-faders{--fh:210px;--tw:52px}.lc-faders.many{grid-auto-columns:minmax(74px,1fr)}.lc-faders.solo{--tw:104px}}@container lc (min-width:860px){.lc-faders{--fh:250px;--tw:56px}.lc-faders.solo{--tw:124px}.lc-title{font-size:30px}.lc-eyebrow{font-size:11px}.lc-fd-big{font-size:56px}.lc-fd-n{font-size:20px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{transition:none!important;animation:none!important}}
`;
const LC_MODAL_CSS=":host{position:fixed;inset:0;z-index:2147483000;pointer-events:none;font-family:var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,system-ui,Roboto,Arial,sans-serif)}\n.lc-root.lc-modal-scope{background:transparent;border:0;border-radius:0;padding:0;pointer-events:none}\n.lc-modal-scope .lc-backdrop{position:fixed;inset:0;display:grid;place-items:center;padding:16px;pointer-events:auto;overscroll-behavior:contain}\n.lc-modal-scope .lc-dialog{max-height:min(82dvh,720px);width:min(390px,100%);border-radius:26px;background:var(--lc-bg)}\n.lc-modal-scope .lc-dialog-body{flex:1 1 auto;min-height:0;background:var(--lc-bg);overscroll-behavior:contain;-webkit-overflow-scrolling:touch}\n.lc-modal-scope .lc-panel{background:transparent;border:0;border-radius:0;padding:10px 0 18px;margin:0}\n.lc-modal-scope .lc-panel+.lc-panel{border:0;border-top:1px solid var(--lc-border);padding-top:19px}\n.lc-modal-scope .lc-panel:last-child{padding-bottom:0}\n.lc-modal-scope .lc-color-info{background:var(--lc-tile);border-radius:13px;padding:11px 13px}\n.lc-modal-scope .lc-close{display:flex;align-items:center;justify-content:center;padding:0;line-height:0}\n.lc-modal-scope .lc-close ha-icon{display:block;width:19px;height:19px;margin:0;--mdc-icon-size:19px}\n@media(max-width:599px){.lc-modal-scope .lc-dialog{width:min(350px,100%);max-height:min(68dvh,560px);border-radius:24px}.lc-modal-scope .lc-dialog-head{padding:12px 15px}}\n@media(max-height:480px){.lc-modal-scope .lc-dialog{max-height:calc(100dvh - 32px)}}";
function lcIcon(name){return `<ha-icon icon="${lcEsc(name)}" aria-hidden="true"></ha-icon>`;}
class LumaControlCard extends HTMLElement {
  static getStubConfig(){const {type,...rest}=lcConfig();return rest;}
  static getConfigElement(){return document.createElement(LC_EDITOR_TAG);}
  constructor(){
    super();this.attachShadow({mode:'open'});
    this._config=lcConfig();this._hass=null;this._opened=null;
    this._busy=new Set();this._busyAll=false;this._error='';this._structureKey='';this._drag=null;this._kb=null;this._kbTimer=0;this._ro=null;
    this._lastFocus=null;this._activeRange=null;this._scrollLock=null;this._modalHost=null;this._blockedScroll=e=>{if(this._opened&&!e.composedPath().some(n=>n?.classList?.contains?.('lc-dialog-body')))e.preventDefault();};this._blockedKeys=e=>{if(this._opened&&['ArrowDown','ArrowUp','PageUp','PageDown','Home','End',' '].includes(e.key)&&!e.composedPath().some(n=>n?.classList?.contains?.('lc-dialog-body')))e.preventDefault();};
    this._pref=typeof matchMedia==='function'?matchMedia('(prefers-color-scheme:dark)'):null;
    this._themeChange=()=>this._paint();
    this.shadowRoot.addEventListener('click',e=>this._click(e));
    this.shadowRoot.addEventListener('input',e=>this._input(e));
    this.shadowRoot.addEventListener('change',e=>this._change(e));
    this.shadowRoot.addEventListener('pointerdown',e=>{if(e.target.matches('.lc-range'))this._activeRange=e.target;this._fadeDown(e);});
    this.shadowRoot.addEventListener('pointermove',e=>this._fadeMove(e));
    this.shadowRoot.addEventListener('pointerup',e=>{this._activeRange=null;this._fadeUp(e);});
    this.shadowRoot.addEventListener('pointercancel',e=>{this._activeRange=null;this._fadeUp(e,true);});
    this.shadowRoot.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&this._opened){this._close();return;}
      const fader=e.target.closest?.('[data-fader]');
      if(fader){
        const k=e.key,idx=Number(fader.dataset.fader),step={ArrowUp:5,ArrowRight:5,ArrowDown:-5,ArrowLeft:-5,PageUp:10,PageDown:-10}[k];
        if(step!==undefined||k==='Home'||k==='End'){
          e.preventDefault();if(!this._canFade(idx))return;
          const cur=Number(fader.getAttribute('aria-valuenow'))||0,v=k==='Home'?0:k==='End'?100:Math.round(lcClamped(cur+step,0,100));
          this._kb={index:idx};this._fadeSet(idx,v);clearTimeout(this._kbTimer);
          this._kbTimer=setTimeout(()=>{this._kb=null;this._fadeCommit(idx,v);},350);
        }
        return;
      }
      if(this._opened?.type==='light'&&e.target.matches('.lc-wheel')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
        e.preventDefault();const light=this._config.lights[this._opened.index],state=this._entity(light?.entity);
        if(!light||!lcCapabilities(state).rgb)return;
        const current=Number(state.attributes?.hs_color?.[0]||0);
        this._service(light.entity,'turn_on',{hs_color:[(current+(['ArrowRight','ArrowUp'].includes(e.key)?5:-5)+360)%360,100]});
      }
    });
  }
  connectedCallback(){this._pref?.addEventListener?.('change',this._themeChange);this._paint();}
  disconnectedCallback(){this._pref?.removeEventListener?.('change',this._themeChange);this._opened=null;this._unmountModal();this._unlockScroll();clearTimeout(this._kbTimer);this._kb=null;this._drag=null;this._ro?.disconnect();this._ro=null;}
  setConfig(v){this._opened=null;this._unmountModal();this._unlockScroll();this._config=lcConfig(v);this._structureKey='';this._paint();}
  set hass(h){this._hass=h;this._paint();}
  getCardSize(){const n=this._configured().length,chips=this._config.show_automation&&this._config.automation_entities.length?2:0;return (n===0?2:n===1?7:9)+chips;}
  getGridOptions(){return {columns:12,min_columns:3};}
  _entity(id){return id?this._hass?.states?.[id]:undefined;}
  _dark(){return this._config.theme_mode==='dark'||(this._config.theme_mode==='auto'&&(this._hass?.themes?.darkMode===true||(!this._hass?.themes&&!!this._pref?.matches)));}
  _configured(){return this._config.lights.map((item,index)=>({item,index})).filter(x=>x.item.entity);}
  _cap(item){return lcCapabilities(this._entity(item.entity));}
  _structure(){
    return JSON.stringify([this._config,this._dark(),
      this._config.lights.map(x=>{const c=this._cap(x);return [c.dim,c.rgb,c.temp];})]);
  }
  _label(item){const e=this._entity(item.entity);return item.name||e?.attributes?.friendly_name||item.entity;}
  _icon(item,e){const id=item.entity;return item.icon||(/^(mdi:[a-z0-9-]{1,70})$/.test(e?.attributes?.icon||'')?e.attributes.icon:'')||(id.startsWith('switch.')?'mdi:light-switch':'mdi:lightbulb-outline');}
  _hasDetails(item,c){return c.rgb||c.temp||Boolean(item.timer_entity)||item.automations.length>0;}
  _detail(item,index,c,label,solo){
    if(!this._hasDetails(item,c))return solo?'':'<span class="lc-det ph" aria-hidden="true"></span><span class="lc-det-pill ph" aria-hidden="true"></span>';
    const aria=`Dettagli e stato di ${lcEsc(label)}`;
    const pill=`<button type="button" class="lc-det-pill" data-open-light="${index}" aria-label="${aria}"><span>Dettagli e stato</span>${lcIcon('mdi:chevron-right')}</button>`;
    if(solo)return pill;
    return `<button type="button" class="lc-det" data-open-light="${index}" aria-label="${aria}">${c.rgb||c.temp?`<i class="lc-swatch" data-swatch="${index}"></i>`:lcIcon('mdi:tune-variant')}</button>${pill}`;
  }
  _track(index,label,dim){
    return dim?`<div class="lc-fd-track" role="slider" tabindex="0" aria-orientation="vertical" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Luminosità ${lcEsc(label)}" data-fader="${index}"><div class="lc-fd-fill"></div></div>`
      :`<div class="lc-fd-track basic" aria-hidden="true"><span data-bstate="${index}">—</span></div>`;
  }
  _strip(item,index){
    const e=this._entity(item.entity),c=this._cap(item),label=this._label(item);
    return `<article class="lc-fd" data-index="${index}"><div class="lc-fd-top"><span class="lc-fd-ic" data-orb="${index}">${lcIcon(this._icon(item,e))}</span><b class="lc-fd-pct" data-pct="${index}">—</b></div>${this._track(index,label,c.dim)}<button type="button" class="lc-power" data-toggle="${index}" aria-label="Accendi o spegni ${lcEsc(label)}">${lcIcon('mdi:power')}</button>${this._detail(item,index,c,label,false)}<div class="lc-fd-name" title="${lcEsc(label)}">${lcEsc(label)}</div></article>`;
  }
  _solo(item,index){
    const e=this._entity(item.entity),c=this._cap(item),label=this._label(item);
    return `<article class="lc-fd lc-solo" data-index="${index}">${this._track(index,label,c.dim)}<div class="lc-fd-info"><div class="lc-fd-head"><span class="lc-fd-ic" data-orb="${index}">${lcIcon(this._icon(item,e))}</span><div class="lc-fd-n">${lcEsc(label)}</div></div><div class="lc-fd-st" data-state="${index}">—</div><b class="lc-fd-big" data-pct="${index}">—</b><div class="lc-fd-act"><button type="button" class="lc-power" data-toggle="${index}" aria-label="Accendi o spegni ${lcEsc(label)}">${lcIcon('mdi:power')}</button></div></div><div class="lc-fd-pillrow">${this._detail(item,index,c,label,true)}</div></article>`;
  }
  _autoChips(ids){return ids.map(id=>{const e=this._entity(id);return `<button type="button" class="lc-ac" data-auto-entity="${lcEsc(id)}" aria-pressed="false"><i></i><span>${lcEsc(e?.attributes?.friendly_name||id)}</span></button>`;}).join('');}
  _allowedAuto(){return new Set([...this._config.automation_entities,...this._config.lights.flatMap(l=>l.automations)]);}
  _popup(){
    if(!this._opened)return '';
    let content='',label='',icon='mdi:lightbulb-outline';
    {
      const index=this._opened.index,item=this._config.lights[index],e=this._entity(item?.entity);
      if(!item)return '';
      label=item.name||e?.attributes?.friendly_name||item.entity;
      icon=item.icon||(/^(mdi:[a-z0-9-]{1,70})$/.test(e?.attributes?.icon||'')?e.attributes.icon:'')||icon;
      const cap=this._cap(item);
      content+=`<div class="lc-panel"><div class="lc-state-row"><i class="lc-swatch" data-state-swatch></i><div class="lc-state-t"><b data-pop-state>—</b></div><button type="button" class="lc-power" data-toggle="${index}" aria-label="Accendi o spegni ${lcEsc(label)}">${lcIcon('mdi:power')}</button></div></div>`;
      if(cap.rgb){
        const colors=[['Arancione',30,'#ff9138'],['Giallo',55,'#f2de45'],['Verde',120,'#44e65d'],['Ciano',180,'#34d9eb'],['Blu',225,'#4c7bee'],['Viola',280,'#bd4ce5'],['Rosa',325,'#eb4d9c']];
        content+=`<div class="lc-panel"><div class="lc-panel-title">Colore RGB</div><div class="lc-wheel" role="slider" tabindex="0" aria-label="Tonalità colore" aria-valuemin="0" aria-valuemax="360" aria-valuenow="0"></div><div class="lc-presets">${colors.map(([name,hue,hex])=>`<button type="button" data-hue="${hue}" class="lc-preset" style="--color:${hex}" aria-label="${name}" title="${name}"></button>`).join('')}</div><div class="lc-color-info"><span>Colore attuale</span><i class="lc-swatch" data-popup-swatch></i></div></div>`;
      }
      if(cap.temp){
        const a=e?.attributes||{},min=lcClamped(a.min_color_temp_kelvin||2000,1000,10000),max=Math.max(min+100,lcClamped(a.max_color_temp_kelvin||6500,1000,10000));
        const v=lcClamped(a.color_temp_kelvin||Math.round((min+max)/2),min,max);
        content+=`<div class="lc-panel"><div class="lc-panel-title">Temperatura colore <span data-temp-text>${v} K</span></div><input class="lc-range" type="range" data-temp="${index}" min="${min}" max="${max}" value="${v}" step="50" style="--percent:${(v-min)*100/(max-min)}%" aria-label="Temperatura colore"/><div class="lc-temp-row"><span>Calda</span><span>Fredda</span></div><div class="lc-quick"><button type="button" data-temp-quick="warm">Calda</button><button type="button" data-temp-quick="neutral">Neutra</button><button type="button" data-temp-quick="cool">Fredda</button></div></div>`;
      }
      if(item.timer_entity){
        content+=`<div class="lc-panel"><div class="lc-panel-title">Spegnimento temporizzato</div><div class="lc-timer-status" data-timer-state>Timer non disponibile</div><div class="lc-timer-actions">${[5,15,30,60].map(n=>`<button type="button" data-start-timer="${n}">${n} min</button>`).join('')}</div><button type="button" class="lc-timer-cancel" data-cancel-timer>Annulla timer</button></div>`;
      }
      if(item.automations.length){
        content+=`<div class="lc-panel"><div class="lc-panel-title lc-ac-h"><span>Automazioni</span><span data-asum-l>—</span></div><div class="lc-ac-row">${this._autoChips(item.automations)}</div></div>`;
      }
    }
    return `<div class="lc-backdrop" data-backdrop><section class="lc-dialog" role="dialog" aria-modal="true" aria-label="${lcEsc(label)}"><header class="lc-dialog-head">${lcIcon(icon)}<strong>${lcEsc(label)}</strong><button class="lc-close" type="button" aria-label="Chiudi" data-close>${lcIcon('mdi:close')}</button></header><div class="lc-dialog-body">${content}</div></section></div>`;
  }
  _paint(){
    if(!this.isConnected)return;
    const key=this._structure();
    if(key!==this._structureKey){
      this._structureKey=key;
      const configured=this._configured();
      const c=this._config,n=configured.length,kind=n===1?'solo':n<=3?'few':'many';
      const head=`<header class="lc-head">${(c.show_eyebrow&&c.eyebrow)||(c.show_title&&c.title)?`<div class="lc-hd">${c.show_eyebrow&&c.eyebrow?`<div class="lc-eyebrow">${lcEsc(c.eyebrow)}</div>`:''}${c.show_title&&c.title?`<div class="lc-title">${lcEsc(c.title)}<span class="lc-dot">.</span></div>`:''}</div>`:''}<button class="lc-alloff" type="button" data-alloff>${lcIcon('mdi:lightbulb-off-outline')} Spegni tutte</button></header>`;
      const body=n?`<div class="lc-col"><div class="lc-faders ${kind}" role="group" aria-label="Luci">${configured.map(x=>n===1?this._solo(x.item,x.index):this._strip(x.item,x.index)).join('')}</div>${n>=4?`<div class="lc-pager" data-pager hidden><button type="button" data-pg="-1" aria-label="Luci precedenti">${lcIcon('mdi:chevron-left')}</button><span data-pager-text aria-live="polite"></span><button type="button" data-pg="1" aria-label="Luci successive">${lcIcon('mdi:chevron-right')}</button></div>`:''}</div>`:'<div class="lc-empty">Aggiungi una luce dall’editor della card.</div>';
      const autos=c.show_automation&&c.automation_entities.length?`<section class="lc-autos" aria-label="Automazioni"><div class="lc-ac-h"><b>AUTOMAZIONI</b><span data-asum>—</span></div><div class="lc-ac-row">${this._autoChips(c.automation_entities)}</div></section>`:'';
      this.shadowRoot.innerHTML=`<style>${LC_CSS}</style><div class="lc-root ${this._dark()?'lc-dark':'lc-light'} ${c.ambient_glow?'lc-glow':''}">${head}${body}${autos}<div class="lc-error" role="alert" hidden></div></div>`;
      this._pagerBind();
    }
    this._sync();
    if(this._opened&&!this._modalHost)this._mountModal();
    if(!this._opened&&this._modalHost)this._unmountModal();
  }
  _held(i){return (this._drag?.index===i&&this._drag.active)||this._kb?.index===i;}
  _syncAutos(root,enabled){
    if(!root)return;
    root.querySelectorAll('[data-auto-entity]').forEach(btn=>{
      const id=btn.dataset.autoEntity,s=this._entity(id),known=lcKnown(s),on=known&&s.state==='on';
      btn.classList.toggle('on',on);btn.classList.toggle('na',!known);btn.setAttribute('aria-pressed',String(on));
      btn.disabled=!known||!enabled||this._busy.has(id);
      const name=s?.attributes?.friendly_name,span=btn.querySelector('span');if(span&&name&&span.textContent!==name)span.textContent=name;
      btn.title=!known?'Non disponibile':on?'Attivata':'Disattivata';
    });
    const count=ids=>{const n=ids.filter(id=>{const s=this._entity(id);return lcKnown(s)&&s.state==='on';}).length;return `${n} ${n===1?'attiva':'attive'}`;};
    const g=root.querySelector('[data-asum]');if(g)g.textContent=count(this._config.automation_entities);
    const l=root.querySelector('[data-asum-l]');if(l&&this._opened?.type==='light')l.textContent=count(this._config.lights[this._opened.index]?.automations||[]);
  }
  _sync(){
    const all=this._configured(),enabled=this._config.controls_enabled,root=this.shadowRoot;
    const active=all.filter(({item})=>this._entity(item.entity)?.state==='on');
    const allBtn=root.querySelector('[data-alloff]');
    if(allBtn)allBtn.disabled=!enabled||this._busyAll||!active.length;
    let sum=0;
    for(const {item,index} of all){
      const id=item.entity,e=this._entity(id),on=e?.state==='on',known=lcKnown(e),cap=this._cap(item),busy=this._busy.has(id)||this._busyAll;
      const level=lcBrightness(e),val=Number.isFinite(level)?level:0,label=this._label(item);
      sum+=on?(cap.dim?val/100:.6):0;
      const fd=root.querySelector(`.lc-fd[data-index="${index}"]`);
      if(fd){
        fd.classList.toggle('off',!on);fd.classList.toggle('na',!known);
        fd.style.setProperty('--lcol',lcRgb(e)||'var(--lc-light)');
        const nm=fd.querySelector('.lc-fd-name,.lc-fd-n');if(nm&&nm.textContent!==label){nm.textContent=label;nm.title=label;}
        const held=this._held(index)||busy,track=fd.querySelector('[data-fader]');
        if(track){
          const canDrag=known&&enabled&&!(on&&level===null);
          track.setAttribute('aria-disabled',String(!canDrag));track.tabIndex=canDrag?0:-1;
          if(!held){fd.style.setProperty('--f',String(val/100));fd.classList.toggle('z',val===0);track.setAttribute('aria-valuenow',String(val));track.setAttribute('aria-valuetext',Number.isFinite(level)?`${val}%`:'Sconosciuto');}
        }
        const bs=fd.querySelector('[data-bstate]');if(bs)bs.textContent=!known?'Non disponibile':on?'Accesa':'Spenta';
        const pct=fd.querySelector('[data-pct]');
        if(pct&&!held)pct.textContent=!known?'—':cap.dim?(on?(Number.isFinite(level)?`${level}%`:'—'):'Off'):(on?'On':'Off');
      }
      const state=root.querySelector(`[data-state="${index}"]`);
      if(state)state.textContent=!known?'Non disponibile':on?'Accesa':'Spenta';
      const orb=root.querySelector(`[data-orb="${index}"]`);
      if(orb){orb.classList.toggle('off',!on);const ha=orb.querySelector('ha-icon');if(ha)ha.setAttribute('icon',this._icon(item,e));}
      const power=root.querySelector(`[data-toggle="${index}"]`);
      if(power){power.classList.toggle('on',on);power.disabled=!known||!enabled||busy;power.setAttribute('aria-label',`${on?'Spegni':'Accendi'} ${label}`);}
      root.querySelectorAll(`[data-open-light="${index}"]`).forEach(b=>{b.disabled=!known&&!item.automations.length;});
      root.querySelectorAll(`[data-swatch="${index}"]`).forEach(sw=>sw.style.setProperty('--actual-color',lcRgb(e)||'var(--lc-light)'));
    }
    root.querySelector('.lc-root')?.style.setProperty('--avg',(all.length?sum/all.length:0).toFixed(3));
    this._syncAutos(root,enabled);
    const err=this.shadowRoot.querySelector('.lc-error');if(err){err.hidden=!this._error;err.textContent=this._error;}
    if(this._opened?.type==='light'){
      const item=this._config.lights[this._opened.index],s=this._entity(item?.entity),busy=this._busy.has(item?.entity);
      const pop=this._modalRoot(),pk=lcKnown(s),pon=pk&&s.state==='on',plevel=lcBrightness(s);
      const ps=pop?.querySelector('[data-pop-state]');if(ps)ps.textContent=!pk?'Non disponibile':pon?(this._cap(item).dim&&Number.isFinite(plevel)?`Accesa · ${plevel}%`:'Accesa'):'Spenta';
      const pw=pop?.querySelector('[data-toggle]');if(pw){pw.classList.toggle('on',pon);pw.disabled=!pk||!enabled||busy;}
      const psw=pop?.querySelector('[data-state-swatch]');if(psw)psw.style.setProperty('--actual-color',lcRgb(s)||'var(--lc-light)');
      this._syncAutos(pop,enabled);
      const wheel=this._modalRoot()?.querySelector('.lc-wheel'),color=lcRgb(s)||'var(--lc-light)';
      if(wheel){wheel.style.setProperty('--chosen-color',color);wheel.setAttribute('aria-valuenow',String(Math.round(s?.attributes?.hs_color?.[0]||0)));}
      const sw=this._modalRoot()?.querySelector('[data-popup-swatch]');if(sw)sw.style.setProperty('--actual-color',color);
      this._modalRoot()?.querySelectorAll('[data-hue],[data-temp-quick]')?.forEach(el=>el.disabled=!lcKnown(s)||!enabled||busy);
      const temp=this._modalRoot()?.querySelector('[data-temp]');if(temp){temp.disabled=!lcKnown(s)||!enabled||busy;if(temp!==this._activeRange&&this._modalRoot()?.activeElement!==temp){const v=lcClamped(s?.attributes?.color_temp_kelvin||temp.value,Number(temp.min),Number(temp.max));temp.value=String(v);temp.style.setProperty('--percent',`${(v-Number(temp.min))*100/(Number(temp.max)-Number(temp.min))}%`);const t=this._modalRoot()?.querySelector('[data-temp-text]');if(t)t.textContent=`${v} K`;}}
      const timer=this._entity(item?.timer_entity),state=this._modalRoot()?.querySelector('[data-timer-state]');
      if(state){state.textContent=!lcKnown(timer)?'Timer non disponibile':timer.state==='active'?'Timer attivo':timer.state==='paused'?'Timer in pausa':'Timer inattivo';}
      const timerReady=!!item?.timer_entity&&lcKnown(timer)&&['idle','active','paused'].includes(timer.state);
      this._modalRoot()?.querySelectorAll('[data-start-timer]')?.forEach(el=>el.disabled=!enabled||!lcKnown(s)||s?.state!=='on'||!timerReady||this._busy.has(item.timer_entity));
      const cancel=this._modalRoot()?.querySelector('[data-cancel-timer]');if(cancel)cancel.disabled=!enabled||!timerReady||timer.state==='idle'||this._busy.has(item.timer_entity);
    }
  }
  _pagerBind(){
    this._ro?.disconnect();this._ro=null;
    const sc=this.shadowRoot.querySelector('.lc-faders');if(!sc)return;
    sc.addEventListener('scroll',()=>this._pager(),{passive:true});
    if(typeof ResizeObserver==='function'){this._ro=new ResizeObserver(()=>this._pager());this._ro.observe(sc);}
    this._pager();
  }
  _pager(){
    const sc=this.shadowRoot.querySelector('.lc-faders'),pg=this.shadowRoot.querySelector('[data-pager]');if(!sc||!pg)return;
    const can=sc.scrollWidth>sc.clientWidth+1;pg.hidden=!can;if(!can)return;
    const items=[...sc.querySelectorAll('.lc-fd')],L=sc.scrollLeft,W=sc.clientWidth;let a=0,z=0;
    items.forEach((it,i)=>{if(it.offsetLeft>=L-2&&it.offsetLeft+it.offsetWidth<=L+W+2){if(!a)a=i+1;z=i+1;}});
    const t=pg.querySelector('[data-pager-text]');if(t)t.textContent=`Luci ${a===z?a:`${a}–${z}`} di ${items.length}`;
    pg.querySelector('[data-pg="-1"]').disabled=L<=1;pg.querySelector('[data-pg="1"]').disabled=L+W>=sc.scrollWidth-1;
  }
  _canFade(index){const item=this._config.lights[index],e=this._entity(item?.entity);return !!item&&this._config.controls_enabled&&lcKnown(e)&&this._cap(item).dim&&!this._busy.has(item.entity)&&!(e.state==='on'&&lcBrightness(e)===null);}
  _fadeSet(index,v){
    const fd=this.shadowRoot.querySelector(`.lc-fd[data-index="${index}"]`);if(!fd)return;
    fd.style.setProperty('--f',String(v/100));fd.classList.toggle('z',v===0);fd.classList.toggle('off',v===0);
    const t=fd.querySelector('[data-fader]');if(t){t.setAttribute('aria-valuenow',String(v));t.setAttribute('aria-valuetext',`${v}%`);}
    const p=fd.querySelector('[data-pct]');if(p)p.textContent=v===0?'Off':`${v}%`;
  }
  _fadeCommit(index,v){const item=this._config.lights[index];if(item)this._service(item.entity,v===0?'turn_off':'turn_on',v===0?{}:{brightness_pct:v});}
  // A tap never changes the level. Touch: only a deliberate vertical drag (relative to the current level) does; a horizontal swipe scrolls the list.
  _fadeDown(ev){
    const tr=ev.target.closest?.('[data-fader]');if(!tr||(ev.pointerType==='mouse'&&ev.button!==0))return;
    const index=Number(tr.dataset.fader);if(!this._canFade(index))return;
    const v0=lcBrightness(this._entity(this._config.lights[index].entity))||0,touch=ev.pointerType!=='mouse';
    this._drag={index,tr,pid:ev.pointerId,touch,x:ev.clientX,y:ev.clientY,v0,v:v0,active:!touch};
    if(!touch){try{tr.setPointerCapture(ev.pointerId);}catch{/* ignore */}tr.classList.add('drag');this._fadeMove(ev);}
  }
  _fadeMove(ev){
    const d=this._drag;if(!d||ev.pointerId!==d.pid)return;
    const box=d.tr.getBoundingClientRect();
    if(!d.touch){d.v=Math.round(lcClamped((1-(ev.clientY-box.top)/box.height)*100,0,100));this._fadeSet(d.index,d.v);return;}
    if(!d.active){
      const dx=ev.clientX-d.x,dy=ev.clientY-d.y;
      if(Math.abs(dy)>=8&&Math.abs(dy)>Math.abs(dx)*1.5){d.active=true;d.y=ev.clientY;d.tr.classList.add('drag');try{d.tr.setPointerCapture(ev.pointerId);}catch{/* ignore */}}
      return;
    }
    d.v=Math.round(lcClamped(d.v0-(ev.clientY-d.y)/box.height*100,0,100));this._fadeSet(d.index,d.v);
  }
  _fadeUp(ev,cancel=false){
    const d=this._drag;if(!d||ev.pointerId!==d.pid)return;
    this._drag=null;d.tr.classList.remove('drag');try{d.tr.releasePointerCapture(ev.pointerId);}catch{/* ignore */}
    if(d.active&&!cancel&&d.v!==d.v0)this._fadeCommit(d.index,d.v);else this._sync();
  }
  _modalRoot(){return this._modalHost?.shadowRoot||null;}
  _mountModal(){
    if(!this._opened||this._modalHost||!document.body)return;
    const host=document.createElement('div');host.setAttribute('data-luma-dialog','');const root=host.attachShadow({mode:'open'});
    const style=getComputedStyle(this);for(const n of ['--edera-light-color','--edera-emerald-color','--ha-font-family-body']){const v=style.getPropertyValue(n).trim();if(v)host.style.setProperty(n,v);}
    root.innerHTML=`<style>${LC_CSS}\n${LC_MODAL_CSS}</style><div class="lc-root lc-modal-scope ${this._dark()?'lc-dark':'lc-light'}">${this._popup()}</div>`;
    for(const evt of ['click','input','change'])root.addEventListener(evt,e=>this['_'+evt](e));
    root.addEventListener('pointerdown',e=>{if(e.target.matches('.lc-range'))this._activeRange=e.target;});
    for(const t of ['pointerup','pointercancel'])root.addEventListener(t,()=>{this._activeRange=null;});
    root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();this._close();return;}
      if(e.key==='Tab'){const arr=[...root.querySelectorAll('.lc-dialog button:not(:disabled),.lc-dialog input:not(:disabled),.lc-dialog [tabindex="0"]')];if(arr.length){const f=arr[0],l=arr[arr.length-1];if(e.shiftKey&&root.activeElement===f){e.preventDefault();l.focus({preventScroll:true});}else if(!e.shiftKey&&root.activeElement===l){e.preventDefault();f.focus({preventScroll:true});}}}
      if(this._opened?.type==='light'&&e.target.matches('.lc-wheel')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const item=this._config.lights[this._opened.index],state=this._entity(item?.entity);if(item&&lcCapabilities(state).rgb){const h=Number(state.attributes?.hs_color?.[0]||0),step=['ArrowRight','ArrowUp'].includes(e.key)?5:-5;this._service(item.entity,'turn_on',{hs_color:[(h+step+360)%360,100]});}}
    });
    this._modalHost=host;document.body.appendChild(host);root.querySelector('.lc-close')?.focus({preventScroll:true});this._sync();
  }
  _unmountModal(){this._modalHost?.remove();this._modalHost=null;}
  _lockScroll(){if(this._scrollLock)return;this._scrollLock=true;document.addEventListener('wheel',this._blockedScroll,{passive:false,capture:true});document.addEventListener('touchmove',this._blockedScroll,{passive:false,capture:true});document.addEventListener('keydown',this._blockedKeys,true);}
  _unlockScroll(){if(!this._scrollLock)return;document.removeEventListener('wheel',this._blockedScroll,true);document.removeEventListener('touchmove',this._blockedScroll,true);document.removeEventListener('keydown',this._blockedKeys,true);this._scrollLock=null;}
  _open(type,index){if(this._opened)return;this._lastFocus=this.shadowRoot.activeElement;this._opened={type,index};this._error='';this._lockScroll();this._mountModal();}
  _close(){this._opened=null;this._error='';this._unmountModal();this._unlockScroll();this._sync();this._lastFocus?.focus?.({preventScroll:true});this._lastFocus=null;}
  async _service(id,action,data={}){
    if(!this._config.controls_enabled||!id||this._busy.has(id)||!lcKnown(this._entity(id))||typeof this._hass?.callService!=='function')return;
    const domain=id.split('.')[0],allowed={light:['turn_on','turn_off'],switch:['turn_on','turn_off'],automation:['turn_on','turn_off'],timer:['start','cancel']};
    if(!allowed[domain]?.includes(action))return;
    this._busy.add(id);this._error='';this._sync();
    try{await this._hass.callService(domain,action,{entity_id:id,...data});}
    catch(err){this._error=`Comando non riuscito: ${lcText(err?.message||'Errore Home Assistant',120)}`;}
    finally{this._busy.delete(id);this._sync();}
  }
  async _allOff(){
    if(!this._config.controls_enabled||this._busyAll||typeof this._hass?.callService!=='function')return;
    const ids=this._configured().map(x=>x.item.entity).filter(id=>this._entity(id)?.state==='on'&&!this._busy.has(id));
    if(!ids.length)return;
    this._busyAll=true;this._sync();
    try{
      const groups={light:ids.filter(x=>x.startsWith('light.')),switch:ids.filter(x=>x.startsWith('switch.'))};
      const results=await Promise.allSettled(Object.entries(groups).filter(([,names])=>names.length).map(([domain,names])=>this._hass.callService(domain,'turn_off',{entity_id:names})));
      if(results.some(x=>x.status==='rejected'))this._error='Alcuni dispositivi non sono stati spenti. Verifica lo stato in Home Assistant.';
    }catch(err){this._error=lcText(err?.message||'Errore Home Assistant',120);}
    finally{this._busyAll=false;this._sync();}
  }
  _click(ev){
    if(ev.target.closest('[data-close]')||ev.target.matches('[data-backdrop]')){this._close();return;}
    if(ev.target.closest('[data-alloff]')){this._allOff();return;}
    const light=ev.target.closest('[data-open-light]');if(light){this._open('light',Number(light.dataset.openLight));return;}
    const pg=ev.target.closest('[data-pg]');if(pg){const sc=this.shadowRoot.querySelector('.lc-faders');if(sc)sc.scrollBy({left:Number(pg.dataset.pg)*(sc.clientWidth+10),behavior:typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});return;}
    const ac=ev.target.closest('[data-auto-entity]');if(ac){const id=ac.dataset.autoEntity;if(this._allowedAuto().has(id))this._service(id,this._entity(id)?.state==='on'?'turn_off':'turn_on');return;}
    const toggle=ev.target.closest('[data-toggle]');if(toggle){const x=this._config.lights[Number(toggle.dataset.toggle)],s=this._entity(x?.entity);if(s)this._service(x.entity,s.state==='on'?'turn_off':'turn_on');return;}
    const preset=ev.target.closest('[data-hue]');if(preset&&this._opened?.type==='light'){
      const x=this._config.lights[this._opened.index],s=this._entity(x?.entity);if(lcCapabilities(s).rgb)this._service(x.entity,'turn_on',{hs_color:[Number(preset.dataset.hue),100]});return;
    }
    const quick=ev.target.closest('[data-temp-quick]');if(quick&&this._opened?.type==='light'){
      const x=this._config.lights[this._opened.index],s=this._entity(x?.entity);if(!lcCapabilities(s).temp)return;
      const input=this._modalRoot()?.querySelector('[data-temp]');if(!input)return;
      const min=Number(input.min),max=Number(input.max),pos=quick.dataset.tempQuick,v=pos==='warm'?min:pos==='cool'?max:Math.round((min+max)/2);
      this._service(x.entity,'turn_on',{color_temp_kelvin:v});return;
    }
    const start=ev.target.closest('[data-start-timer]');if(start&&this._opened?.type==='light'){
      const x=this._config.lights[this._opened.index];if(!x?.timer_entity)return;
      const mins=Number(start.dataset.startTimer);if(![5,15,30,60].includes(mins))return;
      const duration=`${String(Math.floor(mins/60)).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}:00`;
      this._service(x.timer_entity,'start',{duration});return;
    }
    if(ev.target.closest('[data-cancel-timer]')&&this._opened?.type==='light'){
      const x=this._config.lights[this._opened.index];if(x?.timer_entity)this._service(x.timer_entity,'cancel');return;
    }
    const wheel=ev.target.closest('.lc-wheel');if(wheel)this._wheel(ev,wheel);
  }
  _wheel(ev,wheel){
    if(this._opened?.type!=='light')return;
    const box=wheel.getBoundingClientRect(),dx=ev.clientX-(box.left+box.width/2),dy=ev.clientY-(box.top+box.height/2);
    if(Math.hypot(dx,dy)<box.width*.2)return;
    const deg=(Math.atan2(dx,-dy)*180/Math.PI+360)%360,x=this._config.lights[this._opened.index];
    if(x&&this._cap(x).rgb)this._service(x.entity,'turn_on',{hs_color:[Math.round(deg),100]});
  }
  _input(ev){
    const range=ev.target.closest('[data-bright],[data-temp]');if(!range)return;
    const val=Number(range.value),pct=range.hasAttribute('data-bright')?val:(val-Number(range.min))*100/(Number(range.max)-Number(range.min));
    range.style.setProperty('--percent',`${pct}%`);
    if(range.hasAttribute('data-bright')){const el=this.shadowRoot.querySelector(`[data-pct="${Number(range.dataset.bright)}"]`);if(el)el.textContent=`${val}%`;}
    else{const el=this._modalRoot()?.querySelector('[data-temp-text]');if(el)el.textContent=`${val} K`;}
  }
  _change(ev){
    const range=ev.target.closest('[data-bright],[data-temp]');if(!range)return;
    this._activeRange=null;
    const item=this._config.lights[Number(range.dataset.bright??range.dataset.temp)],e=this._entity(item?.entity);if(!item||!lcKnown(e))return;
    if(range.hasAttribute('data-bright')&&this._cap(item).dim){const v=lcClamped(range.value,0,100);this._service(item.entity,v===0?'turn_off':'turn_on',v===0?{}:{brightness_pct:v});}
    if(range.hasAttribute('data-temp')&&this._cap(item).temp)this._service(item.entity,'turn_on',{color_temp_kelvin:Number(range.value)});
  }
}
const LC_EDITOR_CSS=`
:host{display:block;color:var(--primary-text-color,#19221E);font-family:var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,system-ui,Roboto,Arial,sans-serif);font-size:14px}
*,*:before,*:after{box-sizing:border-box}button,input,select{font:inherit}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--primary-color,#0E6B52);outline-offset:2px}button{cursor:pointer}button:disabled{opacity:.4;cursor:not-allowed}.lc-edit{min-width:0}.lc-tabs{display:flex;gap:4px;overflow-x:auto;border-bottom:1px solid var(--divider-color,#dfe5df);padding-bottom:12px}.lc-tab{white-space:nowrap;border:0;background:transparent;color:var(--secondary-text-color,#68716C);padding:10px 13px;border-radius:13px;font-size:13px}.lc-tab.active{font-weight:650;background:var(--secondary-background-color,#f1f3ef);color:var(--primary-text-color,#19221e)}
.lc-heading{font-size:21px;letter-spacing:-.45px;font-weight:600;margin:24px 0 8px}.lc-sub{font-size:12px;line-height:1.5;color:var(--secondary-text-color,#68716c);margin-bottom:18px}.lc-field{margin:19px 0}.lc-field>label{font-size:13px;display:block;font-weight:600;margin-bottom:10px}.lc-input{width:100%;display:block;padding:13px;background:var(--secondary-background-color,#f1f3ef);border:1px solid var(--divider-color,#e3e7e2);border-radius:12px;color:var(--primary-text-color,#19221e);outline-offset:1px}.lc-input option{background:var(--card-background-color,#fff);color:var(--primary-text-color,#19221e)}.lc-help{font-size:11px;color:var(--secondary-text-color,#68716c);margin-top:7px;line-height:1.45}.lc-picker{display:flex;align-items:center;gap:8px}.lc-picker ha-selector{display:block;flex:1;min-width:0;--mdc-theme-primary:var(--primary-color,#0e6b52)}.lc-picker .lc-input{flex:1;min-width:0}.lc-remove{border:1px solid var(--divider-color,#e3e7e2);border-radius:50%;width:36px;height:36px;flex:none;display:grid;place-items:center;background:var(--secondary-background-color,#f1f3ef);color:var(--primary-text-color,#19221e)}.lc-remove ha-icon{width:17px;height:17px;--mdc-icon-size:17px}
.lc-rows{display:flex;gap:6px;overflow-x:auto;padding:9px 0 14px;margin-bottom:10px}.lc-rowtab{background:transparent;color:var(--secondary-text-color,#68716c);border:0;padding:9px 12px;border-radius:12px;white-space:nowrap;font-size:12px}.lc-rowtab.active{background:var(--secondary-background-color,#f1f3ef);color:var(--primary-text-color,#19221e);font-weight:650}.lc-rowgroup{display:inline-flex;flex:none;align-items:center;border:1px solid var(--divider-color,#e3e7e2);border-radius:12px;overflow:hidden}.lc-rowgroup .lc-rowtab{border-radius:0}.lc-delete-x{width:30px;height:35px;display:grid;place-items:center;padding:0;border:0;border-left:1px solid var(--divider-color,#e3e7e2);background:var(--secondary-background-color,#f1f3ef);color:var(--primary-text-color,#19221e)}.lc-delete-x ha-icon{--mdc-icon-size:15px;width:15px;height:15px}.lc-delete-x,.lc-remove{line-height:0;align-items:center;justify-content:center}.lc-buttons{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px}.lc-action{background:var(--secondary-background-color,#f1f3ef);border:1px solid var(--divider-color,#e3e7e2);padding:9px 13px;border-radius:12px;color:var(--primary-text-color,#19221e);font-size:12px}.lc-switchrow{display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid var(--divider-color,#e3e7e2);padding:16px 0}.lc-switchrow:last-child{border-bottom:0}.lc-switchrow label{flex:1;font-size:13px}.lc-switchrow small{display:block;color:var(--secondary-text-color,#68716c);font-size:11px;margin-top:5px;line-height:1.5}.lc-switchrow input{width:18px;height:18px;accent-color:var(--primary-color,#0e6b52)}.lc-empty{padding:12px;color:var(--secondary-text-color,#68716c);font-size:12px}
.lc-fallback{position:relative;flex:1;min-width:0}.lc-fallback-list{max-height:185px;overflow:auto;display:block;border:1px solid var(--divider-color,#dfe5df);border-radius:12px;background:var(--card-background-color,#fff);margin-top:4px}.lc-fallback-list button{display:block;width:100%;padding:10px 12px;text-align:left;border:0;background:transparent;border-bottom:1px solid var(--divider-color,#dfe5df);color:var(--primary-text-color,#19221e);font-size:12px}.lc-fallback-list button:last-child{border-bottom:0}.lc-fallback-list button:hover{background:var(--secondary-background-color,#f1f3ef)}.lc-fallback-list small{display:block;margin-top:3px;color:var(--secondary-text-color,#68716c);font-size:11px}
`;
class LumaControlCardEditor extends HTMLElement {
  constructor(){
    super();this.attachShadow({mode:'open'});this._config=lcConfig();this._hass=null;this._tab='dispositivi';this._index=0;this._selectorReady=false;this._addingAuto=false;this._addingLightAuto=false;
    this.shadowRoot.addEventListener('click',e=>this._click(e));this.shadowRoot.addEventListener('change',e=>this._change(e));
    this.shadowRoot.addEventListener('input',e=>this._search(e));
  }
  connectedCallback(){this._paint();this._prepareSelector();}
  set hass(h){this._hass=h;this.shadowRoot.querySelectorAll('ha-selector').forEach(x=>x.hass=h);this._refreshFallbacks();}
  setConfig(x){const c=lcConfig(x);if(JSON.stringify(c)===JSON.stringify(this._config)&&this.shadowRoot.querySelector('.lc-edit'))return;this._config=c;this._index=Math.min(this._index,Math.max(0,c.lights.length-1));this._paint();}
  _update(patch){this._config=lcConfig({...this._config,...patch});this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this._config},bubbles:true,composed:true}));this._paint();}
  _field(label,body,help=''){return `<div class="lc-field"><label>${lcEsc(label)}</label>${body}${help?`<div class="lc-help">${lcEsc(help)}</div>`:''}</div>`;}
  _picker(kind,id){return `<div class="lc-picker"><div class="lc-picker-slot" style="flex:1;min-width:0" data-picker="${kind}"></div>${id?`<button class="lc-remove" data-clear="${kind}" type="button" aria-label="Rimuovi entità" title="Rimuovi entità">${lcIcon('mdi:close')}</button>`:''}</div>`;}
  _switch(label,key,help=''){return `<div class="lc-switchrow"><label for="lc-${key}">${lcEsc(label)}${help?`<small>${lcEsc(help)}</small>`:''}</label><input id="lc-${key}" type="checkbox" data-key="${key}" ${this._config[key]?'checked':''}/></div>`;}
  _paint(){
    if(!this.isConnected)return;
    const tabs=[['dispositivi','Dispositivi'],['aspetto','Aspetto'],['automazioni','Automazioni'],['avanzate','Avanzate']];
    let body='';const c=this._config;
    if(this._tab==='dispositivi'){
      const x=c.lights[this._index];
      body=`<div class="lc-heading">Configurazione luci</div><div class="lc-sub">Seleziona un'entità light e personalizza il dispositivo.</div>`+
        (c.lights.length?`<div class="lc-rows">${c.lights.map((d,i)=>`<span class="lc-rowgroup"><button type="button" class="lc-rowtab ${this._index===i?'active':''}" data-select="${i}">${lcEsc(d.name||d.entity||`Dispositivo ${i+1}`)}</button><button type="button" class="lc-delete-x" data-delete-index="${i}" aria-label="Rimuovi ${lcEsc(d.name||d.entity||`dispositivo ${i+1}`)}" title="Rimuovi dispositivo">${lcIcon('mdi:close')}</button></span>`).join('')}</div>`:'')+
        (x?this._field('Entità Home Assistant (light)',this._picker('device',x.entity))+this._field('Nome visualizzato',`<input class="lc-input" type="text" data-item-field="name" maxlength="60" value="${lcEsc(x.name)}"/>`)+this._field('Timer spegnimento (facoltativo)',this._picker('timer',x.timer_entity),'Seleziona un helper timer.*. Per spegnere la luce alla scadenza, crea in Home Assistant un’automazione sul trigger Timer finito.')+this._field('Automazioni di questa luce (facoltative)',(x.automations||[]).map((id,i)=>this._picker(`lauto:${i}`,id)).join('')+(this._addingLightAuto?this._picker('lauto:new',''):'')+`<div class="lc-buttons"><button class="lc-action" type="button" data-add-lauto ${this._addingLightAuto?'disabled':''}>+ Aggiungi automazione</button>${this._addingLightAuto?'<button class="lc-action" type="button" data-cancel-lauto>Annulla</button>':''}</div>`,'Compaiono nel popup «Dettagli e stato» di questa luce, come pulsanti per attivarle o disattivarle.')+this._field('Icona MDI (facoltativa)',`<input class="lc-input" type="text" data-item-field="icon" placeholder="Icona originale Home Assistant" value="${lcEsc(x.icon)}"/>`)+`<div class="lc-buttons"><button class="lc-action" type="button" data-move="-1" ${this._index===0?'disabled':''}>↑ Sposta su</button><button class="lc-action" type="button" data-move="1" ${this._index===c.lights.length-1?'disabled':''}>↓ Sposta giù</button></div>`:'<div class="lc-empty">Nessun dispositivo configurato.</div>')+
        '<div class="lc-buttons"><button class="lc-action" type="button" data-add>+ Aggiungi dispositivo</button></div>';
    }
    if(this._tab==='aspetto'){
      body=`<div class="lc-heading">Aspetto Edera</div><div class="lc-sub">Tipografia, colori e disposizione coerenti con le altre card.</div>`+
        this._field('Intestazione superiore',`<input class="lc-input" type="text" maxlength="60" data-key="eyebrow" value="${lcEsc(c.eyebrow)}"/>`)+
        this._field('Titolo',`<input class="lc-input" type="text" maxlength="60" data-key="title" value="${lcEsc(c.title)}"/>`)+
        this._field('Tema',`<select class="lc-input" data-key="theme_mode">${[['auto','Automatico (Home Assistant)'],['light','Edera Light'],['dark','Graphite Dark']].map(([v,l])=>`<option value="${v}" ${c.theme_mode===v?'selected':''}>${l}</option>`).join('')}</select>`)+
        this._switch('Mostra l’intestazione superiore','show_eyebrow')+
        this._switch('Mostra il titolo','show_title')+
        this._switch('Bagliore ambiente','ambient_glow','Alone di luce sullo sfondo, in base alla luminosità media delle luci accese.');
    }
    if(this._tab==='automazioni'){
      body=`<div class="lc-heading">Automazioni sulla card</div><div class="lc-sub">Pulsanti sotto le luci per attivare o disattivare automazioni Home Assistant già esistenti. Per collegare automazioni a una singola luce usa la scheda Dispositivi.</div>`+
        c.automation_entities.map((id,i)=>this._field(`Automazione ${i+1}`,this._picker(`automation:${i}`,id))).join('')+
        (this._addingAuto?this._field('Nuova automazione',this._picker('automation:new','')):'')+
        `<div class="lc-buttons"><button class="lc-action" type="button" data-add-auto ${this._addingAuto?'disabled':''}>+ Aggiungi automazione</button>${this._addingAuto?'<button class="lc-action" type="button" data-cancel-auto>Annulla</button>':''}</div>`+
        this._switch('Mostra nella card','show_automation','Mostra i pulsanti delle automazioni sotto le luci.');
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
      const kind=slot.dataset.picker;
      const domain=kind==='device'?['light']:kind==='timer'?['timer']:['automation'];
      const idx=kind.startsWith('automation:')||kind.startsWith('lauto:')?kind.split(':')[1]:null;
      const value=kind==='device'?(this._config.lights[this._index]?.entity||''):
        kind==='timer'?(this._config.lights[this._index]?.timer_entity||''):
        idx==='new'?'':kind.startsWith('lauto:')?(this._config.lights[this._index]?.automations?.[Number(idx)]||''):(this._config.automation_entities[Number(idx)]||'');
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
      const kind=box.dataset.options,domain=kind==='device'?['light']:kind==='timer'?['timer']:['automation'];
      const query=String(this.shadowRoot.querySelectorAll('[data-search]').length?Array.from(this.shadowRoot.querySelectorAll('[data-search]')).find(el=>el.dataset.search===kind)?.value||'':'').toLowerCase();
      const entities=Object.entries(this._hass?.states||{}).filter(([id,e])=>domain.includes(id.split('.')[0])&&(id.toLowerCase().includes(query)||String(e.attributes?.friendly_name||'').toLowerCase().includes(query))).sort((a,b)=>a[0].localeCompare(b[0])).slice(0,150);
      box.innerHTML=entities.length?entities.map(([id,e])=>`<button type="button" data-pick="${lcEsc(kind)}" data-entity="${lcEsc(id)}">${lcEsc(e.attributes?.friendly_name||id)}<small>${lcEsc(id)}</small></button>`).join(''):'<div class="lc-empty">Nessuna entità disponibile.</div>';
    });
  }
  _setEntity(kind,id){
    if(kind.startsWith('lauto:')){
      const items=[...this._config.lights],cur=items[this._index];if(!cur)return;
      const n=kind.split(':')[1],arr=[...(cur.automations||[])],clean=lcEntity(id,['automation']);
      if(n==='new'){if(!clean||arr.includes(clean))return;arr.push(clean);this._addingLightAuto=false;}
      else{const i=Number(n);if(!Number.isInteger(i)||i<0||i>=arr.length)return;if(!clean)arr.splice(i,1);else if(!arr.some((v,j)=>j!==i&&v===clean))arr[i]=clean;else return;}
      items[this._index]={...cur,automations:arr};this._update({lights:items});return;
    }
    if(kind.startsWith('automation:')){
      const n=kind.split(':')[1],arr=[...this._config.automation_entities],clean=lcEntity(id,['automation']);
      if(n==='new'){if(!clean)return;if(arr.includes(clean))return;arr.push(clean);this._addingAuto=false;}
      else{const i=Number(n);if(!Number.isInteger(i)||i<0||i>=arr.length)return;if(!clean)arr.splice(i,1);else if(!arr.some((v,j)=>j!==i&&v===clean))arr[i]=clean;else return;}
      this._update({automation_entities:arr,automation_entity:arr[0]||''});return;
    }
    const items=[...this._config.lights];if(!items[this._index])return;
    const key=kind==='timer'?'timer_entity':'entity',domains=kind==='timer'?['timer']:['light'];
    items[this._index]={...items[this._index],[key]:lcEntity(id,domains)};
    this._update({lights:items});
  }
  _click(ev){
    if(ev.target.closest('[data-add-auto]')){this._addingAuto=true;this._paint();return;}
    if(ev.target.closest('[data-cancel-auto]')){this._addingAuto=false;this._paint();return;}
    if(ev.target.closest('[data-add-lauto]')){this._addingLightAuto=true;this._paint();return;}
    if(ev.target.closest('[data-cancel-lauto]')){this._addingLightAuto=false;this._paint();return;}
    const tab=ev.target.closest('[data-tab]');if(tab){this._tab=tab.dataset.tab;this._paint();return;}
    const select=ev.target.closest('[data-select]');if(select){this._index=Number(select.dataset.select);this._addingLightAuto=false;this._paint();return;}
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