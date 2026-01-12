import { memo, useState } from "react";
import { useTeacherProfile } from "./service/query/useTeacherProfile";
import { useUpdateTeacherProfile } from "./service/mutate/useUpdateTeacher";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Cookie from "js-cookie";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  TeacherLevel,
  TeacherSpecialty,
  type LessonResponse,
  type TeacherField,
} from "./TeacherTypes";

// Helper to capitalize dropdown labels (e.g., "english" -> "English")
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useTeacherProfile();
  console.log(data)
  Cookie.set("teacherName", data?.teacher.fullName || "");

  const teacherId = user?.id;
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateTeacherProfile(teacherId!);

  const teacher = data?.teacher;

  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    phoneNumber: "",
    specification: "",
    level: "",
    experience: "",
    hourPrice: "",
    portfolioLink: "",
    description: "",
    fullName: "",
    cardNumber: "",
    email: "",
  });

  if (!isAuthenticated || !user) {
    return <div className="p-4">Please log in to view profile</div>;
  }

  if (isLoading) {
    return <p className="text-center text-muted-foreground">Loading...</p>;
  }

  if (!teacher) {
    return <p className="text-center text-red-500">Profile not found</p>;
  }

  const completedLessonsCount =
    teacher.lessons?.filter(
      (lesson: LessonResponse) => lesson.status === "completed"
    ).length ?? 0;

  const totalLessons = teacher.lessons?.length ?? 0;

  const handleEdit = () => {
    setForm({
      phoneNumber: teacher.phoneNumber ?? "",
      specification: teacher.specification ?? "",
      level: teacher.level ?? "",
      experience: teacher.experience ?? "",
      hourPrice: teacher.hourPrice?.toString() ?? "",
      portfolioLink: teacher.portfolioLink ?? "",
      description: teacher.description ?? "",
      fullName: teacher.fullName ?? "",
      cardNumber: teacher.cardNumber ?? "",
      email: teacher.email ?? "",
    });
    setIsEdit(true);
  };

  const handleCancel = () => {
    setIsEdit(false);
  };

  const handleSave = () => {
    if (!teacherId) {
      toast.error("User not identified");
      return;
    }

    // --- 1. VALIDATION ---
    if (!form.experience || form.experience.trim() === "") {
      toast.error("Experience is required");
      return;
    }

    const expValue = parseFloat(form.experience);
    if (isNaN(expValue)) {
      toast.error(
        "Experience must start with a valid number (e.g., '2 years')"
      );
      return;
    }

    if (expValue < 0) {
      toast.error("Experience cannot be negative");
      return;
    }

    if (
      !form.cardNumber ||
      form.cardNumber.trim() === "" ||
      form.cardNumber.length < 16
    ) {
      toast.error("Card number is required and must be 16 digits");
      return;
    }

    // --- 2. CHECK FOR ACTUAL CHANGES ---
    // We compare form state against the current teacher data from the query
    const hasChanges =
      form.phoneNumber !== (teacher.phoneNumber ?? "") ||
      form.specification !== (teacher.specification ?? "") ||
      form.level !== (teacher.level ?? "") ||
      form.experience !== (teacher.experience ?? "") ||
      form.hourPrice !== (teacher.hourPrice?.toString() ?? "") ||
      form.portfolioLink !== (teacher.portfolioLink ?? "") ||
      form.description !== (teacher.description ?? "") ||
      form.fullName !== (teacher.fullName ?? "") ||
      form.cardNumber !== (teacher.cardNumber ?? "") ||
      form.email !== (teacher.email ?? "");

    if (!hasChanges) {
      toast.success("Profile updated successfully"); // Per your request: show success even if no req sent
      setIsEdit(false);
      return;
    }

    // --- 3. CONSTRUCT PAYLOAD ---
    const payload: TeacherField = {
      fullName: form.fullName,
      email: form.email,
      phoneNumber: form.phoneNumber,
      specification: form.specification as TeacherSpecialty,
      level: form.level as TeacherLevel,
      experience: form.experience,
      hourPrice: form.hourPrice === "" ? null : Number(form.hourPrice),
      portfolioLink:
        form.portfolioLink.trim() === "" ? null : form.portfolioLink,
      description: form.description,
      cardNumber: form.cardNumber,
      imageUrl: teacher.imageUrl || "",
    };

    // --- 4. EXECUTE MUTATION ---
    updateProfile(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["teacher-profile"] });
        toast.success("Profile updated successfully");
        setIsEdit(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Failed to update profile"
        );
      },
    });
  };

  return (
    <div className=" bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-3 sm:p-8">
      <Card className="border-0 shadow-xl">
        {/* Header Section */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 px-8 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 shrink-0">
              <AvatarImage src={teacher.imageUrl || undefined} />
              <AvatarFallback className="bg-blue-400 text-white text-xl font-bold">
                {teacher.fullName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <CardTitle className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {teacher.fullName}
              </CardTitle>
              <p className="text-blue-100 text-sm sm:text-base">
                {teacher.email}
              </p>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Badge
                variant={teacher.isActive ? "default" : "secondary"}
                className={`px-4 py-2 text-base font-semibold ${
                  teacher.isActive
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-slate-400 hover:bg-slate-500 text-white"
                }`}
              >
                {teacher.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>

        <CardContent className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Completed Lessons
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                {completedLessonsCount}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Total Lessons
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                {totalLessons}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Hourly Rate
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {teacher.hourPrice !== null ? `$${teacher.hourPrice}` : "—"}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Experience
              </p>
              <p className="text-lg sm:text-2xl font-bold text-slate-700 dark:text-slate-200">
                {teacher.experience || "—"}
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Phone Number
                </label>
                {isEdit ? (
                  <Input
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm({ ...form, phoneNumber: e.target.value })
                    }
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    {teacher.phoneNumber || "Not set"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Specification
                </label>
                {isEdit ? (
                  <Select
                    value={form.specification}
                    onValueChange={(value) =>
                      setForm({ ...form, specification: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TeacherSpecialty).map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {capitalize(specialty)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    {teacher.specification
                      ? capitalize(teacher.specification)
                      : "Not set"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Level
                </label>
                {isEdit ? (
                  <Select
                    value={form.level}
                    onValueChange={(value) =>
                      setForm({ ...form, level: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TeacherLevel).map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    {teacher.level ? teacher.level.toUpperCase() : "Not set"}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Hourly Price
                </label>
                {isEdit ? (
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-600 dark:text-slate-400">
                      $
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.hourPrice}
                      onChange={(e) =>
                        setForm({ ...form, hourPrice: e.target.value })
                      }
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 pl-7"
                    />
                  </div>
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    {teacher.hourPrice !== null
                      ? `$${teacher.hourPrice}`
                      : "Not set"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Portfolio
                </label>
                {isEdit ? (
                  <Input
                    type="url"
                    value={form.portfolioLink}
                    onChange={(e) =>
                      setForm({ ...form, portfolioLink: e.target.value })
                    }
                    placeholder="https://example.com/portfolio"
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  />
                ) : teacher.portfolioLink ? (
                  <a
                    href={teacher.portfolioLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline"
                  >
                    View Portfolio →
                  </a>
                ) : (
                  <p className="text-slate-400 dark:text-slate-500">
                    Not provided
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Teacher experience
                </label>
                {isEdit ? (
                  <Input
                    value={form.experience}
                    onChange={(e) =>
                      setForm({ ...form, experience: e.target.value })
                    }
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    {teacher.experience || "Not set"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Teacher Card
                </label>
                {isEdit ? (
                  <Input
                    value={form.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "") // remove non-digits
                        .slice(0, 17); // limit to 16 digits

                      setForm({ ...form, cardNumber: value });
                    }}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={16}
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    {teacher.cardNumber || "Not set"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description Section */}
          {(isEdit || teacher.description) && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Description
              </label>
              {isEdit ? (
                <Textarea
                  rows={5}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 resize-none focus:ring-blue-500"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Tell us about your teaching experience and style..."
                />
              ) : (
                <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-400 leading-relaxed">
                  {teacher.description || "No description provided"}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            {isEdit ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="sm:order-2 border-slate-300 dark:border-slate-600 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="sm:order-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default memo(Profile);
