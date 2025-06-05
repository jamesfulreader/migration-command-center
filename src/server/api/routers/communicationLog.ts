import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";

export const communicationLogRouter = createTRPCRouter({
    create: protectedProcedure
        .input((
            z.object({
                websiteId: z.string().cuid(),
                message: z.string().min(1, "Message cannot be empty"),
                type: z.enum(["email", "chat"])
            })
        ))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.communicationLog.create({
                data: {
                    websiteId: input.websiteId,
                    message: input.message,
                    type: input.type,
                    userId: ctx.session.user.id,
                }
            })
        }),

    getByWebsiteId: protectedProcedure
        .input(z.object({
            websiteId: z.string().cuid(),
        }))
        .query(async ({ ctx, input }) => {
            return ctx.db.communicationLog.findMany({
                where: {
                    websiteId: input.websiteId,
                },
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string().cuid(),
            message: z.string().min(1, "Message cannot be empty"),
            type: z.enum(["email", "chat"])
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.communicationLog.update({
                where: {
                    id: input.id,
                },
                data: {
                    message: input.message,
                    type: input.type,
                }
            });
        }
        ),

    delete: protectedProcedure
        .input(z.object({
            id: z.string().cuid(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.communicationLog.delete({
                where: {
                    id: input.id,
                }
            });
        }),

})