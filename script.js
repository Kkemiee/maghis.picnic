/* =========================================================
   Maghi's Picnic
   Everything you may want to change later is in this first
   part: the phone number, payment link and all the prices.
   ========================================================= */

const SETTINGS = {
  whatsapp: "60137343736", // 013-7343736 in international format, no + or spaces
  paymentLink: ""          // paste a payment link here later to show a "Pay online" button
};

// Picnic prices in RM. The first number is for 2 people, the last is for 16.
const PICNIC = {
  basic:      { name: "Basic",                     prices: [79, 84, 89, 94, 103, 108, 113, 123, 128, 133, 138, 147, 152, 157, 162] },
  chandelier: { name: "Flower Chandelier",         prices: [83, 88, 93, 98, 107, 112, 117, 127, 132, 137, 142, 151, 156, 162, 167] },
  flower:     { name: "Flower Background",         prices: [85, 90, 95, 100, 109, 114, 119, 129, 134, 139, 144, 153, 158, 163, 168] },
  balloon:    { name: "Simple Balloon Background", prices: [98, 103, 108, 113, 122, 127, 132, 142, 147, 152, 157, 166, 171, 176, 181] }
};
const NIGHT_EXTRA = 10;
const MIN_PAX = 2;
const MAX_PAX = 16;

// Dome prices in RM for 2, 3-4, 5-6, 7-8 and 9-10 people.
const DOME_TIERS = ["2 people", "3 to 4 people", "5 to 6 people", "7 to 8 people", "9 to 10 people"];
const DOME = {
  dome:        { name: "Dome Package",         prices: [119, 129, 139, 159, 169] },
  fullballoon: { name: "Dome Full Balloon",    prices: [149, 159, 169, 189, 199] },
  character:   { name: "Dome Character Theme", fixed: 188, people: "10 people" },
  double:      { name: "Double Dome",          fixed: 318, people: "" },
  bride:       { name: "Bride To Be",          fixed: 139, people: "5 people" },
  white:       { name: "Dome In White",        fixed: 169, people: "10 people" }
};

// Rental prices in RM for 4 hours.
const RENTAL = {
  dome:    { name: "Dome",    price: 60 },
  parasol: { name: "Parasol", price: 40 },
  table:   { name: "Table",   price: 10 },
  chair:   { name: "Chair",   price: 10 }
};

// Add-on prices in RM.
const ADDONS = { mat: 5, number: 6, fullBalloon: 15, fullBalloonWithNumber: 20 };


/* =========================================================
   Helpers
   ========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const rm = (amount) => "RM" + amount;
const whole = (input) => Math.max(0, Math.floor(Number(input.value) || 0));

function picnicPrice(key, pax, time) {
  return PICNIC[key].prices[pax - MIN_PAX] + (time === "night" ? NIGHT_EXTRA : 0);
}
function domePrice(key, tier) {
  const pkg = DOME[key];
  return pkg.fixed ? pkg.fixed : pkg.prices[tier];
}


/* =========================================================
   Price controls on the package cards
   ========================================================= */

let picnicPax = 2;
let picnicTime = "day";
let domeTier = 0;

function showPicnicPrices() {
  $("#pax-value").textContent = picnicPax;
  $$('[data-price^="picnic:"]').forEach((el) => {
    el.textContent = rm(picnicPrice(el.dataset.price.split(":")[1], picnicPax, picnicTime));
  });
  $$('[data-price-note="picnic"]').forEach((el) => {
    el.textContent = "for " + picnicPax + " people, " + picnicTime;
  });
}
function showDomePrices() {
  $$('[data-price^="dome:"]').forEach((el) => {
    el.textContent = rm(domePrice(el.dataset.price.split(":")[1], domeTier));
  });
  $$('[data-price-note="dome"]').forEach((el) => {
    el.textContent = "for " + DOME_TIERS[domeTier];
  });
}
function press(group, chosen) {
  group.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === chosen));
}

$("#pax-minus").addEventListener("click", () => { picnicPax = Math.max(MIN_PAX, picnicPax - 1); showPicnicPrices(); });
$("#pax-plus").addEventListener("click", () => { picnicPax = Math.min(MAX_PAX, picnicPax + 1); showPicnicPrices(); });
$("#picnic-time").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  picnicTime = b.dataset.time; press($("#picnic-time"), b); showPicnicPrices();
});
$("#dome-tier").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  domeTier = Number(b.dataset.tier); press($("#dome-tier"), b); showDomePrices();
});

// Full picnic price table
(function buildPicnicTable() {
  const keys = Object.keys(PICNIC);
  let html = "<thead><tr><th>People</th>" + keys.map((k) => "<th>" + PICNIC[k].name + "</th>").join("") + "</tr></thead><tbody>";
  for (let pax = MIN_PAX; pax <= MAX_PAX; pax++) {
    html += "<tr><td>" + pax + "</td>" + keys.map((k) => "<td>" + picnicPrice(k, pax, "day") + "</td>").join("") + "</tr>";
  }
  $("#picnic-table").insertAdjacentHTML("beforeend", html + "</tbody>");
})();


/* =========================================================
   Booking form
   ========================================================= */

const f = {
  type: $("#f-type"), picnicPkg: $("#f-picnic-pkg"), pax: $("#f-pax"), time: $("#f-time"),
  domePkg: $("#f-dome-pkg"), tier: $("#f-tier"),
  rDome: $("#r-dome"), rParasol: $("#r-parasol"), rTable: $("#r-table"), rChair: $("#r-chair"),
  mat: $("#a-mat"), number: $("#a-number"), full: $("#a-full"), character: $("#a-character"),
  date: $("#f-date"), clock: $("#f-clock"), place: $("#f-place"), name: $("#f-name"), notes: $("#f-notes")
};

// Fill the package dropdowns from the price lists above
for (const key in PICNIC) f.picnicPkg.add(new Option(PICNIC[key].name, key));
for (const key in DOME) f.domePkg.add(new Option(DOME[key].name, key));

// Earliest date you can pick is today
const today = new Date();
f.date.min = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");

// Works out what was chosen. Returns the lines for the summary and the total.
function readBooking() {
  const lines = [];
  let total = 0;
  const type = f.type.value;

  if (type === "picnic") {
    const pax = Math.min(MAX_PAX, Math.max(MIN_PAX, whole(f.pax) || MIN_PAX));
    const price = picnicPrice(f.picnicPkg.value, pax, f.time.value);
    lines.push([PICNIC[f.picnicPkg.value].name + " picnic, " + pax + " people, " + f.time.value, price]);
    total += price;
  }
  if (type === "dome") {
    const pkg = DOME[f.domePkg.value];
    const people = pkg.fixed ? pkg.people : DOME_TIERS[f.tier.value];
    const price = domePrice(f.domePkg.value, Number(f.tier.value));
    lines.push([pkg.name + (people ? ", " + people : ""), price]);
    total += price;
  }
  if (type === "rental") {
    const counts = { dome: whole(f.rDome), parasol: whole(f.rParasol), table: whole(f.rTable), chair: whole(f.rChair) };
    for (const key in counts) {
      if (counts[key] > 0) {
        const price = counts[key] * RENTAL[key].price;
        lines.push([counts[key] + " x " + RENTAL[key].name + " (4 hours)", price]);
        total += price;
      }
    }
  } else {
    const mats = whole(f.mat), numbers = whole(f.number);
    if (mats > 0) { lines.push([mats + " x Mat", mats * ADDONS.mat]); total += mats * ADDONS.mat; }
    if (f.full.checked && numbers > 0) {
      // The bundle covers the background and one number balloon
      const price = ADDONS.fullBalloonWithNumber + (numbers - 1) * ADDONS.number;
      lines.push(["Full balloon background + " + numbers + " x number balloon", price]); total += price;
    } else if (f.full.checked) {
      lines.push(["Full balloon background", ADDONS.fullBalloon]); total += ADDONS.fullBalloon;
    } else if (numbers > 0) {
      lines.push([numbers + " x Number balloon", numbers * ADDONS.number]); total += numbers * ADDONS.number;
    }
    if (f.character.checked) lines.push(["Character balloons", null]);
  }
  return { lines, total };
}

function showBooking() {
  const type = f.type.value;
  $$(".field-group[data-for]").forEach((group) => { group.hidden = group.dataset.for !== type; });
  $("#addon-fields").hidden = type === "rental";
  $("#f-tier-field").hidden = Boolean(DOME[f.domePkg.value].fixed);

  const { lines, total } = readBooking();
  const list = $("#summary-lines");
  list.textContent = "";
  if (lines.length === 0) {
    list.insertAdjacentHTML("beforeend", "<li><span>Add at least one rental item.</span><span></span></li>");
  }
  lines.forEach(([label, price]) => {
    const li = document.createElement("li");
    const a = document.createElement("span"); a.textContent = label;
    const b = document.createElement("span"); b.textContent = price === null ? "to quote" : rm(price);
    li.append(a, b); list.append(li);
  });
  $("#summary-total").textContent = rm(total);
  $("#form-msg").hidden = true;
}

$("#booking-form").addEventListener("input", showBooking);
$("#booking-form").addEventListener("change", showBooking);
f.pax.addEventListener("blur", () => {
  f.pax.value = Math.min(MAX_PAX, Math.max(MIN_PAX, whole(f.pax) || MIN_PAX));
  showBooking();
});

// "Book ..." buttons on the cards fill in the form and scroll to it
$$("[data-book]").forEach((button) => {
  button.addEventListener("click", () => {
    const [type, key] = button.dataset.book.split(":");
    f.type.value = type;
    if (type === "picnic") { f.picnicPkg.value = key; f.pax.value = picnicPax; f.time.value = picnicTime; }
    if (type === "dome") { f.domePkg.value = key; f.tier.value = domeTier; }
    showBooking();
    $("#book").scrollIntoView();
    f.type.focus({ preventScroll: true });
  });
});

// Build the WhatsApp message and open WhatsApp
$("#send-wa").addEventListener("click", () => {
  const { lines, total } = readBooking();
  const msg = $("#form-msg");
  let problem = "";
  if (lines.length === 0) problem = "Add at least one rental item.";
  else if (!f.date.value) problem = "Choose a date.";
  else if (!f.place.value.trim()) problem = "Tell us the location.";
  else if (!f.name.value.trim()) problem = "Tell us your name.";
  if (problem) { msg.textContent = problem; msg.hidden = false; return; }

  const [y, m, d] = f.date.value.split("-");
  const text = ["Hi Maghi's Picnic! I'd like to book a set-up.", ""];
  lines.forEach(([label, price]) => text.push("- " + label + (price === null ? " (please quote)" : " = " + rm(price))));
  text.push("Estimated total: " + rm(total), "");
  text.push("Date: " + d + "/" + m + "/" + y);
  if (f.clock.value) text.push("Time: " + f.clock.value);
  text.push("Location: " + f.place.value.trim());
  text.push("Name: " + f.name.value.trim());
  if (f.notes.value.trim()) text.push("Notes: " + f.notes.value.trim());

  window.open("https://wa.me/" + SETTINGS.whatsapp + "?text=" + encodeURIComponent(text.join("\n")), "_blank", "noopener");
});

// WhatsApp links and the optional payment button
$$("[data-wa]").forEach((a) => {
  a.href = "https://wa.me/" + SETTINGS.whatsapp + "?text=" + encodeURIComponent("Hi Maghi's Picnic! I have a question about your set-ups.");
  a.target = "_blank"; a.rel = "noopener";
});
if (SETTINGS.paymentLink) { $("#pay-link").href = SETTINGS.paymentLink; $("#pay-link").hidden = false; }


/* =========================================================
   Photo carousels and viewer
   ========================================================= */

const viewer = $("#viewer");
const viewerImg = viewer.querySelector("img");
let viewerSet = [];
let viewerIndex = 0;

function showViewerPhoto() {
  const img = viewerSet[viewerIndex];
  viewerImg.src = img.src;
  viewerImg.alt = img.alt;
  $("#viewer-count").textContent = (viewerIndex + 1) + " / " + viewerSet.length;
  const many = viewerSet.length > 1;
  $("#viewer-prev").hidden = !many;
  $("#viewer-next").hidden = !many;
  $("#viewer-count").hidden = !many;
}
function openViewer(images, index) {
  viewerSet = images;
  viewerIndex = index;
  showViewerPhoto();
  viewer.showModal();
}
function stepViewer(step) {
  viewerIndex = (viewerIndex + step + viewerSet.length) % viewerSet.length;
  showViewerPhoto();
}
$("#viewer-prev").addEventListener("click", () => stepViewer(-1));
$("#viewer-next").addEventListener("click", () => stepViewer(1));
$("#viewer-close").addEventListener("click", () => viewer.close());
viewer.addEventListener("click", (e) => { if (e.target === viewer) viewer.close(); });
viewer.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") stepViewer(-1);
  if (e.key === "ArrowRight") stepViewer(1);
});
let touchX = null;
viewer.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
viewer.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const moved = e.changedTouches[0].clientX - touchX;
  if (Math.abs(moved) > 40) stepViewer(moved < 0 ? 1 : -1);
  touchX = null;
});

$$(".carousel").forEach((carousel) => {
  const track = carousel.querySelector(".track");
  const images = [...track.querySelectorAll("img")];
  const prev = carousel.querySelector(".prev");
  const next = carousel.querySelector(".next");
  const count = carousel.querySelector(".car-count");
  const current = () => Math.round(track.scrollLeft / track.clientWidth);

  function update() {
    const i = current();
    count.textContent = (i + 1) + " / " + images.length;
    prev.disabled = i === 0;
    next.disabled = i === images.length - 1;
  }
  const go = (step) => track.scrollTo({ left: (current() + step) * track.clientWidth, behavior: "smooth" });

  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  track.addEventListener("scroll", update, { passive: true });
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
  });
  images.forEach((img, i) => img.addEventListener("click", () => openViewer(images, i)));
  if (images.length < 2) { prev.hidden = true; next.hidden = true; count.hidden = true; }
  update();
});

// Add-on photos open on their own
$$(".zoom").forEach((button) => {
  button.addEventListener("click", () => openViewer([button.querySelector("img")], 0));
});


// First paint
showPicnicPrices();
showDomePrices();
showBooking();
