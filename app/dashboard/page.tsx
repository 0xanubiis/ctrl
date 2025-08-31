"use client"

import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [usage, setUsage] = useState<any>(null)

  useEffect(() => {
    async function fetchUsage() {
      const res = await fetch("/api/audio/usage")
      const data = await res.json()
      setUsage(data)
    }
    fetchUsage()
  }, [])

  if (!usage) return <p>Loading usage...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2">Current Tier: {usage.tier}</p>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(usage.usage).map(([feature, stats]: any) => (
          <div key={feature} className="p-4 border rounded-lg shadow">
            <h2 className="font-semibold">{feature.toUpperCase()}</h2>
            <p>Used: {stats.used}</p>
            <p>Limit: {stats.limit}</p>
            <p>Remaining: {stats.remaining}</p>
            <p>
              Cycle: {new Date(stats.cycleStart).toLocaleDateString()} →{" "}
              {new Date(stats.cycleEnd).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
