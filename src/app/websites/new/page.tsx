"use client";

import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { useForm, type SubmitHandler } from "react-hook-form"; // Use SubmitHandler
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "~/server/api/root";

const websiteFormSchema = z.object({
    url: z.string().url({ message: "Invalid URL format" }),
    ownerName: z.string().optional(),
    ownerEmail: z
        .string()
        .email({ message: "Invalid email format" })
        .optional()
        .or(z.literal("")),
    currentServer: z.string().min(1, { message: "Current server is required" }),
    targetServer: z.string().min(1, { message: "Target server is required" }),
    migrationStatus: z.string().optional(),
    notes: z.string().optional(),
});

type WebsiteFormValues = z.infer<typeof websiteFormSchema>;

const NewWebsitePage: NextPage = () => {
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession(); // Renamed status to avoid conflict
    const utils = api.useUtils();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<WebsiteFormValues>({
        resolver: zodResolver(websiteFormSchema),
    });

    const createWebsite = api.website.create.useMutation({
        onSuccess: () => {
            console.log("Website created successfully");
            void utils.website.getAll.invalidate();
            reset();
            void router.push("/websites");
        },
        onError: (error: TRPCClientErrorLike<AppRouter>) => {
            console.error("Error creating website:", error.message);
            // You can provide more specific error messages based on error.data?.code or error.shape
            let displayMessage = `Failed to create website: ${error.message}.`;
            if (error.data?.zodError) {
                // Handle Zod validation errors more specifically if desired
                displayMessage = "Form validation failed on the server. Please check your inputs.";
                console.error("Server-side Zod validation errors:", error.data.zodError.fieldErrors);
            }
            alert(displayMessage + " Please try again.");
        },
    });

    // Use SubmitHandler for better type safety with handleSubmit
    const onSubmit: SubmitHandler<WebsiteFormValues> = (data: WebsiteFormValues) => {
        const payload: WebsiteFormValues = {
            ...data,
            ownerEmail: data.ownerEmail === "" ? undefined : data.ownerEmail,
            migrationStatus: data.migrationStatus === "" ? undefined : data.migrationStatus,
        };
        createWebsite.mutate(payload);
    };

    if (sessionStatus === "loading") {
        return <div>Loading...</div>;
    }
    if (!session) {
        return <p>Please sign in to add a new website.</p>;
    }

    const migrationStatuses = [
        "Pending Outreach", "Outreach Sent", "Awaiting Reply",
        "Reply Received", "Scheduled", "Migration In Progress",
        "Complete", "Issue - Contact Failed", "Issue - Technical"
    ];

    return (
        <>
            <main className="container mx-auto flex min-h-screen flex-col items-center p-4">
                <h1 className="mb-6 text-3xl font-bold text-white">
                    Add new Migration Website
                </h1>
                <form
                    className="w-full max-w-lg space-y-4 rounded bg-slate-200/90 p-8 shadow-md"
                    onSubmit={(handleSubmit as (fn: SubmitHandler<WebsiteFormValues>) => (e?: React.BaseSyntheticEvent) => Promise<void>)(onSubmit)}
                >
                    <div>
                        <label
                            htmlFor="url"
                            className="block text-sm font-medium text-gray-700"
                        >
                            URL
                        </label>
                        <input
                            type="text"
                            id="url"
                            {...register("url")}
                            className="mt-1 block w-full rounded-md border-b-2 border-gray-600 shadow-sm focus:border-indigo-500"
                        />
                        {errors.url?.message && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.url.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="ownerName"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Owner Name
                        </label>
                        <input
                            type="text"
                            id="ownerName"
                            {...register("ownerName")}
                            className="mt-1 block w-full rounded-md border-b-2 border-gray-600 shadow-sm focus:border-indigo-500"
                        />
                        {errors.ownerName?.message && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.ownerName.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="ownerEmail"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Owner Email
                        </label>
                        <input
                            type="email"
                            id="ownerEmail"
                            {...register("ownerEmail")}
                            className="mt-1 block w-full rounded-md border-b-2 border-gray-600 shadow-sm focus:border-indigo-500"
                        />
                        {errors.ownerEmail?.message && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.ownerEmail.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="currentServer"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Current Server
                        </label>
                        <input
                            type="text"
                            id="currentServer"
                            {...register("currentServer")}
                            className="mt-1 block w-full rounded-md border-b-2 border-gray-600 shadow-sm focus:border-indigo-500"
                        />
                        {errors.currentServer?.message && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.currentServer.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="targetServer"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Target Server
                        </label>
                        <input
                            type="text"
                            id="targetServer"
                            {...register("targetServer")}
                            className="mt-1 block w-full rounded-md border-b-2 border-gray-600 shadow-sm focus:border-indigo-500"
                        />
                        {errors.targetServer?.message && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.targetServer.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="migrationStatus"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Migration Status
                        </label>
                        <select
                            id="migrationStatus"
                            {...register("migrationStatus")}
                            className="mt-1 block w-full rounded-md border-b-2 border-gray-600 shadow-sm focus:border-indigo-500"
                        >
                            {migrationStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        {errors.migrationStatus?.message && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.migrationStatus.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="notes"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            {...register("notes")}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500"
                        ></textarea>
                        {errors.notes?.message && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.notes.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                            disabled={createWebsite.status === "pending"}
                        >
                            {createWebsite.status === "pending" ? "Adding..." : "Add Website"}
                        </button>
                    </div>
                </form>
            </main >
        </>
    );
};

export default NewWebsitePage;