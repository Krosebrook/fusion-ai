import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoleManager from "../components/rbac/RoleManager";
import UserRoleAssignment from "../components/rbac/UserRoleAssignment";

export default function AccessControlPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Access Control
          </h1>
          <p className="text-gray-400">Manage roles, permissions, and user access</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="roles" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 mb-6">
              <TabsTrigger value="roles" className="data-[state=active]:bg-purple-500/20">
                Roles & Permissions
              </TabsTrigger>
              <TabsTrigger value="assignments" className="data-[state=active]:bg-purple-500/20">
                User Assignments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roles">
              <RoleManager />
            </TabsContent>

            <TabsContent value="assignments">
              <UserRoleAssignment />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}