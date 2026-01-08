import { ActiveLink } from '@/components/ui/active-link'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import React from 'react'
import { Link } from 'react-router-dom'
import { links } from './layoutData'

const NavbarLayout = ({role}: {role: string}) => {
  return (
    <Sidebar>
      <SidebarHeader className="p-3">
        <Link to={`/app/${role}`}>
          {/* <img src={logo} alt="img" /> */}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupContent className="p-0">
          <SidebarMenu>
            {links.teacher.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <ActiveLink href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </ActiveLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}

export default NavbarLayout