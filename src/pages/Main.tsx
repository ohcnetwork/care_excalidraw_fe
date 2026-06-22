import { Button } from "@/components/careui/button";
import manifest from "@/manifest";

export default function Main() {
  const remoteEntryUrl = `${window.location.origin}/assets/remoteEntry.js`;
  const careUrl = import.meta.env.VITE_CARE_URL || "http://localhost:4000";

  const appMeta = `{
  "url": "${remoteEntryUrl}",
  "name": "${manifest.plugin}"
}`;

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
      <main className="w-full rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-neutral-900">
          {manifest.plugin}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Plugin development status page.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <a href="/assets/remoteEntry.js" target="_blank" rel="noreferrer">
              Open Remote Entry
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="/assets/main.js" target="_blank" rel="noreferrer">
              Open Main Bundle
            </a>
          </Button>
        </div>

        <section className="mt-8 rounded-md border border-neutral-200 bg-neutral-50 p-4">
          <h2 className="text-base font-semibold text-neutral-900">
            Enable this app in CARE
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-neutral-700">
            <li>
              Open CARE Admin at{" "}
              <a
                href={`${careUrl}/admin`}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-900 underline"
              >
                {`${careUrl}/admin`}
              </a>
              .
            </li>
            <li>Go to Apps and choose Add New Config.</li>
            <li>Choose any slug, then paste this JSON in Meta:</li>
          </ol>
          <pre className="mt-3 overflow-x-auto rounded-md border border-neutral-200 bg-white p-3 text-xs text-neutral-800">
            {appMeta}
          </pre>
          <p className="mt-3 text-sm text-neutral-700">
            Save the config and reload CARE to load this plugin.
          </p>
        </section>
      </main>
    </div>
  );
}
