import Link from "next/link";

/* Portal dashboard blocks. Dense by design: this audience arrives for one
 * specific thing, so every feature gets a visible entry point rather than
 * living behind a menu. */

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-lg border border-line-strong bg-surface ${className}`}
    >
      <header className="flex items-center justify-between gap-3 bg-cream px-4 py-2.5">
        <h2 className="font-display text-sm font-semibold tracking-tight text-fg">
          {title}
        </h2>
        {action && (
          <Link
            href={action.href}
            className="text-xs font-medium text-accent-ink hover:underline"
          >
            {action.label}
          </Link>
        )}
      </header>
      <div className="rule-accent h-px" />
      {children}
    </section>
  );
}

export type Feature = {
  name: string;
  note: string;
  href: string;
  ready: boolean;
  icon: React.ComponentType<{ className?: string }>;
};

/** Feature tiles. `ready: false` renders muted and unlinked — we never imply
 * something is built when it isn't. */
export function FeatureGrid({ items }: { items: readonly Feature[] }) {
  return (
    <ul className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ icon: Icon, ...item }) => {
        const body = (
          <>
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-sm ${
                item.ready
                  ? "bg-accent-tint text-accent-ink"
                  : "bg-line-strong text-dim"
              }`}
            >
              <Icon className="size-4.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{item.name}</span>
              <span className="mt-0.5 block text-xs text-muted">{item.note}</span>
              {!item.ready && (
                <span className="mt-1.5 inline-block rounded-sm bg-line-strong px-1.5 py-0.5 text-2xs font-medium uppercase tracking-wide text-muted">
                  Not built
                </span>
              )}
            </span>
          </>
        );
        return (
          <li key={item.name}>
            {item.ready ? (
              <Link
                href={item.href}
                className="flex h-full items-start gap-3 bg-surface px-4 py-3.5 text-fg transition duration-200 hover:bg-accent-wash"
              >
                {body}
              </Link>
            ) : (
              <div className="flex h-full items-start gap-3 bg-cream px-4 py-3.5 text-dim">
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function StatRow({
  stats,
}: {
  stats: readonly { value: string; label: string }[];
}) {
  return (
    <dl className="grid grid-cols-3 gap-px bg-line">
      {stats.map((s) => (
        <div key={s.label} className="bg-surface px-3 py-3 text-center">
          <dt className="sr-only">{s.label}</dt>
          <dd>
            <span className="block font-display text-base font-semibold text-fg">
              {s.value}
            </span>
            <span className="mt-0.5 block text-2xs uppercase tracking-wide text-muted">
              {s.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
