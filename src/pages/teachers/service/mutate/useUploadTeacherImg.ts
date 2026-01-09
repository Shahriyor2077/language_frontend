import { request } from "@/config/request";
import { useMutation } from "@tanstack/react-query";

export const useUploadTeacherImage = (id: string) => {
  return useMutation({
    mutationFn: (data: FormData) =>
      request
        .patch(`/teacher/${id}/upload-image`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => res.data),
  });
};
