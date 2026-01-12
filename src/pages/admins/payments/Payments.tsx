import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "@/services/transaction.service";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Eye, CheckCircle, XCircle } from "lucide-react";
import type { Transaction, TransactionStatus } from "@/types";
import { Textarea } from "@/components/ui/textarea";

const statusLabels: Record<TransactionStatus, string> = {
  pending: "Kutilmoqda",
  paid: "To'langan",
  cancelled: "Bekor qilingan",
};

const statusColors: Record<TransactionStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};


const Payments = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [cancellingTransaction, setCancellingTransaction] = useState<Transaction | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", page, statusFilter],
    queryFn: () =>
      transactionService.getAll({
        page,
        limit: 10,
        status: statusFilter !== "all" ? (statusFilter as TransactionStatus) : undefined,
      }),
  });

  const completeMutation = useMutation({
    mutationFn: transactionService.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("To'lov tasdiqlandi");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      transactionService.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("To'lov bekor qilindi");
      setCancellingTransaction(null);
      setCancelReason("");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const transactions = data?.data || [];
  const meta = data?.meta;

  const filteredTransactions = transactions.filter((t) => {
    const studentName = t.student
      ? `${t.student.firstName} ${t.student.lastName}`.toLowerCase()
      : "";
    return studentName.includes(search.toLowerCase());
  });


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">To'lovlar</h1>
          <p className="text-muted-foreground">Barcha tranzaksiyalarni ko'rish va boshqarish</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="O'quvchi bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Holat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            {Object.entries(statusLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>O'quvchi</TableHead>
              <TableHead>Dars</TableHead>
              <TableHead>Summa</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>Sana</TableHead>
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
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  To'lovlar topilmadi
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.student
                      ? `${transaction.student.firstName} ${transaction.student.lastName}`
                      : "-"}
                  </TableCell>
                  <TableCell>{transaction.lesson?.name || "-"}</TableCell>
                  <TableCell>{Number(transaction.price).toLocaleString()} so'm</TableCell>
                  <TableCell>
                    <Badge className={statusColors[transaction.status]}>
                      {statusLabels[transaction.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(transaction.createdAt).toLocaleDateString("uz-UZ")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setViewingTransaction(transaction)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {transaction.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => completeMutation.mutate(transaction.id)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCancellingTransaction(transaction)}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
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


      {/* Pagination */}
      {meta && meta.totalPage > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Jami: {meta.total} ta to'lov</p>
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

      {/* View Dialog */}
      <Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>To'lov ma'lumotlari</DialogTitle>
          </DialogHeader>
          {viewingTransaction && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">O'quvchi</p>
                <p className="font-medium">
                  {viewingTransaction.student
                    ? `${viewingTransaction.student.firstName} ${viewingTransaction.student.lastName}`
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dars</p>
                <p className="font-medium">{viewingTransaction.lesson?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Summa</p>
                <p className="font-medium">{Number(viewingTransaction.price).toLocaleString()} so'm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Holat</p>
                <Badge className={statusColors[viewingTransaction.status]}>
                  {statusLabels[viewingTransaction.status]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Yaratilgan</p>
                <p className="font-medium">
                  {new Date(viewingTransaction.createdAt).toLocaleString("uz-UZ")}
                </p>
              </div>
              {viewingTransaction.performedTime && (
                <div>
                  <p className="text-sm text-muted-foreground">To'langan</p>
                  <p className="font-medium">
                    {new Date(viewingTransaction.performedTime).toLocaleString("uz-UZ")}
                  </p>
                </div>
              )}
              {viewingTransaction.reason && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Sabab</p>
                  <p className="font-medium text-red-600">{viewingTransaction.reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={!!cancellingTransaction} onOpenChange={() => setCancellingTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>To'lovni bekor qilish</DialogTitle>
            <DialogDescription>
              Bu to'lovni bekor qilmoqchimisiz? Sabab kiriting (ixtiyoriy):
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Bekor qilish sababi..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancellingTransaction(null)}>
              Yopish
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                cancellingTransaction &&
                cancelMutation.mutate({ id: cancellingTransaction.id, reason: cancelReason })
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

export default Payments;
