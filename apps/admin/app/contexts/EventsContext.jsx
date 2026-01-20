"use client"

import { createContext, useCallback, useContext } from "react"
import { fetchEvents as fetchEventsGateway } from "@/gateways/eventsGateway"

const EventsContext = createContext(undefined)

export function EventsProvider({ children }) {
  const fetchEvents = useCallback(async ({ limit, before, after } = {}) => {
    return fetchEventsGateway({ limit, before, after })
  }, [])

  const value = {
    fetchEvents,
  }

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventsProvider")
  }
  return context
}
