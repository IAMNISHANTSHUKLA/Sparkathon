import { Home, LayoutDashboard, Package, Settings, Scan, TrendingUp, Route, Shield } from 'lucide-react'

export const navigations = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    description: "Navigate to the home page"
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Access your personalized dashboard"
  },
  {
    name: "Products",
    href: "/products",
    icon: Package,
    description: "Manage and view your products"
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Configure your application settings"
  },
  {
    name: "Shelf Scanner",
    href: "/shelf-scan",
    icon: Scan,
    description: "AI-powered shelf scanning for inventory monitoring"
  },
  {
    name: "Demand API",
    href: "/demand-api",
    icon: TrendingUp,
    description: "Smart demand forecasting API service"
  },
  {
    name: "Route Optimizer",
    href: "/route-optimizer",
    icon: Route,
    description: "Autonomous route planning for delivery optimization"
  },
  {
    name: "Food Trace",
    href: "/food-trace",
    icon: Shield,
    description: "Blockchain food provenance and traceability"
  }
]
