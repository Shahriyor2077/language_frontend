import { useAuth } from "@/hooks/useAuth";
import { useGetTeacherLessons } from "../service/query/useTeacherLessons";
import { useUpdateLesson } from "../service/mutate/useUpdateLesson";
import type { GetTeacherLessonsResponse, Lesson } from "../TeacherTypes";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

const LessonCard = ({
  lesson,
  isEditing,
  editForm,
  isUpdating,
  onEditClick,
  onCancelEdit,
  onSaveEdit,
  onFormChange,
}: {
  lesson: Lesson;
  isEditing: boolean;
  editForm: Partial<Lesson>;
  isUpdating: boolean;
  onEditClick: (lesson: Lesson) => void;
  onCancelEdit: () => void;
  onSaveEdit: (lessonId: string) => void;
  onFormChange: (updates: Partial<Lesson>) => void;
}) => {
  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 rounded-xl shadow-md border border-teal-200 dark:border-teal-700 hover:shadow-lg transition-shadow">
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-teal-700 dark:text-teal-300">
              Lesson Name
            </label>
            <Input
              value={editForm.name || ""}
              onChange={(e) => onFormChange({ ...editForm, name: e.target.value })}
              className="bg-white dark:bg-slate-800 border-teal-200 dark:border-teal-700 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-teal-700 dark:text-teal-300">Price</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={editForm.price || ""}
              onChange={(e) =>
                onFormChange({
                  ...editForm,
                  price: parseFloat(e.target.value),
                })
              }
              className="bg-white dark:bg-slate-800 border-teal-200 dark:border-teal-700 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-teal-700 dark:text-teal-300">Status</label>
            <Select
              value={editForm.status || ""}
              onValueChange={(value) =>
                onFormChange({ ...editForm, status: value as any })
              }
            >
              <SelectTrigger className="bg-white dark:bg-slate-800 border-teal-200 dark:border-teal-700">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => onSaveEdit(lesson.id)}
              disabled={isUpdating}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white disabled:bg-gray-400"
            >
              {isUpdating ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={onCancelEdit}
              disabled={isUpdating}
              variant="outline"
              className="border-teal-300 dark:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-teal-900 dark:text-teal-100">{lesson.name}</h3>
              <p className="text-sm text-teal-600 dark:text-teal-400">
                {new Date(lesson.startTime).toLocaleString()}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${lesson.status === "completed"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                : lesson.status === "booked"
                  ? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
                  : lesson.status === "cancelled"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                }`}
            >
              {lesson.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-teal-600 dark:text-teal-400">
                Price
              </p>
              <p className="font-semibold text-teal-900 dark:text-teal-100">${lesson.price}</p>
            </div>
            <div>
              <p className="text-sm text-teal-600 dark:text-teal-400">Paid</p>
              <p className="font-semibold text-teal-900 dark:text-teal-100">
                {lesson.isPaid ? "✓ Yes" : "✗ No"}
              </p>
            </div>
          </div>

          {lesson.googleMeetsUrl && (
            <div className="mb-4">
              <a
                href={lesson.googleMeetsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline text-sm font-medium"
              >
                Join Google Meet →
              </a>
            </div>
          )}

          <Button
            onClick={() => onEditClick(lesson)}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
          >
            Edit
          </Button>
        </div>
      )}
    </div>
  );
};

const Lessons = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useGetTeacherLessons(user?.id || "");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Lesson>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isAuthenticated || !user) {
    return <div className="p-4">Please log in to view lessons</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading your lessons...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading lessons: {error.message}
      </div>
    );
  }

  const lessons = (data as GetTeacherLessonsResponse)?.lessons || [];

  const handleEditClick = (lesson: Lesson) => {
    setEditingId(lesson.id);
    setEditForm({
      name: lesson.name,
      price: lesson.price,
      status: lesson.status,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = (lessonId: string) => {
    if (!editForm.name || editForm.name.trim() === "") {
      toast.error("Lesson name is required");
      return;
    }

    const price = typeof editForm.price === "string" ? parseFloat(editForm.price) : editForm.price;
    if (!price || price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    setIsUpdating(true);
    const { mutate: updateLesson } = useUpdateLesson(lessonId);

    updateLesson(editForm, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["teacher-lessons"] });
        toast.success("Lesson updated successfully");
        setEditingId(null);
        setEditForm({});
        setIsUpdating(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Failed to update lesson"
        );
        setIsUpdating(false);
      },
    });
  };

  return (
    <div className="p-6 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-teal-950 dark:to-slate-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">My Lessons</h1>

      {lessons.length === 0 ? (
        <div className="p-4 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
          No lessons found
        </div>
      ) : (
        <div className="grid gap-4">
          {lessons.map((lesson: Lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isEditing={editingId === lesson.id}
              editForm={editForm}
              isUpdating={isUpdating}
              onEditClick={handleEditClick}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onFormChange={setEditForm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Lessons;
