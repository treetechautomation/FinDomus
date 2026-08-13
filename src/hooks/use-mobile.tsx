'use client';

import * as React from "react"
import { MD } from "@/constants/breakpoints"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MD - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MD)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MD)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
