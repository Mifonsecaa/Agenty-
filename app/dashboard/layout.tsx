import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Sidebar from "../../components/dashboard/Sidebar";

export default async function DashboardLayout({
                                                children,
                                              }: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
      <div className="flex h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white transition-colors duration-500">
        <Sidebar user={session.user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
  );
}
