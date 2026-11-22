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
const LC_STYLES = ['fader', 'bars', 'tiles'];
const LC_LANGS = [['it', 'Italiano'], ['en', 'English'], ['de', 'Deutsch'], ['fr', 'Français']];
const LC_COLOR = new Set(['hs', 'xy', 'rgb', 'rgbw', 'rgbww']);
const LC_IS_PHONE = typeof window !== 'undefined' && Math.min(window.screen ? window.screen.width : 9999, window.screen ? window.screen.height : 9999) < 600;
const LC_DEFAULTS = {
  title: null, eyebrow: 'LUMA CONTROL CARD', theme_mode: 'auto', card_style: 'fader', language: 'auto',
  layout: 'auto', // deprecated: kept so saved configurations stay valid, no longer used
  show_eyebrow: true, show_title: true, ambient_glow: false,
  lights: [], automation_entity: '', automation_entities: [], show_automation: true,
  controls_enabled: true,
};
/* ------------------------------------------------------------------ translations */
const LC_TR = {
  it: {
    title: 'Luci', alloff: 'Spegni tutte', sum_0: 'Nessuna accesa', sum_1: '1 accesa su {t}', sum_n: '{n} accese su {t}',
    on: 'Accesa', off: 'Spenta', pon: 'On', poff: 'Off', na: 'Non disponibile', unk: 'Sconosciuto',
    details: 'Dettagli e stato', dev_a11y: 'Dettagli e stato di {name}', close: 'Chiudi', pw_on: 'Accendi', pw_off: 'Spegni',
    bright: 'Luminosità {name}', rgb: 'Colore RGB', hue: 'Tonalità colore', cur: 'Colore attuale', ctemp: 'Temperatura colore',
    warm: 'Calda', neutral: 'Neutra', cool: 'Fredda',
    timer: 'Spegnimento temporizzato', t_na: 'Timer non disponibile', t_active: 'Timer attivo', t_paused: 'Timer in pausa', t_idle: 'Timer inattivo', t_cancel: 'Annulla timer', min: '{m} min',
    autos: 'Automazioni', a_0: 'Nessuna attiva', a_1: '1 attiva', a_n: '{n} attive', a_on: 'Attivata', a_off: 'Disattivata',
    f_on: 'Accese', f_all: 'Tutte', none_on: 'Nessuna luce accesa.', empty: 'Aggiungi una luce dall’editor della card.', lights: 'Luci',
    prev: 'Luci precedenti', next: 'Luci successive', pager: 'Luci {a}–{b} di {t}',
    err_cmd: 'Comando non riuscito: {m}', err_ha: 'Errore Home Assistant', err_some: 'Alcuni dispositivi non sono stati spenti. Verifica lo stato in Home Assistant.',
    c_or: 'Arancione', c_ye: 'Giallo', c_gr: 'Verde', c_cy: 'Ciano', c_bl: 'Blu', c_pu: 'Viola', c_pk: 'Rosa',
    cfg: 'Configurazione', tab_dev: 'Dispositivi', tab_look: 'Aspetto', tab_auto: 'Automazioni', tab_adv: 'Avanzate',
    e_dev_h: 'Configurazione luci', e_dev_s: 'Seleziona un’entità light e personalizza il dispositivo.', dev_n: 'Dispositivo {n}', dev_x: 'dispositivo {n}',
    rm_dev: 'Rimuovi dispositivo', rm_name: 'Rimuovi {name}', rm_ent: 'Rimuovi entità',
    f_entity: 'Entità Home Assistant (light)', f_name: 'Nome visualizzato', f_timer: 'Timer spegnimento (facoltativo)',
    h_timer: 'Seleziona un helper timer.*. Per spegnere la luce alla scadenza, crea in Home Assistant un’automazione sul trigger Timer finito.',
    f_lauto: 'Automazioni di questa luce (facoltative)', h_lauto: 'Compaiono nel popup «Dettagli e stato» di questa luce, come pulsanti per attivarle o disattivarle.',
    add_auto: '+ Aggiungi automazione', cancel: 'Annulla', f_icon: 'Icona MDI (facoltativa)', ph_icon: 'Icona originale Home Assistant',
    up: '↑ Sposta su', down: '↓ Sposta giù', no_dev: 'Nessun dispositivo configurato.', add_dev: '+ Aggiungi dispositivo',
    e_look_h: 'Aspetto Edera', e_look_s: 'Tipografia, colori e disposizione coerenti con le altre card.',
    e_eye: 'Intestazione superiore', e_ttl: 'Titolo', e_theme: 'Tema', th_auto: 'Automatico (Home Assistant)',
    e_se: 'Mostra intestazione superiore', e_st: 'Mostra titolo', e_glow: 'Bagliore ambiente', e_glow_d: 'Alone di luce sullo sfondo, in base alla luminosità media delle luci accese.',
    e_style: 'Stile della card', e_style_d: 'Come sono disposte le luci. Cambia solo l’aspetto: comandi e popup restano gli stessi.',
    s_fader: 'Fader (strisce verticali)', s_bars: 'Barre orizzontali', s_tiles: 'Tessere con alone',
    e_lang: 'Lingua', e_lang_auto: 'Automatica (Home Assistant)', e_lang_d: 'Automatica segue la lingua dell’utente in Home Assistant. Se la lingua non è disponibile si usa l’inglese.',
    e_auto_h: 'Automazioni sulla card', e_auto_s: 'Pulsanti sotto le luci per attivare o disattivare automazioni Home Assistant già esistenti. Per collegare automazioni a una singola luce usa la scheda Dispositivi.',
    f_auto: 'Automazione {n}', f_auto_new: 'Nuova automazione', sw_show: 'Mostra nella card', sw_show_d: 'Mostra i pulsanti delle automazioni sotto le luci.',
    e_adv_h: 'Avanzate', e_adv_s: 'Comportamento dei controlli.', sw_ctl: 'Abilita i comandi', sw_ctl_d: 'Accensione, regolazione luminosa e attivazione delle automazioni collegate.',
    search_ph: 'Cerca entità {d}', search: 'Cerca entità', no_ent: 'Nessuna entità disponibile.'
  },
  en: {
    title: 'Lights', alloff: 'Turn all off', sum_0: 'All off', sum_1: '1 of {t} on', sum_n: '{n} of {t} on',
    on: 'On', off: 'Off', pon: 'On', poff: 'Off', na: 'Unavailable', unk: 'Unknown',
    details: 'Details and status', dev_a11y: 'Details and status of {name}', close: 'Close', pw_on: 'Turn on', pw_off: 'Turn off',
    bright: 'Brightness {name}', rgb: 'RGB color', hue: 'Color hue', cur: 'Current color', ctemp: 'Color temperature',
    warm: 'Warm', neutral: 'Neutral', cool: 'Cool',
    timer: 'Sleep timer', t_na: 'Timer unavailable', t_active: 'Timer active', t_paused: 'Timer paused', t_idle: 'Timer idle', t_cancel: 'Cancel timer', min: '{m} min',
    autos: 'Automations', a_0: 'None active', a_1: '1 active', a_n: '{n} active', a_on: 'Enabled', a_off: 'Disabled',
    f_on: 'On', f_all: 'All', none_on: 'No light is on.', empty: 'Add a light from the card editor.', lights: 'Lights',
    prev: 'Previous lights', next: 'Next lights', pager: 'Lights {a}–{b} of {t}',
    err_cmd: 'Command failed: {m}', err_ha: 'Home Assistant error', err_some: 'Some devices were not turned off. Check their state in Home Assistant.',
    c_or: 'Orange', c_ye: 'Yellow', c_gr: 'Green', c_cy: 'Cyan', c_bl: 'Blue', c_pu: 'Purple', c_pk: 'Pink',
    cfg: 'Configuration', tab_dev: 'Devices', tab_look: 'Appearance', tab_auto: 'Automations', tab_adv: 'Advanced',
    e_dev_h: 'Lights setup', e_dev_s: 'Select a light entity and customize the device.', dev_n: 'Device {n}', dev_x: 'device {n}',
    rm_dev: 'Remove device', rm_name: 'Remove {name}', rm_ent: 'Remove entity',
    f_entity: 'Home Assistant entity (light)', f_name: 'Display name', f_timer: 'Sleep timer (optional)',
    h_timer: 'Select a timer.* helper. To turn the light off when it ends, create an automation in Home Assistant on the Timer finished trigger.',
    f_lauto: 'Automations of this light (optional)', h_lauto: 'They appear in the “Details and status” popup of this light, as buttons to enable or disable them.',
    add_auto: '+ Add automation', cancel: 'Cancel', f_icon: 'MDI icon (optional)', ph_icon: 'Original Home Assistant icon',
    up: '↑ Move up', down: '↓ Move down', no_dev: 'No device configured.', add_dev: '+ Add device',
    e_look_h: 'Edera appearance', e_look_s: 'Typography, colors and layout consistent with the other cards.',
    e_eye: 'Top label', e_ttl: 'Title', e_theme: 'Theme', th_auto: 'Automatic (Home Assistant)',
    e_se: 'Show top label', e_st: 'Show title', e_glow: 'Ambient glow', e_glow_d: 'A glow in the background, based on the average brightness of the lights that are on.',
    e_style: 'Card style', e_style_d: 'How the lights are laid out. Only the look changes: controls and popup stay the same.',
    s_fader: 'Vertical faders', s_bars: 'Horizontal bars', s_tiles: 'Glow tiles',
    e_lang: 'Language', e_lang_auto: 'Automatic (Home Assistant)', e_lang_d: 'Automatic follows the user’s language in Home Assistant. If the language is not available, English is used.',
    e_auto_h: 'Automations on the card', e_auto_s: 'Buttons under the lights to enable or disable existing Home Assistant automations. To link automations to a single light, use the Devices tab.',
    f_auto: 'Automation {n}', f_auto_new: 'New automation', sw_show: 'Show on the card', sw_show_d: 'Shows the automation buttons under the lights.',
    e_adv_h: 'Advanced', e_adv_s: 'Behavior of the controls.', sw_ctl: 'Enable commands', sw_ctl_d: 'Turning on and off, brightness control and enabling the linked automations.',
    search_ph: 'Search {d} entity', search: 'Search entity', no_ent: 'No entity available.'
  },
  de: {
    title: 'Lichter', alloff: 'Alle ausschalten', sum_0: 'Alle aus', sum_1: '1 von {t} an', sum_n: '{n} von {t} an',
    on: 'An', off: 'Aus', pon: 'An', poff: 'Aus', na: 'Nicht verfügbar', unk: 'Unbekannt',
    details: 'Details und Status', dev_a11y: 'Details und Status von {name}', close: 'Schließen', pw_on: 'Einschalten', pw_off: 'Ausschalten',
    bright: 'Helligkeit {name}', rgb: 'RGB-Farbe', hue: 'Farbton', cur: 'Aktuelle Farbe', ctemp: 'Farbtemperatur',
    warm: 'Warm', neutral: 'Neutral', cool: 'Kalt',
    timer: 'Ausschalt-Timer', t_na: 'Timer nicht verfügbar', t_active: 'Timer aktiv', t_paused: 'Timer pausiert', t_idle: 'Timer inaktiv', t_cancel: 'Timer abbrechen', min: '{m} Min.',
    autos: 'Automatisierungen', a_0: 'Keine aktiv', a_1: '1 aktiv', a_n: '{n} aktiv', a_on: 'Aktiviert', a_off: 'Deaktiviert',
    f_on: 'An', f_all: 'Alle', none_on: 'Kein Licht ist an.', empty: 'Füge im Karteneditor ein Licht hinzu.', lights: 'Lichter',
    prev: 'Vorherige Lichter', next: 'Nächste Lichter', pager: 'Lichter {a}–{b} von {t}',
    err_cmd: 'Befehl fehlgeschlagen: {m}', err_ha: 'Home-Assistant-Fehler', err_some: 'Einige Geräte wurden nicht ausgeschaltet. Prüfe den Status in Home Assistant.',
    c_or: 'Orange', c_ye: 'Gelb', c_gr: 'Grün', c_cy: 'Cyan', c_bl: 'Blau', c_pu: 'Violett', c_pk: 'Rosa',
    cfg: 'Konfiguration', tab_dev: 'Geräte', tab_look: 'Darstellung', tab_auto: 'Automatisierungen', tab_adv: 'Erweitert',
    e_dev_h: 'Lichter einrichten', e_dev_s: 'Wähle eine Light-Entität und passe das Gerät an.', dev_n: 'Gerät {n}', dev_x: 'Gerät {n}',
    rm_dev: 'Gerät entfernen', rm_name: '{name} entfernen', rm_ent: 'Entität entfernen',
    f_entity: 'Home-Assistant-Entität (light)', f_name: 'Anzeigename', f_timer: 'Ausschalt-Timer (optional)',
    h_timer: 'Wähle einen timer.*-Helfer. Damit das Licht am Ende ausgeht, erstelle in Home Assistant eine Automatisierung mit dem Auslöser „Timer beendet“.',
    f_lauto: 'Automatisierungen dieses Lichts (optional)', h_lauto: 'Sie erscheinen im Popup „Details und Status“ dieses Lichts als Schaltflächen zum Aktivieren oder Deaktivieren.',
    add_auto: '+ Automatisierung hinzufügen', cancel: 'Abbrechen', f_icon: 'MDI-Symbol (optional)', ph_icon: 'Originalsymbol von Home Assistant',
    up: '↑ Nach oben', down: '↓ Nach unten', no_dev: 'Kein Gerät konfiguriert.', add_dev: '+ Gerät hinzufügen',
    e_look_h: 'Edera-Darstellung', e_look_s: 'Typografie, Farben und Anordnung passend zu den anderen Karten.',
    e_eye: 'Obere Beschriftung', e_ttl: 'Titel', e_theme: 'Design', th_auto: 'Automatisch (Home Assistant)',
    e_se: 'Obere Beschriftung anzeigen', e_st: 'Titel anzeigen', e_glow: 'Umgebungslicht', e_glow_d: 'Ein Lichtschein im Hintergrund, abhängig von der durchschnittlichen Helligkeit der eingeschalteten Lichter.',
    e_style: 'Kartenstil', e_style_d: 'Wie die Lichter angeordnet werden. Es ändert sich nur das Aussehen: Bedienung und Popup bleiben gleich.',
    s_fader: 'Vertikale Fader', s_bars: 'Horizontale Balken', s_tiles: 'Kacheln mit Leuchten',
    e_lang: 'Sprache', e_lang_auto: 'Automatisch (Home Assistant)', e_lang_d: 'Automatisch folgt der Sprache des Benutzers in Home Assistant. Ist die Sprache nicht verfügbar, wird Englisch verwendet.',
    e_auto_h: 'Automatisierungen auf der Karte', e_auto_s: 'Schaltflächen unter den Lichtern, um bestehende Home-Assistant-Automatisierungen zu aktivieren oder zu deaktivieren. Für ein einzelnes Licht nutze den Reiter Geräte.',
    f_auto: 'Automatisierung {n}', f_auto_new: 'Neue Automatisierung', sw_show: 'Auf der Karte anzeigen', sw_show_d: 'Zeigt die Automatisierungs-Schaltflächen unter den Lichtern.',
    e_adv_h: 'Erweitert', e_adv_s: 'Verhalten der Bedienelemente.', sw_ctl: 'Befehle aktivieren', sw_ctl_d: 'Ein- und Ausschalten, Helligkeitsregelung und Aktivierung der verknüpften Automatisierungen.',
    search_ph: '{d}-Entität suchen', search: 'Entität suchen', no_ent: 'Keine Entität verfügbar.'
  },
  fr: {
    title: 'Lumières', alloff: 'Tout éteindre', sum_0: 'Toutes éteintes', sum_1: '1 allumée sur {t}', sum_n: '{n} allumées sur {t}',
    on: 'Allumée', off: 'Éteinte', pon: 'On', poff: 'Off', na: 'Indisponible', unk: 'Inconnu',
    details: 'Détails et état', dev_a11y: 'Détails et état de {name}', close: 'Fermer', pw_on: 'Allumer', pw_off: 'Éteindre',
    bright: 'Luminosité {name}', rgb: 'Couleur RVB', hue: 'Teinte', cur: 'Couleur actuelle', ctemp: 'Température de couleur',
    warm: 'Chaude', neutral: 'Neutre', cool: 'Froide',
    timer: 'Extinction programmée', t_na: 'Minuteur indisponible', t_active: 'Minuteur actif', t_paused: 'Minuteur en pause', t_idle: 'Minuteur inactif', t_cancel: 'Annuler le minuteur', min: '{m} min',
    autos: 'Automatisations', a_0: 'Aucune active', a_1: '1 active', a_n: '{n} actives', a_on: 'Activée', a_off: 'Désactivée',
    f_on: 'Allumées', f_all: 'Toutes', none_on: 'Aucune lumière allumée.', empty: 'Ajoutez une lumière depuis l’éditeur de la carte.', lights: 'Lumières',
    prev: 'Lumières précédentes', next: 'Lumières suivantes', pager: 'Lumières {a}–{b} sur {t}',
    err_cmd: 'Échec de la commande : {m}', err_ha: 'Erreur Home Assistant', err_some: 'Certains appareils n’ont pas été éteints. Vérifiez leur état dans Home Assistant.',
    c_or: 'Orange', c_ye: 'Jaune', c_gr: 'Vert', c_cy: 'Cyan', c_bl: 'Bleu', c_pu: 'Violet', c_pk: 'Rose',
    cfg: 'Configuration', tab_dev: 'Appareils', tab_look: 'Apparence', tab_auto: 'Automatisations', tab_adv: 'Avancé',
    e_dev_h: 'Configuration des lumières', e_dev_s: 'Sélectionnez une entité light et personnalisez l’appareil.', dev_n: 'Appareil {n}', dev_x: 'appareil {n}',
    rm_dev: 'Supprimer l’appareil', rm_name: 'Supprimer {name}', rm_ent: 'Supprimer l’entité',
    f_entity: 'Entité Home Assistant (light)', f_name: 'Nom affiché', f_timer: 'Minuteur d’extinction (facultatif)',
    h_timer: 'Sélectionnez un assistant timer.*. Pour éteindre la lumière à la fin, créez dans Home Assistant une automatisation sur le déclencheur Minuteur terminé.',
    f_lauto: 'Automatisations de cette lumière (facultatives)', h_lauto: 'Elles apparaissent dans la fenêtre « Détails et état » de cette lumière, sous forme de boutons pour les activer ou les désactiver.',
    add_auto: '+ Ajouter une automatisation', cancel: 'Annuler', f_icon: 'Icône MDI (facultative)', ph_icon: 'Icône d’origine de Home Assistant',
    up: '↑ Monter', down: '↓ Descendre', no_dev: 'Aucun appareil configuré.', add_dev: '+ Ajouter un appareil',
    e_look_h: 'Apparence Edera', e_look_s: 'Typographie, couleurs et disposition cohérentes avec les autres cartes.',
    e_eye: 'Libellé supérieur', e_ttl: 'Titre', e_theme: 'Thème', th_auto: 'Automatique (Home Assistant)',
    e_se: 'Afficher le libellé supérieur', e_st: 'Afficher le titre', e_glow: 'Lueur d’ambiance', e_glow_d: 'Une lueur en arrière-plan, selon la luminosité moyenne des lumières allumées.',
    e_style: 'Style de la carte', e_style_d: 'Disposition des lumières. Seul l’aspect change : les commandes et la fenêtre restent identiques.',
    s_fader: 'Faders verticaux', s_bars: 'Barres horizontales', s_tiles: 'Tuiles lumineuses',
    e_lang: 'Langue', e_lang_auto: 'Automatique (Home Assistant)', e_lang_d: 'Automatique suit la langue de l’utilisateur dans Home Assistant. Si la langue n’est pas disponible, l’anglais est utilisé.',
    e_auto_h: 'Automatisations sur la carte', e_auto_s: 'Boutons sous les lumières pour activer ou désactiver des automatisations Home Assistant existantes. Pour une seule lumière, utilisez l’onglet Appareils.',
    f_auto: 'Automatisation {n}', f_auto_new: 'Nouvelle automatisation', sw_show: 'Afficher sur la carte', sw_show_d: 'Affiche les boutons des automatisations sous les lumières.',
    e_adv_h: 'Avancé', e_adv_s: 'Comportement des commandes.', sw_ctl: 'Activer les commandes', sw_ctl_d: 'Allumage, réglage de la luminosité et activation des automatisations liées.',
    search_ph: 'Rechercher une entité {d}', search: 'Rechercher une entité', no_ent: 'Aucune entité disponible.'
  }
};
function lcLang(cfgLang, h) {
  const l = cfgLang && cfgLang !== 'auto' ? cfgLang : String((h && ((h.locale && h.locale.language) || h.language)) || 'en').toLowerCase().split(/[-_]/)[0];
  return LC_TR[l] ? l : 'en';
}
function lcT(lang, k, v) {
  let s = LC_TR[lang] && LC_TR[lang][k];
  if (s == null) s = LC_TR.en[k];
  if (s == null) return k;
  return v ? s.replace(/\{(\w+)\}/g, (m, x) => (v[x] != null ? v[x] : m)) : s;
}
/* ------------------------------------------------------------------ helpers */
function lcText(v, n = 80) { return String(v ?? '').trim().slice(0, n); }
function lcEsc(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c])); }
function lcEntity(v, domains = ['light', 'switch']) {
  const id = lcText(v, 160);
  return domains.includes(id.split('.')[0]) && /^[a-z0-9_]+\.[a-z0-9_]+$/.test(id) ? id : '';
}
function lcLight(v = {}) {
  const x = v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  const automations = [...new Set((Array.isArray(x.automations) ? x.automations : []).map(v => lcEntity(v, ['automation'])).filter(Boolean))].slice(0, 16);
  return { entity: lcEntity(x.entity), name: lcText(x.name, 60), icon: /^mdi:[a-z0-9-]{1,70}$/.test(x.icon || '') ? x.icon : '', timer_entity: lcEntity(x.timer_entity, ['timer']), automations };
}
function lcConfig(v = {}) {
  const x = v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  const items = Array.isArray(x.lights) ? x.lights.map(lcLight) : [];
  // Keep the original single-automation configuration working without duplicating it.
  const previous = lcEntity(x.automation_entity, ['automation']);
  const autos = Array.isArray(x.automation_entities) ? x.automation_entities : [previous];
  const automation_entities = [...new Set(autos.map(v => lcEntity(v, ['automation'])).filter(Boolean))].slice(0, 64);
  return {
    ...x,
    type: 'custom:luma-control-card',
    // null = default title in the card language; a saved text (even an empty one) is kept as is.
    title: x.title == null ? null : lcText(x.title, 60),
    eyebrow: lcText(x.eyebrow ?? LC_DEFAULTS.eyebrow, 60),
    theme_mode: LC_MODES.includes(x.theme_mode) ? x.theme_mode : 'auto',
    card_style: LC_STYLES.includes(x.card_style) ? x.card_style : 'fader',
    language: LC_LANGS.some(l => l[0] === x.language) ? x.language : 'auto',
    layout: LC_LAYOUTS.includes(x.layout) ? x.layout : 'auto',
    show_eyebrow: x.show_eyebrow !== false, show_title: x.show_title !== false, ambient_glow: x.ambient_glow === true,
    lights: items.filter((x, i, a) => !x.entity || a.findIndex(y => y.entity === x.entity) === i).slice(0, 64),
    automation_entity: automation_entities[0] || '', automation_entities,
    show_automation: x.show_automation !== false,
    controls_enabled: x.controls_enabled !== false,
  };
}
function lcKnown(e) { return !!e && e.state !== 'unknown' && e.state !== 'unavailable' && e.state !== ''; }
function lcCapabilities(e) {
  if (!e || !e.entity_id?.startsWith('light.')) return { dim: false, rgb: false, temp: false };
  const modes = Array.isArray(e.attributes?.supported_color_modes) ? e.attributes.supported_color_modes : [];
  const rgb = modes.some(m => LC_COLOR.has(m));
  const temp = modes.includes('color_temp');
  const dim = modes.some(m => m !== 'onoff' && m !== 'unknown');
  return { dim, rgb, temp };
}
function lcBrightness(e) {
  if (!lcKnown(e) || e.state !== 'on') return 0;
  const b = e.attributes?.brightness;
  return typeof b === 'number' && Number.isFinite(b) ? Math.max(1, Math.min(100, Math.round(b * 100 / 255))) : null;
}
function lcRgb(e) {
  const rgb = e?.attributes?.rgb_color;
  if (!Array.isArray(rgb) || rgb.length < 3 || !rgb.slice(0, 3).every(n => Number.isFinite(n))) return '';
  return `rgb(${rgb.slice(0, 3).map(n => Math.max(0, Math.min(255, Math.round(n)))).join(',')})`;
}
function lcClamped(v, min, max) { return Math.min(max, Math.max(min, Number(v) || 0)); }
function lcIcon(name) { return `<ha-icon icon="${lcEsc(name)}" aria-hidden="true"></ha-icon>`; }

/* ------------------------------------------------------------------ styles */
const LC_CSS = `
:host{display:block;min-width:0;box-sizing:border-box;font-family:var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,system-ui,"Segoe UI Variable","Segoe UI",Roboto,Arial,sans-serif)}
*,*:before,*:after{box-sizing:border-box}button,input,select{font:inherit}button{cursor:pointer;border:0;background:none;padding:0;color:inherit}button:disabled,input:disabled{opacity:.45;cursor:not-allowed}
button:focus-visible,input:focus-visible,select:focus-visible,[role="slider"]:focus-visible{outline:2px solid var(--lc-emerald);outline-offset:2px}[hidden]{display:none!important}
ha-icon{display:inline-flex;vertical-align:middle;--mdc-icon-size:20px;width:20px;height:20px;flex:none}
.lc-root{--lc-bg:var(--card-background-color,#fff);--lc-tile:var(--secondary-background-color,#F1F3EF);--lc-orb:#fff;--lc-border:var(--ha-card-border-color,#E3E7E2);--lc-text:var(--primary-text-color,#19221E);--lc-muted:var(--secondary-text-color,#68716C);--lc-light:var(--edera-light-color,#9A7C4F);--lc-emerald:var(--edera-emerald-color,#0E6B52);--lc-track:#dde2de;--lc-ink:#19221E;--lc-shadow:#0000001a;--lc-warn:var(--warning-color,#A8650B);background:var(--lc-bg);color:var(--lc-text);border:1px solid var(--lc-border);border-radius:26px;padding:16px;min-width:0;font-size:14px;line-height:1.3;position:relative}
.lc-root:not(.lc-modal-scope){container:lc/inline-size}
.lc-root.lc-glow{background:radial-gradient(90% 70% at 100% 0%,color-mix(in srgb,var(--lc-light) calc(var(--avg,0)*24%),transparent) 0,transparent 72%),var(--lc-bg)}
.lc-root.lc-dark{--lc-bg:#101211;--lc-tile:#191c1a;--lc-orb:#282b29;--lc-border:#2b302c;--lc-text:#f5f7f4;--lc-muted:#bbc5bd;--lc-light:var(--edera-light-color,#D3C29D);--lc-emerald:#0e795d;--lc-track:#343a35;--lc-ink:#fff;--lc-shadow:#0006}
.lc-head{padding:2px 4px 14px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:8px}.lc-hd{min-width:0}
.lc-eyebrow{font-size:10px;letter-spacing:1.7px;font-weight:750;color:var(--lc-muted);margin-bottom:7px;white-space:nowrap}
.lc-title{font-size:25px;font-weight:780;letter-spacing:-.7px;line-height:1.14;overflow-wrap:anywhere}.lc-dot{color:var(--lc-emerald)}
.lc-sum{display:flex;align-items:center;gap:7px;margin-top:8px;font-size:12px;color:var(--lc-muted);font-weight:550}
.lc-sum i{width:7px;height:7px;border-radius:50%;background:var(--lc-muted);opacity:.6}
.lc-sum.has i{opacity:1;background:var(--lc-light);box-shadow:0 0 0 3px color-mix(in srgb,var(--lc-light) 24%,transparent)}
.lc-alloff{margin-left:auto;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;border:1px solid var(--lc-border);border-radius:999px;background:var(--lc-tile);color:var(--lc-text);padding:0 12px;min-height:34px;font-size:12px;font-weight:650}
.lc-alloff ha-icon{--mdc-icon-size:16px;width:16px;height:16px}
.lc-col{min-width:0;display:grid;gap:8px}
/* shared parts */
.lc-orb{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--lc-orb);border:1px solid var(--lc-border);color:var(--lc-muted);flex:none}
.lc-orb ha-icon{--mdc-icon-size:18px;width:18px;height:18px}
.lc-tile.on .lc-orb{background:color-mix(in srgb,var(--lcol) 24%,var(--lc-orb));border-color:color-mix(in srgb,var(--lcol) 50%,transparent);color:color-mix(in srgb,var(--lcol) 55%,var(--lc-ink))}
.lc-pw{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--lc-orb);border:1px solid var(--lc-border);color:var(--lc-muted);flex:none}
.lc-pw ha-icon{--mdc-icon-size:18px;width:18px;height:18px}
.lc-pw.on{background:var(--lcol,var(--lc-light));border-color:var(--lcol,var(--lc-light));color:#19221E}
.lc-det{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--lc-orb);border:1px solid var(--lc-border);color:var(--lc-text);flex:none;padding:0}
.lc-det ha-icon{--mdc-icon-size:16px;width:16px;height:16px}.lc-det.ph{visibility:hidden}
.lc-swatch{display:inline-block;width:16px;height:16px;border-radius:50%;background:var(--actual-color,var(--lc-light));border:1px solid #0002}
.lc-pct{font-variant-numeric:tabular-nums;font-weight:720}
.lc-nm{overflow-wrap:anywhere;hyphens:auto;-webkit-hyphens:auto}
@media(pointer:coarse){.lc-det{width:38px;height:38px}}
.lc-empty{padding:12px 4px;color:var(--lc-muted);font-size:12px}.lc-error{font-size:11px;color:var(--error-color,#B85D55);margin-top:10px;line-height:1.45}
/* style: fader */
.lc-faders{--fh:104px;position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(74px,1fr);gap:10px;overflow-x:auto;scroll-snap-type:x proximity;scrollbar-width:none;overscroll-behavior-x:contain;padding-bottom:2px}.lc-faders::-webkit-scrollbar{display:none}
.lc-faders.few{grid-auto-columns:minmax(84px,1fr)}.lc-faders.solo{display:block;overflow:visible}
.lc-fd{--f:0;--lcol:var(--lc-light);--on:0;min-width:0;background:radial-gradient(120% 52% at 50% 0%,color-mix(in srgb,var(--lcol) calc(var(--on)*22%),transparent),transparent 74%),var(--lc-tile);border:1px solid var(--lc-border);border-radius:20px;padding:10px 4px 11px;display:flex;flex-direction:column;align-items:center;gap:9px;scroll-snap-align:start}
.lc-fd.on{--on:1}.lc-fd.na{opacity:.7}
.lc-fd-top{display:flex;align-items:center;justify-content:center;gap:6px;min-width:0}.lc-fd-top .lc-orb{width:30px;height:30px}.lc-fd-top .lc-orb ha-icon{--mdc-icon-size:17px;width:17px;height:17px}.lc-fd-top .lc-pct{font-size:14px}
.lc-fd-track{position:relative;width:44px;height:var(--fh);border-radius:999px;background:var(--lc-track);box-shadow:inset 0 1px 3px var(--lc-shadow);overflow:hidden;touch-action:pan-x;cursor:ns-resize;user-select:none;-webkit-user-select:none;flex:none}
.lc-fd-track[aria-disabled="true"]{cursor:default}.lc-fd-track.drag{outline:2px solid var(--lc-emerald);outline-offset:2px}
.lc-fd-fill{position:absolute;left:0;right:0;bottom:0;height:calc(var(--f)*100%);background:linear-gradient(0deg,color-mix(in srgb,var(--lcol) 60%,var(--lc-track)),var(--lcol));transition:height .18s}
.lc-fd-fill:after{content:"";position:absolute;top:7px;left:30%;right:30%;height:4px;border-radius:2px;background:#fff;opacity:.9}.lc-fd.z .lc-fd-fill:after{display:none}.lc-fd-track.drag .lc-fd-fill{transition:none}
.lc-fd-track.basic{display:grid;place-items:center;touch-action:auto;cursor:default}
.lc-fd-track.basic span{writing-mode:vertical-rl;font-size:10.5px;font-weight:700;letter-spacing:.14em;color:var(--lc-muted);text-transform:uppercase}
.lc-fd.on .lc-fd-track.basic{background:color-mix(in srgb,var(--lcol) 34%,var(--lc-track))}
.lc-act{display:flex;gap:6px;align-items:center;justify-content:center}.lc-act .lc-pw{width:36px;height:36px}.lc-act .lc-det{width:32px;height:32px}
@media(pointer:coarse){.lc-act .lc-pw{width:40px;height:40px}.lc-act .lc-det{width:36px;height:36px}}
.lc-fd .lc-nm{max-width:100%;font-size:11.5px;font-weight:620;text-align:center;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.5em;padding:0 2px}
.lc-fd.lc-solo{display:grid;grid-template-columns:auto 1fr;column-gap:18px;row-gap:12px;align-items:center;padding:14px 16px;max-width:560px}
.lc-solo .lc-fd-track{--fh:112px;width:58px}
.lc-solo .lc-fd-info{display:flex;flex-direction:column;gap:6px;min-width:0}.lc-fd-head{display:flex;align-items:center;gap:9px;min-width:0}.lc-fd-head .lc-orb{width:36px;height:36px}.lc-fd-head .lc-orb ha-icon{--mdc-icon-size:20px;width:20px;height:20px}
.lc-solo .lc-nm{font-size:16px;font-weight:700;display:block;text-align:left;min-height:0;letter-spacing:-.2px}
.lc-fd-big{font-size:36px;line-height:1;font-weight:780;letter-spacing:-1.3px;margin-top:2px}.lc-fd-st{font-size:12px;color:var(--lc-muted)}
.lc-solo .lc-act{grid-column:1/-1;justify-content:flex-start;gap:8px}.lc-solo .lc-act .lc-pw{width:42px;height:42px}.lc-solo .lc-act .lc-det{width:38px;height:38px}
.lc-pager{display:flex;align-items:center;justify-content:center;gap:12px}.lc-pager button{width:44px;height:36px;border-radius:999px;border:1px solid var(--lc-border);background:var(--lc-tile);color:var(--lc-text);display:grid;place-items:center;padding:0}.lc-pager ha-icon{--mdc-icon-size:18px;width:18px;height:18px}.lc-pager span{font-size:11.5px;color:var(--lc-muted);font-variant-numeric:tabular-nums;min-width:104px;text-align:center}
/* style: bars */
.lc-rows{display:grid;gap:9px;grid-template-columns:minmax(0,1fr)}
.lc-rw{--f:0;--lcol:var(--lc-light);display:flex;align-items:center;gap:8px;min-width:0}.lc-rw.na{opacity:.7}
.lc-rt{position:relative;flex:1;min-width:0;height:62px;border-radius:22px;background:var(--lc-tile);border:1px solid var(--lc-border);overflow:hidden;touch-action:pan-y;cursor:ew-resize;user-select:none;-webkit-user-select:none}
.lc-rt[aria-disabled="true"],.lc-rt.basic{cursor:default}.lc-rt.drag{outline:2px solid var(--lc-emerald);outline-offset:2px}
.lc-rf{position:absolute;inset:0 auto 0 0;width:calc(var(--f)*100%);background:linear-gradient(90deg,color-mix(in srgb,var(--lcol) 26%,transparent),color-mix(in srgb,var(--lcol) 52%,transparent));border-right:2px solid color-mix(in srgb,var(--lcol) 80%,transparent);transition:width .18s}
.lc-dark .lc-rf{background:linear-gradient(90deg,color-mix(in srgb,var(--lcol) 20%,transparent),color-mix(in srgb,var(--lcol) 42%,transparent))}
.lc-rw.z .lc-rf,.lc-rt.basic .lc-rf{border-right:0}.lc-rt.basic.on .lc-rf{width:100%}.lc-rt.drag .lc-rf{transition:none}
.lc-rc{position:absolute;inset:0;display:flex;align-items:center;gap:10px;padding:0 16px 0 11px;pointer-events:none}
.lc-rn{min-width:0;flex:1}.lc-rn .lc-nm{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:13.5px;font-weight:660;line-height:1.2;overflow:hidden}.lc-rn small{display:block;font-size:11.5px;color:var(--lc-muted);margin-top:2px}
.lc-rp{font-size:15px;flex:none}.lc-rw .lc-pw{width:44px;height:44px}.lc-rw .lc-det{width:38px;height:38px}
/* style: tiles */
.lc-ts{display:grid;gap:10px;grid-template-columns:repeat(2,minmax(0,1fr))}.lc-ts.k1{grid-template-columns:minmax(0,1fr)}.lc-ts.k3,.lc-ts.kn{grid-template-columns:repeat(3,minmax(0,1fr))}
.lc-ot{--f:0;--lcol:var(--lc-light);--on:0;position:relative;min-width:0;display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 8px 12px;border-radius:22px;border:1px solid var(--lc-border);background:radial-gradient(90% 70% at 50% 18%,color-mix(in srgb,var(--lcol) calc(var(--on)*var(--f)*34%),transparent),transparent 78%),var(--lc-tile);text-align:center}
.lc-ot.on{--on:1;border-color:color-mix(in srgb,var(--lcol) 34%,var(--lc-border))}.lc-ot.na{opacity:.7}
.lc-ob{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:var(--lc-orb);border:1px solid var(--lc-border);color:var(--lc-muted);flex:none}
.lc-ob ha-icon{--mdc-icon-size:24px;width:24px;height:24px}
.lc-ot.on .lc-ob{background:color-mix(in srgb,var(--lcol) 85%,#fff);border-color:var(--lcol);color:#19221E;box-shadow:0 0 calc(10px + var(--f)*22px) calc(var(--f)*5px) color-mix(in srgb,var(--lcol) 48%,transparent)}
.lc-ot .lc-nm{font-size:12.5px;font-weight:650;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.4em}
.lc-ot .lc-pct{font-size:12px;color:var(--lc-muted);font-weight:650}.lc-ot.on .lc-pct{color:var(--lc-text)}
.lc-bar{position:relative;width:100%;height:26px;display:flex;align-items:center;touch-action:pan-y;cursor:ew-resize;user-select:none;-webkit-user-select:none}
.lc-bar:before{content:"";position:absolute;left:2px;right:2px;height:8px;border-radius:999px;background:var(--lc-track)}
.lc-bar i{position:absolute;left:2px;height:8px;border-radius:999px;width:calc((100% - 4px)*var(--f));background:var(--lcol)}
.lc-bar u{position:absolute;top:50%;left:calc(2px + (100% - 4px)*var(--f));width:20px;height:20px;border-radius:50%;background:#fff;border:2px solid var(--lcol);transform:translate(-50%,-50%);box-shadow:0 1px 4px var(--lc-shadow)}
.lc-ot.off .lc-bar u,.lc-ot.z .lc-bar u{border-color:var(--lc-muted)}.lc-bar[aria-disabled="true"]{cursor:default}.lc-bar.drag{outline:2px solid var(--lc-emerald);outline-offset:2px;border-radius:8px}
.lc-bar.basic{cursor:default;touch-action:auto}.lc-bar.basic i{width:calc(100% - 4px);opacity:.5}.lc-bar.basic u{display:none}.lc-ot.off .lc-bar.basic i{opacity:0}
.lc-ot .lc-det{position:absolute;top:8px;right:8px;width:28px;height:28px}
.lc-ot.h{flex-direction:row;flex-wrap:wrap;align-items:center;text-align:left;gap:6px 14px;padding:14px 16px}.lc-ot.h .lc-ob{width:60px;height:60px}.lc-ot.h .lc-ob ha-icon{--mdc-icon-size:28px;width:28px;height:28px}
.lc-ot.h .lc-tx{flex:1;min-width:0}.lc-ot.h .lc-nm{font-size:16px;font-weight:700;min-height:0;letter-spacing:-.2px}.lc-ot.h .lc-fd-st{margin-top:2px}
.lc-ot.h .lc-fd-big{font-size:32px;letter-spacing:-1.1px;color:var(--lc-text)}.lc-ot.h .lc-det{position:static;width:36px;height:36px}.lc-ot.h .lc-bar{flex:1 0 100%;margin-top:2px}
/* card automations */
.lc-autos{display:grid;gap:8px;margin-top:14px}.lc-ac-h{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;font-size:11px;color:var(--lc-muted)}.lc-ac-h b{font-size:10px;letter-spacing:1.7px;font-weight:750}
.lc-ac-row{display:flex;flex-wrap:wrap;gap:8px}
.lc-ac{display:inline-flex;align-items:center;gap:7px;min-height:34px;max-width:100%;border:1px solid var(--lc-border);background:var(--lc-tile);color:var(--lc-text);border-radius:999px;padding:7px 12px;font-size:12px;font-weight:600;line-height:1.2;text-align:left}
.lc-ac span{min-width:0;overflow-wrap:anywhere}.lc-ac i{width:8px;height:8px;border-radius:50%;background:var(--lc-muted);flex:none}
.lc-ac.on{border-color:color-mix(in srgb,var(--lc-emerald) 55%,transparent);background:color-mix(in srgb,var(--lc-emerald) 12%,transparent)}.lc-ac.on i{background:var(--lc-emerald)}
.lc-ac.na{border-style:dashed;color:var(--lc-muted)}.lc-ac.na:disabled{opacity:.8}.lc-ac.na i{background:var(--lc-warn)}
/* responsive */
@media(max-width:420px){.lc-root{padding:13px;border-radius:23px}}
@container lc (max-width:479px){.lc-faders.many{grid-auto-columns:calc((100% - 20px)/3);scroll-snap-type:x mandatory}}
@container lc (min-width:480px){.lc-faders{--fh:150px}.lc-faders.few{grid-auto-columns:minmax(92px,148px);--fh:120px}.lc-faders.many{grid-auto-columns:minmax(80px,1fr)}.lc-fd-track{width:48px}.lc-solo .lc-fd-track{--fh:128px;width:64px}}
@container lc (min-width:560px){.lc-rows.multi{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:14px}.lc-ts.k2,.lc-ts.k3,.lc-ts.k4,.lc-ts.kn{grid-template-columns:repeat(auto-fill,minmax(150px,200px))}.lc-ts.k1{grid-template-columns:minmax(0,420px)}}
@container lc (min-width:860px){.lc-faders{--fh:190px}.lc-faders.few{--fh:130px}.lc-title{font-size:30px}.lc-eyebrow{font-size:11px}.lc-rt{height:68px}.lc-fd-big{font-size:44px}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{transition:none!important;animation:none!important}}
`;
const LC_MODAL_CSS = `
:host{position:fixed;inset:0;z-index:2147483000;pointer-events:none;font-family:var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,system-ui,Roboto,Arial,sans-serif)}
.lc-root.lc-modal-scope{background:transparent;border:0;border-radius:0;padding:0;pointer-events:none;color:var(--lc-text)}
.lc-ov{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#0009;pointer-events:auto;overscroll-behavior:contain;overflow:hidden;padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left))}
.lc-dlg{width:min(390px,100%);max-width:100%;max-height:100%;min-width:0;height:min(calc(100vh - 40px),680px);height:var(--dh,min(calc(100dvh - 40px),680px));display:flex;flex-direction:column;background:var(--lc-bg);color:var(--lc-text);border:1px solid var(--lc-border);border-radius:26px;overflow:hidden;box-shadow:0 18px 60px #0005}
.lc-modal-scope[data-popup="wide"] .lc-dlg{width:min(1120px,100%);height:min(80vh,560px);height:var(--dh,min(80dvh,560px))}
.lc-mh{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 16px 12px 18px;background:var(--lc-bg);border-bottom:1px solid var(--lc-border)}
.lc-mt{flex:1;min-width:0;margin:0;font-size:17px;font-weight:600;line-height:1.3}
.lc-x{display:grid;place-items:center;line-height:0;margin:0;padding:0;width:40px;height:40px;flex:none;border:1px solid var(--lc-border);border-radius:50%;background:var(--lc-tile);color:var(--lc-text)}.lc-x ha-icon{--mdc-icon-size:20px;width:20px;height:20px;display:block;margin:0}
.lc-mb{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:12px 18px 18px;min-width:0}
.lc-modal-scope[data-popup="wide"] .lc-mb{padding:12px 22px 22px}
.lc-cr{display:flex;flex-wrap:wrap;gap:8px 18px;margin-bottom:4px}
.lc-seg2{display:flex;background:var(--lc-tile);border:1px solid var(--lc-border);border-radius:14px;padding:3px;margin:6px 0;flex:1 1 260px;max-width:420px}
.lc-seg2 button{flex:1;border-radius:11px;padding:8px 6px;font-size:12.5px;font-weight:600;color:var(--lc-muted);min-height:36px}
.lc-seg2 button[aria-pressed="true"]{background:var(--lc-bg);color:var(--lc-text);box-shadow:0 1px 4px #0002}
.lc-mrow{display:flex;gap:22px;align-items:flex-start;margin-top:2px}.lc-mcol{flex:1 1 0;min-width:0}
.lc-acc{border:1px solid var(--lc-border);border-radius:20px;background:var(--lc-tile);margin-top:8px;overflow:hidden}
.lc-ah{display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;text-align:left;--lcol:var(--lc-light)}
.lc-an{flex:1;min-width:0;font-size:14px;line-height:1.3;font-weight:600;overflow-wrap:anywhere}
.lc-at{font-size:13px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--lc-muted)}
.lc-ah ha-icon{transition:transform .15s;color:var(--lc-muted);--mdc-icon-size:18px;width:18px;height:18px}.lc-acc.open .lc-ah ha-icon{transform:rotate(90deg)}
.lc-dtp{width:10px;height:10px;border-radius:50%;background:var(--lc-muted);flex:none}.lc-dtp.on{background:var(--lcol)}
.lc-ab{border-top:1px solid var(--lc-border);background:var(--lc-bg);padding:14px}
.lc-er{display:flex;align-items:center;gap:10px;padding:0 0 12px}.lc-er .lc-t{flex:1;min-width:0}.lc-er .lc-n{font-size:14px;font-weight:600}
.lc-ico{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--lc-orb);color:var(--lc-emerald);border:1px solid var(--lc-border);flex:none}.lc-ico ha-icon{--mdc-icon-size:16px;width:16px;height:16px}
.lc-dark .lc-ico{color:#7fd9bd}
.lc-blk{padding:14px 0 0;margin-top:14px;border-top:1px solid var(--lc-border)}.lc-er+.lc-blk{margin-top:0}
.lc-bt{font-size:12.5px;font-weight:650;margin:0 0 10px;display:flex;justify-content:space-between;gap:10px;align-items:baseline}.lc-bt span{font-size:11.5px;font-weight:500;color:var(--lc-muted)}
.lc-wheel{width:min(190px,100%);aspect-ratio:1;border-radius:50%;position:relative;margin:10px auto 14px;background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red);cursor:crosshair;touch-action:none}
.lc-wheel:before{content:"";position:absolute;inset:22%;border-radius:50%;background:var(--lc-bg);pointer-events:none}
.lc-wheel:after{content:"";position:absolute;width:44px;height:44px;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%);background:var(--chosen-color,var(--lc-light));border:1px solid var(--lc-border);pointer-events:none}
.lc-presets{display:flex;justify-content:center;flex-wrap:wrap;gap:9px;margin:8px 0 2px}.lc-preset{width:30px;height:30px;border-radius:50%;border:3px solid var(--lc-bg);box-shadow:0 0 0 1px var(--lc-border);background:var(--color)}.lc-preset:focus-visible{outline-offset:4px}
.lc-cinfo{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px;font-size:12px;color:var(--lc-muted);background:var(--lc-tile);border-radius:13px;padding:10px 13px}.lc-cinfo .lc-swatch{width:18px;height:18px}
.lc-range{-webkit-appearance:none;appearance:none;display:block;width:100%;height:17px;min-height:17px;cursor:pointer;border:0;border-radius:999px;background:linear-gradient(to right,var(--lc-light) 0,var(--lc-light) var(--percent,50%),var(--lc-track) var(--percent,50%),var(--lc-track) 100%);touch-action:pan-y;margin:3px 0}
.lc-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:25px;height:25px;border-radius:50%;border:4px solid var(--lc-bg);background:var(--lc-light);box-shadow:0 1px 5px #0003}.lc-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;border:3px solid var(--lc-bg);background:var(--lc-light);box-shadow:0 1px 5px #0003}
.lc-temp-row{display:flex;justify-content:space-between;gap:9px;color:var(--lc-muted);font-size:11px;margin-top:9px}
.lc-quick{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:12px}.lc-quick button{background:var(--lc-orb);color:var(--lc-text);border:1px solid var(--lc-border);border-radius:12px;padding:9px 5px;font-size:12px;min-height:38px}
.lc-timer-status{font-size:12px;color:var(--lc-muted);margin:0 0 9px}.lc-timer-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.lc-timer-actions button{background:var(--lc-orb);color:var(--lc-text);border:1px solid var(--lc-border);border-radius:11px;padding:9px 2px;font-size:12px;min-height:38px}
.lc-timer-cancel{margin-top:8px;width:100%;padding:9px;border-radius:11px;border:1px solid var(--lc-border);background:var(--lc-orb);color:var(--lc-muted);font-size:12px;min-height:38px}
.lc-ab .lc-ac-row{margin-top:0}
`;

/* ------------------------------------------------------------------ card */
const LC_PRESETS = [['c_or', 30, '#ff9138'], ['c_ye', 55, '#f2de45'], ['c_gr', 120, '#44e65d'], ['c_cy', 180, '#34d9eb'], ['c_bl', 225, '#4c7bee'], ['c_pu', 280, '#bd4ce5'], ['c_pk', 325, '#eb4d9c']];
class LumaControlCard extends HTMLElement {
  static getStubConfig() { const { type, title, ...rest } = lcConfig(); return rest; }
  static getConfigElement() { return document.createElement(LC_EDITOR_TAG); }
  constructor() {
    super(); this.attachShadow({ mode: 'open' });
    this._config = lcConfig(); this._hass = null; this._opened = null; this._pop = { flt: 'on', open: {} }; this._lang = 'en';
    this._busy = new Set(); this._busyAll = false; this._error = ''; this._structureKey = ''; this._drag = null; this._kb = null; this._kbTimer = 0; this._ro = null;
    this._lastFocus = null; this._activeRange = null; this._scrollLock = null; this._modalHost = null;
    this._blockedScroll = e => { if (this._opened && !e.composedPath().some(n => n?.classList?.contains?.('lc-mb'))) e.preventDefault(); };
    this._blockedKeys = e => { if (this._opened && ['ArrowDown', 'ArrowUp', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key) && !e.composedPath().some(n => n?.classList?.contains?.('lc-mb'))) e.preventDefault(); };
    this._pref = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme:dark)') : null;
    this._themeChange = () => this._paint();
    this.shadowRoot.addEventListener('click', e => this._click(e));
    this.shadowRoot.addEventListener('input', e => this._input(e));
    this.shadowRoot.addEventListener('change', e => this._change(e));
    this.shadowRoot.addEventListener('pointerdown', e => { if (e.target.matches('.lc-range')) this._activeRange = e.target; this._fadeDown(e); });
    this.shadowRoot.addEventListener('pointermove', e => this._fadeMove(e));
    this.shadowRoot.addEventListener('pointerup', e => { this._activeRange = null; this._fadeUp(e); });
    this.shadowRoot.addEventListener('pointercancel', e => { this._activeRange = null; this._fadeUp(e, true); });
    this.shadowRoot.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this._opened) { this._close(); return; }
      const fader = e.target.closest?.('[data-fader]');
      if (fader) {
        const k = e.key, idx = Number(fader.dataset.fader), step = { ArrowUp: 5, ArrowRight: 5, ArrowDown: -5, ArrowLeft: -5, PageUp: 10, PageDown: -10 }[k];
        if (step !== undefined || k === 'Home' || k === 'End') {
          e.preventDefault(); if (!this._canFade(idx)) return;
          const cur = Number(fader.getAttribute('aria-valuenow')) || 0, v = k === 'Home' ? 0 : k === 'End' ? 100 : Math.round(lcClamped(cur + step, 0, 100));
          this._kb = { index: idx }; this._fadeSet(idx, v); clearTimeout(this._kbTimer);
          this._kbTimer = setTimeout(() => { this._kb = null; this._fadeCommit(idx, v); }, 350);
        }
      }
    });
  }
  connectedCallback() { this._pref?.addEventListener?.('change', this._themeChange); this._paint(); }
  disconnectedCallback() { this._pref?.removeEventListener?.('change', this._themeChange); this._opened = null; this._unmountModal(); this._unlockScroll(); clearTimeout(this._kbTimer); this._kb = null; this._drag = null; this._ro?.disconnect(); this._ro = null; }
  setConfig(v) { this._opened = null; this._unmountModal(); this._unlockScroll(); this._config = lcConfig(v); this._structureKey = ''; this._paint(); }
  set hass(h) { this._hass = h; this._paint(); }
  getCardSize() {
    const n = this._configured().length, chips = this._config.show_automation && this._config.automation_entities.length ? 2 : 0, st = this._config.card_style;
    const body = n === 0 ? 2 : st === 'bars' ? 1 + n * 1.3 : st === 'tiles' ? 1 + Math.ceil(n / (n === 1 ? 1 : n === 3 || n > 4 ? 3 : 2)) * 3 : n === 1 ? 5 : n <= 3 ? 6 : 7;
    return Math.ceil(body) + 1 + chips;
  }
  getGridOptions() { return { columns: 12, min_columns: 3 }; }
  _t(k, v) { return lcT(this._lang, k, v); }
  _entity(id) { return id ? this._hass?.states?.[id] : undefined; }
  _dark() { return this._config.theme_mode === 'dark' || (this._config.theme_mode === 'auto' && (this._hass?.themes?.darkMode === true || (!this._hass?.themes && !!this._pref?.matches))); }
  _configured() { return this._config.lights.map((item, index) => ({ item, index })).filter(x => x.item.entity); }
  _cap(item) { return lcCapabilities(this._entity(item.entity)); }
  _structure() {
    return JSON.stringify([this._config, this._dark(), this._lang,
      this._config.lights.map(x => { const c = this._cap(x); return [c.dim, c.rgb, c.temp]; })]);
  }
  _label(item) { const e = this._entity(item.entity); return item.name || e?.attributes?.friendly_name || item.entity; }
  _icon(item, e) { const id = item.entity; return item.icon || (/^(mdi:[a-z0-9-]{1,70})$/.test(e?.attributes?.icon || '') ? e.attributes.icon : '') || (id.startsWith('switch.') ? 'mdi:light-switch' : 'mdi:lightbulb-outline'); }
  _hasDetails(item, c) { return c.rgb || c.temp || Boolean(item.timer_entity) || item.automations.length > 0; }
  _stateText(e) { return !lcKnown(e) ? this._t('na') : e.state === 'on' ? this._t('on') : this._t('off'); }
  _pctText(item, e) {
    const known = lcKnown(e), on = known && e.state === 'on', cap = this._cap(item), level = lcBrightness(e);
    return !known ? '—' : cap.dim ? (on ? (Number.isFinite(level) ? `${level}%` : '—') : this._t('poff')) : (on ? this._t('pon') : this._t('poff'));
  }
  _power(index, label, extra = '') { return `<button type="button" class="lc-pw" data-toggle="${index}" aria-label="${lcEsc(this._t('pw_on'))} / ${lcEsc(this._t('pw_off'))} ${lcEsc(label)}">${lcIcon('mdi:power')}</button>`; }
  _detBtn(item, index, c, label) {
    if (!this._hasDetails(item, c)) return '<span class="lc-det ph" aria-hidden="true"></span>';
    return `<button type="button" class="lc-det" data-open-light="${index}" aria-label="${lcEsc(this._t('dev_a11y', { name: label }))}" title="${lcEsc(this._t('details'))}">${c.rgb || c.temp ? `<i class="lc-swatch" data-swatch="${index}"></i>` : lcIcon('mdi:tune-variant')}</button>`;
  }
  _track(index, label, dim, axis) {
    const base = axis === 'v' ? 'lc-fd-track' : 'lc-rt';
    return dim ? `<div class="${base}" role="slider" tabindex="0" aria-orientation="${axis === 'v' ? 'vertical' : 'horizontal'}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="${lcEsc(this._t('bright', { name: label }))}" data-fader="${index}" data-axis="${axis}">`
      : `<div class="${base} basic" aria-hidden="true">`;
  }
  _strip(item, index) {
    const e = this._entity(item.entity), c = this._cap(item), label = this._label(item);
    const track = c.dim ? `${this._track(index, label, true, 'v')}<div class="lc-fd-fill"></div></div>` : `<div class="lc-fd-track basic" aria-hidden="true"><span data-bstate="${index}">—</span></div>`;
    return `<article class="lc-fd lc-tile" data-tile data-index="${index}"><div class="lc-fd-top"><span class="lc-orb" data-orb="${index}">${lcIcon(this._icon(item, e))}</span><b class="lc-pct" data-pct="${index}">—</b></div>${track}<div class="lc-act">${this._power(index, label)}${this._detBtn(item, index, c, label)}</div><div class="lc-nm" title="${lcEsc(label)}">${lcEsc(label)}</div></article>`;
  }
  _solo(item, index) {
    const e = this._entity(item.entity), c = this._cap(item), label = this._label(item);
    const track = c.dim ? `${this._track(index, label, true, 'v')}<div class="lc-fd-fill"></div></div>` : `<div class="lc-fd-track basic" aria-hidden="true"><span data-bstate="${index}">—</span></div>`;
    return `<article class="lc-fd lc-solo lc-tile" data-tile data-index="${index}">${track}<div class="lc-fd-info"><div class="lc-fd-head"><span class="lc-orb" data-orb="${index}">${lcIcon(this._icon(item, e))}</span><div class="lc-nm">${lcEsc(label)}</div></div><b class="lc-fd-big lc-pct" data-pct="${index}">—</b><div class="lc-fd-st" data-state="${index}">—</div></div><div class="lc-act">${this._power(index, label)}${this._detBtn(item, index, c, label)}</div></article>`;
  }
  _row(item, index) {
    const e = this._entity(item.entity), c = this._cap(item), label = this._label(item);
    const track = c.dim ? this._track(index, label, true, 'h') : this._track(index, label, false, 'h');
    return `<div class="lc-rw lc-tile" data-tile data-index="${index}">${track}<div class="lc-rf"></div><div class="lc-rc"><span class="lc-orb" data-orb="${index}">${lcIcon(this._icon(item, e))}</span><div class="lc-rn"><div class="lc-nm" title="${lcEsc(label)}">${lcEsc(label)}</div><small data-state="${index}">—</small></div><b class="lc-rp lc-pct" data-pct="${index}">—</b></div></div>${this._power(index, label)}${this._detBtn(item, index, c, label)}</div>`;
  }
  _tileCard(item, index, n) {
    const e = this._entity(item.entity), c = this._cap(item), label = this._label(item);
    const bar = c.dim ? `<div class="lc-bar" role="slider" tabindex="0" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="${lcEsc(this._t('bright', { name: label }))}" data-fader="${index}" data-axis="h"><i></i><u></u></div>` : '<div class="lc-bar basic" aria-hidden="true"><i></i></div>';
    const ob = `<button type="button" class="lc-ob" data-toggle="${index}" data-orb="${index}" aria-label="${lcEsc(this._t('pw_on'))} / ${lcEsc(this._t('pw_off'))} ${lcEsc(label)}">${lcIcon(this._icon(item, e))}</button>`;
    if (n === 1) return `<article class="lc-ot h lc-tile" data-tile data-index="${index}">${ob}<div class="lc-tx"><div class="lc-nm">${lcEsc(label)}</div><div class="lc-fd-st" data-state="${index}">—</div></div><b class="lc-fd-big lc-pct" data-pct="${index}">—</b>${this._detBtn(item, index, c, label)}${bar}</article>`;
    return `<article class="lc-ot lc-tile" data-tile data-index="${index}">${this._hasDetails(item, c) ? this._detBtn(item, index, c, label) : ''}${ob}<div class="lc-nm" title="${lcEsc(label)}">${lcEsc(label)}</div><div class="lc-pct" data-pct="${index}">—</div>${bar}</article>`;
  }
  _autoChips(ids) { return ids.map(id => { const e = this._entity(id); return `<button type="button" class="lc-ac" data-auto-entity="${lcEsc(id)}" aria-pressed="false"><i></i><span>${lcEsc(e?.attributes?.friendly_name || id)}</span></button>`; }).join(''); }
  _allowedAuto() { return new Set([...this._config.automation_entities, ...this._config.lights.flatMap(l => l.automations)]); }
  _title() { const c = this._config; return c.title == null ? this._t('title') : c.title; }
  _paint() {
    if (!this.isConnected) return;
    this._lang = lcLang(this._config.language, this._hass);
    const key = this._structure();
    if (key !== this._structureKey) {
      this._structureKey = key;
      const configured = this._configured(), c = this._config, n = configured.length, style = c.card_style, title = this._title();
      const hasHd = (c.show_eyebrow && c.eyebrow) || (c.show_title && title);
      const head = `<header class="lc-head">${hasHd ? `<div class="lc-hd">${c.show_eyebrow && c.eyebrow ? `<div class="lc-eyebrow">${lcEsc(c.eyebrow)}</div>` : ''}${c.show_title && title ? `<div class="lc-title">${lcEsc(title)}<span class="lc-dot">.</span></div>` : ''}<div class="lc-sum" data-sum><i></i><span>—</span></div></div>` : ''}<button class="lc-alloff" type="button" data-alloff>${lcIcon('mdi:lightbulb-off-outline')} ${lcEsc(this._t('alloff'))}</button></header>`;
      let body;
      if (!n) body = `<div class="lc-empty">${lcEsc(this._t('empty'))}</div>`;
      else if (style === 'bars') body = `<div class="lc-col"><div class="lc-rows ${n > 1 ? 'multi' : ''}" role="group" aria-label="${lcEsc(this._t('lights'))}">${configured.map(x => this._row(x.item, x.index)).join('')}</div></div>`;
      else if (style === 'tiles') body = `<div class="lc-col"><div class="lc-ts ${n <= 4 ? 'k' + n : 'kn'}" role="group" aria-label="${lcEsc(this._t('lights'))}">${configured.map(x => this._tileCard(x.item, x.index, n)).join('')}</div></div>`;
      else {
        const kind = n === 1 ? 'solo' : n <= 3 ? 'few' : 'many';
        body = `<div class="lc-col"><div class="lc-faders ${kind}" role="group" aria-label="${lcEsc(this._t('lights'))}">${configured.map(x => n === 1 ? this._solo(x.item, x.index) : this._strip(x.item, x.index)).join('')}</div>${n >= 4 ? `<div class="lc-pager" data-pager hidden><button type="button" data-pg="-1" aria-label="${lcEsc(this._t('prev'))}">${lcIcon('mdi:chevron-left')}</button><span data-pager-text aria-live="polite"></span><button type="button" data-pg="1" aria-label="${lcEsc(this._t('next'))}">${lcIcon('mdi:chevron-right')}</button></div>` : ''}</div>`;
      }
      const autos = c.show_automation && c.automation_entities.length ? `<section class="lc-autos" aria-label="${lcEsc(this._t('autos'))}"><div class="lc-ac-h"><b>${lcEsc(this._t('autos').toLocaleUpperCase(this._lang))}</b><span data-asum>—</span></div><div class="lc-ac-row">${this._autoChips(c.automation_entities)}</div></section>` : '';
      this.shadowRoot.innerHTML = `<style>${LC_CSS}</style><div class="lc-root ${this._dark() ? 'lc-dark' : 'lc-light'} ${c.ambient_glow ? 'lc-glow' : ''}">${head}${body}${autos}<div class="lc-error" role="alert" hidden></div></div>`;
      this._pagerBind();
    }
    this._sync();
    if (this._opened && !this._modalHost) this._mountModal();
    if (!this._opened && this._modalHost) this._unmountModal();
  }
  _held(i) { return (this._drag?.index === i && this._drag.active) || this._kb?.index === i; }
  _syncAutos(root, enabled) {
    if (!root) return;
    root.querySelectorAll('[data-auto-entity]').forEach(btn => {
      const id = btn.dataset.autoEntity, s = this._entity(id), known = lcKnown(s), on = known && s.state === 'on';
      btn.classList.toggle('on', on); btn.classList.toggle('na', !known); btn.setAttribute('aria-pressed', String(on));
      btn.disabled = !known || !enabled || this._busy.has(id);
      const name = s?.attributes?.friendly_name, span = btn.querySelector('span'); if (span && name && span.textContent !== name) span.textContent = name;
      btn.title = !known ? this._t('na') : on ? this._t('a_on') : this._t('a_off');
    });
    const count = ids => { const n = ids.filter(id => { const s = this._entity(id); return lcKnown(s) && s.state === 'on'; }).length; return n === 0 ? this._t('a_0') : n === 1 ? this._t('a_1') : this._t('a_n', { n }); };
    const g = root.querySelector('[data-asum]'); if (g) g.textContent = count(this._config.automation_entities);
    root.querySelectorAll('[data-asum-l]').forEach(l => { const i = Number(l.closest('[data-li]')?.dataset.li); l.textContent = count(this._config.lights[i]?.automations || []); });
  }
  _sync() {
    const all = this._configured(), enabled = this._config.controls_enabled, root = this.shadowRoot;
    const active = all.filter(({ item }) => this._entity(item.entity)?.state === 'on');
    const allBtn = root.querySelector('[data-alloff]');
    if (allBtn) allBtn.disabled = !enabled || this._busyAll || !active.length;
    const sum = root.querySelector('[data-sum]');
    if (sum) { const n = active.length, t = all.length; sum.classList.toggle('has', n > 0); sum.querySelector('span').textContent = n === 0 ? this._t('sum_0') : n === 1 ? this._t('sum_1', { t }) : this._t('sum_n', { n, t }); }
    let avg = 0;
    for (const { item, index } of all) {
      const id = item.entity, e = this._entity(id), on = e?.state === 'on', known = lcKnown(e), cap = this._cap(item), busy = this._busy.has(id) || this._busyAll;
      const level = lcBrightness(e), val = Number.isFinite(level) ? level : 0, label = this._label(item);
      avg += on ? (cap.dim ? val / 100 : .6) : 0;
      const fd = root.querySelector(`[data-tile][data-index="${index}"]`);
      if (fd) {
        fd.classList.toggle('on', on && known); fd.classList.toggle('off', !on); fd.classList.toggle('na', !known);
        fd.style.setProperty('--lcol', lcRgb(e) || 'var(--lc-light)');
        const nm = fd.querySelector('.lc-nm'); if (nm && nm.textContent !== label) { nm.textContent = label; nm.title = label; }
        const held = this._held(index) || busy, track = fd.querySelector('[data-fader]');
        if (track) {
          const canDrag = known && enabled && !(on && level === null);
          track.setAttribute('aria-disabled', String(!canDrag)); track.tabIndex = canDrag ? 0 : -1;
          if (!held) { fd.style.setProperty('--f', String(val / 100)); fd.classList.toggle('z', val === 0); track.setAttribute('aria-valuenow', String(val)); track.setAttribute('aria-valuetext', Number.isFinite(level) ? `${val}%` : this._t('unk')); }
        } else { fd.style.setProperty('--f', String(on ? 1 : 0)); fd.classList.toggle('z', !on); }
        const bs = fd.querySelector('[data-bstate]'); if (bs) bs.textContent = this._stateText(e);
        const pct = fd.querySelector('[data-pct]'); if (pct && !held) pct.textContent = this._pctText(item, e);
        const st = fd.querySelector('[data-state]'); if (st) st.textContent = this._stateText(e);
      }
      const orb = root.querySelector(`[data-orb="${index}"]`);
      if (orb) { orb.classList.toggle('off', !on); const ha = orb.querySelector('ha-icon'); if (ha) ha.setAttribute('icon', this._icon(item, e)); }
      const power = root.querySelector(`[data-toggle="${index}"]`);
      if (power) { power.classList.toggle('on', on); power.disabled = !known || !enabled || busy; const nm2 = `${on ? this._t('pw_off') : this._t('pw_on')} ${label}`; power.setAttribute('aria-label', nm2); }
      root.querySelectorAll(`[data-open-light="${index}"]`).forEach(b => { b.disabled = !known && !item.automations.length; });
      root.querySelectorAll(`[data-swatch="${index}"]`).forEach(sw => sw.style.setProperty('--actual-color', lcRgb(e) || 'var(--lc-light)'));
    }
    root.querySelector('.lc-root')?.style.setProperty('--avg', (all.length ? avg / all.length : 0).toFixed(3));
    this._syncAutos(root, enabled);
    const err = root.querySelector('.lc-error'); if (err) { err.hidden = !this._error; err.textContent = this._error; }
    if (this._opened) this._syncPop();
  }
  /* ---------------------------------------------------------------- popup (all lights, accordion list) */
  _wide() { return !LC_IS_PHONE && typeof matchMedia === 'function' && matchMedia('(min-width:640px) and (min-height:600px)').matches; }
  _colCount() { if (!this._wide()) return 1; const w = Math.min(window.innerWidth - 32, 1120); return Math.max(1, Math.min(3, Math.floor((w - 44) / 320))); }
  _accHtml(index, item) {
    const e = this._entity(item.entity), open = !!this._pop.open[index], label = this._label(item);
    const head = `<button type="button" class="lc-ah" data-acc="${index}" aria-expanded="${open}"><span class="lc-dtp" data-dtp="${index}"></span><span class="lc-an">${lcEsc(label)}</span><span class="lc-at" data-acc-val="${index}">—</span>${lcIcon('mdi:chevron-right')}</button>`;
    return `<div class="lc-acc ${open ? 'open' : ''}" data-acc-box="${index}">${head}${open ? `<div class="lc-ab" data-li="${index}">${this._accBody(index, item, e)}</div>` : ''}</div>`;
  }
  _accBody(index, item, e) {
    const cap = this._cap(item), label = this._label(item); let h = '';
    h += `<div class="lc-er"><span class="lc-ico">${lcIcon(this._icon(item, e))}</span><div class="lc-t"><div class="lc-n" data-pop-state>—</div></div><button type="button" class="lc-pw" data-toggle="${index}" aria-label="${lcEsc(this._t('pw_on'))} / ${lcEsc(this._t('pw_off'))} ${lcEsc(label)}">${lcIcon('mdi:power')}</button></div>`;
    if (cap.rgb) h += `<div class="lc-blk"><div class="lc-bt">${lcEsc(this._t('rgb'))}</div><div class="lc-wheel" role="slider" tabindex="0" aria-label="${lcEsc(this._t('hue'))}" aria-valuemin="0" aria-valuemax="360" aria-valuenow="0"></div><div class="lc-presets">${LC_PRESETS.map(([k, hue, hex]) => `<button type="button" data-hue="${hue}" class="lc-preset" style="--color:${hex}" aria-label="${lcEsc(this._t(k))}" title="${lcEsc(this._t(k))}"></button>`).join('')}</div><div class="lc-cinfo"><span>${lcEsc(this._t('cur'))}</span><i class="lc-swatch" data-popup-swatch></i></div></div>`;
    if (cap.temp) {
      const a = e?.attributes || {}, min = lcClamped(a.min_color_temp_kelvin || 2000, 1000, 10000), max = Math.max(min + 100, lcClamped(a.max_color_temp_kelvin || 6500, 1000, 10000));
      const v = lcClamped(a.color_temp_kelvin || Math.round((min + max) / 2), min, max);
      h += `<div class="lc-blk"><div class="lc-bt">${lcEsc(this._t('ctemp'))}<span data-temp-text>${v} K</span></div><input class="lc-range" type="range" data-temp="${index}" min="${min}" max="${max}" value="${v}" step="50" style="--percent:${(v - min) * 100 / (max - min)}%" aria-label="${lcEsc(this._t('ctemp'))}"/><div class="lc-temp-row"><span>${lcEsc(this._t('warm'))}</span><span>${lcEsc(this._t('cool'))}</span></div><div class="lc-quick"><button type="button" data-temp-quick="warm">${lcEsc(this._t('warm'))}</button><button type="button" data-temp-quick="neutral">${lcEsc(this._t('neutral'))}</button><button type="button" data-temp-quick="cool">${lcEsc(this._t('cool'))}</button></div></div>`;
    }
    if (item.timer_entity) h += `<div class="lc-blk"><div class="lc-bt">${lcEsc(this._t('timer'))}</div><div class="lc-timer-status" data-timer-state>${lcEsc(this._t('t_na'))}</div><div class="lc-timer-actions">${[5, 15, 30, 60].map(n => `<button type="button" data-start-timer="${n}">${lcEsc(this._t('min', { m: n }))}</button>`).join('')}</div><button type="button" class="lc-timer-cancel" data-cancel-timer>${lcEsc(this._t('t_cancel'))}</button></div>`;
    if (item.automations.length) h += `<div class="lc-blk"><div class="lc-bt"><span style="font-size:12.5px;font-weight:650;color:inherit">${lcEsc(this._t('autos'))}</span><span data-asum-l>—</span></div><div class="lc-ac-row">${this._autoChips(item.automations)}</div></div>`;
    return h;
  }
  _popupBodyHtml() {
    const list = this._configured().filter(({ item }) => this._pop.flt === 'all' || this._entity(item.entity)?.state === 'on');
    const cr = `<div class="lc-cr"><div class="lc-seg2" role="group"><button type="button" data-flt="on" aria-pressed="${this._pop.flt === 'on'}">${lcEsc(this._t('f_on'))}</button><button type="button" data-flt="all" aria-pressed="${this._pop.flt === 'all'}">${lcEsc(this._t('f_all'))}</button></div></div>`;
    if (!list.length) return cr + `<div class="lc-empty" style="padding:26px 10px;text-align:center;font-size:13px">${lcEsc(this._t('none_on'))}</div>`;
    const cols = this._colCount();
    if (cols < 2) return cr + list.map(({ item, index }) => this._accHtml(index, item)).join('');
    const cs = Array.from({ length: cols }, () => ({ h: 0, a: [] }));
    list.forEach(({ item, index }) => { let b = cs[0]; for (const c of cs) if (c.h < b.h) b = c; b.a.push(this._accHtml(index, item)); b.h += this._pop.open[index] ? 6 : 1; });
    return cr + `<div class="lc-mrow">${cs.filter(c => c.a.length).map(c => `<div class="lc-mcol">${c.a.join('')}</div>`).join('')}</div>`;
  }
  _renderPopupBody() {
    const root = this._modalRoot(); if (!root) return; const mb = root.querySelector('.lc-mb'); if (!mb) return;
    const keep = mb.scrollTop, active = root.activeElement?.dataset?.acc; mb.innerHTML = this._popupBodyHtml(); mb.scrollTop = keep;
    if (active != null) root.querySelector(`[data-acc="${active}"]`)?.focus({ preventScroll: true });
    this._syncPop();
  }
  _syncPop() {
    const pop = this._modalRoot(); if (!pop) return; const enabled = this._config.controls_enabled;
    pop.querySelectorAll('[data-acc]').forEach(btn => {
      const i = Number(btn.dataset.acc), item = this._config.lights[i], e = this._entity(item?.entity); if (!item) return;
      btn.querySelector('[data-dtp]')?.classList.toggle('on', lcKnown(e) && e.state === 'on');
      btn.style.setProperty('--lcol', lcRgb(e) || 'var(--lc-light)');
      const v = btn.querySelector('[data-acc-val]'); if (v) v.textContent = this._pctText(item, e);
      const nm = btn.querySelector('.lc-an'), label = this._label(item); if (nm && nm.textContent !== label) nm.textContent = label;
    });
    pop.querySelectorAll('.lc-ab[data-li]').forEach(box => {
      const i = Number(box.dataset.li), item = this._config.lights[i], s = this._entity(item?.entity); if (!item) return;
      const busy = this._busy.has(item.entity), pk = lcKnown(s), pon = pk && s.state === 'on', plevel = lcBrightness(s), cap = this._cap(item);
      const ps = box.querySelector('[data-pop-state]'); if (ps) ps.textContent = !pk ? this._t('na') : pon ? (cap.dim && Number.isFinite(plevel) ? `${this._t('on')} · ${plevel}%` : this._t('on')) : this._t('off');
      const pw = box.querySelector('[data-toggle]'); if (pw) { pw.classList.toggle('on', pon); pw.style.setProperty('--lcol', lcRgb(s) || 'var(--lc-light)'); pw.disabled = !pk || !enabled || busy; }
      const color = lcRgb(s) || 'var(--lc-light)', wheel = box.querySelector('.lc-wheel');
      if (wheel) { wheel.style.setProperty('--chosen-color', color); wheel.setAttribute('aria-valuenow', String(Math.round(s?.attributes?.hs_color?.[0] || 0))); }
      const sw = box.querySelector('[data-popup-swatch]'); if (sw) sw.style.setProperty('--actual-color', color);
      box.querySelectorAll('[data-hue],[data-temp-quick]').forEach(el => el.disabled = !pk || !enabled || busy);
      const temp = box.querySelector('[data-temp]');
      if (temp) {
        temp.disabled = !pk || !enabled || busy;
        if (temp !== this._activeRange && this._modalRoot()?.activeElement !== temp) {
          const v = lcClamped(s?.attributes?.color_temp_kelvin || temp.value, Number(temp.min), Number(temp.max));
          temp.value = String(v); temp.style.setProperty('--percent', `${(v - Number(temp.min)) * 100 / (Number(temp.max) - Number(temp.min))}%`);
          const t = box.querySelector('[data-temp-text]'); if (t) t.textContent = `${v} K`;
        }
      }
      const timer = this._entity(item.timer_entity), state = box.querySelector('[data-timer-state]');
      if (state) state.textContent = !lcKnown(timer) ? this._t('t_na') : timer.state === 'active' ? this._t('t_active') : timer.state === 'paused' ? this._t('t_paused') : this._t('t_idle');
      const timerReady = !!item.timer_entity && lcKnown(timer) && ['idle', 'active', 'paused'].includes(timer.state);
      box.querySelectorAll('[data-start-timer]').forEach(el => el.disabled = !enabled || !pk || s?.state !== 'on' || !timerReady || this._busy.has(item.timer_entity));
      const cancel = box.querySelector('[data-cancel-timer]'); if (cancel) cancel.disabled = !enabled || !timerReady || timer.state === 'idle' || this._busy.has(item.timer_entity);
    });
    this._syncAutos(pop, enabled);
  }
  _pager_unused() {}
  _pagerBind() {
    this._ro?.disconnect(); this._ro = null;
    const sc = this.shadowRoot.querySelector('.lc-faders'); if (!sc) return;
    sc.addEventListener('scroll', () => this._pager(), { passive: true });
    if (typeof ResizeObserver === 'function') { this._ro = new ResizeObserver(() => this._pager()); this._ro.observe(sc); }
    this._pager();
  }
  _pager() {
    const sc = this.shadowRoot.querySelector('.lc-faders'), pg = this.shadowRoot.querySelector('[data-pager]'); if (!sc || !pg) return;
    const can = sc.scrollWidth > sc.clientWidth + 1; pg.hidden = !can; if (!can) return;
    const items = [...sc.querySelectorAll('.lc-fd')], L = sc.scrollLeft, W = sc.clientWidth; let a = 0, z = 0;
    items.forEach((it, i) => { if (it.offsetLeft >= L - 2 && it.offsetLeft + it.offsetWidth <= L + W + 2) { if (!a) a = i + 1; z = i + 1; } });
    const t = pg.querySelector('[data-pager-text]'); if (t) t.textContent = this._t('pager', { a, b: z, t: items.length });
    pg.querySelector('[data-pg="-1"]').disabled = L <= 1; pg.querySelector('[data-pg="1"]').disabled = L + W >= sc.scrollWidth - 1;
  }
  _canFade(index) { const item = this._config.lights[index], e = this._entity(item?.entity); return !!item && this._config.controls_enabled && lcKnown(e) && this._cap(item).dim && !this._busy.has(item.entity) && !(e.state === 'on' && lcBrightness(e) === null); }
  _fadeSet(index, v) {
    const fd = this.shadowRoot.querySelector(`[data-tile][data-index="${index}"]`); if (!fd) return;
    fd.style.setProperty('--f', String(v / 100)); fd.classList.toggle('z', v === 0); fd.classList.toggle('off', v === 0); fd.classList.toggle('on', v > 0);
    const t = fd.querySelector('[data-fader]'); if (t) { t.setAttribute('aria-valuenow', String(v)); t.setAttribute('aria-valuetext', `${v}%`); }
    const p = fd.querySelector('[data-pct]'); if (p) p.textContent = v === 0 ? this._t('poff') : `${v}%`;
  }
  _fadeCommit(index, v) { const item = this._config.lights[index]; if (item) this._service(item.entity, v === 0 ? 'turn_off' : 'turn_on', v === 0 ? {} : { brightness_pct: v }); }
  // A tap never changes the level. Touch: only a deliberate drag along the slider axis (relative to the current level) does; the other direction scrolls the page or list.
  _fadeDown(ev) {
    const tr = ev.target.closest?.('[data-fader]'); if (!tr || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
    const index = Number(tr.dataset.fader); if (!this._canFade(index)) return;
    const v0 = lcBrightness(this._entity(this._config.lights[index].entity)) || 0, touch = ev.pointerType !== 'mouse', vert = tr.dataset.axis !== 'h';
    this._drag = { index, tr, pid: ev.pointerId, touch, vert, x: ev.clientX, y: ev.clientY, v0, v: v0, active: !touch };
    if (!touch) { try { tr.setPointerCapture(ev.pointerId); } catch { /* ignore */ } tr.classList.add('drag'); this._fadeMove(ev); }
  }
  _fadeMove(ev) {
    const d = this._drag; if (!d || ev.pointerId !== d.pid) return;
    const box = d.tr.getBoundingClientRect();
    if (!d.touch) { d.v = Math.round(lcClamped((d.vert ? 1 - (ev.clientY - box.top) / box.height : (ev.clientX - box.left) / box.width) * 100, 0, 100)); this._fadeSet(d.index, d.v); return; }
    if (!d.active) {
      const dx = ev.clientX - d.x, dy = ev.clientY - d.y, main = d.vert ? Math.abs(dy) : Math.abs(dx), cross = d.vert ? Math.abs(dx) : Math.abs(dy);
      if (main >= 8 && main > cross * 1.5) { d.active = true; d.x = ev.clientX; d.y = ev.clientY; d.tr.classList.add('drag'); try { d.tr.setPointerCapture(ev.pointerId); } catch { /* ignore */ } }
      return;
    }
    const delta = d.vert ? -(ev.clientY - d.y) / box.height : (ev.clientX - d.x) / box.width;
    d.v = Math.round(lcClamped(d.v0 + delta * 100, 0, 100)); this._fadeSet(d.index, d.v);
  }
  _fadeUp(ev, cancel = false) {
    const d = this._drag; if (!d || ev.pointerId !== d.pid) return;
    this._drag = null; d.tr.classList.remove('drag'); try { d.tr.releasePointerCapture(ev.pointerId); } catch { /* ignore */ }
    if (d.active && !cancel && d.v !== d.v0) this._fadeCommit(d.index, d.v); else this._sync();
  }
  _modalRoot() { return this._modalHost?.shadowRoot || null; }
  _mountModal() {
    if (!this._opened || this._modalHost || !document.body) return;
    const host = document.createElement('div'); host.setAttribute('data-luma-dialog', ''); const root = host.attachShadow({ mode: 'open' });
    const style = getComputedStyle(this); for (const n of ['--edera-light-color', '--edera-emerald-color', '--ha-font-family-body', '--card-background-color', '--secondary-background-color', '--primary-text-color', '--secondary-text-color', '--ha-card-border-color']) { const v = style.getPropertyValue(n).trim(); if (v) host.style.setProperty(n, v); }
    const wide = this._wide();
    root.innerHTML = `<style>${LC_CSS}\n${LC_MODAL_CSS}</style><div class="lc-root lc-modal-scope ${this._dark() ? 'lc-dark' : 'lc-light'}" data-popup="${wide ? 'wide' : 'phone'}"><div class="lc-ov" data-backdrop><section class="lc-dlg" role="dialog" aria-modal="true" aria-label="${lcEsc(this._t('details'))}"><header class="lc-mh"><h2 class="lc-mt">${lcEsc(this._t('details'))}</h2><button class="lc-x" type="button" aria-label="${lcEsc(this._t('close'))}" data-close>${lcIcon('mdi:close')}</button></header><div class="lc-mb">${this._popupBodyHtml()}</div></section></div></div>`;
    for (const evt of ['click', 'input', 'change']) root.addEventListener(evt, e => this['_' + evt](e));
    root.addEventListener('pointerdown', e => { if (e.target.matches('.lc-range')) this._activeRange = e.target; });
    for (const t of ['pointerup', 'pointercancel']) root.addEventListener(t, () => { this._activeRange = null; });
    root.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); this._close(); return; }
      if (e.key === 'Tab') { const arr = [...root.querySelectorAll('.lc-dlg button:not(:disabled),.lc-dlg input:not(:disabled),.lc-dlg [tabindex="0"]')]; if (arr.length) { const f = arr[0], l = arr[arr.length - 1]; if (e.shiftKey && root.activeElement === f) { e.preventDefault(); l.focus({ preventScroll: true }); } else if (!e.shiftKey && root.activeElement === l) { e.preventDefault(); f.focus({ preventScroll: true }); } } }
      if (e.target.matches('.lc-wheel') && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault(); const i = Number(e.target.closest('[data-li]')?.dataset.li), item = this._config.lights[i], state = this._entity(item?.entity);
        if (item && lcCapabilities(state).rgb) { const h = Number(state.attributes?.hs_color?.[0] || 0), step = ['ArrowRight', 'ArrowUp'].includes(e.key) ? 5 : -5; this._service(item.entity, 'turn_on', { hs_color: [(h + step + 360) % 360, 100] }); }
      }
    });
    this._modalHost = host; document.body.appendChild(host);
    // Fixes the sheet height at open: on iOS the browser bars change the viewport height while the popup is open.
    const dlg = root.querySelector('.lc-dlg'), vh = window.innerHeight || 0, hgt = wide ? Math.min(vh * .8, 560) : Math.min(vh - 40, 680);
    if (dlg && hgt > 200) dlg.style.setProperty('--dh', Math.round(hgt) + 'px');
    root.querySelector('.lc-x')?.focus({ preventScroll: true }); this._sync();
  }
  _unmountModal() { this._modalHost?.remove(); this._modalHost = null; }
  _lockScroll() { if (this._scrollLock) return; this._scrollLock = true; document.addEventListener('wheel', this._blockedScroll, { passive: false, capture: true }); document.addEventListener('touchmove', this._blockedScroll, { passive: false, capture: true }); document.addEventListener('keydown', this._blockedKeys, true); }
  _unlockScroll() { if (!this._scrollLock) return; document.removeEventListener('wheel', this._blockedScroll, true); document.removeEventListener('touchmove', this._blockedScroll, true); document.removeEventListener('keydown', this._blockedKeys, true); this._scrollLock = null; }
  _open(index) {
    if (this._opened) return; this._lastFocus = this.shadowRoot.activeElement;
    const item = this._config.lights[index], e = this._entity(item?.entity);
    this._pop = { flt: lcKnown(e) && e.state === 'on' ? 'on' : 'all', open: { [index]: true } };
    this._opened = { type: 'all', index }; this._error = ''; this._lockScroll(); this._mountModal();
  }
  _close() { this._opened = null; this._error = ''; this._unmountModal(); this._unlockScroll(); this._sync(); this._lastFocus?.focus?.({ preventScroll: true }); this._lastFocus = null; }
  async _service(id, action, data = {}) {
    if (!this._config.controls_enabled || !id || this._busy.has(id) || !lcKnown(this._entity(id)) || typeof this._hass?.callService !== 'function') return;
    const domain = id.split('.')[0], allowed = { light: ['turn_on', 'turn_off'], switch: ['turn_on', 'turn_off'], automation: ['turn_on', 'turn_off'], timer: ['start', 'cancel'] };
    if (!allowed[domain]?.includes(action)) return;
    this._busy.add(id); this._error = ''; this._sync();
    try { await this._hass.callService(domain, action, { entity_id: id, ...data }); }
    catch (err) { this._error = this._t('err_cmd', { m: lcText(err?.message || this._t('err_ha'), 120) }); }
    finally { this._busy.delete(id); this._sync(); }
  }
  async _allOff() {
    if (!this._config.controls_enabled || this._busyAll || typeof this._hass?.callService !== 'function') return;
    const ids = this._configured().map(x => x.item.entity).filter(id => this._entity(id)?.state === 'on' && !this._busy.has(id));
    if (!ids.length) return;
    this._busyAll = true; this._sync();
    try {
      const groups = { light: ids.filter(x => x.startsWith('light.')), switch: ids.filter(x => x.startsWith('switch.')) };
      const results = await Promise.allSettled(Object.entries(groups).filter(([, names]) => names.length).map(([domain, names]) => this._hass.callService(domain, 'turn_off', { entity_id: names })));
      if (results.some(x => x.status === 'rejected')) this._error = this._t('err_some');
    } catch (err) { this._error = lcText(err?.message || this._t('err_ha'), 120); }
    finally { this._busyAll = false; this._sync(); }
  }
  _li(ev) { const b = ev.target.closest?.('[data-li]'); return b ? Number(b.dataset.li) : -1; }
  _click(ev) {
    if (ev.target.closest('[data-close]') || ev.target.matches('[data-backdrop]')) { this._close(); return; }
    if (ev.target.closest('[data-alloff]')) { this._allOff(); return; }
    const light = ev.target.closest('[data-open-light]'); if (light) { this._open(Number(light.dataset.openLight)); return; }
    const acc = ev.target.closest('[data-acc]'); if (acc) { const i = Number(acc.dataset.acc); this._pop.open[i] = !this._pop.open[i]; this._renderPopupBody(); return; }
    const flt = ev.target.closest('[data-flt]'); if (flt) { this._pop.flt = flt.dataset.flt === 'all' ? 'all' : 'on'; this._renderPopupBody(); return; }
    const pg = ev.target.closest('[data-pg]'); if (pg) { const sc = this.shadowRoot.querySelector('.lc-faders'); if (sc) sc.scrollBy({ left: Number(pg.dataset.pg) * (sc.clientWidth + 10), behavior: typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' }); return; }
    const ac = ev.target.closest('[data-auto-entity]'); if (ac) { const id = ac.dataset.autoEntity; if (this._allowedAuto().has(id)) this._service(id, this._entity(id)?.state === 'on' ? 'turn_off' : 'turn_on'); return; }
    const toggle = ev.target.closest('[data-toggle]'); if (toggle) { const x = this._config.lights[Number(toggle.dataset.toggle)], s = this._entity(x?.entity); if (s) this._service(x.entity, s.state === 'on' ? 'turn_off' : 'turn_on'); return; }
    const li = this._li(ev), x = this._config.lights[li], s = this._entity(x?.entity);
    const preset = ev.target.closest('[data-hue]'); if (preset && x) { if (lcCapabilities(s).rgb) this._service(x.entity, 'turn_on', { hs_color: [Number(preset.dataset.hue), 100] }); return; }
    const quick = ev.target.closest('[data-temp-quick]'); if (quick && x) {
      if (!lcCapabilities(s).temp) return;
      const input = ev.target.closest('[data-li]')?.querySelector('[data-temp]'); if (!input) return;
      const min = Number(input.min), max = Number(input.max), pos = quick.dataset.tempQuick, v = pos === 'warm' ? min : pos === 'cool' ? max : Math.round((min + max) / 2);
      this._service(x.entity, 'turn_on', { color_temp_kelvin: v }); return;
    }
    const start = ev.target.closest('[data-start-timer]'); if (start && x) {
      if (!x.timer_entity) return;
      const mins = Number(start.dataset.startTimer); if (![5, 15, 30, 60].includes(mins)) return;
      const duration = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}:00`;
      this._service(x.timer_entity, 'start', { duration }); return;
    }
    if (ev.target.closest('[data-cancel-timer]') && x) { if (x.timer_entity) this._service(x.timer_entity, 'cancel'); return; }
    const wheel = ev.target.closest('.lc-wheel'); if (wheel) this._wheel(ev, wheel);
  }
  _wheel(ev, wheel) {
    const i = Number(wheel.closest('[data-li]')?.dataset.li), x = this._config.lights[i]; if (!x) return;
    const box = wheel.getBoundingClientRect(), dx = ev.clientX - (box.left + box.width / 2), dy = ev.clientY - (box.top + box.height / 2);
    if (Math.hypot(dx, dy) < box.width * .2) return;
    const deg = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
    if (this._cap(x).rgb) this._service(x.entity, 'turn_on', { hs_color: [Math.round(deg), 100] });
  }
  _input(ev) {
    const range = ev.target.closest('[data-temp]'); if (!range) return;
    const val = Number(range.value), pct = (val - Number(range.min)) * 100 / (Number(range.max) - Number(range.min));
    range.style.setProperty('--percent', `${pct}%`);
    const el = range.closest('[data-li]')?.querySelector('[data-temp-text]'); if (el) el.textContent = `${val} K`;
  }
  _change(ev) {
    const range = ev.target.closest('[data-temp]'); if (!range) return;
    this._activeRange = null;
    const item = this._config.lights[Number(range.dataset.temp)], e = this._entity(item?.entity); if (!item || !lcKnown(e)) return;
    if (this._cap(item).temp) this._service(item.entity, 'turn_on', { color_temp_kelvin: Number(range.value) });
  }
}

const LC_EDITOR_CSS=`
:host{display:block;color:var(--primary-text-color,#19221E);font-family:var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,system-ui,Roboto,Arial,sans-serif);font-size:14px}
*,*:before,*:after{box-sizing:border-box}button,input,select{font:inherit}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--primary-color,#0E6B52);outline-offset:2px}button{cursor:pointer}button:disabled{opacity:.4;cursor:not-allowed}.lc-edit{min-width:0}.lc-tabs{display:flex;gap:4px;overflow-x:auto;border-bottom:1px solid var(--divider-color,#dfe5df);padding-bottom:12px}.lc-tab{white-space:nowrap;border:0;background:transparent;color:var(--secondary-text-color,#68716C);padding:10px 13px;border-radius:13px;font-size:13px}.lc-tab.active{font-weight:650;background:var(--secondary-background-color,#f1f3ef);color:var(--primary-text-color,#19221e)}
.lc-heading{font-size:21px;letter-spacing:-.45px;font-weight:600;margin:24px 0 8px}.lc-sub{font-size:12px;line-height:1.5;color:var(--secondary-text-color,#68716c);margin-bottom:18px}.lc-field{margin:19px 0}.lc-field>label{font-size:13px;display:block;font-weight:600;margin-bottom:10px}.lc-input{width:100%;display:block;padding:13px;background:var(--secondary-background-color,#f1f3ef);border:1px solid var(--divider-color,#e3e7e2);border-radius:12px;color:var(--primary-text-color,#19221e);outline-offset:1px}.lc-input option{background:var(--card-background-color,#fff);color:var(--primary-text-color,#19221e)}.lc-help{font-size:11px;color:var(--secondary-text-color,#68716c);margin-top:7px;line-height:1.45}.lc-picker{display:flex;align-items:center;gap:8px}.lc-picker ha-selector{display:block;flex:1;min-width:0;--mdc-theme-primary:var(--primary-color,#0e6b52)}.lc-picker .lc-input{flex:1;min-width:0}.lc-remove{border:1px solid var(--divider-color,#e3e7e2);border-radius:50%;width:36px;height:36px;flex:none;display:grid;place-items:center;background:var(--secondary-background-color,#f1f3ef);color:var(--primary-text-color,#19221e)}.lc-remove ha-icon{width:17px;height:17px;--mdc-icon-size:17px}
.lc-rows{display:flex;gap:6px;overflow-x:auto;padding:9px 0 14px;margin-bottom:10px}.lc-rowtab{background:transparent;color:var(--secondary-text-color,#68716c);border:0;padding:9px 12px;border-radius:12px;white-space:nowrap;font-size:12px}.lc-rowtab.active{background:var(--secondary-background-color,#f1f3ef);color:var(--primary-text-color,#19221e);font-weight:650}.lc-rowgroup{display:inline-flex;flex:none;align-items:center;border:1px solid var(--divider-color,#e3e7e2);border-radius:12px;overflow:hidden}.lc-rowgroup .lc-rowtab{border-radius:0}.lc-delete-x{width:30px;height:35px;display:grid;place-items:center;padding:0;border:0;border-left:1px solid var(--divider-color,#e3e7e2);background:var(--secondary-background-color,#f1f3ef);color:var(--primary-text-color,#19221e)}.lc-delete-x ha-icon{--mdc-icon-size:15px;width:15px;height:15px}.lc-delete-x,.lc-remove{line-height:0;align-items:center;justify-content:center}.lc-buttons{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px}.lc-action{background:var(--secondary-background-color,#f1f3ef);border:1px solid var(--divider-color,#e3e7e2);padding:9px 13px;border-radius:12px;color:var(--primary-text-color,#19221e);font-size:12px}.lc-switchrow{display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid var(--divider-color,#e3e7e2);padding:16px 0}.lc-switchrow:last-child{border-bottom:0}.lc-switchrow label{flex:1;font-size:13px}.lc-switchrow small{display:block;color:var(--secondary-text-color,#68716c);font-size:11px;margin-top:5px;line-height:1.5}.lc-switchrow input{width:18px;height:18px;accent-color:var(--primary-color,#0e6b52)}.lc-empty{padding:12px;color:var(--secondary-text-color,#68716c);font-size:12px}
.lc-fallback{position:relative;flex:1;min-width:0}.lc-fallback-list{max-height:185px;overflow:auto;display:block;border:1px solid var(--divider-color,#dfe5df);border-radius:12px;background:var(--card-background-color,#fff);margin-top:4px}.lc-fallback-list button{display:block;width:100%;padding:10px 12px;text-align:left;border:0;background:transparent;border-bottom:1px solid var(--divider-color,#dfe5df);color:var(--primary-text-color,#19221e);font-size:12px}.lc-fallback-list button:last-child{border-bottom:0}.lc-fallback-list button:hover{background:var(--secondary-background-color,#f1f3ef)}.lc-fallback-list small{display:block;margin-top:3px;color:var(--secondary-text-color,#68716c);font-size:11px}
`;

/* ---------------------------------------------------------------- editor */
class LumaControlCardEditor extends HTMLElement {
  constructor() {
    super(); this.attachShadow({ mode: 'open' });
    this._config = lcConfig(); this._hass = null; this._tab = 'dispositivi'; this._index = 0; this._selectorReady = false; this._addingAuto = false; this._addingLightAuto = false; this._lang = 'en';
    this.shadowRoot.addEventListener('click', e => this._click(e));
    this.shadowRoot.addEventListener('change', e => this._change(e));
    this.shadowRoot.addEventListener('input', e => this._search(e));
  }
  connectedCallback() { this._paint(); this._prepareSelector(); }
  set hass(h) { const prev = this._lang; this._hass = h; this._lang = lcLang(this._config.language, h); this.shadowRoot.querySelectorAll('ha-selector').forEach(x => { x.hass = h; }); if (prev !== this._lang) this._paint(); else this._refreshFallbacks(); }
  setConfig(x) { const c = lcConfig(x); if (JSON.stringify(c) === JSON.stringify(this._config) && this.shadowRoot.querySelector('.lc-edit')) return; this._config = c; this._index = Math.min(this._index, Math.max(0, c.lights.length - 1)); this._paint(); }
  _t(k, v) { return lcT(this._lang, k, v); }
  _update(patch) { this._config = lcConfig({ ...this._config, ...patch }); this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true })); this._paint(); }
  _field(label, body, help = '') { return `<div class="lc-field"><label>${lcEsc(label)}</label>${body}${help ? `<div class="lc-help">${lcEsc(help)}</div>` : ''}</div>`; }
  _picker(kind, id) { return `<div class="lc-picker"><div class="lc-picker-slot" style="flex:1;min-width:0" data-picker="${kind}"></div>${id ? `<button class="lc-remove" data-clear="${kind}" type="button" aria-label="${lcEsc(this._t('rm_ent'))}" title="${lcEsc(this._t('rm_ent'))}">${lcIcon('mdi:close')}</button>` : ''}</div>`; }
  _switch(label, key, help = '') { return `<div class="lc-switchrow"><label for="lc-${key}">${lcEsc(label)}${help ? `<small>${lcEsc(help)}</small>` : ''}</label><input id="lc-${key}" type="checkbox" data-key="${key}" ${this._config[key] ? 'checked' : ''}/></div>`; }
  _select(key, options, value) { return `<select class="lc-input" data-key="${key}">${options.map(([v, l]) => `<option value="${v}" ${value === v ? 'selected' : ''}>${lcEsc(l)}</option>`).join('')}</select>`; }
  _paint() {
    if (!this.isConnected) return;
    this._lang = lcLang(this._config.language, this._hass);
    const t = k => this._t(k), c = this._config;
    const tabs = [['dispositivi', t('tab_dev')], ['aspetto', t('tab_look')], ['automazioni', t('tab_auto')], ['avanzate', t('tab_adv')]];
    let body = '';
    if (this._tab === 'dispositivi') {
      const x = c.lights[this._index], nm = (d, i) => d.name || d.entity || this._t('dev_n', { n: i + 1 });
      body = `<div class="lc-heading">${lcEsc(t('e_dev_h'))}</div><div class="lc-sub">${lcEsc(t('e_dev_s'))}</div>` +
        (c.lights.length ? `<div class="lc-rows">${c.lights.map((d, i) => `<span class="lc-rowgroup"><button type="button" class="lc-rowtab ${this._index === i ? 'active' : ''}" data-select="${i}">${lcEsc(nm(d, i))}</button><button type="button" class="lc-delete-x" data-delete-index="${i}" aria-label="${lcEsc(this._t('rm_name', { name: d.name || d.entity || this._t('dev_x', { n: i + 1 }) }))}" title="${lcEsc(t('rm_dev'))}">${lcIcon('mdi:close')}</button></span>`).join('')}</div>` : '') +
        (x ? this._field(t('f_entity'), this._picker('device', x.entity)) + this._field(t('f_name'), `<input class="lc-input" type="text" data-item-field="name" maxlength="60" value="${lcEsc(x.name)}"/>`) + this._field(t('f_timer'), this._picker('timer', x.timer_entity), t('h_timer')) +
          this._field(t('f_lauto'), (x.automations || []).map((id, i) => this._picker(`lauto:${i}`, id)).join('') + (this._addingLightAuto ? this._picker('lauto:new', '') : '') + `<div class="lc-buttons"><button class="lc-action" type="button" data-add-lauto ${this._addingLightAuto ? 'disabled' : ''}>${lcEsc(t('add_auto'))}</button>${this._addingLightAuto ? `<button class="lc-action" type="button" data-cancel-lauto>${lcEsc(t('cancel'))}</button>` : ''}</div>`, t('h_lauto')) +
          this._field(t('f_icon'), `<input class="lc-input" type="text" data-item-field="icon" placeholder="${lcEsc(t('ph_icon'))}" value="${lcEsc(x.icon)}"/>`) +
          `<div class="lc-buttons"><button class="lc-action" type="button" data-move="-1" ${this._index === 0 ? 'disabled' : ''}>${lcEsc(t('up'))}</button><button class="lc-action" type="button" data-move="1" ${this._index === c.lights.length - 1 ? 'disabled' : ''}>${lcEsc(t('down'))}</button></div>` : `<div class="lc-empty">${lcEsc(t('no_dev'))}</div>`) +
        `<div class="lc-buttons"><button class="lc-action" type="button" data-add>${lcEsc(t('add_dev'))}</button></div>`;
    }
    if (this._tab === 'aspetto') {
      body = `<div class="lc-heading">${lcEsc(t('e_look_h'))}</div><div class="lc-sub">${lcEsc(t('e_look_s'))}</div>` +
        this._field(t('e_style'), this._select('card_style', [['fader', t('s_fader')], ['bars', t('s_bars')], ['tiles', t('s_tiles')]], c.card_style), t('e_style_d')) +
        this._field(t('e_eye'), `<input class="lc-input" type="text" maxlength="60" data-key="eyebrow" value="${lcEsc(c.eyebrow)}"/>`) +
        this._field(t('e_ttl'), `<input class="lc-input" type="text" maxlength="60" data-key="title" placeholder="${lcEsc(t('title'))}" value="${lcEsc(c.title == null ? '' : c.title)}"/>`) +
        this._field(t('e_theme'), this._select('theme_mode', [['auto', t('th_auto')], ['light', 'Edera Light'], ['dark', 'Graphite Dark']], c.theme_mode)) +
        this._field(t('e_lang'), this._select('language', [['auto', t('e_lang_auto')], ...LC_LANGS.map(l => [l, { it: 'Italiano', en: 'English', de: 'Deutsch', fr: 'Français' }[l]])], c.language), t('e_lang_d')) +
        this._switch(t('e_se'), 'show_eyebrow') + this._switch(t('e_st'), 'show_title') + this._switch(t('e_glow'), 'ambient_glow', t('e_glow_d'));
    }
    if (this._tab === 'automazioni') {
      body = `<div class="lc-heading">${lcEsc(t('e_auto_h'))}</div><div class="lc-sub">${lcEsc(t('e_auto_s'))}</div>` +
        c.automation_entities.map((id, i) => this._field(this._t('f_auto', { n: i + 1 }), this._picker(`automation:${i}`, id))).join('') +
        (this._addingAuto ? this._field(t('f_auto_new'), this._picker('automation:new', '')) : '') +
        `<div class="lc-buttons"><button class="lc-action" type="button" data-add-auto ${this._addingAuto ? 'disabled' : ''}>${lcEsc(t('add_auto'))}</button>${this._addingAuto ? `<button class="lc-action" type="button" data-cancel-auto>${lcEsc(t('cancel'))}</button>` : ''}</div>` +
        this._switch(t('sw_show'), 'show_automation', t('sw_show_d'));
    }
    if (this._tab === 'avanzate') body = `<div class="lc-heading">${lcEsc(t('e_adv_h'))}</div><div class="lc-sub">${lcEsc(t('e_adv_s'))}</div>` + this._switch(t('sw_ctl'), 'controls_enabled', t('sw_ctl_d'));
    this.shadowRoot.innerHTML = `<style>${LC_EDITOR_CSS}</style><div class="lc-edit"><nav class="lc-tabs" aria-label="${lcEsc(t('cfg'))}">${tabs.map(([id, name]) => `<button type="button" class="lc-tab ${id === this._tab ? 'active' : ''}" data-tab="${id}">${lcEsc(name)}</button>`).join('')}</nav>${body}</div>`;
    this._mountSelectors();
  }
  async _prepareSelector() {
    if (customElements.get('ha-selector')) { this._selectorReady = true; this._paint(); return; }
    try { const h = await window.loadCardHelpers?.(); await h?.importSelector?.(); } catch { /* Use the safe local entity list if HA's selector is not loaded. */ }
    this._selectorReady = !!customElements.get('ha-selector'); this._paint();
  }
  _domainOf(kind) { return kind === 'device' ? ['light'] : kind === 'timer' ? ['timer'] : ['automation']; }
  _mountSelectors() {
    this.shadowRoot.querySelectorAll('[data-picker]').forEach(slot => {
      const kind = slot.dataset.picker, domain = this._domainOf(kind), cur = this._config.lights[this._index];
      const idx = kind.startsWith('automation:') || kind.startsWith('lauto:') ? kind.split(':')[1] : null;
      const value = kind === 'device' ? (cur?.entity || '') : kind === 'timer' ? (cur?.timer_entity || '') : idx === 'new' ? '' : kind.startsWith('lauto:') ? (cur?.automations?.[Number(idx)] || '') : (this._config.automation_entities[Number(idx)] || '');
      if (this._selectorReady && customElements.get('ha-selector')) {
        const el = document.createElement('ha-selector'); el.hass = this._hass;
        el.selector = { entity: { domain: domain.length === 1 ? domain[0] : domain } }; el.value = value || '';
        el.addEventListener('value-changed', e => { e.stopPropagation(); if (!e.detail || !Object.prototype.hasOwnProperty.call(e.detail, 'value')) return; this._setEntity(kind, lcEntity(e.detail.value, domain)); });
        slot.appendChild(el);
      } else {
        slot.innerHTML = `<div class="lc-fallback"><input class="lc-input" type="search" data-search="${kind}" placeholder="${lcEsc(this._t('search_ph', { d: domain.join(' / ') }))}" autocomplete="off" value="${lcEsc(value)}" aria-label="${lcEsc(this._t('search'))}"/><div class="lc-fallback-list" data-options="${kind}"></div></div>`;
      }
    });
    this._refreshFallbacks();
  }
  _refreshFallbacks() {
    this.shadowRoot.querySelectorAll('[data-options]').forEach(box => {
      const kind = box.dataset.options, domain = this._domainOf(kind);
      const query = String(Array.from(this.shadowRoot.querySelectorAll('[data-search]')).find(el => el.dataset.search === kind)?.value || '').toLowerCase();
      const entities = Object.entries(this._hass?.states || {}).filter(([id, e]) => domain.includes(id.split('.')[0]) && (id.toLowerCase().includes(query) || String(e.attributes?.friendly_name || '').toLowerCase().includes(query))).sort((a, b) => a[0].localeCompare(b[0])).slice(0, 150);
      box.innerHTML = entities.length ? entities.map(([id, e]) => `<button type="button" data-pick="${lcEsc(kind)}" data-entity="${lcEsc(id)}">${lcEsc(e.attributes?.friendly_name || id)}<small>${lcEsc(id)}</small></button>`).join('') : `<div class="lc-empty">${lcEsc(this._t('no_ent'))}</div>`;
    });
  }
  _setEntity(kind, id) {
    if (kind.startsWith('lauto:')) {
      const items = [...this._config.lights], cur = items[this._index]; if (!cur) return;
      const n = kind.split(':')[1], arr = [...(cur.automations || [])], clean = lcEntity(id, ['automation']);
      if (n === 'new') { if (!clean || arr.includes(clean)) return; arr.push(clean); this._addingLightAuto = false; }
      else { const i = Number(n); if (!Number.isInteger(i) || i < 0 || i >= arr.length) return; if (!clean) arr.splice(i, 1); else if (!arr.some((v, j) => j !== i && v === clean)) arr[i] = clean; else return; }
      items[this._index] = { ...cur, automations: arr }; this._update({ lights: items }); return;
    }
    if (kind.startsWith('automation:')) {
      const n = kind.split(':')[1], arr = [...this._config.automation_entities], clean = lcEntity(id, ['automation']);
      if (n === 'new') { if (!clean || arr.includes(clean)) return; arr.push(clean); this._addingAuto = false; }
      else { const i = Number(n); if (!Number.isInteger(i) || i < 0 || i >= arr.length) return; if (!clean) arr.splice(i, 1); else if (!arr.some((v, j) => j !== i && v === clean)) arr[i] = clean; else return; }
      this._update({ automation_entities: arr, automation_entity: arr[0] || '' }); return;
    }
    const items = [...this._config.lights]; if (!items[this._index]) return;
    const key = kind === 'timer' ? 'timer_entity' : 'entity', domains = kind === 'timer' ? ['timer'] : ['light'];
    items[this._index] = { ...items[this._index], [key]: lcEntity(id, domains) }; this._update({ lights: items });
  }
  _click(ev) {
    if (ev.target.closest('[data-add-auto]')) { this._addingAuto = true; this._paint(); return; }
    if (ev.target.closest('[data-cancel-auto]')) { this._addingAuto = false; this._paint(); return; }
    if (ev.target.closest('[data-add-lauto]')) { this._addingLightAuto = true; this._paint(); return; }
    if (ev.target.closest('[data-cancel-lauto]')) { this._addingLightAuto = false; this._paint(); return; }
    const tab = ev.target.closest('[data-tab]'); if (tab) { this._tab = tab.dataset.tab; this._paint(); return; }
    const select = ev.target.closest('[data-select]'); if (select) { this._index = Number(select.dataset.select); this._addingLightAuto = false; this._paint(); return; }
    const pick = ev.target.closest('[data-pick]'); if (pick) { this._setEntity(pick.dataset.pick, pick.dataset.entity); return; }
    const clear = ev.target.closest('[data-clear]'); if (clear) { this._setEntity(clear.dataset.clear, ''); return; }
    if (ev.target.closest('[data-add]')) { this._index = this._config.lights.length; this._update({ lights: [...this._config.lights, lcLight()] }); return; }
    const remove = ev.target.closest('[data-delete-index]'); if (remove) { const removed = Number(remove.dataset.deleteIndex); if (!Number.isInteger(removed) || removed < 0 || removed >= this._config.lights.length) return; this._index = Math.max(0, Math.min(this._index > removed ? this._index - 1 : this._index, this._config.lights.length - 2)); this._update({ lights: this._config.lights.filter((_, i) => i !== removed) }); return; }
    const move = ev.target.closest('[data-move]'); if (move) { const j = this._index + Number(move.dataset.move), arr = [...this._config.lights]; if (j < 0 || j >= arr.length) return;[arr[j], arr[this._index]] = [arr[this._index], arr[j]]; this._index = j; this._update({ lights: arr }); }
  }
  _search(ev) { if (ev.target.hasAttribute('data-search')) this._refreshFallbacks(); }
  _change(ev) {
    const el = ev.target;
    if (el.hasAttribute('data-item-field')) { const arr = [...this._config.lights], item = arr[this._index]; if (!item) return; arr[this._index] = { ...item, [el.dataset.itemField]: el.value }; this._update({ lights: arr }); return; }
    const key = el.dataset.key; if (!key || !(key in LC_DEFAULTS)) return;
    let value = el.type === 'checkbox' ? el.checked : el.value; if (key === 'title' && !String(value).trim()) value = null; this._update({ [key]: value });
  }
}

if (typeof customElements !== 'undefined') {
  if (!customElements.get(LC_TAG)) customElements.define(LC_TAG, LumaControlCard);
  if (!customElements.get(LC_EDITOR_TAG)) customElements.define(LC_EDITOR_TAG, LumaControlCardEditor);
}
if (typeof window !== 'undefined') {
  window.customCards = window.customCards || [];
  if (!window.customCards.some(x => x.type === LC_TAG)) window.customCards.push({ type: LC_TAG, name: 'Luma Control Card', description: 'Light and automation control in Edera style.', preview: true });
}
export { lcConfig, lcEntity, lcCapabilities, lcBrightness };

