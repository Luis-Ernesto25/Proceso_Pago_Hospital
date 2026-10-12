import SideBarAdmin from "@/components/sideBarsPorRol/SideBarAdmin"

function LayoutVistaContador({children}) {
  return (
    <>
    <SideBarAdmin>{children}</SideBarAdmin>
    </>
  )
}

export default LayoutVistaContador