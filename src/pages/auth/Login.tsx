import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "./service/useLogin";
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

export const formSchema = z.object({
  username: z.string().max(50),
  password: z.string().min(2).max(50),
});

export default function Login() {
  const { mutate, isPending } = useLogin();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "kamolov607@gmail.com",
      password: "StrongP@ssw0rd",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
    mutate(data, {
      onSuccess: (res) => {
        console.log(res);
        Cookie.set("token", res.accessToken);
        Cookie.set("role", res.role.toLowerCase());
        toast.success(res.message, {
          position: "bottom-right",
        });
        navigate(`/app/${res.role.toLowerCase()}/lessons`);
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <Button
        variant="outline"
        className="absolute right-6 top-6 rounded-full px-6"
      >
        Sign up
      </Button>

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your Email"
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
                  <FormLabel>Password</FormLabel>
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
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button className="font-medium text-primary hover:underline">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
