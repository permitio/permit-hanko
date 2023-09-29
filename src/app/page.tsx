import Image from 'next/image'
import styles from './page.module.css'
import { RedirectType, redirect } from 'next/navigation'

export default function Home() {
  return (
    redirect('/notes', RedirectType.replace)
  )
}
