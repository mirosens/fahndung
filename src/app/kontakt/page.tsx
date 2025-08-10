import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, AlertTriangle } from "lucide-react";
import StaticPageLayout from "~/components/layout/StaticPageLayout";

export const metadata: Metadata = {
  title: "Kontakt | LKA Baden-Württemberg",
  description: "Kontaktinformationen des Landeskriminalamts Baden-Württemberg",
};

export default function KontaktPage() {
  return (
    <StaticPageLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="mb-8 text-3xl font-bold">Kontakt</h1>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Hauptkontakt */}
            <div className="space-y-6">
              <section>
                <h2 className="mb-4 text-2xl font-semibold">
                  Landeskriminalamt Baden-Württemberg
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p className="text-muted-foreground dark:text-muted-foreground">
                        Taubenheimstraße 85
                        <br />
                        70372 Stuttgart
                        <br />
                        Deutschland
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Telefon</p>
                      <p className="text-muted-foreground dark:text-muted-foreground">
                        +49 711 5401-0
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">E-Mail</p>
                      <p className="text-muted-foreground dark:text-muted-foreground">
                        poststelle@lka.polizei.bwl.de
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Öffnungszeiten</p>
                      <p className="text-muted-foreground dark:text-muted-foreground">
                        Montag - Freitag: 8:00 - 16:00 Uhr
                        <br />
                        Samstag, Sonntag: geschlossen
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">Fachbereiche</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Pressestelle</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground">
                      E-Mail: pressestelle@lka.polizei.bwl.de
                      <br />
                      Telefon: +49 711 5401-1001
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold">Datenschutz</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground">
                      E-Mail: datenschutz@lka.polizei.bwl.de
                      <br />
                      Telefon: +49 711 5401-1002
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold">IT-Support</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground">
                      E-Mail: it-support@lka.polizei.bwl.de
                      <br />
                      Telefon: +49 711 5401-1003
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Notfall und wichtige Hinweise */}
            <div className="space-y-6">
              <section className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="mt-1 h-6 w-6 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-200">
                      Notfall
                    </h3>
                    <p className="text-red-700 dark:text-red-300">
                      Bei akuten Notfällen wenden Sie sich bitte an die örtliche
                      Polizei oder den Notruf 110.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">
                  Weitere Kontakte
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Allgemeine Anfragen</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground">
                      Für allgemeine Anfragen nutzen Sie bitte das
                      Kontaktformular oder die oben genannten Kontaktdaten.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold">Presseanfragen</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground">
                      Journalisten wenden sich bitte direkt an die Pressestelle.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold">Datenschutzanfragen</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground">
                      Für Fragen zum Datenschutz kontaktieren Sie bitte den
                      Datenschutzbeauftragten.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  );
}
