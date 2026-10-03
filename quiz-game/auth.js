/* Login / register logic (frontend only: data lives in this browser's storage) */
(function () {
  "use strict";
  const S = "sq_session", U = "sq_users";
  const $ = (id) => document.getElementById(id);
  const area = (n) => { try { return window[n]; } catch (e) { return null; } };
  const read = (st, k, d) => { try { const v = st.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };

  // Already signed in? Go straight to the quiz.
  if (read(area("sessionStorage"), S, null) || read(area("localStorage"), S, null)) {
    location.replace("quiz.html");
    return;
  }

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const users = () => read(area("localStorage"), U, {});

  async function hash(pw, salt) {
    const data = new TextEncoder().encode(salt + ":" + pw);
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(buf), (x) => x.toString(16).padStart(2, "0")).join("");
    }
    let h = 5381; data.forEach((x) => { h = ((h << 5) + h) ^ x; });
    return "f" + (h >>> 0).toString(16);
  }

  function signIn(user, keep, msgId) {
    try {
      const ls = area("localStorage"), ss = area("sessionStorage");
      ls.removeItem(S); ss.removeItem(S);
      (keep ? ls : ss).setItem(S, JSON.stringify(user));
      location.replace("quiz.html");
    } catch (e) {
      $(msgId).textContent = "Your browser is blocking site storage. Allow it and try again.";
    }
  }

  // show an error under a field; returns true when there is an error
  function err(id, msg) {
    $(id + "-e").textContent = msg || "";
    $(id).setAttribute("aria-invalid", String(!!msg));
    return !!msg;
  }

  function mode(m) {
    const reg = m === "register";
    $("login-form").hidden = reg;
    $("register-form").hidden = !reg;
    $("tab-login").setAttribute("aria-selected", String(!reg));
    $("tab-register").setAttribute("aria-selected", String(reg));
    $("auth-title").textContent = reg ? "Create your account" : "Welcome back";
    $("auth-sub").textContent = reg
      ? "It takes a few seconds. Your scores are saved in this browser."
      : "Log in to start a round and keep your best score.";
  }
  $("tab-login").onclick = () => mode("login");
  $("tab-register").onclick = () => mode("register");

  document.querySelectorAll(".pw-toggle").forEach((b) => {
    b.onclick = () => {
      const i = $(b.dataset.for), show = i.type === "password";
      i.type = show ? "text" : "password";
      b.textContent = show ? "Hide" : "Show";
      b.setAttribute("aria-pressed", String(show));
    };
  });

  $("r-pw").oninput = () => {
    const p = $("r-pw").value;
    const n = (p.length >= 8) + (/[a-z]/.test(p) && /[A-Z]/.test(p)) + /\d/.test(p) + /[^A-Za-z0-9]/.test(p);
    $("r-hint").textContent = (p ? "Strength: " + ["Weak", "Weak", "Fair", "Good", "Strong"][n] + ". " : "") +
      "Use 8+ characters with a letter and a number.";
  };

  $("login-form").onsubmit = async (e) => {
    e.preventDefault();
    const em = $("l-email").value.trim().toLowerCase(), pw = $("l-pw").value;
    const bad = [
      err("l-email", EMAIL.test(em) ? "" : "Enter a valid email, like name@example.com."),
      err("l-pw", pw ? "" : "Enter your password."),
    ];
    $("l-msg").textContent = "";
    if (bad.some(Boolean)) return;
    const u = users()[em];
    if (!u) { $("l-msg").textContent = "No account uses this email. Select Create account to sign up."; return; }
    if ((await hash(pw, u.salt)) !== u.hash) { err("l-pw", "Password is incorrect. Check it and try again."); return; }
    signIn({ id: em, name: u.name, guest: false }, $("l-keep").checked, "l-msg");
  };

  $("register-form").onsubmit = async (e) => {
    e.preventDefault();
    const nm = $("r-name").value.trim(), em = $("r-email").value.trim().toLowerCase();
    const pw = $("r-pw").value, pw2 = $("r-pw2").value;
    const bad = [
      err("r-name", nm.length >= 2 ? "" : "Enter your name (at least 2 characters)."),
      err("r-email", EMAIL.test(em) ? "" : "Enter a valid email, like name@example.com."),
      err("r-pw", /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(pw) ? "" : "Use 8+ characters with at least one letter and one number."),
      err("r-pw2", pw2 === pw ? "" : "Passwords do not match."),
    ];
    $("r-msg").textContent = "";
    if (bad.some(Boolean)) return;
    const all = users();
    if (all[em]) { err("r-email", "An account with this email exists. Select Log in instead."); return; }
    const salt = window.crypto && crypto.getRandomValues
      ? Array.from(crypto.getRandomValues(new Uint8Array(8)), (x) => x.toString(16).padStart(2, "0")).join("")
      : String(Math.random()).slice(2);
    all[em] = { name: nm, salt: salt, hash: await hash(pw, salt) };
    try { area("localStorage").setItem(U, JSON.stringify(all)); }
    catch (x) { $("r-msg").textContent = "Your browser is blocking site storage. Allow it and try again."; return; }
    signIn({ id: em, name: nm, guest: false }, true, "r-msg");
  };

  $("guest-btn").onclick = () => signIn({ id: "guest", name: "Guest", guest: true }, false, "l-msg");
})();
