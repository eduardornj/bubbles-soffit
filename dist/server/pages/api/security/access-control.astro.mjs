import mysql from 'mysql2/promise';
import crypto from 'crypto';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "bubbles_enterprise"
};
const SYSTEM_PERMISSIONS = [
  // Dashboard permissions
  { id: "dashboard_view", name: "View Dashboard", resource: "dashboard", action: "read", description: "View security dashboard", is_system_permission: true },
  { id: "dashboard_admin", name: "Admin Dashboard", resource: "dashboard", action: "admin", description: "Full dashboard administration", is_system_permission: true },
  // Log management permissions
  { id: "logs_view", name: "View Logs", resource: "logs", action: "read", description: "View system logs", is_system_permission: true },
  { id: "logs_export", name: "Export Logs", resource: "logs", action: "export", description: "Export logs and reports", is_system_permission: true },
  { id: "logs_delete", name: "Delete Logs", resource: "logs", action: "delete", description: "Delete log entries", is_system_permission: true },
  { id: "logs_cleanup", name: "Cleanup Logs", resource: "logs", action: "cleanup", description: "Perform log cleanup operations", is_system_permission: true },
  // Security permissions
  { id: "security_view", name: "View Security", resource: "security", action: "read", description: "View security events and alerts", is_system_permission: true },
  { id: "security_manage", name: "Manage Security", resource: "security", action: "write", description: "Manage security settings and rules", is_system_permission: true },
  { id: "security_investigate", name: "Security Investigation", resource: "security", action: "investigate", description: "Perform forensic investigations", is_system_permission: true },
  // IP management permissions
  { id: "ip_view", name: "View IP Status", resource: "ip_management", action: "read", description: "View IP ban status", is_system_permission: true },
  { id: "ip_ban", name: "Ban IPs", resource: "ip_management", action: "ban", description: "Ban and unban IP addresses", is_system_permission: true },
  { id: "ip_whitelist", name: "Whitelist IPs", resource: "ip_management", action: "whitelist", description: "Manage IP whitelist", is_system_permission: true },
  // User management permissions
  { id: "users_view", name: "View Users", resource: "users", action: "read", description: "View user accounts", is_system_permission: true },
  { id: "users_create", name: "Create Users", resource: "users", action: "create", description: "Create new user accounts", is_system_permission: true },
  { id: "users_update", name: "Update Users", resource: "users", action: "update", description: "Update user accounts", is_system_permission: true },
  { id: "users_delete", name: "Delete Users", resource: "users", action: "delete", description: "Delete user accounts", is_system_permission: true },
  // Role management permissions
  { id: "roles_view", name: "View Roles", resource: "roles", action: "read", description: "View roles and permissions", is_system_permission: true },
  { id: "roles_create", name: "Create Roles", resource: "roles", action: "create", description: "Create new roles", is_system_permission: true },
  { id: "roles_update", name: "Update Roles", resource: "roles", action: "update", description: "Update roles and permissions", is_system_permission: true },
  { id: "roles_delete", name: "Delete Roles", resource: "roles", action: "delete", description: "Delete roles", is_system_permission: true },
  // Report permissions
  { id: "reports_view", name: "View Reports", resource: "reports", action: "read", description: "View generated reports", is_system_permission: true },
  { id: "reports_generate", name: "Generate Reports", resource: "reports", action: "generate", description: "Generate new reports", is_system_permission: true },
  { id: "reports_schedule", name: "Schedule Reports", resource: "reports", action: "schedule", description: "Schedule automated reports", is_system_permission: true },
  // Alert permissions
  { id: "alerts_view", name: "View Alerts", resource: "alerts", action: "read", description: "View security alerts", is_system_permission: true },
  { id: "alerts_manage", name: "Manage Alerts", resource: "alerts", action: "write", description: "Manage alert rules and settings", is_system_permission: true },
  { id: "alerts_acknowledge", name: "Acknowledge Alerts", resource: "alerts", action: "acknowledge", description: "Acknowledge and resolve alerts", is_system_permission: true },
  // System permissions
  { id: "system_admin", name: "System Administration", resource: "system", action: "admin", description: "Full system administration access", is_system_permission: true },
  { id: "system_config", name: "System Configuration", resource: "system", action: "config", description: "Modify system configuration", is_system_permission: true }
];
const SYSTEM_ROLES = [
  {
    id: "super_admin",
    name: "Super Administrator",
    description: "Full system access with all permissions",
    is_system_role: true,
    permissions: SYSTEM_PERMISSIONS
  },
  {
    id: "security_admin",
    name: "Security Administrator",
    description: "Security management and investigation access",
    is_system_role: true,
    permissions: SYSTEM_PERMISSIONS.filter(
      (p) => p.resource === "security" || p.resource === "ip_management" || p.resource === "alerts" || p.resource === "logs" || p.id === "dashboard_view"
    )
  },
  {
    id: "analyst",
    name: "Security Analyst",
    description: "Read-only access to security data and basic investigation",
    is_system_role: true,
    permissions: SYSTEM_PERMISSIONS.filter(
      (p) => p.action === "read" || p.id === "security_investigate" || p.id === "reports_generate" || p.id === "alerts_acknowledge"
    )
  },
  {
    id: "operator",
    name: "System Operator",
    description: "Basic operational access for monitoring and basic actions",
    is_system_role: true,
    permissions: SYSTEM_PERMISSIONS.filter(
      (p) => p.action === "read" || p.id === "ip_ban" || p.id === "logs_cleanup"
    )
  },
  {
    id: "viewer",
    name: "Read-Only Viewer",
    description: "Read-only access to dashboards and basic information",
    is_system_role: true,
    permissions: SYSTEM_PERMISSIONS.filter((p) => p.action === "read")
  }
];
function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "security_salt_2025").digest("hex");
}
function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}
async function checkUserPermission(userId, resource, action, connection) {
  try {
    const [userRoles] = await connection.execute(`
      SELECT 
        JSON_EXTRACT(details, '$.permissions') as permissions
      FROM security_events 
      WHERE event_type = 'user_role_assignment' 
      AND JSON_EXTRACT(details, '$.user_id') = ?
      AND JSON_EXTRACT(details, '$.is_active') = true
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);
    if (userRoles.length === 0) {
      return false;
    }
    const userPermissions = JSON.parse(userRoles[0].permissions);
    const hasPermission = userPermissions.some(
      (perm) => perm.resource === resource && (perm.action === action || perm.action === "admin")
    );
    const hasSystemAdmin = userPermissions.some(
      (perm) => perm.id === "system_admin"
    );
    return hasPermission || hasSystemAdmin;
  } catch (error) {
    console.error("Error checking user permission:", error);
    return false;
  }
}
async function logAuditEvent(userId, action, resource, details, connection) {
  try {
    await connection.execute(
      `INSERT INTO security_events (event_type, ip_address, details, created_at) 
       VALUES ('audit_log', ?, ?, NOW())`,
      [
        userId,
        JSON.stringify({
          user_id: userId,
          action,
          resource,
          details,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          user_agent: "Security Dashboard API"
        })
      ]
    );
  } catch (error) {
    console.error("Error logging audit event:", error);
  }
}
const POST = async ({ request }) => {
  try {
    const params = await request.json();
    const { action, username, password, email, userId, roleId, roleName, permissions, resource, operation, sessionToken } = params;
    const connection = await mysql.createConnection(dbConfig);
    try {
      let result = {};
      switch (action) {
        case "authenticate":
          if (!username || !password) {
            throw new Error("Username and password are required");
          }
          const passwordHash = hashPassword(password);
          const [users] = await connection.execute(`
            SELECT 
              JSON_EXTRACT(details, '$.user_id') as user_id,
              JSON_EXTRACT(details, '$.username') as username,
              JSON_EXTRACT(details, '$.email') as email,
              JSON_EXTRACT(details, '$.password_hash') as password_hash,
              JSON_EXTRACT(details, '$.role') as role,
              JSON_EXTRACT(details, '$.is_active') as is_active
            FROM security_events 
            WHERE event_type = 'user_account' 
            AND JSON_EXTRACT(details, '$.username') = ?
            AND JSON_EXTRACT(details, '$.is_active') = true
            ORDER BY created_at DESC
            LIMIT 1
          `, [username]);
          if (users.length === 0) {
            throw new Error("Invalid credentials");
          }
          const user = users[0];
          const storedPasswordHash = JSON.parse(user.password_hash);
          if (passwordHash !== storedPasswordHash) {
            await connection.execute(
              `INSERT INTO auth_attempts (ip_address, username, success, created_at) 
               VALUES (?, ?, FALSE, NOW())`,
              ["api_request", username]
            );
            throw new Error("Invalid credentials");
          }
          const token = generateSessionToken();
          const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1e3);
          await connection.execute(
            `INSERT INTO security_events (event_type, ip_address, details, created_at) 
             VALUES ('user_session', ?, ?, NOW())`,
            [
              JSON.parse(user.user_id),
              JSON.stringify({
                user_id: JSON.parse(user.user_id),
                username: JSON.parse(user.username),
                session_token: token,
                expires_at: expiresAt.toISOString(),
                is_active: true
              })
            ]
          );
          await connection.execute(
            `INSERT INTO auth_attempts (ip_address, username, success, created_at) 
             VALUES (?, ?, TRUE, NOW())`,
            ["api_request", username]
          );
          result = {
            success: true,
            user: {
              id: JSON.parse(user.user_id),
              username: JSON.parse(user.username),
              email: JSON.parse(user.email),
              role: JSON.parse(user.role)
            },
            session_token: token,
            expires_at: expiresAt.toISOString()
          };
          break;
        case "authorize":
          if (!sessionToken) {
            throw new Error("Session token is required");
          }
          const [sessions] = await connection.execute(`
            SELECT 
              JSON_EXTRACT(details, '$.user_id') as user_id,
              JSON_EXTRACT(details, '$.username') as username,
              JSON_EXTRACT(details, '$.expires_at') as expires_at,
              JSON_EXTRACT(details, '$.is_active') as is_active
            FROM security_events 
            WHERE event_type = 'user_session' 
            AND JSON_EXTRACT(details, '$.session_token') = ?
            AND JSON_EXTRACT(details, '$.is_active') = true
            ORDER BY created_at DESC
            LIMIT 1
          `, [sessionToken]);
          if (sessions.length === 0) {
            throw new Error("Invalid session token");
          }
          const session = sessions[0];
          const sessionExpiresAt = new Date(JSON.parse(session.expires_at));
          if (/* @__PURE__ */ new Date() > sessionExpiresAt) {
            throw new Error("Session expired");
          }
          result = {
            success: true,
            user_id: JSON.parse(session.user_id),
            username: JSON.parse(session.username),
            is_valid: true
          };
          break;
        case "check_permission":
          if (!userId || !resource || !operation) {
            throw new Error("User ID, resource, and operation are required");
          }
          const hasPermission = await checkUserPermission(userId, resource, operation, connection);
          result = {
            success: true,
            user_id: userId,
            resource,
            operation,
            has_permission: hasPermission
          };
          break;
        case "create_user":
          if (!username || !password || !email || !roleName) {
            throw new Error("Username, password, email, and role are required");
          }
          const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newPasswordHash = hashPassword(password);
          const [existingUsers] = await connection.execute(`
            SELECT COUNT(*) as count
            FROM security_events 
            WHERE event_type = 'user_account' 
            AND (JSON_EXTRACT(details, '$.username') = ? OR JSON_EXTRACT(details, '$.email') = ?)
            AND JSON_EXTRACT(details, '$.is_active') = true
          `, [username, email]);
          if (existingUsers[0].count > 0) {
            throw new Error("User already exists");
          }
          const selectedRole = SYSTEM_ROLES.find((role) => role.name === roleName || role.id === roleName);
          if (!selectedRole) {
            throw new Error("Invalid role");
          }
          await connection.execute(
            `INSERT INTO security_events (event_type, ip_address, details, created_at) 
             VALUES ('user_account', ?, ?, NOW())`,
            [
              newUserId,
              JSON.stringify({
                user_id: newUserId,
                username,
                email,
                password_hash: newPasswordHash,
                role: selectedRole.id,
                is_active: true,
                created_by: "system"
              })
            ]
          );
          await connection.execute(
            `INSERT INTO security_events (event_type, ip_address, details, created_at) 
             VALUES ('user_role_assignment', ?, ?, NOW())`,
            [
              newUserId,
              JSON.stringify({
                user_id: newUserId,
                role_id: selectedRole.id,
                role_name: selectedRole.name,
                permissions: selectedRole.permissions,
                is_active: true,
                assigned_by: "system"
              })
            ]
          );
          await logAuditEvent("system", "create_user", "users", { created_user: newUserId, username, role: selectedRole.name }, connection);
          result = {
            success: true,
            user_id: newUserId,
            username,
            role: selectedRole.name,
            message: "User created successfully"
          };
          break;
        case "assign_role":
          if (!userId || !roleName) {
            throw new Error("User ID and role name are required");
          }
          const roleToAssign = SYSTEM_ROLES.find((role) => role.name === roleName || role.id === roleName);
          if (!roleToAssign) {
            throw new Error("Invalid role");
          }
          await connection.execute(
            `INSERT INTO security_events (event_type, ip_address, details, created_at) 
             VALUES ('user_role_revocation', ?, ?, NOW())`,
            [
              userId,
              JSON.stringify({
                user_id: userId,
                revoked_by: "system",
                reason: "Role reassignment"
              })
            ]
          );
          await connection.execute(
            `INSERT INTO security_events (event_type, ip_address, details, created_at) 
             VALUES ('user_role_assignment', ?, ?, NOW())`,
            [
              userId,
              JSON.stringify({
                user_id: userId,
                role_id: roleToAssign.id,
                role_name: roleToAssign.name,
                permissions: roleToAssign.permissions,
                is_active: true,
                assigned_by: "system"
              })
            ]
          );
          await logAuditEvent("system", "assign_role", "roles", { user_id: userId, new_role: roleToAssign.name }, connection);
          result = {
            success: true,
            user_id: userId,
            new_role: roleToAssign.name,
            permissions_count: roleToAssign.permissions.length,
            message: "Role assigned successfully"
          };
          break;
        case "audit_log":
          const [auditLogs] = await connection.execute(`
            SELECT 
              JSON_EXTRACT(details, '$.user_id') as user_id,
              JSON_EXTRACT(details, '$.action') as action,
              JSON_EXTRACT(details, '$.resource') as resource,
              JSON_EXTRACT(details, '$.details') as event_details,
              created_at
            FROM security_events 
            WHERE event_type = 'audit_log'
            ORDER BY created_at DESC
            LIMIT 100
          `);
          result = {
            success: true,
            audit_logs: auditLogs.map((log) => ({
              user_id: JSON.parse(log.user_id),
              action: JSON.parse(log.action),
              resource: JSON.parse(log.resource),
              details: JSON.parse(log.event_details),
              timestamp: log.created_at
            }))
          };
          break;
        default:
          throw new Error("Invalid action");
      }
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error in access control:", error);
    return new Response(JSON.stringify({
      error: "Access control operation failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const GET = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const userId = url.searchParams.get("userId");
    const connection = await mysql.createConnection(dbConfig);
    try {
      let result = {};
      switch (action) {
        case "roles":
          result = {
            success: true,
            system_roles: SYSTEM_ROLES.map((role) => ({
              id: role.id,
              name: role.name,
              description: role.description,
              permissions_count: role.permissions.length,
              is_system_role: role.is_system_role
            }))
          };
          break;
        case "permissions":
          result = {
            success: true,
            system_permissions: SYSTEM_PERMISSIONS.map((perm) => ({
              id: perm.id,
              name: perm.name,
              resource: perm.resource,
              action: perm.action,
              description: perm.description
            })),
            resources: [...new Set(SYSTEM_PERMISSIONS.map((p) => p.resource))],
            actions: [...new Set(SYSTEM_PERMISSIONS.map((p) => p.action))]
          };
          break;
        case "user_permissions":
          if (!userId) {
            throw new Error("User ID is required");
          }
          const [userPerms] = await connection.execute(`
            SELECT 
              JSON_EXTRACT(details, '$.role_name') as role_name,
              JSON_EXTRACT(details, '$.permissions') as permissions
            FROM security_events 
            WHERE event_type = 'user_role_assignment' 
            AND JSON_EXTRACT(details, '$.user_id') = ?
            AND JSON_EXTRACT(details, '$.is_active') = true
            ORDER BY created_at DESC
            LIMIT 1
          `, [userId]);
          if (userPerms.length === 0) {
            result = {
              success: true,
              user_id: userId,
              role: "none",
              permissions: []
            };
          } else {
            const userPermData = userPerms[0];
            result = {
              success: true,
              user_id: userId,
              role: JSON.parse(userPermData.role_name),
              permissions: JSON.parse(userPermData.permissions)
            };
          }
          break;
        case "users":
          const [allUsers] = await connection.execute(`
            SELECT DISTINCT
              JSON_EXTRACT(details, '$.user_id') as user_id,
              JSON_EXTRACT(details, '$.username') as username,
              JSON_EXTRACT(details, '$.email') as email,
              JSON_EXTRACT(details, '$.role') as role,
              JSON_EXTRACT(details, '$.is_active') as is_active,
              created_at
            FROM security_events 
            WHERE event_type = 'user_account'
            AND JSON_EXTRACT(details, '$.is_active') = true
            ORDER BY created_at DESC
          `);
          result = {
            success: true,
            users: allUsers.map((user) => ({
              id: JSON.parse(user.user_id),
              username: JSON.parse(user.username),
              email: JSON.parse(user.email),
              role: JSON.parse(user.role),
              is_active: JSON.parse(user.is_active),
              created_at: user.created_at
            }))
          };
          break;
        case "install_defaults":
          const [adminExists] = await connection.execute(`
            SELECT COUNT(*) as count
            FROM security_events 
            WHERE event_type = 'user_account' 
            AND JSON_EXTRACT(details, '$.username') = 'admin'
            AND JSON_EXTRACT(details, '$.is_active') = true
          `);
          if (adminExists[0].count === 0) {
            const adminUserId = `user_admin_${Date.now()}`;
            const adminPasswordHash = hashPassword("admin123");
            await connection.execute(
              `INSERT INTO security_events (event_type, ip_address, details, created_at) 
               VALUES ('user_account', ?, ?, NOW())`,
              [
                adminUserId,
                JSON.stringify({
                  user_id: adminUserId,
                  username: "admin",
                  email: "admin@security-dashboard.local",
                  password_hash: adminPasswordHash,
                  role: "super_admin",
                  is_active: true,
                  created_by: "system_install"
                })
              ]
            );
            await connection.execute(
              `INSERT INTO security_events (event_type, ip_address, details, created_at) 
               VALUES ('user_role_assignment', ?, ?, NOW())`,
              [
                adminUserId,
                JSON.stringify({
                  user_id: adminUserId,
                  role_id: "super_admin",
                  role_name: "Super Administrator",
                  permissions: SYSTEM_PERMISSIONS,
                  is_active: true,
                  assigned_by: "system_install"
                })
              ]
            );
          }
          result = {
            success: true,
            message: "Default access control setup completed",
            default_admin: {
              username: "admin",
              password: "admin123",
              note: "Please change the default password immediately"
            },
            roles_installed: SYSTEM_ROLES.length,
            permissions_installed: SYSTEM_PERMISSIONS.length
          };
          break;
        default:
          result = {
            success: true,
            available_actions: ["roles", "permissions", "user_permissions", "users", "install_defaults"],
            access_control_status: "active",
            system_info: {
              total_roles: SYSTEM_ROLES.length,
              total_permissions: SYSTEM_PERMISSIONS.length,
              resources: [...new Set(SYSTEM_PERMISSIONS.map((p) => p.resource))].length
            }
          };
      }
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error in access control GET:", error);
    return new Response(JSON.stringify({
      error: "Failed to process access control request",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
