import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { teacherService } from "@/services/teacher.service";
import { studentService } from "@/services/student.service";
import { lessonService } from "@/services/lesson.service";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const Statistic = () => {
  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: teacherService.getAll,
  });

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => studentService.getAll({ limit: 1000 }),
  });

  const { data: lessonsData, isLoading: lessonsLoading } = useQuery({
    queryKey: ["lessons"],
    queryFn: () => lessonService.getAll(1, 1000),
  });

  const teachers = teachersData?.teachers || [];
  const students = studentsData?.data || [];
  const lessons = lessonsData?.lessons || [];

  const completedLessons = lessons.filter((l) => l.status === "completed").length;
  const bookedLessons = lessons.filter((l) => l.status === "booked").length;
  const cancelledLessons = lessons.filter((l) => l.status === "cancelled").length;

  const stats = [
    {
      title: "Jami O'qituvchilar",
      value: teachers.length,
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Jami O'quvchilar",
      value: students.length,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Jami Darslar",
      value: lessons.length,
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Tugatilgan Darslar",
      value: completedLessons,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Band Darslar",
      value: bookedLessons,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Bekor Qilingan",
      value: cancelledLessons,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const isLoading = teachersLoading || studentsLoading || lessonsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Tizim statistikasi va umumiy ko'rsatkichlar
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Bugungi sana: {new Date().toLocaleDateString("uz-UZ")}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>So'nggi O'qituvchilar</CardTitle>
          </CardHeader>
          <CardContent>
            {teachersLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : teachers.length === 0 ? (
              <p className="text-muted-foreground">O'qituvchilar topilmadi</p>
            ) : (
              <div className="space-y-3">
                {teachers.slice(0, 5).map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{teacher.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {teacher.specification} - {teacher.level.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${teacher.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {teacher.isActive ? "Faol" : "Nofaol"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>So'nggi O'quvchilar</CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : students.length === 0 ? (
              <p className="text-muted-foreground">O'quvchilar topilmadi</p>
            ) : (
              <div className="space-y-3">
                {students.slice(0, 5).map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {student.phoneNumber}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${student.isBlocked
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                        }`}
                    >
                      {student.isBlocked ? "Bloklangan" : "Faol"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistic;
