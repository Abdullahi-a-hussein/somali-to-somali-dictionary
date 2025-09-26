const abbreviations = {
  "m.l/dh.kh": "Magac Lab/Dheddig Khabar",
  "qr.diid": "Qurub Diidmo",
  "m.f.l": "magac Fal Lab",
  "mu.eb": "magacuyaal Ebyoon",
  "f.g1": "Fal Gudbe",
  "f.g/mg4": "Fal Gudbe/magudbe",
  "u.j.w": "urur Jagaale wadar",
  "f.g/mg1": "Fal Gudbe/magudbe",
  "xi.": "xiriiriye",
  "m.l.t": "Magac Lab tiraale",
  "m.l.fk": "Magac Lab Falkaab",
  "f.lg2": "Fal labagudbe",
  "f.g4": "Fal Gudbe",
  "m.dh.fk": "Magac Dheddig Falkaab",
  "f.g3": "Fal Gudbe",
  "m.dh.w": "Magac Dheddig Wadar",
  "qr.dd": "Qurub Diirad",
  "m.l/dh": "Magac Lab/Dheddig",
  "m.dh.u": "Magac Dheddig Urur",
  "s.": "Sifo",
  "f.mg4": "Fal magudbe",
  "fk.": "Falkaab",
  "m.l.kh": "Magac Lab/Dheddig Khabar",
  "m.l.u": "Magac Lab Urur",
  "f.g1/2": "Fal Gudbe",
  "m.l/dh.t.j": "Magac Lab/Dheddig Tiraale Jagaale",
  "qr.": "Qurub",
  "f.g2": "Fal Gudbe",
  "mu.dhm.y": "Magacuyaal Dhimman Yeele",
  "f.mg2": "Fal Magudbe",
  "m.l/dh.u": "Magac Lab/Dheddig Urur",
  "e.d": "Erey dareen",
  "m.l": "Magac Lab",
  "f.mg1": "Fal Magudbe",
  "m.f.dh": "Magac Fal Dheddig",
  "f.g/mg3": "Fal Gudbe/Magudbe",
  "m.dh.t": "Magac Dheddig Tiraale",
  "f.mg3": "Fal Magudbe",
  "e.we": "Erey weyddimeed",
  "m.l.w": "Magac Lab Wadar",
  "u.j": "Urur jagaale",
  "f.g/mg2": "Fal Gudbe/Magudbe",
  "m.dh": "Magac Dheddig",
  "m.dh.sh.r": "Magac Dheddig shanqar-raac",
  "f.g/f.mg3": "Fal Gudbe/Magudbe",
  "m.dh.kh": "Magac Dheddig Khabar",
  "f.mg1/2": "Fal Magudbe",
  "m.l.t.j": "Magac Lab Tiraale Jagaale",
  "m.u": "Magac Urur",
  "f.g/mg1/2": "Fal Gudbe/Magudbe",
  "f.lg1": "Fal labagudbe",
  "f.g/mg.": "Fal Gudbe/Magudbe",
  "f.g/lg1": "Fal Gubde/Labagudbe",
  "m.fk": "Magac Falkaab",
  "f.g/lg2": "Fal Gubde/Labagudbe",
  "f.lg3": "Fal labagudbe",
  "m.l.t.": "Magac Lab Tiraale",
  "f.a": "Fal Amar",
  "f.g/lg3": "Fal Gubde/Labagudbe",
  "m.d": "Magac Dheddig",
  "m.l.": "Magac Lab",
  "m.l.u.kh": "Magac Lab Urur Khabar",
  "m.f.kh": "Magac Fal Khabar",
  "f.g": "Fal Gudbe",
  "m.dh.w": "Magac Dheddig Wadar",
  "m.f.sh.r": "Magac Fal Shanqar-raac",
  "f.dh": "Fal Dheddig",
  lg1: "Labagudbe",
  "m.l.sh.r": "Magac Lab Shanqar-raac",
  "m.dh/l": "Magac Dheddig/Lab",
  lg2: "Labagudbe",
  "mu.dhm.ly": "Magacuyaal Dhimman layeele",
  "mu.we": "Magacuyaal weyddimeed",
  "mu.diid": "Magacuyaal Diidmo",
  h: "Horyaale",
  "m.l/dh.sh.r": "Magac Dheddig/Lab shanqar-raac",
  "mu.lh.l": "Magacuyaal laahansho Lab",
  "mu.ti.l": "Magacuyaal tilmaame Lab",
  "mu.ac.l": "Magacuyaal aan cayinnayn Lab",
  "mu.lh.w": "Magacuyaal laahansho Wadar",
  "mu.ti.w": "Magacuyaal tilmaame Wadar",
  "mu.ac.w": "Magacuyaal aan cayinnayn Wadar",
  "mu.we.w": "Magacuyaal weyddimeed Wadar",
  "mu.we.l": "Magacuyaal weyddimeed Lab",
  "m.l/dh.w": "Magac Dheddig/Lab Wadar",
  "dk.ti.l": "Dibkabe tilmaame lab",
  "qr.fk": "qurub Falkaab",
  "mu.y.ac": "Magacuyaal yeele aan cayinnayn",
  "f.g/f.mg1": "Fal Gudbe/Magudbe",
  "xi.we": "xiriiriye weyddimeed",
  "q.t.": "qodob tiraale",
  "qr.we": "qurub weyddimeed",
  "diid.": "Diidmo",
  "e.we.dh": "Erey weyddimeed Dheddig",
  "f.g.1": "Fal Gudbe",
  "m.dh.t.j": "Magac Dheddig tiraale jagaale",
  "fk.we": "Falkaab weyddimeed",
  "m.f.w": "Magac Fal Wadar",
  "f.g.2": "Fal Gudbe",
  "m.": "Magac",
  "mu.ti.dh": "Magacuyaal tilmaame Dheddig",
  "mu.lh.dh": "Magacuyaal laahansho Dheddig",
  "mu.ac.dh": "Magacuyaal aan cayinnayn Dheddig",
  "mu.we.dh": "Magacuyaal weyddimeed Dheddig",
};
const example = `m.l (-layaal, m.l/dh) (nax.) Curiye aan doorsoomin oo hawshiisu tahay in layeele dadban uu qabadsiiyo falka weerta. Tus. “Safiya baa salligaas ku tukatay”`;
export function customSplit(word, text) {
  if (!text) return [];
  text = text.replace(/\s1\.\s/g, " ");
  const pattern = new RegExp(`(?: [2-9]\\d?\\. |${word}: )`, "g");
  return text
    .split(pattern)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export function findMarkers(definition) {
  if (!definition || !definition.trim()) {
    return [];
  }

  const parts = [];
  let remaining = definition.trim();

  // helper to grab first token until space
  function getFirstToken(text) {
    const index = text.indexOf(" ");
    return index === -1 ? text : text.slice(0, index);
  }

  // Loop until we’ve parsed markers/brackets
  while (remaining.startsWith("(")) {
    // grab bracket group
    const closeIndex = remaining.indexOf(")");
    if (closeIndex === -1) break; // malformed, stop
    const bracketGroup = remaining.slice(0, closeIndex + 1);
    parts.push(bracketGroup.trim());
    remaining = remaining.slice(closeIndex + 1).trim();
  }

  // Now check if first token is a marker
  const possibleMarker = getFirstToken(remaining);
  if (abbreviations.hasOwnProperty(possibleMarker)) {
    parts.push(abbreviations[possibleMarker]);
    remaining = remaining.slice(possibleMarker.length).trim();
  }

  // After marker, might be another bracket group
  while (remaining.startsWith("(")) {
    const closeIndex = remaining.indexOf(")");
    if (closeIndex === -1) break;
    const bracketGroup = remaining.slice(0, closeIndex + 1);
    parts.push(bracketGroup.trim());
    remaining = remaining.slice(closeIndex + 1).trim();
  }

  // Whatever is left is the definition
  if (remaining) {
    parts.push(remaining);
  }

  return parts;
}

export function markersWithNodefinition(def) {
  const parts = findMarkers(def);
  if (!parts || parts.length <= 1) {
    return [];
  }
  return parts.slice(0, parts.length - 1);
}
