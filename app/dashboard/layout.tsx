import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions) as any;

    if (!session?.user?.email) {
        redirect("/login");
    }

    // Get user from DB to get ID
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) {
        // Edge case: session exists but user not in DB (should not happen normally)
        redirect("/login");
    }

    // Fetch user's agents on the server
    const agents = await prisma.business.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <DashboardShell 
            initialAgents={agents} 
            userName={session.user.name} 
            userEmail={session.user.email}
        >
            {children}
        </DashboardShell>
    );
}
