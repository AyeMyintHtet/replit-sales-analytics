import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, Shield, Edit, User, Crown, UserCheck } from "lucide-react";

export default function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await apiRequest("PUT", `/api/users/${userId}/role`, { role });
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: `User role updated to ${getRoleDisplay(updatedUser.role)}.`,
      });
      setEditingUserId(null);
      setNewRole("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role.",
        variant: "destructive",
      });
    },
  });

  const handleRoleUpdate = (userId: string, role: string) => {
    if (!role) {
      toast({
        title: "Validation Error",
        description: "Please select a role.",
        variant: "destructive",
      });
      return;
    }
    updateRoleMutation.mutate({ userId, role });
  };

  const startEditing = (userId: string, currentRole: string) => {
    setEditingUserId(userId);
    setNewRole(currentRole);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setNewRole("");
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "sales_manager":
        return "Sales Manager";
      case "sales_rep":
        return "Sales Rep";
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive/10 text-destructive";
      case "sales_manager":
        return "bg-primary/10 text-primary";
      case "sales_rep":
        return "bg-secondary/10 text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return Crown;
      case "sales_manager":
        return Shield;
      case "sales_rep":
        return UserCheck;
      default:
        return User;
    }
  };

  const getPermissions = (role: string) => {
    switch (role) {
      case "admin":
        return ["Full system access", "User management", "All data operations", "System configuration"];
      case "sales_manager":
        return ["Manage competitors", "Manage products", "View all data", "Team oversight"];
      case "sales_rep":
        return ["Add pricing data", "View assigned data", "Basic reporting"];
      default:
        return [];
    }
  };

  // Check if current user is admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                <p className="text-muted-foreground">Access denied</p>
              </div>
            </div>
          </header>
          
          <main className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="pt-6 text-center">
                <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Access Restricted</h2>
                <p className="text-muted-foreground">
                  You need administrator privileges to access user management.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">User Management</h1>
              <p className="text-muted-foreground">Manage user roles and permissions</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Role Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card data-testid="card-role-overview-admin">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Crown className="w-5 h-5 mr-2 text-destructive" />
                  Administrator
                </CardTitle>
                <CardDescription>Full system access and control</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-foreground">
                    {(users as any[])?.filter((u: any) => u.role === "admin").length || 0}
                  </p>
                  <div className="space-y-1">
                    {getPermissions("admin").map((permission, index) => (
                      <p key={index} className="text-xs text-muted-foreground">• {permission}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-role-overview-manager">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  Sales Manager
                </CardTitle>
                <CardDescription>Team and data management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-foreground">
                    {(users as any[])?.filter((u: any) => u.role === "sales_manager").length || 0}
                  </p>
                  <div className="space-y-1">
                    {getPermissions("sales_manager").map((permission, index) => (
                      <p key={index} className="text-xs text-muted-foreground">• {permission}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-role-overview-rep">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <UserCheck className="w-5 h-5 mr-2 text-secondary-foreground" />
                  Sales Representative
                </CardTitle>
                <CardDescription>Data entry and reporting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-foreground">
                    {(users as any[])?.filter((u: any) => u.role === "sales_rep").length || 0}
                  </p>
                  <div className="space-y-1">
                    {getPermissions("sales_rep").map((permission, index) => (
                      <p key={index} className="text-xs text-muted-foreground">• {permission}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card data-testid="card-users-table">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                All Users ({(users as any[])?.length || 0})
              </CardTitle>
              <CardDescription>
                Manage user roles and permissions across the organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : (users as any[])?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Current Role</TableHead>
                        <TableHead>Member Since</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(users as any[]).map((userItem: any, index: number) => {
                        const RoleIcon = getRoleIcon(userItem.role);
                        const isEditing = editingUserId === userItem.id;
                        
                        return (
                          <TableRow key={userItem.id} data-testid={`row-user-${index}`}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-accent-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground" data-testid={`text-user-name-${index}`}>
                                    {userItem.fullName}
                                  </p>
                                  <p className="text-sm text-muted-foreground" data-testid={`text-username-${index}`}>
                                    @{userItem.username}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground" data-testid={`text-user-email-${index}`}>
                              {userItem.email}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <RoleIcon className="w-4 h-4" />
                                <Badge 
                                  className={getRoleColor(userItem.role)}
                                  data-testid={`badge-user-role-${index}`}
                                >
                                  {getRoleDisplay(userItem.role)}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground" data-testid={`text-user-created-${index}`}>
                              {new Date(userItem.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <div className="flex items-center space-x-2">
                                  <Select value={newRole} onValueChange={setNewRole}>
                                    <SelectTrigger className="w-32" data-testid={`select-new-role-${index}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">Administrator</SelectItem>
                                      <SelectItem value="sales_manager">Sales Manager</SelectItem>
                                      <SelectItem value="sales_rep">Sales Rep</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    size="sm"
                                    onClick={() => handleRoleUpdate(userItem.id, newRole)}
                                    disabled={updateRoleMutation.isPending}
                                    data-testid={`button-save-role-${index}`}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelEditing}
                                    data-testid={`button-cancel-edit-${index}`}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditing(userItem.id, userItem.role)}
                                  disabled={userItem.id === user?.id} // Prevent self-editing
                                  data-testid={`button-edit-role-${index}`}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit Role
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto opacity-50 mb-4" />
                  <p>No users found</p>
                  <p className="text-sm">Users will appear here once they register</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role Permissions Reference */}
          <Card data-testid="card-permissions-reference">
            <CardHeader>
              <CardTitle>Role Permissions Reference</CardTitle>
              <CardDescription>
                Understanding what each role can do in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-destructive" />
                    <h4 className="font-semibold text-foreground">Administrator</h4>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Full system access</li>
                    <li>• User role management</li>
                    <li>• Delete any data</li>
                    <li>• System configuration</li>
                    <li>• All reporting features</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-foreground">Sales Manager</h4>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Manage competitors</li>
                    <li>• Manage products</li>
                    <li>• Add/edit pricing data</li>
                    <li>• Advanced reporting</li>
                    <li>• Team data oversight</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-secondary-foreground" />
                    <h4 className="font-semibold text-foreground">Sales Representative</h4>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Add pricing data</li>
                    <li>• View dashboard</li>
                    <li>• Basic reporting</li>
                    <li>• View assigned data</li>
                    <li>• Update own entries</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
