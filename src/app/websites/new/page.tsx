"use client"

import { useRouter } from "next/router";
import Head from "next/head";
import { z } from "zod";

import { useSession } from "next-auth/react";

const websiteFormSchema = z.object({
    url: z.string().url({ message: "Invalid URL format" }),
    ownerName: z.string().optional(),
    ownerEmail: z.string().email({ message: "Invalid email format" }).optional().or(z.literal('')),
    currentServer: z.string().min(1, { message: "Current server is required" }),
    targetServer: z.string().min(1, { message: "Target server is required" }),
    notes: z.string().optional(),
});

type WebsiteFormValues = z.infer<typeof websiteFormSchema>;

const NewWebsitePage = () => {
    // const router = useRouter();
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (!session) {
        return <p>Please sign in</p>;
    }

    return (
        <>
            <Head>
                <title>Create New Website</title>
            </Head>
            <main className="container mx-auto flex min-h-screen flex-col items-center p-4">
                <h1 className="mb-6 text-3xl font-bold">Add new Migration Website</h1>
                <form className="w-full max-w-lg space-y-4 rounded bg-white p-8 shadow-md">
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700">URL</label>
                        <input type="text" id="url" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500" />
                    </div>
                </form>
            </main>
        </>
    );
}

export default NewWebsitePage;