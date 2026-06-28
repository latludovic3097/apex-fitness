export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-black tracking-[1.5px] ${className}`}>
      <span className="text-foreground">FIT</span>
      <span className="text-primary">Stark</span>
    </span>
  )
}
