/**
 * RBAC Permissions Guide Component
 * 
 * Explains the role-based access control system and available roles.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Shield, Check, X } from 'lucide-react';

const ROLES_DATA = [
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to view tests and analytics',
    color: 'from-blue-500 to-cyan-500',
    permissions: {
      'view_tests': true,
      'view_analytics': true,
      'create_tests': false,
      'edit_tests': false,
      'pause_tests': false,
      'promote_tests': false,
      'export_reports': false,
      'manage_roles': false,
    },
  },
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'View and analyze tests, export reports',
    color: 'from-purple-500 to-pink-500',
    permissions: {
      'view_tests': true,
      'view_analytics': true,
      'create_tests': false,
      'edit_tests': false,
      'pause_tests': false,
      'promote_tests': false,
      'export_reports': true,
      'manage_roles': false,
    },
  },
  {
    id: 'tester',
    name: 'Tester',
    description: 'Create and manage A/B tests',
    color: 'from-cyan-500 to-blue-500',
    permissions: {
      'view_tests': true,
      'view_analytics': true,
      'create_tests': true,
      'edit_tests': true,
      'pause_tests': true,
      'promote_tests': false,
      'export_reports': true,
      'manage_roles': false,
    },
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Full test management including promotions',
    color: 'from-orange-500 to-red-500',
    permissions: {
      'view_tests': true,
      'view_analytics': true,
      'create_tests': true,
      'edit_tests': true,
      'pause_tests': true,
      'promote_tests': true,
      'export_reports': true,
      'manage_roles': false,
    },
  },
];

const PERMISSION_LABELS = {
  'view_tests': 'View Tests',
  'view_analytics': 'View Analytics',
  'create_tests': 'Create Tests',
  'edit_tests': 'Edit Tests',
  'pause_tests': 'Pause/Resume Tests',
  'promote_tests': 'Promote Winners',
  'export_reports': 'Export Reports',
  'manage_roles': 'Manage Roles',
};

export function RBACPermissionsGuide({ onComplete }) {
  const [selectedRole, setSelectedRole] = useState(ROLES_DATA[0].id);
  const role = ROLES_DATA.find(r => r.id === selectedRole);

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CinematicCard className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-600/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-shield-gradient flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Role-Based Access Control (RBAC)</h3>
              <p className="text-white/70">
                FlashFusion uses roles to control what different team members can do. Choose the role that matches your team's responsibilities.
              </p>
            </div>
          </div>
        </CinematicCard>
      </motion.div>

      {/* Role Selection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Available Roles</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {ROLES_DATA.map(r => (
            <motion.button
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-4 rounded-lg border-2 transition text-left ${
                selectedRole === r.id
                  ? 'border-white bg-white/10'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${r.color} mb-3`} />
              <h4 className="font-semibold text-white text-sm">{r.name}</h4>
              <p className="text-xs text-white/60 mt-1">{r.description}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Role Details */}
      <motion.div
        key={selectedRole}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CinematicCard className="p-8">
          <div className="mb-6">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${role.color} mb-4`} />
            <h3 className="text-2xl font-bold text-white mb-2">{role.name} Role</h3>
            <p className="text-white/70">{role.description}</p>
          </div>

          {/* Permissions Grid */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Permissions</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(role.permissions).map(([perm, granted]) => (
                <motion.div
                  key={perm}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Object.keys(role.permissions).indexOf(perm) * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                    granted
                      ? 'border-green-500/30 bg-green-500/10'
                      : 'border-red-500/20 bg-red-500/5'
                  }`}
                >
                  {granted ? (
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-red-400/60 flex-shrink-0" />
                  )}
                  <span className={granted ? 'text-white/80' : 'text-white/40'}>
                    {PERMISSION_LABELS[perm]}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </CinematicCard>
      </motion.div>

      {/* Role Recommendation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30"
      >
        <p className="text-purple-300 text-sm font-semibold mb-1">💡 Recommendation</p>
        <p className="text-purple-200/80 text-sm">
          {selectedRole === 'viewer' && 'Perfect for stakeholders who need to see results but not make changes.'}
          {selectedRole === 'analyst' && 'Ideal for data analysts who need to investigate and report on test results.'}
          {selectedRole === 'tester' && 'Great for product managers who design and manage experiments.'}
          {selectedRole === 'manager' && 'Best for team leads who oversee the full testing lifecycle.'}
        </p>
      </motion.div>

      {/* Key Concepts */}
      <CinematicCard className="p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Key Concepts</h4>
        <div className="space-y-4">
          <div className="border-l-4 border-l-cyan-500 pl-4">
            <p className="font-semibold text-white mb-1">Global vs. Scoped Roles</p>
            <p className="text-white/70 text-sm">
              Roles can be assigned globally (all tests) or scoped to specific tests or projects for fine-grained control.
            </p>
          </div>
          <div className="border-l-4 border-l-blue-500 pl-4">
            <p className="font-semibold text-white mb-1">Admin Access</p>
            <p className="text-white/70 text-sm">
              Admins can manage all aspects including role assignments, audit logs, and system configuration.
            </p>
          </div>
          <div className="border-l-4 border-l-purple-500 pl-4">
            <p className="font-semibold text-white mb-1">Audit Trail</p>
            <p className="text-white/70 text-sm">
              All user actions are logged for compliance. You can view who did what, when, and why.
            </p>
          </div>
        </div>
      </CinematicCard>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center pt-4"
      >
        <Button
          onClick={onComplete}
          className="bg-gradient-to-r from-cyan-500 to-blue-600"
        >
          Continue to Create First Test
        </Button>
      </motion.div>
    </div>
  );
}