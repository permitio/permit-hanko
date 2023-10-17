import { RedirectType, redirect } from 'next/navigation'

export default function Home() {
  return (
    redirect('/notes', RedirectType.replace)
  )
}
