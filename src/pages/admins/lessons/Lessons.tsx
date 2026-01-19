import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { lessonService } from "@/services/lesson.service";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, ExternalLink } from "lucide-react";
import type { Lesson, LessonStatus } from "@/types";

const statusLabels: Record<LessonStatus, string> = {
  available: "Mavjud",
  booked: "Band",
  completed: "Tugatilgan",
  cancelled: "Bekor qilingan",
};

const statusColors: Record<LessonStatus, string> = {
  available: "bg-blue-100 text-blue-700",
  booked: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const Lessons = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["lessons", page],
    queryFn: () => lessonService.getAll(page, 10),
  });

  const lessons = data?.lessons || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / 10);

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      lesson.name.toLowerCase().includes(search.toLowerCase()) ||
      lesson.teacher?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      lesson.student?.firstName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || lesson.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("uz-UZ"),
      time: date.toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Darslar</h1>
          <p className="text-muted-foreground">Barcha darslarni ko'rish va boshqarish</p>
        </div>
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
              <TableHead>Dars nomi</TableHead>
              <TableHead>O'qituvchi</TableHead>
              <TableHead>O'quvchi</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead>Vaqt</TableHead>
              <TableHead>Narx</TableHead>
              <TableHead>Holat</TableHead>
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
            ) : filteredLessons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Darslar topilmadi
                </TableCell>
              </TableRow>
            ) : (
              filteredLessons.map((lesson) => {
                const start = formatDateTime(lesson.startTime);
                const end = formatDateTime(lesson.endTime);
                return (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">{lesson.name}</TableCell>
                    <TableCell>{lesson.teacher?.fullName || "-"}</TableCell>
                    <TableCell>
                      {lesson.student
                        ? `${lesson.student.firstName} ${lesson.student.lastName}`
                        : "-"}
                    </TableCell>
                    <TableCell>{start.date}</TableCell>
                    <TableCell>
                      {start.time} - {end.time}
                    </TableCell>
                    <TableCell>
                      {Number(lesson.price).toLocaleString()} so'm
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[lesson.status]}>
                        {statusLabels[lesson.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingLesson(lesson)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {lesson.googleMeetsUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              window.open(lesson.googleMeetsUrl, "_blank")
                            }
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Jami: {totalCount} ta dars</p>
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
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Keyingi
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!viewingLesson} onOpenChange={() => setViewingLesson(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dars ma'lumotlari</DialogTitle>
          </DialogHeader>
          {viewingLesson && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Dars nomi</p>
                  <p className="font-medium">{viewingLesson.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Holat</p>
                  <Badge className={statusColors[viewingLesson.status]}>
                    {statusLabels[viewingLesson.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">O'qituvchi</p>
                  <p className="font-medium">
                    {viewingLesson.teacher?.fullName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">O'quvchi</p>
                  <p className="font-medium">
                    {viewingLesson.student
                      ? `${viewingLesson.student.firstName} ${viewingLesson.student.lastName}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Boshlanish</p>
                  <p className="font-medium">
                    {new Date(viewingLesson.startTime).toLocaleString("uz-UZ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tugash</p>
                  <p className="font-medium">
                    {new Date(viewingLesson.endTime).toLocaleString("uz-UZ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Narx</p>
                  <p className="font-medium">
                    {Number(viewingLesson.price).toLocaleString()} so'm
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">To'lov holati</p>
                  <Badge variant={viewingLesson.isPaid ? "default" : "secondary"}>
                    {viewingLesson.isPaid ? "To'langan" : "To'lanmagan"}
                  </Badge>
                </div>
              </div>
              {viewingLesson.googleMeetsUrl && (
                <div>
                  <p className="text-sm text-muted-foreground">Google Meet</p>
                  <a
                    href={viewingLesson.googleMeetsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    Darsga qo'shilish <ExternalLink className="h-3 w-3" />
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

export default Lessons;
