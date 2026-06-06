import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SelectComponent from "@/components/inputComponents/select-component";
import LoadingFallback from "@/components/ui/loading-fallback";
import UpdatePopupModal from "@/components/popupModals/update-popup-modal";
import { useGetSingleUser, useEditUser } from "@/query/useUserManagement";
import {
  editUserSchema,
  type EditUserFormValues,
} from "@/utils/schemas/user";

const UsersEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: userResponse, isLoading } = useGetSingleUser(id || "");
  const { mutate: editUserMutation, isPending: editUserPending } = useEditUser();

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formData, setFormData] = useState<EditUserFormValues | null>(null);

  const methods = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      mobile: "",
      type: "team",
      gender: "",
      age: "",
      address: "",
      status: "active",
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const userData = userResponse?.data?.data;

  useEffect(() => {
    try {
      const orgConfigStr = sessionStorage.getItem("orgConfig");
      if (orgConfigStr) {
        const orgConfig = JSON.parse(orgConfigStr);
        const adminIdFromSession = orgConfig?.data?.orgData?.adminId;
        if (id && adminIdFromSession && id === adminIdFromSession) {
          toast.error("You cannot edit this administrator user");
          navigate("/management/users/list", { replace: true });
        }
      }
    } catch (err) {
      console.error("Failed to parse orgConfig from sessionStorage:", err);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (userData) {
      reset({
        name: userData.name || "",
        mobile: userData.mobile || "",
        type: userData.type || "team",
        gender: userData.gender || "",
        age: userData.age !== undefined && userData.age !== null ? String(userData.age) : "",
        address: userData.address || "",
        status: userData.status || "active",
      });
    }
  }, [userData, reset]);

  const onInvalid = (formErrors: any) => {
    console.log(formErrors);
    const findFirstError = (obj: any): string | null => {
      if (!obj) return null;
      if (typeof obj === "object" && obj.message) return obj.message;
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (val && typeof val === "object") {
          const result = findFirstError(val);
          if (result) return result;
        }
      }
      return null;
    };

    const firstErrorMessage = findFirstError(formErrors);
    if (firstErrorMessage) {
      toast.error(firstErrorMessage);
    }
  };

  const onSubmit = (data: EditUserFormValues) => {
    if (!id) {
      toast.error("User ID not found");
      return;
    }
    setFormData(data);
    setShowUpdateModal(true);
  };

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate("/management/users/list", { replace: true })}
          disabled={editUserPending}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Profile Details</CardTitle>
            <CardDescription>
              Modify user settings, update access permissions, or change account status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                  errorTooltip={errors.name?.message}
                />
              </div>

              {/* Email (Read Only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData?.email || ""}
                  disabled
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <Label htmlFor="mobile">
                  Mobile Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mobile"
                  placeholder="Enter mobile number"
                  {...register("mobile")}
                  aria-invalid={!!errors.mobile}
                  errorTooltip={errors.mobile?.message}
                />
              </div>

              {/* Role Type */}
              <div className="space-y-2">
                <Label htmlFor="type">
                  Role / Access Level <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <SelectComponent
                      id="type"
                      placeholder="Select Role"
                      onValueChange={field.onChange}
                      value={field.value}
                      ariaInvalid={!!errors.type}
                      data={[
                        { name: "Admin", value: "admin" },
                        { name: "Team Member", value: "team" },
                      ]}
                      errorTooltip={errors.type?.message}
                    />
                  )}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">
                  User Status <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <SelectComponent
                      id="status"
                      placeholder="Select Status"
                      onValueChange={field.onChange}
                      value={field.value}
                      ariaInvalid={!!errors.status}
                      data={[
                        { name: "Active", value: "active" },
                        { name: "Inactive", value: "inactive" },
                        { name: "Deleted", value: "deleted" },
                      ]}
                      errorTooltip={errors.status?.message}
                    />
                  )}
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <SelectComponent
                      id="gender"
                      placeholder="Select Gender"
                      onValueChange={field.onChange}
                      value={field.value}
                      ariaInvalid={!!errors.gender}
                      data={[
                        { name: "Male", value: "male" },
                        { name: "Female", value: "female" },
                        { name: "Other", value: "other" },
                      ]}
                      errorTooltip={errors.gender?.message}
                    />
                  )}
                />
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter age"
                  {...register("age")}
                  aria-invalid={!!errors.age}
                  errorTooltip={errors.age?.message}
                />
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Residential Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter address details"
                  {...register("address")}
                  aria-invalid={!!errors.address}
                  errorTooltip={errors.address?.message}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Controls */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/management/users/list", { replace: true })}
            disabled={editUserPending}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={editUserPending}>
            Update User
          </Button>
        </div>
      </form>

      <UpdatePopupModal
        isOpen={showUpdateModal}
        title={<strong>Update User Details</strong>}
        description={
          <span>
            Are you sure you want to update the user details for{" "}
            <strong>{userData?.name}</strong>? This will apply all changes immediately.
          </span>
        }
        cancelButtonAction={() => {
          setShowUpdateModal(false);
          setFormData(null);
        }}
        updateButtonAction={() => {
          if (formData && id) {
            editUserMutation(
              { id, payload: formData },
              {
                onSuccess: () => {
                  setShowUpdateModal(false);
                  setFormData(null);
                  navigate("/management/users/list", { replace: true });
                },
              }
            );
          }
        }}
        isUpdating={editUserPending}
      />
    </div>
  );
};

export default UsersEdit;
