import giftData from '@/lib/giftData'
import HomeExperience from '@/components/HomeExperience'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Happy Birthday habiby!🎂',
  description: 'A special birthday message for habiby',
}

export default function Home() {
  const data = giftData.yahya || giftData.aya
  return <HomeExperience data={data} />
}
