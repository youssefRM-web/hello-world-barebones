import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { BuildingSelector } from './building-selector'
import { usePermissions } from '@/contexts/PermissionsContext'
import { useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import MendigoLogo from '../media/Mendigo_Logo.png'
// import LogoIso from '../media/logo-iso.png'

export function AppSidebar() {
  const { canAccess, isAdmin } = usePermissions()
  const { state } = useSidebar()
  const location = useLocation()
  
  // Filter nav groups based on permissions
  const filteredNavGroups = useMemo(() => {
    return sidebarData.navGroups.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        // If no permission field, show the item (like Help)
        if (!item.permission) return true
        // Admins see everything
        if (isAdmin) return true
        // Check if user has access to this section
        return canAccess(item.permission as any)
      }),
    })).filter((group) => group.items.length > 0) // Remove empty groups
  }, [canAccess, isAdmin])

  // Force re-render when location changes to ensure active state is correct
  useEffect(() => {
    // This effect ensures the sidebar updates when the route changes
  }, [location.pathname])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className='border-b'>
        <div className="flex items-center justify-start gap-3 px-2 py-3 h-12 w-48 ">
          {/* <img 
            src={state === 'collapsed' ? LogoIso : MendigoLogo} 
            alt="Logo" 
            className={state === 'collapsed' ? 'h-8 w-8 object-cover' : 'object-cover'} 
          /> */}
        </div>
      </SidebarHeader>
      <div className="py-4 px-3 bg-white">

        <BuildingSelector />
      </div>
      <SidebarContent>
        {filteredNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      {/*  <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  )
}