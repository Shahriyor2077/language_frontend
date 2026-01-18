import { memo, useState, useRef } from "react";
import { useTeacherProfile } from "./service/query/useTeacherProfile";
import { useUpdateTeacherProfile } from "./service/mutate/useUpdateTeacher";
import { useUploadTeacherImage } from "./service/mutate/useUploadTeacherImg";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useTeacherProfile();
  console.log(data)
  Cookie.set("teacherName", data?.teacher.fullName || "");

  const teacherId = user?.id;
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateTeacherProfile(teacherId!);
  const { mutate: uploadImage, isPending: isUploadingImage } =
    useUploadTeacherImage(teacherId!);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, and PNG files are allowed");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    uploadImage(formData, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["teacher-profile"] });
        toast.success("Image uploaded successfully");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Failed to upload image"
        );
      },
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 p-3 sm:p-8">
      <Card className="border-0 shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 dark:from-purple-700 dark:via-pink-600 dark:to-orange-600 px-8 py-16 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group">
              <Avatar className="h-28 w-28 border-4 border-white dark:border-slate-900 shrink-0 cursor-pointer hover:opacity-90 transition-all duration-300 shadow-lg ring-4 ring-white/20">
                <AvatarImage src={teacher.imageUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-2xl font-bold">
                  {teacher.fullName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleImageClick}
                disabled={isUploadingImage}
                className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                title="Change profile picture"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1 min-w-0">
              <CardTitle className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {teacher.fullName}
              </CardTitle>
              <p className="text-white/90 text-sm sm:text-base drop-shadow">
                {teacher.email}
              </p>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Badge
                variant={teacher.isActive ? "default" : "secondary"}
                className={`px-4 py-2 text-base font-semibold shadow-lg ${teacher.isActive
                  ? "bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white"
                  : "bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white"
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
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-5 text-center border border-purple-200 dark:border-purple-700/50 hover:shadow-lg transition-shadow">
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                Completed Lessons
              </p>
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {completedLessonsCount}
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 rounded-xl p-5 text-center border border-pink-200 dark:border-pink-700/50 hover:shadow-lg transition-shadow">
              <p className="text-sm font-semibold text-pink-700 dark:text-pink-300 mb-2">
                Total Lessons
              </p>
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                {totalLessons}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-5 text-center border border-orange-200 dark:border-orange-700/50 hover:shadow-lg transition-shadow">
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">
                Hourly Rate
              </p>
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {teacher.hourPrice !== null ? `$${teacher.hourPrice}` : "—"}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl p-5 text-center border border-red-200 dark:border-red-700/50 hover:shadow-lg transition-shadow">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
                Experience
              </p>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                {teacher.experience || "—"}
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3">
                  Phone Number
                </label>
                {isEdit ? (
                  <Input
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm({ ...form, phoneNumber: e.target.value })
                    }
                    className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 focus:ring-purple-500"
                  />
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    {teacher.phoneNumber || "Not set"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-700 dark:text-pink-300 mb-3">
                  Specification
                </label>
                {isEdit ? (
                  <Select
                    value={form.specification}
                    onValueChange={(value) =>
                      setForm({ ...form, specification: value })
                    }
                  >
                    <SelectTrigger className="bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-700 focus:ring-pink-500">
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
                <label className="block text-sm font-semibold text-orange-700 dark:text-orange-300 mb-3">
                  Level
                </label>
                {isEdit ? (
                  <Select
                    value={form.level}
                    onValueChange={(value) =>
                      setForm({ ...form, level: value })
                    }
                  >
                    <SelectTrigger className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 focus:ring-orange-500">
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
                <label className="block text-sm font-semibold text-red-700 dark:text-red-300 mb-3">
                  Hourly Price
                </label>
                {isEdit ? (
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-red-600 dark:text-red-400 font-semibold">
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
                      className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 pl-7 focus:ring-red-500"
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
                <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3">
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
                    className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 focus:ring-purple-500"
                  />
                ) : teacher.portfolioLink ? (
                  <a
                    href={teacher.portfolioLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium underline"
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
                <label className="block text-sm font-semibold text-pink-700 dark:text-pink-300 mb-3">
                  Teacher experience
                </label>
                {isEdit ? (
                  <Input
                    value={form.experience}
                    onChange={(e) =>
                      setForm({ ...form, experience: e.target.value })
                    }
                    className="bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-700 focus:ring-pink-500"
                  />
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    {teacher.experience || "Not set"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-orange-700 dark:text-orange-300 mb-3">
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
                    className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 focus:ring-orange-500"
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
              <label className="block text-sm font-semibold bg-gradient-to-r from-purple-700 to-pink-700 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
                Description
              </label>
              {isEdit ? (
                <Textarea
                  rows={5}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700 resize-none focus:ring-purple-500"
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
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-purple-200 dark:border-purple-700/50">
            {isEdit ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="sm:order-2 border-purple-300 dark:border-purple-600 bg-transparent hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="sm:order-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 dark:from-purple-700 dark:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 text-white font-semibold shadow-lg"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleEdit}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 dark:from-purple-700 dark:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 text-white font-semibold shadow-lg"
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
