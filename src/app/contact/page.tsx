export const metadata = {
  title: "Contact — Kashiphilia",
};

export default function Contact() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Contact
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          We'd love to hear from you — questions, feedback, or collaboration.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Contact details</h2>

          <dl className="space-y-4 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-slate-400 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16v16H4z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <div>
                <dt className="font-medium text-slate-800">Email</dt>
                <dd className="mt-1">
                  <a
                    href="mailto:Kashiphilia@gmail.com"
                    className="text-brand-600 underline"
                  >
                    Kashiphilia@gmail.com
                  </a>
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-slate-400 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v6" />
                <path d="M20 7v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7" />
              </svg>
              <div>
                <dt className="font-medium text-slate-800">Developer</dt>
                <dd className="mt-1">
                  <a
                    href="mailto:er.skm.dev@gmail.com"
                    className="text-brand-600 underline"
                  >
                    er.skm.dev@gmail.com
                  </a>
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-slate-400 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <dt className="font-medium text-slate-800">Location</dt>
                <dd className="mt-1 text-slate-700">
                  Varanasi — Kashi — Banaras
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold mb-3">Visit & Hours</h3>
          <p className="text-sm text-slate-600 mb-4">
            We're based in Varanasi; remote work is available. For meetings or
            collaborations, please email first to schedule.
          </p>

          <div className="w-full overflow-hidden rounded-md border border-slate-100 bg-slate-50">
            <div className="p-3 text-center text-xs text-slate-500">
              Map — Varanasi
            </div>
            <iframe
              title="Varanasi map"
              className="w-full h-56"
              src="https://www.openstreetmap.org/export/embed.html?bbox=82.96%2C25.31%2C82.99%2C25.33&layer=mapnik&marker=25.3176%2C82.9739"
              style={{ border: 0 }}
              loading="lazy"
            />
            <div className="p-3 text-center text-xs">
              <a
                href="https://www.openstreetmap.org/?mlat=25.3176&mlon=82.9739#map=14/25.3176/82.9739"
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 underline"
              >
                View larger map on OpenStreetMap
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
