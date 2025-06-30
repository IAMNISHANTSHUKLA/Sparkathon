import { AlertTriangle, CheckCircle, Clock } from "lucide-react"

export interface AgentAction {
  id: string
  agent: string
  action: string
  status: "completed" | "pending" | "warning"
  time: string
}

interface AgentActivityProps {
  actions: AgentAction[]
}

export function AgentActivity({ actions }: AgentActivityProps) {
  return (
    <div className="space-y-8">
      {actions.map((action) => (
        <div key={action.id} className="flex items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border">
            {action.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {action.status === "pending" && <Clock className="h-5 w-5 text-amber-500" />}
            {action.status === "warning" && <AlertTriangle className="h-5 w-5 text-red-500" />}
          </div>
          <div className="ml-4 space-y-1 flex-1">
            <p className="text-sm font-medium leading-none">{action.agent}</p>
            <p className="text-sm text-muted-foreground">{action.action}</p>
          </div>
          <div className="ml-auto text-xs text-muted-foreground">{action.time}</div>
        </div>
      ))}
    </div>
  )
}
