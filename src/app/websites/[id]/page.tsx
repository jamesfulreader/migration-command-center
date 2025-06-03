"use client";

import { type NextPage } from "next";
import Head from "next/head";
import { useRouter, useParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { useEffect } from "react"; // To set form values
import { useSession } from "next-auth/react";

// Same form schema as new.tsx
const websiteFormSchema = z.object({
    url: z.string().url({ message: "Must be a valid URL" }),
    ownerName: z.string().optional(),
    ownerEmail: z.string().email({ message: "Must be a valid email" }).optional().or(z.literal('')),
    currentServer: z.string().min(1, { message: "Current server is required" }),
    targetServer: z.string().min(1, { message: "Target server is required" }),
    migrationStatus: z.string().min(1, { message: "Status is required" }), // Added status
    notes: z.string().optional(),
});
type WebsiteFormValues = z.infer<typeof websiteFormSchema>;

const EditWebsitePage: NextPage = () => {
    const router = useRouter();
    const params = useParams();
    const websiteId = params.id as string;
    const { data: session, status } = useSession();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset, // To pre-fill the form
        setValue, // To pre-fill the form
    } = useForm<WebsiteFormValues>({
        resolver: zodResolver(websiteFormSchema),
    });

    const { data: websiteData, isLoading: isLoadingWebsite } = api.website.getById.useQuery(
        { id: websiteId },
        {
            enabled: !!websiteId && status === "authenticated",
        }
    );

    useEffect(() => {
        if (websiteData) {
            // Pre-fill the form with fetched data
            setValue("url", websiteData.url);
            setValue("ownerName", websiteData.ownerName || "");
            setValue("ownerEmail", websiteData.ownerEmail || "");
            setValue("currentServer", websiteData.currentServer);
            setValue("targetServer", websiteData.targetServer);
            setValue("migrationStatus", websiteData.migrationStatus);
            setValue("notes", websiteData.notes || "");
        }
    }, [websiteData, setValue]);

    const updateWebsite = api.website.update.useMutation({
        onSuccess: () => {
            console.log("Website updated successfully!");
            void router.push("/websites"); // Redirect to list page
        },
        onError: (error) => {
            console.error("Failed to update website:", error);
            alert(`Error: ${error.message}`);
        },
    });

    const onSubmit: SubmitHandler<WebsiteFormValues> = (data) => {
        updateWebsite.mutate({ id: websiteId, ...data });
    };

    const deleteWebsite = api.website.delete.useMutation({
        onSuccess: () => {
            console.log("Website deleted successfully!");
            void router.push("/websites"); // Redirect to list page
        },
        onError: (error) => {
            console.error("Failed to delete website:", error);
            alert(`Error: ${error.message}`);
        },
    });
    const handleDelete = () => {
        if (
            window.confirm(
                "Are you sure you want to delete this website? This action cannot be undone.",
            )
        ) {
            deleteWebsite.mutate({ id: websiteId });
        }
    }

    // Route protection
    if (status === "loading") return <p>Loading session...</p>;
    if (status === "unauthenticated") return <p>Access Denied. Please sign in.</p>;
    if (isLoadingWebsite && status === "authenticated") return <p>Loading website data...</p>;
    if (!websiteData && !isLoadingWebsite && status === "authenticated") return <p>Website not found.</p>;

    const migrationStatuses = [
        "Pending Outreach", "Outreach Sent", "Awaiting Reply",
        "Reply Received", "Scheduled", "Migration In Progress",
        "Complete", "Issue - Contact Failed", "Issue - Technical"
    ];

    return (
        <>
            <Head>
                <title>Edit Migration Website</title>
            </Head>
            <main className="container mx-auto flex min-h-screen flex-col items-center p-4">
                <h1 className="mb-6 text-3xl font-bold text-white">Edit Migration Website</h1>
                {websiteData && (
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="w-full max-w-lg space-y-4 rounded bg-white p-8 shadow-md"
                    >
                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-gray-700">URL</label>
                            <input id="url" {...register("url")} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            {errors.url && <p className="mt-1 text-xs text-red-500">{errors.url.message}</p>}
                        </div>

                        {/* Owner Name */}
                        <div>
                            <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">Owner Name</label>
                            <input id="ownerName" {...register("ownerName")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>

                        {/* Owner Email */}
                        <div>
                            <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700">Owner Email</label>
                            <input id="ownerEmail" type="email" {...register("ownerEmail")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            {errors.ownerEmail && <p className="mt-1 text-xs text-red-500">{errors.ownerEmail.message}</p>}
                        </div>

                        {/* Current Server */}
                        <div>
                            <label htmlFor="currentServer" className="block text-sm font-medium text-gray-700">Current Server</label>
                            <input id="currentServer" {...register("currentServer")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            {errors.currentServer && <p className="mt-1 text-xs text-red-500">{errors.currentServer.message}</p>}
                        </div>

                        {/* Target Server */}
                        <div>
                            <label htmlFor="targetServer" className="block text-sm font-medium text-gray-700">Target Server</label>
                            <input id="targetServer" {...register("targetServer")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            {errors.targetServer && <p className="mt-1 text-xs text-red-500">{errors.targetServer.message}</p>}
                        </div>

                        {/* Migration Status */}
                        <div>
                            <label htmlFor="migrationStatus" className="block text-sm font-medium text-gray-700">Migration Status</label>
                            <select
                                id="migrationStatus"
                                {...register("migrationStatus")}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                {migrationStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            {errors.migrationStatus && <p className="mt-1 text-xs text-red-500">{errors.migrationStatus.message}</p>}
                        </div>

                        {/* Notes */}
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                            <textarea id="notes" {...register("notes")} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>

                        <button
                            type="submit"
                            disabled={updateWebsite.isLoading}
                            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        >
                            {updateWebsite.isLoading ? "Updating..." : "Update Website"}
                        </button>
                        <button
                            type="button" // Important: type="button" to prevent form submission
                            onClick={handleDelete}
                            disabled={deleteWebsite.isPending}
                            className="flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
                        >
                            {deleteWebsite.isPending ? "Deleting..." : "Delete Website"}
                        </button>
                    </form>
                )}
            </main>
        </>
    );
};

export default EditWebsitePage;