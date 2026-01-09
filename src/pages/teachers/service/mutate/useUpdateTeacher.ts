import { request } from "@/config/request";
import { useMutation } from "@tanstack/react-query";

export const useUpdateTeacherProfile = (id: string) => {
  return useMutation({
    mutationFn: (
      payload: Partial<{
        id: string;
        phoneNumber: string;
        specification: string;
        level: string;
        experience: string;
        hourPrice: number;
        portfolioLink: string;
      }>
    ) => request.patch(`/teacher/${payload.id}`, payload),
  });
};
