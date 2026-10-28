"use strict";

const REPO = "https://raw.githubusercontent.com/squirelworks/NIDA_ATT/main/";
const BOOKS = REPO + "courses/";
const BACK = "../nida/";

function course(title, menu) {
  const url = new URL("../foolcourse/", location.href);
  url.searchParams.set("title", title);
  url.searchParams.set("menu", menu);
  url.searchParams.set("books", BOOKS);
  url.searchParams.set("back", BACK);
  return url.pathname + url.search;
}

function link(host, label, href) {
  const a = document.createElement("a");
  a.href = href;
  a.textContent = label;
  host.appendChild(a);
}

const main = document.getElementById("main");
link(main, "ATT master", course("NIDA ATT", REPO + "_curriculum/master.xml"));
link(main, "Programs", course("NIDA programs", REPO + "_curriculum/programs/nida.programs.xml"));

const ratings = [
  ["ATT Master", "att-master.xml"],
  ["Gas Turbine Systems Technician — Electrical", "gse.xml"],
  ["Electrician's Mate", "em.xml"],
  ["Interior Communications", "ic.xml"],
  ["Gunner's Mate", "gm.xml"],
  ["Fire Controlman", "fc.xml"],
  ["Electronics Technician", "et.xml"],
  ["Sonar Technician — Surface", "stg.xml"],
  ["Aviation Electrician's Mate", "ae.xml"],
  ["Aviation Electronics Technician", "ati.xml"],
  ["Aviation Ordnanceman", "ao.xml"],
  ["Aviation Electronics Technician (ATO)", "ato.xml"],
  ["Aviation Support Equipment Technician", "as.xml"],
  ["Torpedoman's Mate", "tm.xml"],
  ["Cryptologic Technician — Maintenance", "ctm.xml"],
  ["Fire Control Technician — Submarine", "ft.xml"],
  ["Electronics Technician — Submarine", "etss.xml"],
  ["Sonar Technician — Submarine", "sts.xml"],
  ["Cryptologic Technician — Technical", "ctt.xml"],
  ["Mineman", "mn.xml"],
  ["Aviation Electronics Technician (MV)", "mv.xml"],
];
ratings.forEach(([label, file]) => {
  link(document.getElementById("ratings"), label, course(label, REPO + "_curriculum/ratings/" + file));
});

["nida81.fbk", "nc81base.fsk", "nc81recs.fsk", "nc81test.fsk", "nc81trnr.fsk", "NC81BANK.fsk"].forEach((file) => {
  const url = new URL("../foolbook/", location.href);
  url.searchParams.set("embed", "1");
  url.searchParams.set("src", REPO + file);
  url.searchParams.set("title", file);
  link(document.getElementById("system"), file, url.pathname + url.search);
});
