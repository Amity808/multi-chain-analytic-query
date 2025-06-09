"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const NETWORKS = [
  { id: "ethereum", name: "Ethereum", color: "bg-blue-500" },
  { id: "arbitrum", name: "Arbitrum", color: "bg-blue-500" },
  { id: "sepolia", name: "Sepolia", color: "bg-blue-500" },
  { id: "sepolia", name: "Base Sepolia", color: "bg-blue-500" },
  { id: "sepolia", name: "Arbitrum Sepolia", color: "bg-blue-500" },
  { id: "base", name: "Base", color: "bg-blue-500" },
  { id: "bsc", name: "BSC", color: "bg-yellow-500" },
  { id: "tron", name: "Tron", color: "bg-red-500" },
]

interface NetworkSelectorProps {
  selectedNetwork: string
  onNetworkChange: (network: string) => void
}

export function NetworkSelector({ selectedNetwork, onNetworkChange }: NetworkSelectorProps) {
  return (
    <Select value={selectedNetwork} onValueChange={onNetworkChange}>
      <SelectTrigger className="w-48">
        <SelectValue>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${NETWORKS.find((n) => n.id === selectedNetwork)?.color}`} />
            {NETWORKS.find((n) => n.id === selectedNetwork)?.name}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {NETWORKS.map((network) => (
          <SelectItem key={network.id} value={network.id}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${network.color}`} />
              {network.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
