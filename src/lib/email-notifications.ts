import { getServerClient } from "~/lib/supabase/supabase-server";

export interface RegistrationNotification {
  userEmail: string;
  userName: string;
  department: string;
  phone?: string;
  registrationDate: string;
}

export interface UserConfirmationEmail {
  userEmail: string;
  userName: string;
  approved: boolean;
}

/**
 * Sendet eine E-Mail-Benachrichtigung an den Super-Admin über eine neue Registrierung
 * Jetzt mit echten E-Mail-Funktionen und Admin-Genehmigungslink
 */
export async function sendRegistrationNotification(
  notification: RegistrationNotification,
) {
  try {
    // Echte E-Mail an ptlsweb@gmail.com senden
    const emailContent = `
🔔 NEUE BENUTZER-REGISTRIERUNG - FAHNDUNG SYSTEM

Ein neuer Benutzer hat sich registriert und wartet auf Ihre Genehmigung.

📋 REGISTRIERUNGS-DETAILS:
Name: ${notification.userName}
E-Mail: ${notification.userEmail}
Abteilung: ${notification.department}
Telefon: ${notification.phone ?? "Nicht angegeben"}
Registriert am: ${notification.registrationDate}

🔗 AKTIONEN:
Genehmigen: http://localhost:3000/admin/approve?email=${encodeURIComponent(notification.userEmail)}&action=approve
Ablehnen: http://localhost:3000/admin/approve?email=${encodeURIComponent(notification.userEmail)}&action=reject

Oder gehen Sie zu: http://localhost:3000/admin/users

💡 ADMIN-PANEL:
- Gehen Sie zu: http://localhost:3000/admin/users
- Melden Sie sich mit Ihren Admin-Daten an
- Klicken Sie auf "Genehmigen" oder "Ablehnen"

---
Fahndung System - Automatische Benachrichtigung
`;

    // Verwende Supabase Edge Function für E-Mail-Versand
    const supabase = getServerClient();
    const result = await supabase.functions.invoke("send-email", {
      body: {
        to: "ptlsweb@gmail.com",
        subject: "🔔 Neue Registrierung - Fahndung System",
        html: emailContent.replace(/\n/g, "<br>"),
        text: emailContent,
      },
    });

    if (result.error) {
      console.error("❌ E-Mail-Versand fehlgeschlagen:", result.error);
      // Fallback: Speichere in Datenbank für späteren Versand
      await saveEmailNotification(notification);
    } else {
    }

    // Speichere auch in der Datenbank für Admin-Panel
    await saveEmailNotification(notification);

    return true;
  } catch (error) {
    console.error("❌ Fehler beim Senden der E-Mail-Benachrichtigung:", error);

    // Fallback: Speichere in Datenbank
    try {
      await saveEmailNotification(notification);
    } catch (dbError) {
      console.error("❌ Auch Datenbank-Speicherung fehlgeschlagen:", dbError);
    }

    return false;
  }
}

/**
 * Speichert E-Mail-Benachrichtigung in der Datenbank
 */
async function saveEmailNotification(notification: RegistrationNotification) {
  try {
    const supabase = getServerClient();
    const result = await supabase.from("user_notifications").insert({
      user_email: notification.userEmail,
      user_name: notification.userName,
      type: "registration_request",
      status: "pending",
      message: `Neue Registrierung von ${notification.userName} (${notification.userEmail}) - Abteilung: ${notification.department}`,
      created_at: new Date().toISOString(),
    });

    if (result.error) {
      console.error(
        "❌ Fehler beim Speichern der Benachrichtigung:",
        result.error,
      );
    } else {
    }
  } catch (error) {
    console.error("❌ Unerwarteter Fehler beim Speichern:", error);
  }
}

/**
 * Sendet Bestätigungs-E-Mail an Benutzer nach Admin-Entscheidung
 */
export async function sendUserConfirmationEmail(
  userEmail: string,
  userName: string,
  approved: boolean,
) {
  try {
    const subject = approved
      ? "✅ Registrierung genehmigt - Fahndung System"
      : "❌ Registrierung abgelehnt - Fahndung System";

    const emailContent = `
${approved ? "✅ GENEHMIGT" : "❌ ABGELEHNT"} - FAHNDUNG SYSTEM

Hallo ${userName},

${
  approved
    ? `Ihre Registrierung für das Fahndung System wurde erfolgreich genehmigt!

Sie können sich jetzt unter http://localhost:3000/login anmelden und das System nutzen.

Bei Fragen wenden Sie sich bitte an den Administrator.`
    : `Ihre Registrierung für das Fahndung System wurde leider abgelehnt.

Bei Fragen wenden Sie sich bitte an den Administrator.`
}

---
Fahndung System - Automatische Benachrichtigung
`;

    // Verwende Supabase Edge Function für E-Mail-Versand
    const supabase = getServerClient();
    const result = await supabase.functions.invoke("send-email", {
      body: {
        to: userEmail,
        subject: subject,
        html: emailContent.replace(/\n/g, "<br>"),
        text: emailContent,
      },
    });

    if (result.error) {
      console.error(
        "❌ E-Mail-Versand an Benutzer fehlgeschlagen:",
        result.error,
      );
    } else {
    }

    // Optional: Speichere Bestätigung in der Datenbank
    try {
      await supabase.from("user_notifications").insert({
        user_email: userEmail,
        user_name: userName,
        type: "registration_confirmation",
        status: approved ? "approved" : "rejected",
        message: approved
          ? "Registrierung genehmigt"
          : "Registrierung abgelehnt",
        created_at: new Date().toISOString(),
      });
    } catch (dbError) {
      console.warn("⚠️ Fehler beim Speichern in Datenbank:", dbError);
    }

    return true;
  } catch (error) {
    console.error("Unerwarteter Fehler bei der Benutzer-Bestätigung:", error);
    return false;
  }
}

/**
 * Sendet tägliche Zusammenfassung an Admin
 */
export async function sendDailySummary() {
  try {
    const supabase = getServerClient();

    // Hole alle ausstehenden Registrierungen
    const result = await supabase
      .from("user_profiles")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (result.error) {
      console.error(
        "❌ Fehler beim Abrufen ausstehender Registrierungen:",
        result.error,
      );
      return false;
    }

    const pendingUsers = result.data;

    if (!pendingUsers || pendingUsers.length === 0) {
      return true;
    }

    const summaryContent = `
📊 TÄGLICHE ZUSAMMENFASSUNG - FAHNDUNG SYSTEM

Es warten ${pendingUsers.length} Registrierung(en) auf Ihre Genehmigung:

${pendingUsers
  .map(
    (user, index) => `
${index + 1}. ${String(user["name"])} (${String(user["email"])})
   Abteilung: ${String(user["department"])}
   Registriert: ${new Date(String(user["created_at"])).toLocaleDateString("de-DE")}
`,
  )
  .join("")}

🔗 Admin-Panel: http://localhost:3000/admin/users

---
Fahndung System - Automatische Zusammenfassung
`;

    // Sende Zusammenfassung an Admin
    const emailResult = await supabase.functions.invoke("send-email", {
      body: {
        to: "ptlsweb@gmail.com",
        subject: `📊 ${pendingUsers.length} ausstehende Registrierung(en) - Fahndung System`,
        html: summaryContent.replace(/\n/g, "<br>"),
        text: summaryContent,
      },
    });

    if (emailResult.error) {
      console.error(
        "❌ Fehler beim Senden der Zusammenfassung:",
        emailResult.error,
      );
    } else {
    }

    return true;
  } catch (error) {
    console.error("❌ Fehler bei der täglichen Zusammenfassung:", error);
    return false;
  }
}
