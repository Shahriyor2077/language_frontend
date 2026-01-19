import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
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
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { Search, Eye, Ban, CheckCircle, Trash2 } from "lucide-react";
import type { Student } from "@/types";
import { Textarea } from "@/components/ui/textarea";

const Students = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [blockingStudent, setBlockingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["students", page, search],
    queryFn: () => studentService.getAll({ page, limit: 10, search }),
  });

  const blockMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      studentService.block(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("O'quvchi bloklandi");
      setBlockingStudent(null);
      setBlockReason("");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const unblockMutation = useMutation({
    mutationFn: studentService.unblock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("O'quvchi blokdan chiqarildi");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: studentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("O'quvchi o'chirildi");
      setDeletingStudent(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const students = data?.data || [];
  const meta = data?.meta;


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">O'quvchilar</h1>
          <p className="text-muted-foreground">Barcha o'quvchilarni boshqarish</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ism</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Telegram</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>Ro'yxatdan o'tgan</TableHead>
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
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  O'quvchilar topilmadi
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell>{student.phoneNumber}</TableCell>
                  <TableCell>{student.tgUsername ? `@${student.tgUsername}` : "-"}</TableCell>
                  <TableCell>
                    {student.isBlocked ? (
                      <Badge variant="destructive">Bloklangan</Badge>
                    ) : student.isActive ? (
                      <Badge variant="default">Faol</Badge>
                    ) : (
                      <Badge variant="secondary">Nofaol</Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(student.createdAt).toLocaleDateString("uz-UZ")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setViewingStudent(student)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {student.isBlocked ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => unblockMutation.mutate(student.id)}
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setBlockingStudent(student)}
                        >
                          <Ban className="h-4 w-4 text-orange-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingStudent(student)}
                      >
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


      {meta && meta.totalPage > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Jami: {meta.total} ta o'quvchi</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Oldingi
            </Button>
            <span className="flex items-center px-3 text-sm">
              {page} / {meta.totalPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.totalPage, p + 1))}
              disabled={page === meta.totalPage}
            >
              Keyingi
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deletingStudent}
        onOpenChange={() => setDeletingStudent(null)}
        title="O'chirishni tasdiqlang"
        description={`${deletingStudent?.firstName} ${deletingStudent?.lastName} ni o'chirmoqchimisiz?`}
        onConfirm={() => deletingStudent && deleteMutation.mutate(deletingStudent.id)}
        confirmText="O'chirish"
        isLoading={deleteMutation.isPending}
      />

      {/* View Dialog */}
      <Dialog open={!!viewingStudent} onOpenChange={() => setViewingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>O'quvchi ma'lumotlari</DialogTitle>
          </DialogHeader>
          {viewingStudent && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ism</p>
                <p className="font-medium">{viewingStudent.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Familiya</p>
                <p className="font-medium">{viewingStudent.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefon</p>
                <p className="font-medium">{viewingStudent.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telegram</p>
                <p className="font-medium">
                  {viewingStudent.tgUsername ? `@${viewingStudent.tgUsername}` : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telegram ID</p>
                <p className="font-medium">{viewingStudent.tgId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Holat</p>
                <p className="font-medium">
                  {viewingStudent.isBlocked
                    ? "Bloklangan"
                    : viewingStudent.isActive
                      ? "Faol"
                      : "Nofaol"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ro'yxatdan o'tgan</p>
                <p className="font-medium">
                  {new Date(viewingStudent.createdAt).toLocaleDateString("uz-UZ")}
                </p>
              </div>
              {viewingStudent.isBlocked && viewingStudent.blockedReason && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Bloklash sababi</p>
                  <p className="font-medium text-red-600">{viewingStudent.blockedReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!blockingStudent} onOpenChange={() => setBlockingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>O'quvchini bloklash</DialogTitle>
          </DialogHeader>
          {blockingStudent && (
            <div className="space-y-4">
              <p>
                <span className="font-medium">
                  {blockingStudent.firstName} {blockingStudent.lastName}
                </span>{" "}
                ni bloklash sababini kiriting:
              </p>
              <Textarea
                placeholder="Bloklash sababi..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setBlockingStudent(null)}>
                  Bekor qilish
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    blockMutation.mutate({ id: blockingStudent.id, reason: blockReason })
                  }
                  disabled={!blockReason.trim() || blockMutation.isPending}
                >
                  {blockMutation.isPending ? "Yuklanmoqda..." : "Bloklash"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;
