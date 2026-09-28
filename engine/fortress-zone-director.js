/* =============================================================================
   Fortress Army — Zone Director V1

   Cervello dati per costruire una zona giocabile senza duplicare logiche per
   singola mappa. Una ZoneDefinition dichiara identità + profilo + template;
   il Director materializza Node Graph, Encounter e opportunità usando gli
   stessi contratti che fortress-loop.js già conosce.

   Nessun DOM, nessun tiro digitale, nessuno stato partita mutabile qui.
   ========================================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FORTRESS_ZONE_DIRECTOR = api;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null), function () {
  "use strict";

  const PROFILE_LIBRARY = {
    wilderness: {
      shelterOpportunity: { maxPerVisit: 2, countWeights: [0.2, 0.5, 0.3], names: ["Capanno Abbandonato", "Rovine Coperte", "Postazione di Caccia"] },
      partyBoostOpportunity: { chance: 0.6, name: "Party Boost" },
      vehicleOpportunity: { chance: 0.8, pool: [
        { id: "armored-truck", name: "Camion Blindato", integrity: 28, demolitionBonus: 5 },
        { id: "assault-dozer", name: "Ruspa d'Assalto", integrity: 24, demolitionBonus: 7 },
        { id: "battle-bus", name: "Autobus Corazzato", integrity: 30, demolitionBonus: 4 }
      ] }
    },
    urban: {
      shelterOpportunity: { maxPerVisit: 2, countWeights: [0.15, 0.5, 0.35], names: ["Negozio Sventrato", "Garage Crollato", "Androne Blindato"] },
      partyBoostOpportunity: { chance: 0.55, name: "Party Boost" },
      vehicleOpportunity: { chance: 0.7, pool: [
        { id: "battle-bus", name: "Autobus Corazzato", integrity: 30, demolitionBonus: 4 },
        { id: "armored-truck", name: "Camion Blindato", integrity: 28, demolitionBonus: 5 }
      ] }
    },
    highground: {
      shelterOpportunity: { maxPerVisit: 1, countWeights: [0.25, 0.75], names: ["Bunker di Vetta", "Trincea Coperta", "Posto Osservazione"] },
      partyBoostOpportunity: { chance: 0.55, name: "Party Boost" },
      vehicleOpportunity: { chance: 0.45, pool: [
        { id: "armored-truck", name: "Camion Blindato", integrity: 28, demolitionBonus: 5 }
      ] }
    },
    frontier: {
      shelterOpportunity: { maxPerVisit: 2, countWeights: [0.2, 0.5, 0.3], names: ["Tenda Rinforzata", "Baracca di Frontiera", "Riparo di Lamiere"] },
      partyBoostOpportunity: { chance: 0.7, name: "Party Boost" },
      vehicleOpportunity: { chance: 0.65, pool: [
        { id: "armored-truck", name: "Camion Blindato", integrity: 28, demolitionBonus: 5 },
        { id: "battle-bus", name: "Autobus Corazzato", integrity: 30, demolitionBonus: 4 }
      ] }
    },
    industrial: {
      shelterOpportunity: { maxPerVisit: 2, countWeights: [0.2, 0.45, 0.35], names: ["Cabina Tecnica", "Container Aperto", "Passaggio di Servizio"] },
      partyBoostOpportunity: { chance: 0.6, name: "Party Boost" },
      vehicleOpportunity: { chance: 0.85, pool: [
        { id: "assault-dozer", name: "Ruspa d'Assalto", integrity: 24, demolitionBonus: 7 },
        { id: "armored-truck", name: "Camion Blindato", integrity: 28, demolitionBonus: 5 }
      ] }
    },
    ruins: {
      shelterOpportunity: { maxPerVisit: 2, countWeights: [0.25, 0.5, 0.25], names: ["Cripta Spezzata", "Arco Crollato", "Camera Sepolta"] },
      partyBoostOpportunity: { chance: 0.65, name: "Party Boost" },
      vehicleOpportunity: { chance: 0.25, pool: [
        { id: "armored-truck", name: "Camion Blindato", integrity: 28, demolitionBonus: 5 }
      ] }
    },
    military: {
      shelterOpportunity: { maxPerVisit: 2, countWeights: [0.15, 0.45, 0.4], names: ["Trincea", "Bunker Ausiliario", "Postazione Fortificata"] },
      partyBoostOpportunity: { chance: 0.5, name: "Party Boost" },
      vehicleOpportunity: { chance: 0.85, pool: [
        { id: "armored-truck", name: "Camion Blindato", integrity: 28, demolitionBonus: 5 },
        { id: "battle-bus", name: "Autobus Corazzato", integrity: 30, demolitionBonus: 4 }
      ] }
    },
    depot: {
      shelterOpportunity: { maxPerVisit: 1, countWeights: [0.2, 0.8], names: ["Container Blindato", "Baia di Carico", "Magazzino Laterale"] },
      partyBoostOpportunity: { chance: 0.6, name: "Party Boost" },
      vehicleOpportunity: { chance: 0.75, pool: [
        { id: "assault-dozer", name: "Ruspa d'Assalto", integrity: 24, demolitionBonus: 7 },
        { id: "armored-truck", name: "Camion Blindato", integrity: 28, demolitionBonus: 5 }
      ] }
    }
  };

  const NODE_TEMPLATES = {
    fork4: [
      { key:"n01", x:15, y:50, connections:{ right:"n02" } },
      { key:"n02", x:45, y:50, connections:{ left:"n01", up:"n03", down:"n04" } },
      { key:"n03", x:45, y:20, connections:{ down:"n02" } },
      { key:"n04", x:45, y:80, connections:{ up:"n02" } }
    ],
    diamond5: [
      { key:"n01", x:12, y:50, connections:{ right:"n02" } },
      { key:"n02", x:35, y:50, connections:{ left:"n01", up:"n03", down:"n04" } },
      { key:"n03", x:62, y:22, connections:{ down:"n05", left:"n02" } },
      { key:"n04", x:62, y:78, connections:{ up:"n05", left:"n02" } },
      { key:"n05", x:85, y:50, connections:{ up:"n03", down:"n04" } }
    ],
    corridor5: [
      { key:"n01", x:10, y:50, connections:{ right:"n02" } },
      { key:"n02", x:30, y:50, connections:{ left:"n01", right:"n03" } },
      { key:"n03", x:50, y:50, connections:{ left:"n02", right:"n04" } },
      { key:"n04", x:70, y:50, connections:{ left:"n03", right:"n05" } },
      { key:"n05", x:90, y:50, connections:{ left:"n04" } }
    ],
    cross5: [
      { key:"n01", x:12, y:50, connections:{ right:"n02" } },
      { key:"n02", x:48, y:50, connections:{ left:"n01", up:"n03", right:"n04", down:"n05" } },
      { key:"n03", x:48, y:18, connections:{ down:"n02" } },
      { key:"n04", x:82, y:50, connections:{ left:"n02" } },
      { key:"n05", x:48, y:82, connections:{ up:"n02" } }
    ],
    loop5: [
      { key:"n01", x:12, y:50, connections:{ right:"n02" } },
      { key:"n02", x:35, y:25, connections:{ left:"n01", right:"n03", down:"n05" } },
      { key:"n03", x:72, y:25, connections:{ left:"n02", down:"n04" } },
      { key:"n04", x:72, y:75, connections:{ up:"n03", left:"n05" } },
      { key:"n05", x:35, y:75, connections:{ right:"n04", up:"n02" } }
    ],
    split6: [
      { key:"n01", x:10, y:50, connections:{ right:"n02" } },
      { key:"n02", x:30, y:50, connections:{ left:"n01", up:"n03", down:"n04" } },
      { key:"n03", x:52, y:24, connections:{ down:"n05", left:"n02" } },
      { key:"n04", x:52, y:76, connections:{ up:"n05", left:"n02" } },
      { key:"n05", x:72, y:50, connections:{ up:"n03", down:"n04", right:"n06" } },
      { key:"n06", x:91, y:50, connections:{ left:"n05" } }
    ]
  };

  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function merge(a, b) {
    const out = clone(a) || {};
    Object.keys(b || {}).forEach((k) => {
      const v = b[k];
      if (v && typeof v === "object" && !Array.isArray(v) && out[k] && typeof out[k] === "object" && !Array.isArray(out[k])) out[k] = merge(out[k], v);
      else out[k] = clone(v);
    });
    return out;
  }
  function nodeId(zoneId, key) { return `${zoneId}-${key}`; }
  function materializeNodes(zoneId, templateName, chestSlots) {
    const template = NODE_TEMPLATES[templateName];
    if (!template) throw new Error(`Template nodi inesistente: ${templateName}`);
    const slotMap = new Map((chestSlots || []).map((key, i) => [key, i]));
    return template.map((n) => ({
      id: nodeId(zoneId, n.key), x:n.x, y:n.y,
      connections: Object.fromEntries(Object.entries(n.connections || {}).map(([dir,key]) => [dir,nodeId(zoneId,key)])),
      ...(slotMap.has(n.key) ? { contents:[{ type:"chestSlot", slot:slotMap.get(n.key) }] } : {})
    }));
  }
  function materializeEncounter(zoneId, plan) {
    if (!plan || !plan.length) return null;
    return { composition: plan.map((e) => ({ archetype:e.archetype, nodeId:nodeId(zoneId,e.node) })) };
  }
  function mapStructure(zoneId, spec) {
    if (!spec) return null;
    const s = clone(spec);
    if (s.node && !s.nodeId) s.nodeId = nodeId(zoneId, s.node);
    delete s.node;
    return s;
  }
  function materializeZoneDefinition(raw) {
    const profile = PROFILE_LIBRARY[raw.profile] || {};
    const z = merge(profile, raw);
    if (raw.template) {
      z.nodes = materializeNodes(raw.id, raw.template, raw.chestSlots || []);
      z.entryNodeId = nodeId(raw.id, raw.entryNode || "n01");
      z.encounter = materializeEncounter(raw.id, raw.encounterPlan || []);
      z.operationalStructure = mapStructure(raw.id, raw.operationalStructure || z.operationalStructure);
    }
    delete z.profile; delete z.template; delete z.chestSlots; delete z.entryNode; delete z.encounterPlan;
    return z;
  }


  function cloneNodeLayout(zone) {
    if (!zone) throw new Error("Zona mancante");
    return {
      version: 1,
      zoneId: zone.id,
      entryNodeId: zone.entryNodeId || null,
      nodes: (zone.nodes || []).map((n) => ({
        id: n.id,
        x: Number(n.x),
        y: Number(n.y),
        connections: clone(n.connections || {}),
        ...(n.contents ? { contents: clone(n.contents) } : {})
      }))
    };
  }

  function portableEdges(layout) {
    if (!layout) return [];
    if (Array.isArray(layout.edges)) return layout.edges.map((edge) => Array.isArray(edge) ? edge.slice(0, 2) : edge);
    const seen = new Set(), edges = [];
    (layout.nodes || []).forEach((node) => Object.values(node.connections || {}).forEach((targetId) => {
      if (!targetId || targetId === node.id) return;
      const pair = [node.id, targetId].sort();
      const key = pair.join("|");
      if (seen.has(key)) return;
      seen.add(key); edges.push(pair);
    }));
    return edges;
  }

  function portableLayoutToInternal(layout) {
    const nodes = (layout && layout.nodes || []).map((n) => ({
      id: n.id, x: Number(n.x), y: Number(n.y), connections: {},
      ...(n.contents ? { contents: clone(n.contents) } : {})
    }));
    const byId = new Map(nodes.map((n) => [n.id, n]));
    portableEdges(layout).forEach((edge) => {
      if (!Array.isArray(edge) || edge.length !== 2) throw new Error("Edge non valido");
      const a = byId.get(edge[0]), b = byId.get(edge[1]);
      if (!a || !b) throw new Error(`Edge verso nodo inesistente: ${edge.join(" → ")}`);
      if (a.id === b.id) throw new Error(`Self-edge non valido: ${a.id}`);
      const baseA = inferConnectionDirection(a, b), baseB = oppositeDirection(baseA);
      a.connections[nextConnectionKey(a.connections, baseA)] = b.id;
      b.connections[nextConnectionKey(b.connections, baseB)] = a.id;
    });
    return { version: 1, zoneId: layout.zoneId, entryNodeId: layout.entryNodeId || null, nodes };
  }

  function applyNodeLayout(zone, layout) {
    if (!zone || !layout || layout.zoneId !== zone.id) throw new Error("Layout non compatibile con la zona");
    const normalized = Array.isArray(layout.edges) ? portableLayoutToInternal(layout) : layout;
    const next = cloneNodeLayout({ id: zone.id, entryNodeId: normalized.entryNodeId, nodes: normalized.nodes || [] });
    const ids = new Set(next.nodes.map((n) => n.id));
    if (next.entryNodeId && !ids.has(next.entryNodeId)) throw new Error("Entry node non presente nel layout");
    next.nodes.forEach((n) => Object.values(n.connections || {}).forEach((targetId) => {
      if (!ids.has(targetId)) throw new Error(`Collegamento a nodo inesistente: ${targetId}`);
    }));
    const oldById = new Map((zone.nodes || []).map((n) => [n.id, n]));
    zone.nodes = next.nodes.map((n) => {
      const old = oldById.get(n.id);
      if (!old) return n;
      return { ...clone(old), x:n.x, y:n.y, connections:clone(n.connections || {}), ...(n.contents ? { contents:clone(n.contents) } : {}) };
    });
    zone.entryNodeId = next.entryNodeId || (next.nodes[0] && next.nodes[0].id) || null;
    return zone;
  }

  function baseConnectionDirection(key) {
    const m = String(key || "").match(/^(left|right|up|down)/);
    return m ? m[1] : null;
  }

  function oppositeDirection(dir) {
    return ({ left:"right", right:"left", up:"down", down:"up" })[baseConnectionDirection(dir) || dir] || null;
  }

  function nextConnectionKey(connections, baseDir) {
    connections = connections || {};
    if (!connections[baseDir]) return baseDir;
    let i = 2;
    while (connections[`${baseDir}${i}`]) i += 1;
    return `${baseDir}${i}`;
  }

  function inferConnectionDirection(a, b) {
    if (!a || !b) throw new Error("Servono due nodi");
    const dx = Number(b.x) - Number(a.x), dy = Number(b.y) - Number(a.y);
    if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "right" : "left";
    return dy >= 0 ? "down" : "up";
  }

  function toggleNodeConnection(layout, aId, bId) {
    if (!layout || aId === bId) throw new Error("Seleziona due nodi diversi");
    const a = (layout.nodes || []).find((n) => n.id === aId);
    const b = (layout.nodes || []).find((n) => n.id === bId);
    if (!a || !b) throw new Error("Nodo non trovato");
    a.connections = a.connections || {}; b.connections = b.connections || {};
    const existingA = Object.entries(a.connections).find(([,id]) => id === bId);
    const existingB = Object.entries(b.connections).find(([,id]) => id === aId);
    if (existingA || existingB) {
      if (existingA) delete a.connections[existingA[0]];
      if (existingB) delete b.connections[existingB[0]];
      return { connected:false };
    }
    const baseDirA = inferConnectionDirection(a,b), baseDirB = oppositeDirection(baseDirA);
    const dirA = nextConnectionKey(a.connections, baseDirA);
    const dirB = nextConnectionKey(b.connections, baseDirB);
    a.connections[dirA] = bId; b.connections[dirB] = aId;
    return { connected:true, dirA, dirB, baseDirA, baseDirB };
  }

  function createTemplateLayout(zoneId, templateName) {
    const nodes = materializeNodes(zoneId, templateName || "diamond5", []);
    return { version:1, zoneId, entryNodeId: nodes[0] ? nodes[0].id : null, nodes };
  }

  function validateDefinition(z) {
    const problems = [];
    if (!z || !z.id) return ["Zona senza id"];
    if (z.nodes) {
      const ids = new Set(z.nodes.map((n)=>n.id));
      if (!ids.has(z.entryNodeId)) problems.push(`${z.id}: entryNodeId inesistente`);
      z.nodes.forEach((n)=>Object.values(n.connections || {}).forEach((id)=>{ if(!ids.has(id)) problems.push(`${z.id}: collegamento nodo inesistente ${id}`); }));
      (z.encounter && z.encounter.composition || []).forEach((e)=>{ if(!ids.has(e.nodeId)) problems.push(`${z.id}: encounter su nodo inesistente ${e.nodeId}`); });
      if (z.operationalStructure && !ids.has(z.operationalStructure.nodeId)) problems.push(`${z.id}: struttura su nodo inesistente`);
    }
    return problems;
  }

  return { PROFILE_LIBRARY, NODE_TEMPLATES, materializeZoneDefinition, validateDefinition, cloneNodeLayout, applyNodeLayout, portableEdges, portableLayoutToInternal, inferConnectionDirection, baseConnectionDirection, toggleNodeConnection, createTemplateLayout };
});
