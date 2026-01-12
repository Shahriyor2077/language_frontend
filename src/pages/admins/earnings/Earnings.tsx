import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherPaymentService } from "@/services/teacher-payment.service";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Search, Eye, XCircle, DollarSign, TrendingUp, Users } from "lucide-react";
import type { TeacherPayment } from "@/types";
import { Textarea } from "@/components/ui/textarea";


const Earnings = () => {
  const [search, setSearch] = useState("");
  const [viewingPayment, setViewingPayment] = useState<TeacherPayment | null>(null);
  const [cancellingPayment, setCancellingPayment] = useState<TeacherPayment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["teacher-payments"],
    queryFn: teacherPaymentService.getAll,
  });

  const cancelMutation = useMutation({
    mutationFn: ({
      id,
      canceledBy,
      canceledReason,
    }: {
      id: string;
      canceledBy: string;
      canceledReason?: string;
    }) => teacherPaymentService.cancel(id, canceledBy, canceledReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-payments"] });
      toast.success("To'lov bekor qilindi");
      setCancellingPayment(null);
      setCancelReason("");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const payments = data?.payments || [];

  const filteredPayments = payments.filter((p) => {
    const teacherName = p.teacher?.fullName?.toLowerCase() || "";
    return teacherName.includes(search.toLowerCase());
  });

  const totalPlatformEarnings = payments
    .filter((p) => !p.isCanceled)
    .reduce((sum, p) => sum + p.platformAmount, 0);

  const totalTeacherPayments = payments
    .filter((p) => !p.isCanceled)
    .reduce((sum, p) => sum + p.teacherAmount, 0);

  const totalLessonAmount = payments
    .filter((p) => !p.isCanceled)
    .reduce((sum, p) => sum + p.totalLessonAmount, 0);

  const activePayments = payments.filter((p) => !p.isCanceled).length;


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daromadlar</h1>
          <p className="text-muted-foreground">O'qituvchi to'lovlari va platforma daromadlari</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jami daromad</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessonAmount.toLocaleString()} so'm</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Platforma ulushi</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlatformEarnings.toLocaleString()} so'm</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">O'qituvchilarga</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeacherPayments.toLocaleString()} so'm</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faol to'lovlar</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePayments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="O'qituvchi bo'yicha qidirish..."
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
              <TableHead>O'qituvchi</TableHead>
              <TableHead>Dars summasi</TableHead>
              <TableHead>Komissiya (%)</TableHead>
              <TableHead>Platforma</TableHead>
              <TableHead>O'qituvchi</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(8)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  To'lovlar topilmadi
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.teacher?.fullName || "-"}</TableCell>
                  <TableCell>{payment.totalLessonAmount.toLocaleString()} so'm</TableCell>
                  <TableCell>{payment.platformComission}%</TableCell>
                  <TableCell className="text-blue-600">{payment.platformAmount.toLocaleString()} so'm</TableCell>
                  <TableCell className="text-green-600">{payment.teacherAmount.toLocaleString()} so'm</TableCell>
                  <TableCell>
                    <Badge variant={payment.isCanceled ? "destructive" : "default"}>
                      {payment.isCanceled ? "Bekor qilingan" : "Faol"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(payment.paidAt).toLocaleDateString("uz-UZ")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setViewingPayment(payment)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!payment.isCanceled && (
                        <Button variant="ghost" size="icon" onClick={() => setCancellingPayment(payment)}>
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>


      {/* View Dialog */}
      <Dialog open={!!viewingPayment} onOpenChange={() => setViewingPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>To'lov tafsilotlari</DialogTitle>
          </DialogHeader>
          {viewingPayment && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">O'qituvchi</p>
                <p className="font-medium">{viewingPayment.teacher?.fullName || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dars</p>
                <p className="font-medium">{viewingPayment.lesson?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jami summa</p>
                <p className="font-medium">{viewingPayment.totalLessonAmount.toLocaleString()} so'm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Komissiya</p>
                <p className="font-medium">{viewingPayment.platformComission}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Platforma ulushi</p>
                <p className="font-medium text-blue-600">{viewingPayment.platformAmount.toLocaleString()} so'm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">O'qituvchi ulushi</p>
                <p className="font-medium text-green-600">{viewingPayment.teacherAmount.toLocaleString()} so'm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">To'lagan</p>
                <p className="font-medium">{viewingPayment.paidBy}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sana</p>
                <p className="font-medium">{new Date(viewingPayment.paidAt).toLocaleString("uz-UZ")}</p>
              </div>
              {viewingPayment.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Izoh</p>
                  <p className="font-medium">{viewingPayment.notes}</p>
                </div>
              )}
              {viewingPayment.isCanceled && viewingPayment.canceledReason && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Bekor qilish sababi</p>
                  <p className="font-medium text-red-600">{viewingPayment.canceledReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={!!cancellingPayment} onOpenChange={() => setCancellingPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>To'lovni bekor qilish</DialogTitle>
            <DialogDescription>Bu to'lovni bekor qilmoqchimisiz? Sabab kiriting:</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Bekor qilish sababi..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancellingPayment(null)}>
              Yopish
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                cancellingPayment &&
                cancelMutation.mutate({
                  id: cancellingPayment.id,
                  canceledBy: "Admin",
                  canceledReason: cancelReason,
                })
              }
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Yuklanmoqda..." : "Bekor qilish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Earnings;
