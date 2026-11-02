import { notFound } from 'next/navigation'
import giftData from '@/lib/giftData'
import GiftClient from '@/components/GiftClient'
import type { Metadata } from 'next'

interface PageProps {
  params: { id: string }
}

// Generate metadata per gift
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = giftData[params.id.toLowerCase()]
  if (!data) return { title: 'Gift Not Found' }
  return {
    title: `Happy Birthday ${data.name}! 🎂`,
    description: `A special birthday message for ${data.name}`,
  }
}

export default function GiftPage({ params }: PageProps) {
  const id = params.id.toLowerCase()
  const data = giftData[id]

  // Show 404 if ID doesn't exist in data
  if (!data) {
    notFound()
  }

  return <GiftClient data={data} />
}
