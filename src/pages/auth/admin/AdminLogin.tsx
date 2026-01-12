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
import { Shield } from "lucide-react";

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
        // Admin ma'lumotlarini localStorage ga saqlash
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
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
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
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Username kiriting"
                      className="h-11"
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
                  <FormLabel>Parol</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
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
