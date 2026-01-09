import { request } from "@/config/request";
import { useQuery } from "@tanstack/react-query";

export const useGetTeacherPayments = (id: string) => {
  return useQuery({
    queryKey: ["teacher-payments", id],
    queryFn: () =>
      request.get(`/teacher-payments/teacher/${id}`).then((res) => res.data),
  });
};
