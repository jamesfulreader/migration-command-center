import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";

export const websiteRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({
            url: z.string().url(),
            ownerName: z.string().optional(),
            ownerEmail: z.string().email().optional(),
            currentServer: z.string(),
            targetServer: z.string(),
            notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.website.create({
                data: {
                    url: input.url,
                    ownerName: input.ownerName,
                    ownerEmail: input.ownerEmail,
                    currentServer: input.currentServer,
                    targetServer: input.targetServer,
                    notes: input.notes,
                },
            });
        }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.website.findMany({
            orderBy: { createdAt: "desc" },
        });
    }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.website.findUnique({
                where: { id: input.id },
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            url: z.string().url(),
            ownerName: z.string().optional(),
            ownerEmail: z.string().email().optional(),
            currentServer: z.string(),
            targetServer: z.string(),
            notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.website.update({
                where: { id: input.id },
                data: {
                    url: input.url,
                    ownerName: input.ownerName,
                    ownerEmail: input.ownerEmail,
                    currentServer: input.currentServer,
                    targetServer: input.targetServer,
                    notes: input.notes,
                },
            });
        }
        ),
})