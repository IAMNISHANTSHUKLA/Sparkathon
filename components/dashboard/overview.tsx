"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    total: 1530,
  },
  {
    name: "Feb",
    total: 2200,
  },
  {
    name: "Mar",
    total: 1900,
  },
  {
    name: "Apr",
    total: 2800,
  },
  {
    name: "May",
    total: 2500,
  },
  {
    name: "Jun",
    total: 3100,
  },
  {
    name: "Jul",
    total: 2800,
  },
  {
    name: "Aug",
    total: 3300,
  },
  {
    name: "Sep",
    total: 3600,
  },
  {
    name: "Oct",
    total: 3200,
  },
  {
    name: "Nov",
    total: 3800,
  },
  {
    name: "Dec",
    total: 4100,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
