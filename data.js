export const BASELINE = {
  lastUpdated: "Abril 2026",
  source: "Milk Market Observatory — Comissão Europeia",
  euAvg: 42.79,
  countries: [
    { code:"CY", name:"Chipre",        flag:"🇨🇾", cur:66.82, prev:66.06 },
    { code:"MT", name:"Malta",         flag:"🇲🇹", cur:63.66, prev:60.81 },
    { code:"GR", name:"Grécia",        flag:"🇬🇷", cur:54.00, prev:54.61 },
    { code:"FI", name:"Finlândia",     flag:"🇫🇮", cur:51.33, prev:51.49 },
    { code:"HR", name:"Croácia",       flag:"🇭🇷", cur:48.85, prev:48.95 },
    { code:"ES", name:"Espanha",       flag:"🇪🇸", cur:47.48, prev:48.64 },
    { code:"AT", name:"Áustria",       flag:"🇦🇹", cur:46.75, prev:55.32 },
    { code:"IT", name:"Itália",        flag:"🇮🇹", cur:45.53, prev:57.58 },
    { code:"FR", name:"França",        flag:"🇫🇷", cur:45.25, prev:49.26 },
    { code:"PT", name:"Portugal",      flag:"🇵🇹", cur:44.43, prev:46.44 },
    { code:"SE", name:"Suécia",        flag:"🇸🇪", cur:43.66, prev:57.59 },
    { code:"PL", name:"Polónia",       flag:"🇵🇱", cur:43.50, prev:53.56 },
    { code:"BG", name:"Bulgária",      flag:"🇧🇬", cur:42.17, prev:47.37 },
    { code:"NL", name:"P. Baixos",     flag:"🇳🇱", cur:41.50, prev:55.25 },
    { code:"DE", name:"Alemanha",      flag:"🇩🇪", cur:40.54, prev:54.37 },
    { code:"RO", name:"Roménia",       flag:"🇷🇴", cur:40.05, prev:44.72 },
    { code:"EE", name:"Estónia",       flag:"🇪🇪", cur:40.02, prev:51.89 },
    { code:"DK", name:"Dinamarca",     flag:"🇩🇰", cur:40.01, prev:55.73 },
    { code:"CZ", name:"Rep. Checa",    flag:"🇨🇿", cur:39.91, prev:51.81 },
    { code:"IE", name:"Irlanda",       flag:"🇮🇪", cur:39.82, prev:52.15 },
    { code:"SI", name:"Eslovénia",     flag:"🇸🇮", cur:38.87, prev:48.97 },
    { code:"BE", name:"Bélgica",       flag:"🇧🇪", cur:38.81, prev:53.15 },
    { code:"LV", name:"Letónia",       flag:"🇱🇻", cur:38.64, prev:48.57 },
    { code:"SK", name:"Eslováquia",    flag:"🇸🇰", cur:37.61, prev:48.29 },
    { code:"HU", name:"Hungria",       flag:"🇭🇺", cur:37.50, prev:50.01 },
    { code:"LT", name:"Lituânia",      flag:"🇱🇹", cur:37.46, prev:52.17 },
  ],
  trend: {
    months: ["Jan-24","Fev-24","Mar-24","Abr-24","Mai-24","Jun-24","Jul-24","Ago-24","Set-24","Out-24","Nov-24","Dez-24",
             "Jan-25","Fev-25","Mar-25","Abr-25","Mai-25","Jun-25","Jul-25","Ago-25","Set-25","Out-25","Nov-25","Dez-25",
             "Jan-26","Fev-26","Mar-26","Abr-26","Mai-26"],
    series: {
      EU:[46.48,46.42,46.46,46.14,46.01,46.13,46.55,47.63,49.62,51.78,53.61,54.71,53.70,53.77,53.19,53.02,52.99,52.89,52.85,53.22,53.40,52.40,50.08,47.98,45.17,43.90,42.91,42.79,42.53],
      PT:[44.27,43.80,43.83,43.60,43.44,43.26,43.14,43.30,44.13,44.50,45.64,50.62,45.84,45.87,46.13,46.44,46.04,45.75,45.68,45.79,46.91,46.93,47.67,47.63,45.77,45.03,44.85,44.43,44.43],
      ES:[50.19,49.90,49.61,47.38,46.99,46.41,45.92,45.92,46.60,47.28,47.77,47.96,48.06,48.16,48.16,48.64,48.74,48.16,48.74,50.39,51.36,51.94,52.62,52.62,52.52,52.23,51.84,47.48,47.48],
      DE:[45.89,45.66,45.99,45.88,45.70,45.85,46.37,47.44,49.54,52.70,54.68,55.59,54.65,54.48,54.48,54.37,54.17,53.86,53.77,54.26,54.00,52.34,49.33,46.23,42.50,40.75,40.03,40.54,40.54],
      FR:[47.23,47.04,46.69,46.30,45.96,45.98,46.63,46.89,48.43,49.23,49.87,50.00,50.20,51.18,49.75,49.26,49.05,49.01,49.04,49.89,51.20,51.57,50.66,50.05,48.50,46.74,45.40,45.25,43.02],
      IE:[43.41,44.67,43.12,42.54,43.31,44.48,47.49,50.99,57.98,62.15,63.42,61.47,58.66,57.20,53.32,52.15,51.08,51.76,51.86,51.37,51.86,49.63,46.52,43.80,43.41,42.63,39.82,39.82,39.82],
      DK:[45.19,45.21,46.13,46.12,46.65,47.06,47.99,48.78,49.87,51.75,54.70,55.77,55.76,55.77,55.90,55.73,55.90,55.90,56.01,56.00,54.93,53.03,49.95,45.92,41.90,39.89,39.88,40.01,41.89],
      NL:[46.31,46.00,46.50,46.75,47.25,47.75,48.00,49.25,51.00,53.50,55.50,57.35,56.00,55.00,53.75,55.25,56.50,56.75,56.75,56.25,55.75,53.00,46.00,43.50,39.00,39.00,39.00,41.50,41.75],
    }
  }
};

export const SERIES_META = {
  EU:{ label:"Média UE",      color:"#C9A84C" },
  PT:{ label:"🇵🇹 Portugal",  color:"#C0392B" },
  ES:{ label:"🇪🇸 Espanha",   color:"#2563A8" },
  DE:{ label:"🇩🇪 Alemanha",  color:"#3D7A55" },
  FR:{ label:"🇫🇷 França",    color:"#7B3FA6" },
  IE:{ label:"🇮🇪 Irlanda",   color:"#E67E22" },
  DK:{ label:"🇩🇰 Dinamarca", color:"#1ABC9C" },
  NL:{ label:"🇳🇱 P. Baixos", color:"#E91E63" },
};

export const STORAGE_KEY = "milk-pwa-data-v1";
export const pct = (a,b) => ((a-b)/b*100).toFixed(1);
export const fmt = v => Number(v).toFixed(2);
