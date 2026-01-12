import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Key,
} from "lucide-react";
import type { Admin, AdminRole } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PasswordInput } from "@/components/ui/password-input";


const adminSchema = z.object({
  username: z.string().min(3, "Username kamida 3 ta belgi"),
  password: z.string().min(4, "Parol kamida 4 ta belgi"),
  phoneNumber: z.string().min(9, "Telefon raqam noto'g'ri"),
  role: z.enum(["admin", "superAdmin"]),
  isActive: z.boolean(),
});

const updateAdminSchema = z.object({
  username: z.string().min(3, "Username kamida 3 ta belgi"),
  phoneNumber: z.string().min(9, "Telefon raqam noto'g'ri"),
  role: z.enum(["admin", "superAdmin"]),
  newPassword: z.string().optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(4, "Joriy parol kamida 4 ta belgi"),
    newPassword: z.string().min(4, "Yangi parol kamida 4 ta belgi"),
    confirmPassword: z.string().min(4, "Tasdiqlash paroli kamida 4 ta belgi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Parollar mos kelmaydi",
    path: ["confirmPassword"],
  });

type AdminFormData = z.infer<typeof adminSchema>;
type UpdateAdminFormData = z.infer<typeof updateAdminSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const roleLabels: Record<AdminRole, string> = {
  admin: "Admin",
  superAdmin: "Super Admin",
};

const Admins = () => {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [viewingAdmin, setViewingAdmin] = useState<Admin | null>(null);
  const [changingPasswordAdmin, setChangingPasswordAdmin] = useState<Admin | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);
  const queryClient = useQueryClient();

  const currentUser = JSON.parse(localStorage.getItem("admin") || "{}");
  const isSuperAdmin = currentUser?.role === "superAdmin";

  const { data, isLoading } = useQuery({
    queryKey: ["admins", search],
    queryFn: () => adminService.getAll({ search: search || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: adminService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin yaratildi");
      setIsCreateOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Admin> }) =>
      adminService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin yangilandi");
      setEditingAdmin(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin o'chirildi");
      setDeletingAdmin(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const activateMutation = useMutation({
    mutationFn: adminService.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin faollashtirildi");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: adminService.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin nofaollashtirildi");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePasswordFormData }) =>
      adminService.changePassword(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Parol o'zgartirildi");
      setChangingPasswordAdmin(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const admins = data?.data || [];


  const createForm = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      username: "",
      password: "",
      phoneNumber: "",
      role: "admin",
      isActive: true,
    },
  });

  const updateForm = useForm<UpdateAdminFormData>({
    resolver: zodResolver(updateAdminSchema),
    defaultValues: {
      username: "",
      phoneNumber: "",
      role: "admin",
      newPassword: "",
    },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onCreateSubmit = (data: AdminFormData) => {
    createMutation.mutate(data);
  };

  const onUpdateSubmit = (data: UpdateAdminFormData) => {
    if (editingAdmin) {
      const updateData: any = {
        username: data.username,
        phoneNumber: data.phoneNumber,
        role: data.role,
      };
      if (data.newPassword) {
        updateData.newPassword = data.newPassword;
      }
      updateMutation.mutate({ id: editingAdmin.id, data: updateData });
    }
  };

  const onPasswordSubmit = (data: ChangePasswordFormData) => {
    if (changingPasswordAdmin) {
      changePasswordMutation.mutate({ id: changingPasswordAdmin.id, data });
    }
  };

  const openEditDialog = (admin: Admin) => {
    setEditingAdmin(admin);
    updateForm.reset({
      username: admin.username,
      phoneNumber: admin.phoneNumber,
      role: admin.role,
      newPassword: "",
    });
  };

  const openPasswordDialog = (admin: Admin) => {
    setChangingPasswordAdmin(admin);
    passwordForm.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Adminlar</h1>
          <p className="text-muted-foreground">Barcha adminlarni boshqarish</p>
        </div>
        {isSuperAdmin && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => createForm.reset()}>
                <Plus className="mr-2 h-4 w-4" />
                Yangi admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yangi admin qo'shish</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="admin_user" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parol</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon</FormLabel>
                        <FormControl>
                          <Input placeholder="+998901234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rol</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Saqlanmoqda..." : "Qo'shish"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>


      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>Yaratilgan</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Adminlar topilmadi
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.username}</TableCell>
                  <TableCell>{admin.phoneNumber}</TableCell>
                  <TableCell>
                    <Badge variant={admin.role === "superAdmin" ? "default" : "secondary"}>
                      {roleLabels[admin.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.isActive ? "default" : "destructive"}>
                      {admin.isActive ? "Faol" : "Nofaol"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(admin.createdAt).toLocaleDateString("uz-UZ")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingAdmin(admin)}
                        title="Ko'rish"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(isSuperAdmin || currentUser?.id === admin.id) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(admin)}
                            title="Tahrirlash"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPasswordDialog(admin)}
                            title="Parolni o'zgartirish"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {isSuperAdmin && currentUser?.id !== admin.id && (
                        <>
                          {admin.isActive ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deactivateMutation.mutate(admin.id)}
                              title="Nofaollashtirish"
                            >
                              <XCircle className="h-4 w-4 text-orange-500" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => activateMutation.mutate(admin.id)}
                              title="Faollashtirish"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingAdmin(admin)}
                            title="O'chirish"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>


      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deletingAdmin}
        onOpenChange={() => setDeletingAdmin(null)}
        title="O'chirishni tasdiqlang"
        description={`${deletingAdmin?.username} ni o'chirmoqchimisiz?`}
        onConfirm={() => deletingAdmin && deleteMutation.mutate(deletingAdmin.id)}
        confirmText="O'chirish"
        isLoading={deleteMutation.isPending}
      />

      {/* Edit Dialog */}
      <Dialog open={!!editingAdmin} onOpenChange={() => setEditingAdmin(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adminni tahrirlash</DialogTitle>
          </DialogHeader>
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
              <FormField
                control={updateForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="admin_user" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="+998901234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isSuperAdmin && (
                <FormField
                  control={updateForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="superAdmin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={updateForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yangi parol (ixtiyoriy)</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>


      {/* Change Password Dialog */}
      <Dialog open={!!changingPasswordAdmin} onOpenChange={() => setChangingPasswordAdmin(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Parolni o'zgartirish</DialogTitle>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joriy parol</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yangi parol</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parolni tasdiqlash</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? "Saqlanmoqda..." : "O'zgartirish"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingAdmin} onOpenChange={() => setViewingAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin ma'lumotlari</DialogTitle>
          </DialogHeader>
          {viewingAdmin && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium">{viewingAdmin.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefon</p>
                <p className="font-medium">{viewingAdmin.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <Badge variant={viewingAdmin.role === "superAdmin" ? "default" : "secondary"}>
                  {roleLabels[viewingAdmin.role]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Holat</p>
                <Badge variant={viewingAdmin.isActive ? "default" : "destructive"}>
                  {viewingAdmin.isActive ? "Faol" : "Nofaol"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Yaratilgan</p>
                <p className="font-medium">{new Date(viewingAdmin.createdAt).toLocaleString("uz-UZ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Yangilangan</p>
                <p className="font-medium">{new Date(viewingAdmin.updatedAt).toLocaleString("uz-UZ")}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admins;
