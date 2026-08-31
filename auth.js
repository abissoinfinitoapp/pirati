/* =============================================================================
   Login con Supabase Auth (lato browser, nessun server).

   Config in config.js:
     supabaseUrl, supabaseAnonKey  -> il progetto Supabase
     allowedEmails                  -> elenco di email ammesse (invito).
                                       Vuoto = chiunque abbia un account entra.

   Se supabaseUrl/Key sono vuoti l'autenticazione è disattivata (sviluppo).
   ========================================================================== */

window.PIRATI_AUTH = (function () {
  "use strict";

  const cfg = window.PIRATI_CONFIG || {};
  const enabled = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase);
  const allow = (cfg.allowedEmails || []).map((e) => String(e).trim().toLowerCase());

  let client = null;
  if (enabled) {
    client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: "pirati-auth", flowType: "pkce" }
    });
  }

  function isAllowed(email) {
    if (!allow.length) return true;
    return allow.includes(String(email || "").trim().toLowerCase());
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
    if (!isAllowed(data.user.email)) {
      await client.auth.signOut();
      throw new Error("Questo account non è tra quelli autorizzati.");
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
    // il browser viene reindirizzato a Google e poi torna su /gioco
  }

  async function signOut() {
    if (enabled) { try { await client.auth.signOut(); } catch (e) {} }
    location.href = "/";
  }

  /* In cima al GIOCO: se non c'è sessione valida e ammessa, torna alla home. */
  async function requireSession() {
    if (!enabled) return true;
    const { data } = await client.auth.getSession();
    const user = data && data.session && data.session.user;
    if (!user) { location.replace("/?login=1"); return false; }
    if (!isAllowed(user.email)) {
      await client.auth.signOut();
      location.replace("/?vietato=1");
      return false;
    }
    return true;
  }

  return { enabled, client, currentUser, signInWithPassword, signInWithGoogle, signOut, requireSession, isAllowed };
})();
