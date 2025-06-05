// src/pages/websites/index.tsx
"use client";

import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";

import LoadingSpinner from "~/app/_components/loadingspinner";

const WebsitesIndexPage: NextPage = () => {
    const { status } = useSession();
    const { data: websites, isLoading, error } = api.website.getAll.useQuery(
        undefined,
        {
            enabled: status === "authenticated", // Only run query if user is authenticated
        }
    );

    return (
        <>
            <Head>
                <title>Migration Websites</title>
            </Head>
            <main className="container mx-auto flex min-h-screen flex-col p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white">Migration Websites</h1>
                    <Link href="/websites/new" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                        Add New Website
                    </Link>
                </div>

                {websites && websites.length > 0 ? (
                    <div className="overflow-x-auto shadow-md sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">URL</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Owner</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Current Server</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Target Server</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {websites.map((website) => (
                                    <tr key={website.id}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{website.url}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{website.ownerName ?? "-"} ({website.ownerEmail ?? "-"})</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{website.migrationStatus}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{website.currentServer}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{website.targetServer}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <Link href={`/websites/${website.id}`} className="text-indigo-600 hover:text-indigo-900">
                                                View/Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    isLoading ?
                        <LoadingSpinner fullPage message="Loading websites..." />
                        : error ?
                            <p className="text-red-500">Error loading websites: {error.message}</p>
                            :
                            status === "authenticated" ?
                                <p className="text-gray-500">No websites added yet. <Link href="/websites/new" className="text-indigo-600 hover:text-indigo-800">Add one now!</Link></p>
                                :
                                <div>
                                    <p className="text-gray-500 mb-2">You need to be signed in to view websites.</p>
                                    <Link href="/api/auth/signin" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                                        Sign in
                                    </Link>
                                </div>
                )}
            </main>
        </>
    );
};

export default WebsitesIndexPage;
