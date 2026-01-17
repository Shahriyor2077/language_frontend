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
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Lesson Name
            </label>
            <Input
              value={editForm.name || ""}
              onChange={(e) => onFormChange({ ...editForm, name: e.target.value })}
              className="bg-slate-50 dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Price</label>
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
              className="bg-slate-50 dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <Select
              value={editForm.status || ""}
              onValueChange={(value) =>
                onFormChange({ ...editForm, status: value as any })
              }
            >
              <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
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
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
            >
              {isUpdating ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={onCancelEdit}
              disabled={isUpdating}
              variant="outline"
              className="border-slate-300 dark:border-slate-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">{lesson.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {new Date(lesson.startTime).toLocaleString()}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${lesson.status === "completed"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : lesson.status === "booked"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : lesson.status === "cancelled"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }`}
            >
              {lesson.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Price
              </p>
              <p className="font-semibold">${lesson.price}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Paid</p>
              <p className="font-semibold">
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
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Join Google Meet →
              </a>
            </div>
          )}

          <Button
            onClick={() => onEditClick(lesson)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Lessons</h1>

      {lessons.length === 0 ? (
        <div className="p-4 text-slate-600 dark:text-slate-400">
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
