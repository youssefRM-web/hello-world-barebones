import * as React from 'react'
import { ChevronDown, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useBuilding } from '@/contexts/BuildingContext'
import { useBuildingsQuery } from '@/hooks/queries'
import { useBuildingSelection } from '@/contexts/BuildingSelectionContext'
import { useLanguage } from '@/contexts/LanguageContext'

export function BuildingSelector() {
  const { isMobile } = useSidebar()
  const { selectedBuilding, setSelectedBuilding } = useBuilding()
  const { setSelectedBuildingId } = useBuildingSelection()
  const { affectedBuildings } = useBuildingsQuery()
  const { t } = useLanguage()

  const handleBuildingSelect = (building: any) => {
    setSelectedBuilding(building)
    setSelectedBuildingId(building._id)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu >
          <DropdownMenuTrigger asChild className="border">
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground px-2'
            >
              {selectedBuilding ? (
                <>
                  <Avatar className='h-10 w-10 rounded-md'>
                    <AvatarImage 
                      src={selectedBuilding.photo} 
                      alt={selectedBuilding.label}
                      className="object-cover"
                    />
                    <AvatarFallback className='bg-primary text-primary-foreground text-2xl rounded-md'>
                      {selectedBuilding.label?.[0]?.toUpperCase() ?? '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-start text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      {selectedBuilding.label}
                    </span>
                    <span className='truncate text-xs'>
                      {selectedBuilding?.organization_id?.name}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className='bg-primary h-8 w-8 text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md'>
                    <Building2 className='h-5 w-5' />
                  </div>
                  <div className='grid flex-1 text-start text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      {t("nav.allBuildings")}
                    </span>
                  </div>
                </>
              )}
              <ChevronDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg flex flex-col max-h-80'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs shrink-0'>
              {t("pages.building")}
            </DropdownMenuLabel>
            <div className='flex-1 overflow-y-auto min-h-0'>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedBuilding(null)
                  setSelectedBuildingId(null)
                }}
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border'>
                  <Building2 className='h-4 w-4' />
                </div>
                {t("nav.allBuildings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {affectedBuildings?.map((building) => (
                <DropdownMenuItem
                  key={building._id}
                  onClick={() => handleBuildingSelect(building)}
                  className='gap-2 p-2'
                >
                  <Avatar className='h-6 w-6 rounded-sm'>
                    <AvatarImage 
                      src={building.photo} 
                      alt={building.label}
                      className="object-cover"
                    />
                    <AvatarFallback className='bg-primary text-primary-foreground rounded-sm text-xs'>
                      {building.label?.[0]?.toUpperCase() ?? '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col'>
                    <span className='text-sm font-medium'>{building.label}</span>
                    <span className='text-xs text-muted-foreground'>
                      {building?.organization_id?.name}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator className='shrink-0' />
            <DropdownMenuItem asChild className='gap-2 p-2 shrink-0'>
              <Link to='/dashboard/building'>
                <div className='bg-background flex size-6 items-center justify-center rounded-md border'>
                  <Building2 className='h-4 w-4' />
                </div>
                <div className='text-muted-foreground font-medium'>{t("nav.manageBuildings")}</div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
