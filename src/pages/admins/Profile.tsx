import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Key, User, Phone, Lock, Clock } from "lucide-react";
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
import { PasswordInput } from "@/components/ui/password-input";
import type { AdminRole } from "@/types";

const updateProfileSchema = z.object({
  username: z.string().min(3, "Username kamida 3 ta belgi"),
  phoneNumber: z.string().min(9, "Telefon raqam noto'g'ri"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(4, "Joriy parol kamida 4 ta belgi"),
  newPassword: z.string().min(4, "Yangi parol kamida 4 ta belgi"),
  confirmPassword: z.string().min(4, "Tasdiqlash paroli kamida 4 ta belgi"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Parollar mos kelmaydi",
  path: ["confirmPassword"],
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const roleLabels: Record<AdminRole, string> = {
  admin: "Admin",
  superAdmin: "Super Admin",
};


const Profile = () => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const queryClient = useQueryClient();

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("admin") || "{}");
  const isEnvSuperAdmin = currentUser?.id === "env-superadmin";

  const { data: admin, isLoading } = useQuery({
    queryKey: ["admin-profile", currentUser?.id],
    queryFn: () => adminService.getById(currentUser?.id),
    enabled: !!currentUser?.id && !isEnvSuperAdmin,
  });

  // Env superadmin uchun statik ma'lumotlar
  const envSuperAdminData = {
    id: "env-superadmin",
    username: "superadmin",
    phoneNumber: "-",
    role: "superAdmin" as AdminRole,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const displayAdmin = isEnvSuperAdmin ? envSuperAdminData : admin;

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileFormData) =>
      adminService.update(currentUser?.id, data),
    onSuccess: (updatedAdmin) => {
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
      // Update localStorage
      const stored = JSON.parse(localStorage.getItem("admin") || "{}");
      localStorage.setItem("admin", JSON.stringify({ ...stored, ...updatedAdmin }));
      toast.success("Profil yangilandi");
      setIsEditOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      adminService.changePassword(currentUser?.id, data),
    onSuccess: () => {
      toast.success("Parol o'zgartirildi");
      setIsPasswordOpen(false);
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: admin?.username || "",
      phoneNumber: admin?.phoneNumber || "",
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

  // Update form when admin data loads
  if (admin && profileForm.getValues("username") !== admin.username) {
    profileForm.reset({
      username: admin.username,
      phoneNumber: admin.phoneNumber,
    });
  }

  if (isLoading && !isEnvSuperAdmin) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">Mening profilim</h1>
          <p className="text-muted-foreground">
            Shaxsiy ma'lumotlaringizni boshqaring
          </p>
        </div>
        <div className="flex gap-2">
          {!isEnvSuperAdmin && (
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                  <Pencil className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Tahrirlash
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md border-indigo-200 dark:border-indigo-800">
                <DialogHeader>
                  <DialogTitle className="text-indigo-600 dark:text-indigo-400">Profilni tahrirlash</DialogTitle>
                </DialogHeader>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-indigo-700 dark:text-indigo-300">Username</FormLabel>
                          <FormControl>
                            <Input placeholder="admin_user" className="border-indigo-200 dark:border-indigo-700 focus:ring-indigo-500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-indigo-700 dark:text-indigo-300">Telefon</FormLabel>
                          <FormControl>
                            <Input placeholder="+998901234567" className="border-indigo-200 dark:border-indigo-700 focus:ring-indigo-500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 dark:from-indigo-700 dark:to-blue-700 dark:hover:from-indigo-600 dark:hover:to-blue-600 text-white" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}

          {!isEnvSuperAdmin && (
            <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                  <Key className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Parolni o'zgartirish
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md border-indigo-200 dark:border-indigo-800">
                <DialogHeader>
                  <DialogTitle className="text-indigo-600 dark:text-indigo-400">Parolni o'zgartirish</DialogTitle>
                </DialogHeader>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit((data) => changePasswordMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-indigo-700 dark:text-indigo-300">Joriy parol</FormLabel>
                          <FormControl>
                            <PasswordInput placeholder="••••••••" className="border-indigo-200 dark:border-indigo-700 focus:ring-indigo-500" {...field} />
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
                          <FormLabel className="text-indigo-700 dark:text-indigo-300">Yangi parol</FormLabel>
                          <FormControl>
                            <PasswordInput placeholder="••••••••" className="border-indigo-200 dark:border-indigo-700 focus:ring-indigo-500" {...field} />
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
                          <FormLabel className="text-indigo-700 dark:text-indigo-300">Parolni tasdiqlash</FormLabel>
                          <FormControl>
                            <PasswordInput placeholder="••••••••" className="border-indigo-200 dark:border-indigo-700 focus:ring-indigo-500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 dark:from-indigo-700 dark:to-blue-700 dark:hover:from-indigo-600 dark:hover:to-blue-600 text-white" disabled={changePasswordMutation.isPending}>
                      {changePasswordMutation.isPending ? "Saqlanmoqda..." : "O'zgartirish"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>


      {displayAdmin && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-indigo-200 dark:border-indigo-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-b border-indigo-200 dark:border-indigo-800">
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Asosiy ma'lumotlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between py-2 border-b border-indigo-100 dark:border-indigo-800">
                <span className="text-muted-foreground">Username</span>
                <span className="font-medium text-indigo-700 dark:text-indigo-300">{displayAdmin.username}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-indigo-100 dark:border-indigo-800">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Telefon
                </span>
                <span className="font-medium text-indigo-700 dark:text-indigo-300">{displayAdmin.phoneNumber}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Rol
                </span>
                <Badge variant={displayAdmin.role === "superAdmin" ? "default" : "secondary"} className={displayAdmin.role === "superAdmin" ? "bg-gradient-to-r from-indigo-600 to-blue-600" : ""}>
                  {roleLabels[displayAdmin.role]}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 dark:border-indigo-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-b border-indigo-200 dark:border-indigo-800">
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Qo'shimcha ma'lumotlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between py-2 border-b border-indigo-100 dark:border-indigo-800">
                <span className="text-muted-foreground">Holat</span>
                <Badge variant={displayAdmin.isActive ? "default" : "destructive"} className={displayAdmin.isActive ? "bg-gradient-to-r from-emerald-600 to-teal-600" : ""}>
                  {displayAdmin.isActive ? "Faol" : "Nofaol"}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-indigo-100 dark:border-indigo-800">
                <span className="text-muted-foreground">Yaratilgan</span>
                <span className="font-medium text-indigo-700 dark:text-indigo-300">
                  {new Date(displayAdmin.createdAt).toLocaleString("uz-UZ")}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Oxirgi yangilanish</span>
                <span className="font-medium text-indigo-700 dark:text-indigo-300">
                  {new Date(displayAdmin.updatedAt).toLocaleString("uz-UZ")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile;
