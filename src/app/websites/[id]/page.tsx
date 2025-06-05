"use client";

import { type NextPage } from "next";
import Head from "next/head";
import { useRouter, useParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "~/server/api/root";

const websiteFormSchema = z.object({
    url: z.string().url({ message: "Must be a valid URL" }),
    ownerName: z.string().optional(),
    ownerEmail: z
        .string()
        .email({ message: "Must be a valid email" })
        .optional()
        .or(z.literal("")),
    currentServer: z.string().min(1, { message: "Current server is required" }),
    targetServer: z.string().min(1, { message: "Target server is required" }),
    migrationStatus: z.string().min(1, { message: "Status is required" }),
    notes: z.string().optional(),
});
type WebsiteFormValues = z.infer<typeof websiteFormSchema>;

const commLogFormSchema = z.object({
    message: z.string().min(1, { message: "Message cannot be empty" }),
    type: z.enum(["email", "chat"]),
});
type CommLogFormValues = z.infer<typeof commLogFormSchema>;

type CommLogWithUser = {
    id: string;
    type: "email" | "chat";
    message: string;
    createdAt: Date;
    user?: {
        id: string;
        name?: string;
    } | null;
    websiteId: string;
};

const EditWebsitePage: NextPage = () => {
    const router = useRouter();
    const params = useParams();
    const websiteId = params.id as string;
    const { data: session, status } = useSession();

    // Edit communication log state
    const [editingCommLog, setEditingCommLog] = useState<CommLogWithUser | null>(null);

    // Hooks for the main website form
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset: resetWebsiteForm,
        setValue,
    } = useForm<WebsiteFormValues>({
        resolver: zodResolver(websiteFormSchema),
    });

    // Hooks for communication logs form
    const {
        register: registerCommLog,
        handleSubmit: handleSubmitCommLog,
        reset: resetCommLogForm,
        formState: { errors: commLogErrors },
        setValue: setCommLogValue,
    } = useForm<CommLogFormValues>({
        resolver: zodResolver(commLogFormSchema),
        defaultValues: {
            type: "email",
            message: "",
        },
    });

    // tRPC Queries
    const {
        data: websiteData,
        isLoading: isLoadingWebsite,
        isError: isErrorLoadingWebsite, // Added for completeness
        error: websiteLoadingError, // Added for completeness
    } = api.website.getById.useQuery(
        { id: websiteId },
        {
            enabled: !!websiteId && status === "authenticated",
        },
    );

    const {
        data: commLogs,
        isLoading: isLoadingCommLogs,
        isError: isCommLogsError, // Consistent naming
        error: commLogsLoadingError, // Consistent naming
        refetch: refetchCommLogs,
    } = api.communicationLog.getByWebsiteId.useQuery(
        { websiteId },
        {
            enabled: !!websiteId && status === "authenticated",
        },
    );

    useEffect(() => {
        if (websiteData) {
            setValue("url", websiteData.url);
            setValue("ownerName", websiteData.ownerName ?? "");
            setValue("ownerEmail", websiteData.ownerEmail ?? "");
            setValue("currentServer", websiteData.currentServer);
            setValue("targetServer", websiteData.targetServer);
            setValue(
                "migrationStatus",
                websiteData.migrationStatus ?? "Pending Outreach",
            );
            setValue("notes", websiteData.notes ?? "");
        }
    }, [websiteData, setValue]);

    useEffect(() => {
        if (editingCommLog) {
            setCommLogValue("message", editingCommLog.message);
            setCommLogValue("type", editingCommLog.type);
        } else {
            resetCommLogForm({ type: "email", message: "" });
        }
    }, [editingCommLog, setCommLogValue, resetCommLogForm]);

    // tRPC Mutations
    const updateWebsite = api.website.update.useMutation({
        onSuccess: () => {
            console.log("Website updated successfully!");
            void router.push("/websites");
        },
        onError: (error) => {
            console.error("Failed to update website:", error);
            alert(`Error: ${error.message}`);
        },
    });

    const deleteWebsite = api.website.delete.useMutation({
        onSuccess: () => {
            console.log("Website deleted successfully!");
            resetWebsiteForm(); // Also reset main form if website is deleted
            void router.push("/websites");
        },
        onError: (error) => {
            console.error("Failed to delete website:", error);
            alert(`Error: ${error.message}`);
        },
    });

    const createCommLog = api.communicationLog.create.useMutation({
        onSuccess: () => {
            console.log("Communication log added successfully!");
            resetCommLogForm();
            void refetchCommLogs();
        },
        onError: (error: TRPCClientErrorLike<AppRouter>) => {
            console.error("Failed to add communication log:", error.message);
            alert(`Error adding log: ${error.message}`);
        },
    });

    const updateCommLog = api.communicationLog.update.useMutation({
        onSuccess: () => {
            console.log("Communication log updated successfully!");
            setEditingCommLog(null); // Reset editing state
            resetCommLogForm();
            void refetchCommLogs();
        },
        onError: (error: TRPCClientErrorLike<AppRouter>) => {
            console.error("Failed to update communication log:", error.message);
            alert(`Error updating log: ${error.message}`);
        }
    });

    const deleteCommLog = api.communicationLog.delete.useMutation({
        onSuccess: () => {
            console.log("Communication log deleted successfully!");
            setEditingCommLog(null); // Reset editing state
            void refetchCommLogs();
        },
        onError: (error: TRPCClientErrorLike<AppRouter>) => {
            console.error("Failed to delete communication log:", error.message);
            alert(`Error deleting log: ${error.message}`);
        }
    });

    // --- END OF HOOKS SECTION ---

    // Event Handlers (defined after hooks)
    const onWebsiteSubmit: SubmitHandler<WebsiteFormValues> = (data) => {
        updateWebsite.mutate({
            id: websiteId,
            ...data,
            ownerEmail: data.ownerEmail === "" ? undefined : data.ownerEmail,
        });
    };

    const handleDeleteWebsite = () => {
        if (
            window.confirm(
                "Are you sure you want to delete this website? This action cannot be undone.",
            )
        ) {
            deleteWebsite.mutate({ id: websiteId });
        }
    };

    const onCommLogSubmit: SubmitHandler<CommLogFormValues> = (data) => {
        if (editingCommLog) {
            // If editing an existing log, update it
            updateCommLog.mutate({
                id: editingCommLog.id,
                ...data,
            });
        } else {
            createCommLog.mutate({
                ...data,
                websiteId: websiteId,
            });
        }
    };

    const handleCancelEditCommLog = () => {
        setEditingCommLog(null); // Reset editing state
        resetCommLogForm(); // Reset the form
    };

    // Conditional returns for loading/auth states (NOW AFTER ALL HOOKS)
    if (status === "loading") {
        return <div className="flex min-h-screen items-center justify-center"><p>Loading session...</p></div>;
    }
    if (status === "unauthenticated") {
        // Consider redirecting or a more robust auth boundary
        router.push("/api/auth/signin");
        return <div className="flex min-h-screen items-center justify-center"><p>Redirecting to sign in...</p></div>;
    }
    // This check should ideally be after session is confirmed authenticated
    if (isLoadingWebsite && status === "authenticated") {
        return <div className="flex min-h-screen items-center justify-center"><p>Loading website data...</p></div>;
    }
    // If websiteData is explicitly not found after trying to load
    if (!websiteData && !isLoadingWebsite && status === "authenticated") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
                <h1 className="mb-4 text-2xl font-bold text-red-500">Website Not Found</h1>
                <p className="mb-4 text-gray-700">Could not find website with ID: {websiteId}.</p>
                <button onClick={() => router.push("/websites")} className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
                    Back to Websites List
                </button>
            </div>
        );
    }


    const migrationStatuses = [
        "Pending Outreach", "Outreach Sent", "Awaiting Reply",
        "Reply Received", "Scheduled", "Migration In Progress",
        "Complete", "Issue - Contact Failed", "Issue - Technical",
    ];

    // Main component JSX
    return (
        <>
            <Head>
                <title>Edit Migration Website - {websiteData?.url ?? "Loading..."}</title>
            </Head>
            <main className="container mx-auto flex min-h-screen flex-col items-center p-4">
                <h1 className="mb-6 text-3xl font-bold text-white">
                    Edit Migration Website
                </h1>

                {/* Main Website Edit Form */}
                {websiteData && ( // Only render form if websiteData is available
                    (<form
                        onSubmit={handleSubmit(onWebsiteSubmit)} // Use the correct submit handler
                        className="mb-10 w-full max-w-lg space-y-4 rounded bg-slate-200/90 p-8 shadow-xl" // Adjusted styles
                    >
                        {/* URL */}
                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-gray-700">URL</label>
                            <input id="url" {...register("url")} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            {errors.url && <p className="mt-1 text-xs text-red-600">{errors.url.message}</p>}
                        </div>
                        {/* Owner Name */}
                        <div>
                            <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">Owner Name</label>
                            <input id="ownerName" {...register("ownerName")} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        {/* Owner Email */}
                        <div>
                            <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700">Owner Email</label>
                            <input id="ownerEmail" type="email" {...register("ownerEmail")} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            {errors.ownerEmail && <p className="mt-1 text-xs text-red-600">{errors.ownerEmail.message}</p>}
                        </div>
                        {/* Current Server */}
                        <div>
                            <label htmlFor="currentServer" className="block text-sm font-medium text-gray-700">Current Server</label>
                            <input id="currentServer" {...register("currentServer")} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            {errors.currentServer && <p className="mt-1 text-xs text-red-600">{errors.currentServer.message}</p>}
                        </div>
                        {/* Target Server */}
                        <div>
                            <label htmlFor="targetServer" className="block text-sm font-medium text-gray-700">Target Server</label>
                            <input id="targetServer" {...register("targetServer")} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            {errors.targetServer && <p className="mt-1 text-xs text-red-600">{errors.targetServer.message}</p>}
                        </div>
                        {/* Migration Status */}
                        <div>
                            <label htmlFor="migrationStatus" className="block text-sm font-medium text-gray-700">Migration Status</label>
                            <select
                                id="migrationStatus"
                                {...register("migrationStatus")}
                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                {migrationStatuses.map(statusVal => ( // Renamed 'status' to 'statusVal' to avoid conflict
                                    (<option key={statusVal} value={statusVal}>{statusVal}</option>)
                                ))}
                            </select>
                            {errors.migrationStatus && <p className="mt-1 text-xs text-red-600">{errors.migrationStatus.message}</p>}
                        </div>
                        {/* Notes */}
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                            <textarea id="notes" {...register("notes")} rows={3} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        {/* Action Buttons for Website Form */}
                        <div className="space-y-3 pt-2">
                            <button
                                type="submit"
                                disabled={updateWebsite.isPending} // Corrected to isPending
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                            >
                                {updateWebsite.isPending ? "Updating..." : "Save Changes"}
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteWebsite} // Use the correct handler
                                disabled={deleteWebsite.isPending}
                                className="flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
                            >
                                {deleteWebsite.isPending ? "Deleting..." : "Delete Website"}
                            </button>
                        </div>
                    </form>)
                )}

                {/* Communication Logs Section - Render only if websiteData exists */}
                {websiteData && (
                    <div className="w-full max-w-lg rounded bg-slate-100 p-6 shadow-xl"> {/* Adjusted styles */}
                        <h2 className="mb-4 text-xl font-semibold text-gray-800">
                            Communication Log
                        </h2>
                        {/* Form to Add New Communication Log */}
                        <form
                            onSubmit={handleSubmitCommLog(onCommLogSubmit)}
                            className="mb-6 space-y-4 rounded border border-gray-200 bg-white p-4"
                        >
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingCommLog ? "Edit Log Entry" : "Add New Log Entry"}
                            </h3>
                            <div>
                                <label htmlFor="commLogType" className="block text-sm font-medium text-gray-700">Type</label>
                                <select
                                    id="commLogType"
                                    {...registerCommLog("type")}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="email">Email</option>
                                    <option value="chat">Chat</option>
                                </select>
                                {commLogErrors.type && (<p className="mt-1 text-xs text-red-500">{commLogErrors.type.message}</p>)}
                            </div>
                            <div>
                                <label htmlFor="commLogMessage" className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea
                                    id="commLogMessage"
                                    {...registerCommLog("message")}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {commLogErrors.message && (<p className="mt-1 text-xs text-red-500">{commLogErrors.message.message}</p>)}
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={createCommLog.isPending || updateCommLog.isPending}
                                    className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
                                >
                                    {editingCommLog
                                        ? updateCommLog.isPending
                                            ? "Updating..."
                                            : "Update Log"
                                        : createCommLog.isPending
                                            ? "Adding..."
                                            : "Add Log Entry"}
                                </button>
                                {editingCommLog && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEditCommLog}
                                        className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                                        disabled={updateCommLog.isPending}
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Display existing logs */}
                        {isLoadingCommLogs && <p className="text-center text-gray-600">Loading communication logs...</p>}
                        {isCommLogsError && (<p className="text-center text-red-500">Error loading logs: {commLogsLoadingError?.message}</p>)}
                        {commLogs && commLogs.length === 0 && !isLoadingCommLogs && !isCommLogsError && (<p className="text-center text-gray-600">No communication logs yet.</p>)}
                        {commLogs && commLogs.length > 0 && (
                            <ul className="space-y-4">
                                {commLogs.map((log) => (
                                    <li key={log.id} className="rounded-md border border-gray-300 bg-white p-4 shadow-sm">
                                        <div className="mb-1 flex items-center justify-between">
                                            <span className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{log.type}</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(log.createdAt).toLocaleDateString()} -{" "}
                                                {new Date(log.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="whitespace-pre-wrap text-gray-700">{log.message}</p>
                                        {log.user && (
                                            <p className="mt-2 text-right text-xs text-gray-500">
                                                Logged by: {log.user.name ?? "Unknown User"}
                                            </p>
                                        )}
                                        <div className="mt-3 flex justify-end space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditingCommLog({
                                                        ...log,
                                                        type: log.type as "email" | "chat",
                                                        user: log.user
                                                            ? {
                                                                ...log.user,
                                                                name: log.user.name ?? undefined,
                                                            }
                                                            : undefined,
                                                    });
                                                }}
                                                className="rounded bg-yellow-500 px-2 py-1 text-xs font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
                                                disabled={deleteCommLog.isPending || updateCommLog.isPending || createCommLog.isPending}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm("Are you sure you want to delete this log?")) {
                                                        deleteCommLog.mutate({ id: log.id });
                                                    }
                                                }}
                                                className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                                                disabled={deleteCommLog.isPending || updateCommLog.isPending || createCommLog.isPending}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </main>
        </>
    );
};

export default EditWebsitePage;