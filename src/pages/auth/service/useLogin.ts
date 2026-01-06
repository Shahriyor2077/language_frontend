import { useMutation } from "@tanstack/react-query";
import { request } from "@/config/request";
import type { LoginT } from "../types";

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginT) =>
      request.post("/auth/teacher/login", data).then((res) => res.data),
  });
};
