(() => {
  // Troque pelo número real, com DDI e DDD, só dígitos.
  const WHATSAPP = "5511984812294";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const wa = t => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t)}`;

  /* links diretos de WhatsApp */
  $$("[data-wa]").forEach(a => a.href = wa(a.dataset.wa));

  /* menu mobile */
  const burger = $("#burger"), sheet = $("#sheet");
  const setMenu = open => {
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    sheet.classList.toggle("open", open);
    document.body.classList.toggle("lock", open);
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  sheet.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
  matchMedia("(min-width:860px)").addEventListener("change", e => e.matches && setMenu(false));

  /* trenzinho na barra de rolagem */
  const rail = $("#rail"); let tick = false;
  const onScroll = () => {
    if (tick) return; tick = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      rail.style.setProperty("--p", max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
      tick = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* entradas ao rolar */
  const rv = $$(".rv");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: .12 });
    rv.forEach(el => io.observe(el));
  } else rv.forEach(el => el.classList.add("in"));

  /* barra fixa */
  const dock = $("#dock"), heroCta = $(".hero-cta"), final = $(".final");
  const st = { h: false, f: false };
  const upd = () => dock.classList.toggle("show", st.h && !st.f);
  new IntersectionObserver(([e]) => { st.h = !e.isIntersecting && e.boundingClientRect.top < 0; upd(); }).observe(heroCta);
  new IntersectionObserver(([e]) => { st.f = e.isIntersecting; upd(); }, { threshold: .2 }).observe(final);

  /* indicadores do carrossel de pacotes */
  const wag = $("#wagons"), dots = $$("#dots i");
  if (wag) {
    const ws = $$(".wagon", wag);
    const io2 = new IntersectionObserver(es => es.forEach(e => {
      if (e.intersectionRatio > .6) dots.forEach((d, k) => d.classList.toggle("on", k === ws.indexOf(e.target)));
    }), { root: wag, threshold: [.6] });
    ws.forEach(w => io2.observe(w));
  }

  /* ───── assistente ───── */
  const dlg = $("#wiz"), steps = $$(".stp", dlg), TOTAL = 4;
  const next = $("#next"), send = $("#send"), skip = $("#skip"), back = $("#wback"), close2 = $("#close2");
  const dataEl = $("#data"), gout = $("#gout"), rec = $("#rec"), sum = $("#sum");
  const state = { i: 0, date: "", guests: 40, age: 5, pack: "" };
  const fmtLong = iso => { const [y, m, d] = iso.split("-").map(Number); return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(y, m - 1, d)); };
  const fmtShort = d => new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "numeric", month: "short" }).format(d).replace(".", "");
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const suggest = n => n <= 30 ? "Passeio" : n <= 50 ? "Expresso" : "Grande Viagem";

  const today = new Date(); dataEl.min = iso(today);
  const sat = new Date(today); sat.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));
  const sat2 = new Date(sat); sat2.setDate(sat.getDate() + 7);
  const dchips = $("#dchips");
  [[sat, "Este sábado"], [sat2, "Sábado seguinte"]].forEach(([d, l]) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.setAttribute("aria-pressed", "false"); b.dataset.iso = iso(d);
    b.innerHTML = `${l}<small>${fmtShort(d)}</small>`; dchips.append(b);
  });
  const setDate = v => { state.date = v; dataEl.value = v; $$(".chip", dchips).forEach(c => c.setAttribute("aria-pressed", c.dataset.iso === v)); refresh(); };
  dchips.addEventListener("click", e => { const c = e.target.closest(".chip"); if (c) setDate(c.dataset.iso); });
  dataEl.addEventListener("change", () => setDate(dataEl.value));

  const gchips = $("#gchips");
  [20, 30, 40, 50, 60, 80].forEach(n => { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.n = n; b.setAttribute("aria-pressed", "false"); b.textContent = n; gchips.append(b); });
  const setGuests = n => {
    state.guests = Math.max(10, Math.min(150, n));
    gout.firstChild.nodeValue = state.guests;
    $$(".chip", gchips).forEach(c => c.setAttribute("aria-pressed", +c.dataset.n === state.guests));
    const p = suggest(state.guests);
    rec.textContent = `Para ${state.guests} convidados, indicamos o ${p}.`;
    if (!state.packTouched) state.pack = p;
    refresh();
  };
  gchips.addEventListener("click", e => { const c = e.target.closest(".chip"); if (c) setGuests(+c.dataset.n); });
  $$("[data-g]", dlg).forEach(b => b.addEventListener("click", () => setGuests(state.guests + +b.dataset.g)));

  const ag = $("#agegrid");
  for (let a = 1; a <= 12; a++) { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.a = a; b.setAttribute("aria-pressed", "false"); b.textContent = a === 12 ? "12+" : a; ag.append(b); }
  ag.addEventListener("click", e => {
    const c = e.target.closest(".chip"); if (!c) return;
    state.age = +c.dataset.a; $$(".chip", ag).forEach(x => x.setAttribute("aria-pressed", x === c));
    setTimeout(() => go(3), reduce ? 0 : 260);
  });

  $("#opts").addEventListener("change", e => { state.pack = e.target.value; state.packTouched = true; refresh(); });

  const message = () => [
    "Olá! Vi o site do Buffet Trem da Alegria e quero um orçamento para uma festa.",
    "",
    `📅 Data: ${state.date ? fmtLong(state.date) : "ainda não definida"}`,
    `👧 Convidados: ${state.guests}`,
    `🎂 Aniversariante: ${state.age >= 12 ? "12 anos ou mais" : state.age + (state.age === 1 ? " ano" : " anos")}`,
    `🎁 Pacote: ${state.pack || "preciso de ajuda para escolher"}`,
    "",
    "A data está disponível?"
  ].join("\n");

  function refresh() {
    $$('input[name=pk]', dlg).forEach(r => r.checked = r.value === state.pack);
    const p = suggest(state.guests);
    $$(".opt", dlg).forEach(o => { const b = $("b", o); $(".badge", b)?.remove(); if (o.querySelector("input").value === p) b.insertAdjacentHTML("beforeend", '<span class="badge">indicado</span>'); });
    sum.innerHTML = `<span>📅 ${state.date ? fmtLong(state.date) : "Data ainda não definida"}</span><span>👧 ${state.guests} convidados</span><span>🎂 ${state.age >= 12 ? "12 anos ou mais" : state.age + (state.age === 1 ? " ano" : " anos")}</span>`;
    send.href = wa(message());
  }

  function go(i, dir) {
    const prev = state.i; state.i = i;
    steps.forEach((s, k) => { s.classList.toggle("on", k === i); s.classList.toggle("back", (dir ?? (i < prev ? -1 : 1)) < 0); });
    const prog = $("#prog"); prog.style.setProperty("--s", Math.min(i, TOTAL - 1) / (TOTAL - 1));
    back.classList.toggle("on", i > 0 && i < 4);
    next.hidden = i >= 3; send.hidden = i !== 3; skip.hidden = i !== 0; close2.hidden = i !== 4;
    next.textContent = i === 0 && !state.date ? "Continuar" : "Continuar";
    $("#wlive").textContent = i < 4 ? `Passo ${i + 1} de ${TOTAL}` : "Mensagem pronta";
    $(".w-body", dlg).scrollTop = 0;
    if (i === 3) refresh();
    if (i === 2) next.hidden = true; // idade avança sozinha
  }

  function open(pack) {
    state.packTouched = false; state.pack = ""; state.i = 0;
    setGuests(state.guests);
    if (pack) { state.pack = pack; state.packTouched = true; }
    $$(".chip", ag).forEach(x => x.setAttribute("aria-pressed", +x.dataset.a === state.age));
    go(0, 1); setMenu(false);
    if (!dlg.open) dlg.showModal();
    document.body.classList.add("lock");
  }
  const shut = () => { dlg.close(); };
  dlg.addEventListener("close", () => document.body.classList.remove("lock"));
  dlg.addEventListener("click", e => { if (e.target === dlg) shut(); });
  $("#wx").addEventListener("click", shut); close2.addEventListener("click", shut);
  back.addEventListener("click", () => go(state.i - 1, -1));
  next.addEventListener("click", () => go(state.i + 1, 1));
  skip.addEventListener("click", () => { setDate(""); go(1, 1); });
  $$("[data-open]").forEach(b => b.addEventListener("click", () => open(b.dataset.pack)));

  function confetti() {
    if (reduce) return;
    const box = document.createElement("div"); box.className = "conf"; dlg.append(box);
    const cols = ["#F2512F", "#FFC83D", "#8EE0C0", "#1E3FAE", "#25D366"];
    for (let k = 0; k < 36; k++) {
      const i = document.createElement("i");
      i.style.cssText = `--c:${cols[k % 5]};--x:${(Math.random() - .5) * 360}px;--y:${Math.random() * 380 + 60}px;--r:${Math.random() * 720}deg;animation-delay:${Math.random() * .12}s`;
      box.append(i);
    }
    setTimeout(() => box.remove(), 1700);
  }
  send.addEventListener("click", () => {
    $("#again").href = send.href; confetti();
    setTimeout(() => go(4, 1), 450);
  });
})();
