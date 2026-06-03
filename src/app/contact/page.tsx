export const metadata = {
  title: "Contact — Kashiphilia",
};

export default function Contact() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Contact
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Get in touch with the Kashiphilia team.
        </p>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-2">Contact details</h2>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>
            <strong>Email:</strong>{" "}
            <a
              href="mailto:Kashiphilia@gmail.com"
              className="text-blue-600 underline"
            >
              Kashiphilia@gmail.com
            </a>
          </li>
          <li>
            <strong>Developer:</strong>{" "}
            <a
              href="mailto:er.skm.dev@gmail.com"
              className="text-blue-600 underline"
            >
              er.skm.dev@gmail.com
            </a>
          </li>
          <li>
            <strong>Location:</strong> Varanasi — Kashi — Banaras
          </li>
        </ul>
      </div>
    </div>
  );
}
