"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

const chartData = [
  { name: "TTS", value: 245, color: "#8884d8" },
  { name: "STT", value: 189, color: "#82ca9d" },
  { name: "Noise Reduction", value: 67, color: "#ffc658" },
]

const chartConfig = {
  value: {
    label: "Usage",
    color: "hsl(var(--chart-1))",
  },
}

export default function AdminChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Usage</CardTitle>
        <CardDescription>API calls by feature type this month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
