import { useAuth } from "@/hooks/useAuth";
import { useGetTeacherLessons } from "../service/query/useTeacherLessons";
import type { GetTeacherLessonsResponse, Lesson } from "../TeacherTypes";

const Lessons = () => {
  const { user, isAuthenticated } = useAuth();

  const { data, isLoading, error } = useGetTeacherLessons(user?.id || "");

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

  console.log(lessons);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Lessons</h1>

      {lessons.length === 0 ? (
        <div className="p-4">No lessons found</div>
      ) : (
        <div className="grid gap-4">
          {lessons.map((lesson: Lesson) => (
            <div key={lesson.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold">{lesson.name}</h3>
              <p>Status: {lesson.status}</p>
              <p>Price: ${lesson.price}</p>
              <p>Start: {new Date(lesson.startTime).toLocaleString()}</p>
              <p>Paid: {lesson.isPaid ? "Yes" : "No"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Lessons;
