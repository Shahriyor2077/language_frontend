import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import Cookie from "js-cookie";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { Lock } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(3, "Username kamida 3 ta belgi bo'lishi kerak"),
  password: z.string().min(4, "Parol kamida 4 ta belgi bo'lishi kerak"),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminLogin() {
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: authService.adminLogin,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: FormData) => {
    mutate(data, {
      onSuccess: (res) => {
        Cookie.set("token", res.accessToken);
        Cookie.set("role", res.role.toLowerCase());
        localStorage.setItem("admin", JSON.stringify({
          id: res.id,
          role: res.role,
        }));
        toast.success(res.message || "Tizimga muvaffaqiyatli kirdingiz", {
          position: "bottom-right",
        });
        navigate("/app/admin");
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Login xatolik yuz berdi",
          { position: "bottom-right" }
        );
      },
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-2xl border border-indigo-100 dark:border-indigo-800">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30">
            <Lock className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">Admin Panel</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tizimga kirish uchun ma'lumotlaringizni kiriting
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-indigo-700 dark:text-indigo-300">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Username kiriting"
                      className="h-11 border-indigo-200 dark:border-indigo-700 focus:ring-indigo-500 dark:bg-slate-800"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-indigo-700 dark:text-indigo-300">Parol</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      className="h-11 border-indigo-200 dark:border-indigo-700 focus:ring-indigo-500 dark:bg-slate-800"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 dark:from-indigo-700 dark:to-blue-700 dark:hover:from-indigo-600 dark:hover:to-blue-600 text-white shadow-lg"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Kirish...
                </span>
              ) : (
                "Kirish"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
