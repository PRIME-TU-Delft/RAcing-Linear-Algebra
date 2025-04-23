import { createContext } from "react"
import { Study } from "../components/LecturerPlatform/SharedUtils"

export const StudiesContext = createContext<Study[]>([])