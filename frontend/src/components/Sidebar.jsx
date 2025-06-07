import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { 
  TrendingUp, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  UserCheck,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Submissions', href: '/submissions', icon: FileText },
  { name: 'Users', href: '/users', icon: UserCheck, permission: 'create_users' },
  { name: 'Settings', href: '/settings', icon: Settings },
]

function SidebarContent({ onNavigate }) {
  const location = useLocation()
  const { user } = useAuth()

  const filteredNavigation = navigation.filter(item => 
    !item.permission || user?.has_permission?.(item.permission)
  )

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="bg-primary rounded-lg p-2">
          <TrendingUp className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">LeadLift.ai</h1>
          <p className="text-xs text-muted-foreground">Lead Analytics</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredNavigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          
          return (
            <Button
              key={item.name}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11 text-left font-medium",
                isActive && "bg-secondary text-secondary-foreground"
              )}
              onClick={() => onNavigate(item.href)}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Button>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="px-6 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-full p-2">
            <UserCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Sidebar({ open, onOpenChange }) {
  const navigate = useNavigate()

  const handleNavigate = (href) => {
    navigate(href)
    onOpenChange(false)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-card border-r border-border">
        <SidebarContent onNavigate={handleNavigate} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent onNavigate={handleNavigate} />
        </SheetContent>
      </Sheet>
    </>
  )
}

