"use client";

import { Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

const topics = ["A custom order", "Wedding & Nikkah", "Eid / Ramadan", "An existing order", "Something else"];

/**
 * The live site's contact form posts to WPForms on WordPress. This front end has no
 * server mailbox of its own, so the message is handed to WhatsApp or the visitor's
 * email client — both reach the same Shahpara inbox the live form does.
 */
export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState(topics[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const compose = () => [`Hello Shahpara,`, ``, message.trim(), ``, `— ${name.trim()}${phone.trim() ? ` (${phone.trim()})` : ""}`, `Topic: ${topic}`].join("\n");

  const valid = () => {
    if (!name.trim() || !message.trim()) {
      setError("Please add your name and a message.");
      return false;
    }
    setError(null);
    return true;
  };

  return (
    <form
      className="mt-8 space-y-7"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (valid()) window.open(whatsappLink(compose()), "_blank", "noopener,noreferrer");
      }}
    >
      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="ct-name" className="field-label">
            Your name <span className="text-rose-deep">*</span>
          </label>
          <input id="ct-name" className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </div>
        <div>
          <label htmlFor="ct-phone" className="field-label">
            Phone (optional)
          </label>
          <input id="ct-phone" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" />
        </div>
      </div>
      <fieldset>
        <legend className="field-label mb-3">What’s it about?</legend>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <label key={t} className={cn("cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-stamp", topic === t ? "border-ink bg-ink text-paper" : "border-ink/20 hover:border-ink/50")}>
              <input type="radio" name="topic" className="sr-only" checked={topic === t} onChange={() => setTopic(t)} />
              {t}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="ct-message" className="field-label">
          Message <span className="text-rose-deep">*</span>
        </label>
        <textarea id="ct-message" rows={5} className="field resize-y" value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={1500} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-rose-deep">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-stamp px-6 text-sm font-semibold text-paper transition-colors hover:bg-stamp-deep">
          <MessageCircle className="h-4 w-4" /> Send on WhatsApp
        </button>
        <button
          type="button"
          onClick={() => {
            if (valid()) window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(`${topic} — ${name.trim()}`)}&body=${encodeURIComponent(compose())}`;
          }}
          className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-ink/80 px-6 text-sm font-semibold transition-colors hover:bg-ink hover:text-paper"
        >
          <Mail className="h-4 w-4" /> Send by email
        </button>
      </div>
    </form>
  );
}
