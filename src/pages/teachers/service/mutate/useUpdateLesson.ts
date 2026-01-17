import { request } from "@/config/request";
import { useMutation } from "@tanstack/react-query";
import type { Lesson } from "../../TeacherTypes";

export const useUpdateLesson = (lessonId: string) => {
    return useMutation({
        mutationFn: (data: Partial<Lesson>) =>
            request.patch(`/lesson/${lessonId}`, data).then((res) => res.data),
    });
};
