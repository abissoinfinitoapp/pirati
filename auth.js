/* =============================================================================
   Login con Supabase Auth (lato browser, nessun server).

   Config in config.js:
     supabaseUrl, supabaseAnonKey  -> il progetto Supabase
     allowedEmails                  -> lista di riserva (bootstrap/override).

   Chi può entrare è nella tabella `giocatori_autorizzati` su Supabase.
   Le richieste di accesso vanno nella tabella `richieste_accesso`.

   Se supabaseUrl/Key sono vuoti l'autenticazione è disattivata (sviluppo).
   ========================================================================== */

window.PIRATI_AUTH = (function () {
  "use strict";

  const cfg = window.PIRATI_CONFIG || {};
  const enabled = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase);
  const bootstrap = (cfg.allowedEmails || []).map((e) => String(e).trim().toLowerCase());
  const CONTACT = cfg.contactEmail || "abissoinfinitoapp@gmail.com";

  let client = null;
  if (enabled) {
    client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: "pirati-auth", flowType: "pkce" }
    });
  }

  /* È autorizzato? Lista di riserva in config, poi tabella giocatori_autorizzati. */
  async function isAllowed(email) {
    const e = String(email || "").trim().toLowerCase();
    if (!e) return false;
    if (bootstrap.includes(e)) return true;
    if (!enabled) return bootstrap.length === 0;
    try {
      const { data } = await client
        .from("giocatori_autorizzati")
        .select("email")
        .eq("email", e)
        .maybeSingle();
      return Boolean(data);
    } catch (err) {
      return false;
    }
  }

  async function currentUser() {
    if (!enabled) return { email: "ospite (login non attivo)", guest: true };
    const { data } = await client.auth.getUser();
    return data && data.user ? data.user : null;
  }

  async function signInWithPassword(email, password) {
    if (!enabled) throw new Error("Login non configurato: compila config.js.");
    const { data, error } = await client.auth.signInWithPassword({
      email: String(email).trim(), password: String(password)
    });
    if (error) throw error;
    if (!(await isAllowed(data.user.email))) {
      await client.auth.signOut();
      const err = new Error("Questa email non è ancora autorizzata a giocare.");
      err.code = "not_allowed";
      throw err;
    }
    return data.user;
  }

  async function signInWithGoogle() {
    if (!enabled) throw new Error("Login non configurato: compila config.js.");
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: location.origin + "/gioco" }
    });
    if (error) throw error;
  }

  async function signOut() {
    if (enabled) { try { await client.auth.signOut(); } catch (e) {} }
    location.href = "/";
  }

  /* Invia una richiesta di accesso (finisce nella tabella richieste_accesso). */
  async function requestAccess(email, messaggio) {
    if (!enabled) throw new Error("Non configurato.");
    const { error } = await client
      .from("richieste_accesso")
      .insert({ email: String(email).trim(), messaggio: (messaggio || "").trim() || null });
    if (error) throw error;
  }

  /* In cima al GIOCO: se non c'è sessione valida e autorizzata, torna alla home. */
  async function requireSession() {
    if (!enabled) return true;
    const { data } = await client.auth.getSession();
    const user = data && data.session && data.session.user;
    if (!user) { location.replace("/?login=1"); return false; }
    if (!(await isAllowed(user.email))) {
      try { sessionStorage.setItem("pirati-rifiutata", user.email); } catch (e) {}
      await client.auth.signOut();
      location.replace("/?vietato=1");
      return false;
    }
    return true;
  }

  return {
    enabled, client, contact: CONTACT,
    currentUser, isAllowed, signInWithPassword, signInWithGoogle, signOut, requestAccess, requireSession
  };
})();
