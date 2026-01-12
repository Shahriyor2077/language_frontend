import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherService } from "@/services/teacher.service";
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
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import type { Teacher, TeacherSpecialty, TeacherLevel } from "@/types";
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
import { Textarea } from "@/components/ui/textarea";

const createTeacherSchema = z
  .object({
    email: z.string().min(1, "Email kiritilishi shart").email("Email noto'g'ri"),
    phoneNumber: z.string().min(1, "Telefon kiritilishi shart").max(20, "Telefon raqam 20 ta belgidan oshmasin"),
    fullName: z.string().min(1, "Ism kiritilishi shart").max(255, "Ism 255 ta belgidan oshmasin"),
    password: z.string().min(6, "Parol kamida 6 ta belgi"),
    confirm_password: z.string().min(6, "Parol kamida 6 ta belgi"),
    cardNumber: z.string().min(1, "Karta raqami kiritilishi shart").max(50, "Karta raqami 50 ta belgidan oshmasin"),
    isActive: z.boolean().optional(),
    specification: z.enum(["english", "french", "spanish", "italian", "german"]).optional(),
    level: z.enum(["b2", "c1", "c2"]).optional(),
    description: z.string().max(1000).optional(),
    hourPrice: z.coerce.number().min(0).optional(),
    portfolioLink: z.string().optional(),
    experience: z.string().max(50).optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Parollar mos kelmaydi",
    path: ["confirm_password"],
  });

const updateTeacherSchema = z.object({
  email: z.string().email("Email noto'g'ri").optional(),
  phoneNumber: z.string().max(20).optional(),
  fullName: z.string().max(255).optional(),
  cardNumber: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  specification: z.enum(["english", "french", "spanish", "italian", "german"]).optional(),
  level: z.enum(["b2", "c1", "c2"]).optional(),
  description: z.string().max(1000).optional(),
  hourPrice: z.coerce.number().min(0).optional(),
  portfolioLink: z.string().optional(),
  experience: z.string().max(50).optional(),
});

type CreateTeacherFormData = z.infer<typeof createTeacherSchema>;
type UpdateTeacherFormData = z.infer<typeof updateTeacherSchema>;

const specialtyLabels: Record<TeacherSpecialty, string> = {
  english: "Ingliz tili",
  french: "Fransuz tili",
  spanish: "Ispan tili",
  italian: "Italyan tili",
  german: "Nemis tili",
};

const levelLabels: Record<TeacherLevel, string> = {
  b2: "B2",
  c1: "C1",
  c2: "C2",
};

const Teachers = () => {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: teacherService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: teacherService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("O'qituvchi yaratildi");
      setIsCreateOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeacherFormData }) =>
      teacherService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("O'qituvchi yangilandi");
      setEditingTeacher(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: teacherService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("O'qituvchi o'chirildi");
      setDeletingTeacher(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const teachers = data?.teachers || [];
  const filteredTeachers = teachers.filter(
    (t) =>
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.phoneNumber.includes(search)
  );

  const createForm = useForm<CreateTeacherFormData>({
    resolver: zodResolver(createTeacherSchema) as any,
    defaultValues: {
      email: "",
      phoneNumber: "",
      fullName: "",
      password: "",
      confirm_password: "",
      cardNumber: "",
      isActive: true,
      specification: "english",
      level: "b2",
      description: "",
      hourPrice: 0,
      experience: "",
      portfolioLink: "",
    },
  });

  const updateForm = useForm<UpdateTeacherFormData>({
    resolver: zodResolver(updateTeacherSchema) as any,
  });

  const onCreateSubmit = (data: CreateTeacherFormData) => {
    const submitData: any = {
      email: data.email,
      phoneNumber: data.phoneNumber,
      fullName: data.fullName,
      password: data.password,
      confirm_password: data.confirm_password,
      cardNumber: data.cardNumber,
      googleId: `manual_${Date.now()}`,
    };

    if (data.specification) submitData.specification = data.specification;
    if (data.level) submitData.level = data.level;
    if (data.isActive !== undefined) submitData.isActive = data.isActive;
    if (data.description) submitData.description = data.description;
    if (data.experience) submitData.experience = data.experience;
    if (data.hourPrice && data.hourPrice > 0) submitData.hourPrice = Math.floor(data.hourPrice);
    if (data.portfolioLink && data.portfolioLink.trim()) submitData.portfolioLink = data.portfolioLink;

    createMutation.mutate(submitData);
  };

  const onUpdateSubmit = (data: UpdateTeacherFormData) => {
    if (editingTeacher) {
      updateMutation.mutate({ id: editingTeacher.id, data });
    }
  };

  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    updateForm.reset({
      fullName: teacher.fullName,
      email: teacher.email,
      phoneNumber: teacher.phoneNumber,
      cardNumber: teacher.cardNumber,
      specification: teacher.specification,
      level: teacher.level,
      hourPrice: teacher.hourPrice || 0,
      description: teacher.description || "",
      experience: teacher.experience || "",
      isActive: teacher.isActive,
    });
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">O'qituvchilar</h1>
          <p className="text-muted-foreground">Barcha o'qituvchilarni boshqarish</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => createForm.reset()}>
              <Plus className="mr-2 h-4 w-4" />
              Yangi o'qituvchi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yangi o'qituvchi qo'shish</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To'liq ism *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ism familiya" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon *</FormLabel>
                        <FormControl>
                          <Input placeholder="+998901234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Karta raqami *</FormLabel>
                        <FormControl>
                          <Input placeholder="8600123456789012" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parol *</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parolni tasdiqlash *</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="specification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mutaxassislik</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(specialtyLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daraja</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(levelLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="hourPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Soatlik narx (so'm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tajriba</FormLabel>
                        <FormControl>
                          <Input placeholder="5 yil" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tavsif</FormLabel>
                      <FormControl>
                        <Textarea placeholder="O'qituvchi haqida..." {...field} />
                      </FormControl>
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
              <TableHead>Ism</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Mutaxassislik</TableHead>
              <TableHead>Daraja</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredTeachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  O'qituvchilar topilmadi
                </TableCell>
              </TableRow>
            ) : (
              filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.fullName}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.phoneNumber}</TableCell>
                  <TableCell>{specialtyLabels[teacher.specification]}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{levelLabels[teacher.level]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={teacher.isActive ? "default" : "destructive"}>
                      {teacher.isActive ? "Faol" : "Nofaol"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setViewingTeacher(teacher)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(teacher)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingTeacher(teacher)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
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
        open={!!deletingTeacher}
        onOpenChange={() => setDeletingTeacher(null)}
        title="O'chirishni tasdiqlang"
        description={`${deletingTeacher?.fullName} ni o'chirmoqchimisiz?`}
        onConfirm={() => deletingTeacher && deleteMutation.mutate(deletingTeacher.id)}
        confirmText="O'chirish"
        isLoading={deleteMutation.isPending}
      />


      {/* Edit Dialog */}
      <Dialog open={!!editingTeacher} onOpenChange={() => setEditingTeacher(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>O'qituvchini tahrirlash</DialogTitle>
          </DialogHeader>
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={updateForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To'liq ism</FormLabel>
                      <FormControl>
                        <Input placeholder="Ism familiya" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <FormField
                  control={updateForm.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Karta raqami</FormLabel>
                      <FormControl>
                        <Input placeholder="8600123456789012" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={updateForm.control}
                  name="specification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mutaxassislik</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(specialtyLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daraja</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(levelLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={updateForm.control}
                  name="hourPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soatlik narx (so'm)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tajriba</FormLabel>
                      <FormControl>
                        <Input placeholder="5 yil" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={updateForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tavsif</FormLabel>
                    <FormControl>
                      <Textarea placeholder="O'qituvchi haqida..." {...field} />
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


      {/* View Dialog */}
      <Dialog open={!!viewingTeacher} onOpenChange={() => setViewingTeacher(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>O'qituvchi ma'lumotlari</DialogTitle>
          </DialogHeader>
          {viewingTeacher && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ism</p>
                <p className="font-medium">{viewingTeacher.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{viewingTeacher.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefon</p>
                <p className="font-medium">{viewingTeacher.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Karta raqami</p>
                <p className="font-medium">{viewingTeacher.cardNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mutaxassislik</p>
                <p className="font-medium">{specialtyLabels[viewingTeacher.specification]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daraja</p>
                <p className="font-medium">{levelLabels[viewingTeacher.level]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Soatlik narx</p>
                <p className="font-medium">{viewingTeacher.hourPrice?.toLocaleString() || 0} so'm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reyting</p>
                <p className="font-medium">{viewingTeacher.rating || 0} / 5</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tajriba</p>
                <p className="font-medium">{viewingTeacher.experience || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Holat</p>
                <Badge variant={viewingTeacher.isActive ? "default" : "destructive"}>
                  {viewingTeacher.isActive ? "Faol" : "Nofaol"}
                </Badge>
              </div>
              {viewingTeacher.description && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Tavsif</p>
                  <p className="font-medium">{viewingTeacher.description}</p>
                </div>
              )}
              {viewingTeacher.portfolioLink && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Portfolio</p>
                  <a
                    href={viewingTeacher.portfolioLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {viewingTeacher.portfolioLink}
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teachers;
