import { PageHeader } from "@/components/Header"

export function PlaceholderScreen({ title, note }: { title: string; note?: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <div className="mx-4 mt-4 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">{note || "Écran en cours de migration."}</p>
      </div>
    </div>
  )
}
