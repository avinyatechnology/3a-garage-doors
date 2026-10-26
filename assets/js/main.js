/* 3A Garage Doors — site interactions */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobile navigation */
  var toggle = document.querySelector(".nav-toggle");
  var backdrop = document.querySelector(".nav-backdrop");
  function setNav(open) {
    root.classList.toggle("nav-open", open);
    if (toggle) toggle.setAttribute("aria-expanded", String(open));
  }
  if (toggle) toggle.addEventListener("click", function () { setNav(!root.classList.contains("nav-open")); });
  if (backdrop) backdrop.addEventListener("click", function () { setNav(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setNav(false); closeLightbox(); } });
  document.querySelectorAll(".nav__links a").forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });

  /* Header shadow on scroll */
  var header = document.querySelector(".header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Hero slider */
  var slides = document.querySelectorAll(".hero__slide");
  var dots = document.querySelectorAll(".hero__dots button");
  if (slides.length > 1) {
    var current = 0, timer;
    var go = function (i) {
      slides[current].classList.remove("is-active");
      if (dots[current]) dots[current].classList.remove("is-active");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      if (dots[current]) dots[current].classList.add("is-active");
    };
    var start = function () { if (!reduceMotion) timer = setInterval(function () { go(current + 1); }, 6500); };
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () { clearInterval(timer); go(i); start(); });
    });
    start();
  }

  /* Scroll reveal */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Gallery lightbox */
  var lightbox = document.querySelector(".lightbox");
  var lbImg = lightbox && lightbox.querySelector("img");
  function closeLightbox() { if (lightbox) lightbox.classList.remove("is-open"); }
  document.querySelectorAll(".gallery figure").forEach(function (fig) {
    fig.setAttribute("tabindex", "0");
    var open = function () {
      var img = fig.querySelector("img");
      if (!lightbox || !img) return;
      lbImg.src = img.src; lbImg.alt = img.alt;
      lightbox.classList.add("is-open");
      lightbox.querySelector("button").focus();
    };
    fig.addEventListener("click", open);
    fig.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
  if (lightbox) lightbox.addEventListener("click", function (e) { if (e.target !== lbImg) closeLightbox(); });

  /* Contact form: validate, then open the visitor's email app with the message filled in */
  var form = document.getElementById("contact-form");
  if (form) {
    var rules = {
      "F-Name": function (v) { return v.trim() ? "" : "Please enter your first name."; },
      "L-Name": function (v) { return v.trim() ? "" : "Please enter your last name."; },
      "phone": function (v) { return v.replace(/\D/g, "").length >= 10 ? "" : "Please enter a valid phone number."; },
      "email": function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address."; },
      "message": function (v) { return v.trim() ? "" : "Please tell us how we can help."; }
    };
    var validate = function (field) {
      var rule = rules[field.name];
      if (!rule) return true;
      var msg = rule(field.value);
      var wrap = field.closest(".field");
      wrap.classList.toggle("has-error", !!msg);
      wrap.querySelector(".field__err").textContent = msg;
      return !msg;
    };
    form.querySelectorAll("input, textarea").forEach(function (f) {
      f.addEventListener("blur", function () { validate(f); });
      f.addEventListener("input", function () { if (f.closest(".field").classList.contains("has-error")) validate(f); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("input, textarea").forEach(function (f) { if (!validate(f)) ok = false; });
      if (!ok) { form.querySelector(".has-error input, .has-error textarea").focus(); return; }
      var d = new FormData(form);
      var subject = d.get("subject") || "Garage door service request";
      var body = [
        "Name: " + d.get("F-Name") + " " + d.get("L-Name"),
        "Phone: " + d.get("phone"),
        "Email: " + d.get("email"),
        "",
        d.get("message")
      ].join("\n");
      window.location.href = "mailto:tony3ag@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      var status = form.querySelector(".form-status");
      if (status) status.textContent = "Thanks! Your email app should open so you can send your message.";
    });
  }

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
