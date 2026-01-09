import { memo, useState } from "react";
import { useTeacherProfile } from "./service/query/useTeacherProfile";
import { useUploadTeacherImage } from "./service/mutate/useUploadTeacherImg";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { LessonResponse } from "./TeacherTypes";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateTeacherProfile } from "./service/mutate/useUpdateTeacher";

const Profile = () => {
  const { data, isLoading } = useTeacherProfile();
  const queryClient = useQueryClient();

  const teacher = data?.teacher;

  // const { mutate: uploadImage, isPending: imageUploading } =
  //   useUploadTeacherImage(data?.id as string);

  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateTeacherProfile(data?.id as string);

  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    phoneNumber: "",
    specification: "",
    level: "",
    experience: "",
    hourPrice: "",
    portfolioLink: "",
  });

  if (isLoading) {
    return <p className="text-center text-muted-foreground">Loading...</p>;
  }

  const completedLessonsCount =
    teacher?.lessons?.filter(
      (lesson: LessonResponse) => lesson.status === "completed"
    ).length ?? 0;

  const totalLessons = teacher?.lessons?.length ?? 0;

  const handleEdit = () => {
    setForm({
      phoneNumber: teacher?.phoneNumber ?? "",
      specification: teacher?.specification ?? "",
      level: teacher?.level ?? "",
      experience: teacher?.experience ?? "",
      hourPrice: teacher?.hourPrice?.toString() ?? "",
      portfolioLink: teacher?.portfolioLink ?? "",
    });
    setIsEdit(true);
  };

  const handleSave = () => {
    if (!teacher) return;

    const payload: Record<string, any> = {};

    if (form.phoneNumber !== teacher.phoneNumber)
      payload.phoneNumber = form.phoneNumber;

    if (form.specification !== teacher.specification)
      payload.specification = form.specification;

    if (form.level !== teacher.level) payload.level = form.level;

    if (form.experience !== teacher.experience)
      payload.experience = form.experience;

    if (Number(form.hourPrice) !== teacher.hourPrice)
      payload.hourPrice = Number(form.hourPrice);

    if (form.portfolioLink !== teacher.portfolioLink)
      payload.portfolioLink = form.portfolioLink;

    if (Object.keys(payload).length === 0) {
      toast.info("No changes to save");
      return;
    }

    updateProfile(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["teacher"] });
        toast.success("Profile updated successfully");
        setIsEdit(false);
      },
      onError: () => {
        toast.error("Failed to update profile");
      },
    });
  };

  return (
    <Card className=" mx-auto mt-10 shadow-lg">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={teacher?.imageUrl} />
          <AvatarFallback>{teacher?.fullName?.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <CardTitle className="text-xl">{teacher?.fullName}</CardTitle>
          <p className="text-sm text-muted-foreground">{teacher?.email}</p>
        </div>

        <Badge variant={teacher?.isActive ? "default" : "secondary"}>
          {teacher?.isActive ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6 text-sm space-y-6">
        <div className="grid grid-cols-[160px_1fr] gap-y-3 gap-x-4">
          <span className="text-muted-foreground">Phone</span>
          {isEdit ? (
            <Input
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
            />
          ) : (
            <span>{teacher?.phoneNumber}</span>
          )}

          <span className="text-muted-foreground">Specification</span>
          {isEdit ? (
            <Input
              value={form.specification}
              onChange={(e) =>
                setForm({ ...form, specification: e.target.value })
              }
            />
          ) : (
            <span className="capitalize">{teacher?.specification}</span>
          )}

          <span className="text-muted-foreground">Level</span>
          {isEdit ? (
            <Input
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            />
          ) : (
            <span className="uppercase">{teacher?.level}</span>
          )}

          <span className="text-muted-foreground">Experience</span>
          {isEdit ? (
            <Input
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
            />
          ) : (
            <span>{teacher?.experience}</span>
          )}

          <span className="text-muted-foreground">Hourly Price</span>
          {isEdit ? (
            <Input
              type="number"
              value={form.hourPrice}
              onChange={(e) => setForm({ ...form, hourPrice: e.target.value })}
            />
          ) : (
            <span>
              {teacher?.hourPrice ? `$${teacher.hourPrice}` : "Not set"}
            </span>
          )}

          <span className="text-muted-foreground">Portfolio</span>
          {isEdit ? (
            <Input
              value={form.portfolioLink}
              onChange={(e) =>
                setForm({ ...form, portfolioLink: e.target.value })
              }
            />
          ) : teacher?.portfolioLink ? (
            <a
              href={teacher.portfolioLink}
              target="_blank"
              className="text-primary underline"
            >
              View
            </a>
          ) : (
            "Not provided"
          )}

          <span className="text-muted-foreground">Completed Lessons</span>
          <span>{completedLessonsCount}</span>

          <span className="text-muted-foreground">Total Lessons</span>
          <span>{totalLessons}</span>
        </div>

        <div className="flex justify-end gap-3">
          {isEdit ? (
            <>
              <Button variant="outline" onClick={() => setIsEdit(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>Edit Profile</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(Profile);
