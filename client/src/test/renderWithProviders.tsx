/**
 * Renders a component inside a router and any React contexts it needs.
 *
 *     const { getPathname } = renderWithProviders(<Home loggedIn={false} />, {
 *         route: "/",
 *         providers: [provide(ScoreContext, { ...scores })],
 *     })
 *     fireEvent.click(screen.getByText("Join Game"))
 *     expect(getPathname()).toBe("/JoinGame")
 *
 * Contexts that are not provided fall back to their `createContext` defaults.
 */
import { Context, ReactElement, ReactNode } from "react"
import { render, RenderOptions } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"

interface ProviderEntry {
    context: Context<any>
    value: unknown
}

/** Pairs a context with the value to provide, keeping the two type-checked together. */
export function provide<T>(context: Context<T>, value: T): ProviderEntry {
    return { context, value }
}

interface Options extends Omit<RenderOptions, "wrapper"> {
    /** Initial URL of the in-memory router. Defaults to "/". */
    route?: string
    providers?: ProviderEntry[]
}

export function renderWithProviders(
    ui: ReactElement,
    { route = "/", providers = [], ...renderOptions }: Options = {}
) {
    const location = { pathname: route }

    function LocationProbe() {
        location.pathname = useLocation().pathname
        return null
    }

    function Wrapper({ children }: { children: ReactNode }) {
        const withContexts = providers.reduceRight<ReactNode>(
            (inner, { context, value }) => (
                <context.Provider value={value}>{inner}</context.Provider>
            ),
            children
        )
        return (
            <MemoryRouter initialEntries={[route]}>
                <LocationProbe />
                {withContexts}
            </MemoryRouter>
        )
    }

    return {
        ...render(ui, { wrapper: Wrapper, ...renderOptions }),
        /** Current router path, e.g. after a click that navigates. */
        getPathname: () => location.pathname,
    }
}
