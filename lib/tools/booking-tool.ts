import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { reservationService } from "@/services/database/reservations";

export const createBookingTool = (businessId: string, customerPhone?: string) => {
    return new DynamicStructuredTool({
        name: "booking_manager",
        description: "Use this tool to check availability or create a reservation for the customer. ALWAYS check availability before creating a reservation.",
        schema: z.object({
            action: z.enum(["CHECK", "CREATE"]).describe("Action to perform: CHECK for availability, CREATE to book."),
            date: z.string().describe("Date in YYYY-MM-DD format. If user says 'tomorrow', calculate the date."),
            time: z.string().optional().describe("Time in HH:mm format (24h). Required for CREATE."),
            details: z.string().optional().describe("Extra details for the reservation (e.g., 'Haircut and beard')."),
        }),
        func: async ({ action, date, time, details }) => {
            try {
                if (action === "CHECK") {
                    const result = await reservationService.checkAvailability(businessId, date);
                    if (!result.available) {
                        return `No appointments available on ${date}. Reason: ${result.reason || "Closed or fully booked."}`;
                    }
                    if (result.slots.length === 0) {
                        return `There are no free slots available on ${date}. Please suggest another day.`;
                    }
                    return `Available slots on ${date}: ${result.slots.join(", ")}.`;
                }

                if (action === "CREATE") {
                    if (!time) return "Error: Time is required to create a reservation.";
                    if (!customerPhone) return "Error: Customer phone number is missing. Cannot book.";

                    const reservation = await reservationService.createReservation(businessId, customerPhone, date, time, details);
                    return `Reservation confirmed! ID: ${reservation.id.slice(-4)}. Date: ${date} at ${time}.`;
                }
                
                return "Invalid action.";
            } catch (error: any) {
                return `Error performing booking action: ${error.message}`;
            }
        },
    });
};

