// =====================================================================
// Vibe Coding block: Format details header (Block 1 of /ugc-formats)
// =====================================================================
// Shows three fields: name, description, adaptable-to tags. Nothing else.
//
// SOFTR UI SETUP:
//   Source tab → Database: brieflee leads → Table: Formats
//   Visibility tab → public
//   Conditional filters → Bev configures in Softr UI.
// =====================================================================

import { useRecord, useCurrentRecordId, q } from "@/lib/datasource";

const formatFields = q.select({
  emoji:        "3e7hB",
  name:         "DTyOH",
  description:  "bHmfU",
  adaptableTag: "Za8v7",  // multi-SELECT — replaces the old comma-list LONG_TEXT
});

export default function Block() {
  const recordId = useCurrentRecordId();
  const { data: record } = useRecord({ recordId, select: formatFields });
  const f = record?.fields || {};

  const emoji = f.emoji || "";
  const name = f.name || "";
  const description = f.description || "";
  const adaptable = Array.isArray(f.adaptableTag)
    ? f.adaptableTag.map((x) => x?.label).filter(Boolean)
    : [];

  return (
    <div className="container py-10 md:py-12">
      <div className="content max-w-6xl mx-auto">
        {name && (
          <h1 className="text-2xl md:text-3xl font-normal text-foreground mb-3 leading-snug">
            {emoji && <span className="mr-2" aria-hidden="true">{emoji}</span>}
            {name}
          </h1>
        )}

        {description && (
          <p className="text-foreground leading-relaxed mb-6">
            {description}
          </p>
        )}

        {adaptable.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {adaptable.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center text-sm font-normal px-3 py-1 rounded-xl border border-border bg-card text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
