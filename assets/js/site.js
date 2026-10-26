/* Tamu Ridge Coffee Co. : site behaviour (hash panels, WhatsApp/email contact form, share links).
   Loaded on every page after main.js. Every block starts with an existence guard. */
(function () {
  "use strict";

  // Edit these three values (and the README checklist) when the real details are known.
  const CONTACT = { whatsapp: "254700000000", email: "hello@tamuridge.example", brand: "Tamu Ridge Coffee Co." };
  const DISPLAY_PHONE = "+254 700 000 000";

  /**
   * Hash panels: one HTML page holds several items, location.hash chooses which is visible.
   */
  (function panels() {
    const root = document.querySelector("[data-panels]");
    if (!root) return;
    const items = Array.from(root.querySelectorAll("[data-panel]"));
    if (!items.length) return;
    const links = Array.from(document.querySelectorAll("[data-panel-link]"));
    let firstRun = true;

    function show() {
      const wanted = decodeURIComponent(location.hash.slice(1));
      const current = items.find((p) => p.dataset.panel === wanted) || items[0];
      items.forEach((p) => { p.hidden = p !== current; });
      links.forEach((a) => {
        const on = a.hash.slice(1) === current.dataset.panel;
        a.classList.toggle("active", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
      const plain = current.dataset.title;
      document.title = plain + " | " + CONTACT.brand;
      const h1 = document.querySelector(".page-title h1");
      if (h1) h1.textContent = plain;
      const crumb = document.querySelector(".breadcrumbs .current");
      if (crumb) crumb.textContent = plain;
      if (!firstRun) {
        const top = root.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
      }
      firstRun = false;
      if (window.AOS && typeof window.AOS.refresh === "function") window.AOS.refresh();
    }

    window.addEventListener("hashchange", show);
    show();
  })();

  /**
   * Contact form: opens a pre-filled WhatsApp message, or an email as the fallback.
   */
  (function contactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const sent = form.querySelector(".sent-message");
    const error = form.querySelector(".error-message");
    const emailBtn = document.getElementById("email-instead");

    function compose() {
      const name = form.elements.name.value.trim();
      const topic = form.elements.topic.value;
      const message = form.elements.message.value.trim();
      return {
        topic: topic,
        text: "Hello " + CONTACT.brand + ", my name is " + name + ". Topic: " + topic + ".\n\n" + message
      };
    }
    function valid() {
      if (error) { error.style.display = "none"; }
      if (!form.checkValidity()) {
        form.reportValidity();
        return false;
      }
      return true;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!valid()) return;
      const m = compose();
      const url = "https://wa.me/" + CONTACT.whatsapp + "?text=" + encodeURIComponent(m.text);
      window.open(url, "_blank", "noopener");
      if (sent) {
        sent.textContent = "Opening WhatsApp. If nothing happens, message us on " + DISPLAY_PHONE + ".";
        sent.style.display = "block";
      }
    });

    if (emailBtn) {
      emailBtn.addEventListener("click", function () {
        if (!valid()) return;
        const m = compose();
        location.href = "mailto:" + CONTACT.email + "?subject=" + encodeURIComponent(m.topic) + "&body=" + encodeURIComponent(m.text);
      });
    }
  })();

  /**
   * Share links on the article page: use the real page title and URL once the page is open.
   */
  (function shareLinks() {
    const wa = document.querySelector('[data-share="whatsapp"]');
    const mail = document.querySelector('[data-share="email"]');
    if (!wa && !mail) return;
    function update() {
      const text = document.title + " " + location.href;
      document.querySelectorAll('[data-share="whatsapp"]').forEach((a) => {
        a.href = "https://wa.me/?text=" + encodeURIComponent(text);
      });
      document.querySelectorAll('[data-share="email"]').forEach((a) => {
        a.href = "mailto:?subject=" + encodeURIComponent(document.title) + "&body=" + encodeURIComponent(text);
      });
    }
    window.addEventListener("hashchange", update);
    window.addEventListener("load", update);
    update();
  })();

  /**
   * Isotope and lazy images change the page height after AOS has measured it, so re-measure.
   */
  (function aosRefresh() {
    function refresh() {
      if (window.AOS && typeof window.AOS.refresh === "function") window.AOS.refresh();
    }
    window.addEventListener("load", function () {
      setTimeout(refresh, 800);
      setTimeout(refresh, 2500);
    });
    let t;
    window.addEventListener("scroll", function () {
      clearTimeout(t);
      t = setTimeout(refresh, 250);
    }, { passive: true });
  })();

  /**
   * Keyboard support for controls that main.js only wires to clicks.
   */
  (function keyboard() {
    function enable(el) {
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          el.click();
        }
      });
    }
    document.querySelectorAll(".faq-item h3").forEach(enable);
    const nav = document.querySelector(".mobile-nav-toggle");
    if (nav) {
      nav.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          nav.click();
        }
      });
    }
  })();
})();
