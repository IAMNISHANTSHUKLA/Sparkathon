import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export type ShipmentStatus = "in-transit" | "delivered" | "delayed" | "customs"

export interface Shipment {
  id: string
  origin: string
  destination: string
  carrier: string
  status: ShipmentStatus
  eta: string
  value: string
}

interface RecentShipmentsProps {
  shipments: Shipment[]
}

export function RecentShipments({ shipments }: RecentShipmentsProps) {
  return (
    <div className="space-y-8">
      {shipments.map((shipment) => (
        <div key={shipment.id} className="flex items-center">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage src={`/placeholder.svg?height=36&width=36`} alt={shipment.carrier} />
            <AvatarFallback>{shipment.carrier.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1 flex-1">
            <p className="text-sm font-medium leading-none">{shipment.id}</p>
            <p className="text-sm text-muted-foreground">
              {shipment.origin} → {shipment.destination}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {shipment.status === "in-transit" && (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
              >
                In Transit
              </Badge>
            )}
            {shipment.status === "delivered" && (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
              >
                Delivered
              </Badge>
            )}
            {shipment.status === "delayed" && (
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
              >
                Delayed
              </Badge>
            )}
            {shipment.status === "customs" && (
              <Badge
                variant="outline"
                className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800"
              >
                Customs
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
