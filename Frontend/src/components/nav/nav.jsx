import { ModeToggle } from "../mode-toggle"

export default function Nav() {
  return (
    <nav className="max-w-7xl mx-auto w-full flex items-center justify-between p-2">
        <h1>IntelOps</h1>

        <ModeToggle />
    </nav>
  )
}
