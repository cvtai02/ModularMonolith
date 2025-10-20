import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"
import { ROUTES } from "@/configs/routes"
import { useIdentityStore } from "@/stores/identity"
import { useForm, type SubmitHandler } from 'react-hook-form'
import { ApiError, type LoginRequest as FormInput  } from "@shared/api/api-types"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

type ApiProblemDetails = {
  title?: string
  detail?: string
  status?: number
}

const getLoginErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.detail || error.message || "Login failed. Please try again."
  }

  if (typeof error === "object" && error !== null) {
    const maybeProblem = error as ApiProblemDetails
    return maybeProblem.detail || maybeProblem.title || "Login failed. Please try again."
  }

  return "Login failed. Please try again."
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useIdentityStore();
  const navigate = useNavigate();

  const loginM = useMutation({
    mutationFn: (input: {
      email: string
      password: string
      redirect?: string
    }) => login(input),
    onSuccess: () => {
      navigate('/');
    },
    onError: (error) => {
      const message = getLoginErrorMessage(error);
      setError("root", { type: "server", message });
      toast.error(message);
    }
  })


  const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm<FormInput>()

  const onSubmit: SubmitHandler<FormInput> = (data) => {
    clearErrors("root");
    loginM.mutate(data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-1">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your Acme Inc account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  tabIndex={1}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                    tabIndex={3}
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input {...register('password')} tabIndex={2} id="password" type="password" required />
              </Field>
              <Field>
                <Button tabIndex={4} type="submit">Login</Button>
              </Field>
              {errors.root?.message ? (
                <FieldDescription className="text-destructive">
                  {errors.root.message}
                </FieldDescription>
              ) : null}
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="grid grid-cols-1 gap-4">
                <Button variant="outline" tabIndex={5} type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Google</span>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <Link tabIndex={6} to={ROUTES.signup}>Sign up</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
