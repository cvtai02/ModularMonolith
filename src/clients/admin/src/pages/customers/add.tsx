import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, UsersIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAccountClient } from "@/components/containers/api-client-provider";
import { applyValidationErrors } from "@/lib/form-error";
import { ROUTES } from "@/configs/routes";

type FormValues = {
  displayName: string;
  email: string;
  phoneNumber: string;
  identityUserId: string;
  status: "Active" | "Suspended" | "Archived" | "";
};

export default function AddCustomerPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accountClient = useAccountClient();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      displayName: "",
      email: "",
      phoneNumber: "",
      identityUserId: "",
      status: "",
    },
  });

  const { mutateAsync: createCustomer, isPending } = useMutation({
    mutationFn: accountClient.createAdminProfile.bind(accountClient),
  });

  const doSubmit = handleSubmit(async (values) => {
    try {
      const result = await createCustomer({
        displayName: values.displayName || undefined,
        email: values.email,
        phoneNumber: values.phoneNumber || undefined,
        identityUserId: values.identityUserId || undefined,
        status: (values.status || undefined) as never,
      });
      toast.success("Customer created");
      await queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      navigate(ROUTES.customerDetail(result.id));
    } catch (err) {
      if (!applyValidationErrors(err, setError)) throw err;
    }
  });

  return (
    <div className="flex min-h-0 flex-col bg-muted/30">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background px-6">
        <SidebarTrigger className="-ml-2" />
        <Separator orientation="vertical" className="h-5" />
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="-ml-2 gap-1.5"
          onClick={() => navigate(ROUTES.customers)}
        >
          <ArrowLeftIcon className="size-4" />
          Customers
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-2">
          <UsersIcon className="size-4 text-muted-foreground" />
          <h1 className="text-sm font-semibold">New customer</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" type="button" onClick={() => navigate(ROUTES.customers)}>
            Discard
          </Button>
          <Button size="sm" type="button" disabled={isPending} onClick={doSubmit}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {/* Form body */}
      <div className="mx-auto w-full max-w-xl p-6">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold">Customer details</h2>
          <FieldGroup>
            <Field>
              <FieldLabel>Email *</FieldLabel>
              <Input
                {...register("email", { required: "Email is required" })}
                type="email"
                placeholder="customer@example.com"
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Display name</FieldLabel>
              <Input
                {...register("displayName")}
                placeholder="Jane Smith"
              />
              {errors.displayName && <FieldError>{errors.displayName.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Phone number</FieldLabel>
              <Input
                {...register("phoneNumber")}
                placeholder="+1 555 000 0000"
              />
              {errors.phoneNumber && <FieldError>{errors.phoneNumber.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Status</FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Active (default)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Active (default)</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field>
              <FieldLabel>Identity user ID</FieldLabel>
              <Input
                {...register("identityUserId")}
                placeholder="Optional — link to an existing identity account"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to create a manual customer profile without a login account.
              </p>
              {errors.identityUserId && <FieldError>{errors.identityUserId.message}</FieldError>}
            </Field>
          </FieldGroup>
        </div>
      </div>
    </div>
  );
}
