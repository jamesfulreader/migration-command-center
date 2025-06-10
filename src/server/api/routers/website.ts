import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
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
            migrationStatus: z.string().optional(),
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
                    migrationStatus: input.migrationStatus,
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
            migrationStatus: z.string().optional(),
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
                    migrationStatus: input.migrationStatus,
                },
            });
        }
        ),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.website.delete({
                where: { id: input.id },
            });
        }
        ),
    // Metrics
    getMetrics: publicProcedure.query(async ({ ctx }) => {
        const [inProgressCount, completedCount] = await Promise.all([
            // Count all websites that are NOT 'Complete'
            ctx.db.website.count({
                where: {
                    migrationStatus: {
                        not: "Complete",
                    },
                },
            }),
            // Count all websites that ARE 'Complete'
            ctx.db.website.count({
                where: {
                    migrationStatus: "Complete",
                },
            }),
        ]);

        return {
            inProgressCount,
            completedCount,
        };
    }),

    getStatusCounts: publicProcedure.query(async ({ ctx }) => {
        const statusCounts = await ctx.db.website.groupBy({
            by: ["migrationStatus"],
            _count: {
                migrationStatus: true,
            },
        });
        return statusCounts.map((item) => ({
            name: item.migrationStatus,
            value: item._count.migrationStatus,
        }));
    }),
})