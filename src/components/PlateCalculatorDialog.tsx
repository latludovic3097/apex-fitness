import { useMemo, useState, type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25]
const PLATE_COLOR: Record<number, string> = {
  25: "#E63946",
  20: "#4A7AAB",
  15: "#F4A261",
  10: "#2A9D8F",
  5: "#1c1c1e",
  2.5: "#6c6c70",
  1.25: "#b0b0b5",
}

function platesPerSide(target: number, bar: number): { plate: number; n: number }[] {
  let perSide = (target - bar) / 2
  if (perSide <= 0) return []
  const result: { plate: number; n: number }[] = []
  for (const p of PLATES) {
    const n = Math.floor(perSide / p)
    if (n > 0) {
      result.push({ plate: p, n })
      perSide = +(perSide - n * p).toFixed(3)
    }
  }
  return result
}

export function PlateCalculatorDialog({ trigger }: { trigger: ReactNode }) {
  const [target, setTarget] = useState(60)
  const [bar, setBar] = useState(20)
  const plates = useMemo(() => platesPerSide(target, bar), [target, bar])
  const reachable = bar + plates.reduce((s, p) => s + p.plate * p.n * 2, 0)

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Plate calculator</DialogTitle>
          <DialogDescription>Disques à charger de chaque côté de la barre.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pc-target">Charge cible (kg)</Label>
            <Input
              id="pc-target"
              type="number"
              inputMode="decimal"
              value={target}
              onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pc-bar">Barre (kg)</Label>
            <Input
              id="pc-bar"
              type="number"
              inputMode="decimal"
              value={bar}
              onChange={(e) => setBar(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="mt-2 rounded-xl border border-border bg-secondary p-4">
          {plates.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Charge ≤ barre — aucun disque.
            </p>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {plates.map(({ plate, n }) => (
                <div
                  key={plate}
                  className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-white"
                  style={{ background: PLATE_COLOR[plate] }}
                >
                  <span className="font-mono text-base font-black">{plate}</span>
                  <span className="text-[11px] font-bold opacity-90">×{n}</span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">
            Par côté · total atteignable : <b className="text-foreground">{reachable} kg</b>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
