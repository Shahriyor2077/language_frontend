import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Calendar, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCreateLesson } from "../service/mutate/useCreateLesson";

const ALLOWED_DURATIONS_MINUTES = [30, 45, 60, 90, 120];

const lessonSchema = z.object({
  name: z.string().min(2, "Lesson name must be at least 2 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration: z.number().min(1, "Duration is required"),
  price: z.string().transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num < 0)
      throw new Error("Price must be a valid positive number");
    return num;
  }),
});

type LessonFormData = z.infer<typeof lessonSchema>;

const LessonCreationForm = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { user, isAuthenticated } = useAuth();
  const { mutate, isPending } = useCreateLesson();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema) as any,
  });

  const selectedDate = watch("date");

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentMonth);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateDisabled = (day: number) => {
    const date = new Date(year, month, day);
    return date < today;
  };

  const handleDateSelect = (day: number) => {
    if (isDateDisabled(day)) return;
    const date = new Date(year, month, day);
    const formatted = date.toISOString().split("T")[0];
    setValue("date", formatted);
    setShowDatePicker(false);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "Select date";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min of [0, 30]) {
        const h = hour.toString().padStart(2, "0");
        const m = min.toString().padStart(2, "0");
        slots.push(`${h}:${m}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const onSubmit = async (data: LessonFormData) => {
    if (!isAuthenticated || !user) {
      setErrorMessage("You must be logged in to create a lesson");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const startDateTime = new Date(`${data.date}T${data.time}`);
    const endDateTime = new Date(
      startDateTime.getTime() + data.duration * 60000
    );

    const lessonData = {
      name: data.name,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      teacherId: user.id,
      price: data.price,
    };

    mutate(lessonData, {
      onSuccess: (response) => {
        setSuccessMessage(
          response.data.message || "Lesson created successfully!"
        );
        reset();
        setTimeout(() => setSuccessMessage(""), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(
          error.response?.data?.message ||
          error.message ||
          "Failed to create lesson"
        );
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-950 dark:to-slate-900 rounded-2xl shadow-xl min-h-screen flex items-center justify-center">
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl flex items-center gap-3 text-amber-900 dark:text-amber-200">
          <AlertCircle size={20} />
          <span className="font-medium">Please log in to create a lesson</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mx-auto p-8 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-teal-950 dark:to-slate-900">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl border border-teal-200 dark:border-teal-800 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
          Create New Lesson
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Schedule a lesson for your students
        </p>

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center gap-3 text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 size={20} />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl flex items-center gap-3 text-red-900 dark:text-red-200">
            <AlertCircle size={20} />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Lesson Name */}
          <div>
            <Label
              htmlFor="name"
              className="block text-sm font-semibold mb-2 text-teal-700 dark:text-teal-300"
            >
              Lesson Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Advanced Mathematics"
              {...register("name")}
              className={`h-12 border-2 ${errors.name ? "border-red-400" : "border-teal-200 dark:border-teal-700"
                } focus:border-teal-500 dark:focus:border-teal-400 rounded-lg bg-white dark:bg-slate-800`}
            />
            {errors.name && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <Label className="block text-sm font-semibold mb-2 text-teal-700 dark:text-teal-300">
              Lesson Date
            </Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`w-full h-12 px-4 border-2 ${errors.date ? "border-red-400" : "border-teal-200 dark:border-teal-700"
                  } rounded-lg flex items-center justify-between bg-white dark:bg-slate-800 hover:border-teal-400 dark:hover:border-teal-500 transition-colors`}
              >
                <span
                  className={selectedDate ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}
                >
                  {formatDisplayDate(selectedDate)}
                </span>
                <Calendar size={20} className="text-teal-600 dark:text-teal-400" />
              </button>

              {showDatePicker && (
                <div className="absolute z-10 mt-2 bg-white dark:bg-slate-800 border-2 border-teal-200 dark:border-teal-700 rounded-xl shadow-xl p-4 w-full">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => setCurrentMonth(new Date(year, month - 1))}
                      className="p-2 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400"
                    >
                      ←
                    </button>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {currentMonth.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentMonth(new Date(year, month + 1))}
                      className="p-2 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400"
                    >
                      →
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-semibold text-teal-700 dark:text-teal-300 py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const disabled = isDateDisabled(day);
                      const isSelected =
                        selectedDate ===
                        new Date(year, month, day).toISOString().split("T")[0];

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDateSelect(day)}
                          disabled={disabled}
                          className={`
                            h-10 rounded-lg text-sm font-medium transition-colors
                            ${disabled
                              ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                              : "hover:bg-teal-100 dark:hover:bg-teal-900/30 cursor-pointer text-slate-900 dark:text-slate-100"
                            }
                            ${isSelected
                              ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700"
                              : ""
                            }
                          `}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {errors.date && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Time and Duration Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Time Selector */}
            <div>
              <Label
                htmlFor="time"
                className="block text-sm font-semibold mb-2 text-teal-700 dark:text-teal-300"
              >
                Start Time
              </Label>
              <div className="relative">
                <select
                  id="time"
                  {...register("time")}
                  className={`w-full h-12 px-4 border-2 ${errors.time ? "border-red-400" : "border-teal-200 dark:border-teal-700"
                    } rounded-lg bg-white dark:bg-slate-800 appearance-none cursor-pointer focus:border-teal-500 dark:focus:border-teal-400 focus:outline-none text-slate-900 dark:text-slate-100`}
                >
                  <option value="">Select time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <Clock
                  size={20}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-600 dark:text-teal-400 pointer-events-none"
                />
              </div>
              {errors.time && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.time.message}
                </p>
              )}
            </div>

            {/* Duration Selector */}
            <div>
              <Label
                htmlFor="duration"
                className="block text-sm font-semibold mb-2 text-teal-700 dark:text-teal-300"
              >
                Duration
              </Label>
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="duration"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className={`w-full h-12 px-4 border-2 ${errors.duration ? "border-red-400" : "border-teal-200 dark:border-teal-700"
                      } rounded-lg bg-white dark:bg-slate-800 appearance-none cursor-pointer focus:border-teal-500 dark:focus:border-teal-400 focus:outline-none text-slate-900 dark:text-slate-100`}
                  >
                    <option value="">Select duration</option>
                    {ALLOWED_DURATIONS_MINUTES.map((duration) => (
                      <option key={duration} value={duration}>
                        {duration} min ({Math.floor(duration / 60)}h{" "}
                        {duration % 60 > 0 ? `${duration % 60}m` : ""})
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.duration && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.duration.message}
                </p>
              )}
            </div>
          </div>

          {/* Price */}
          <div>
            <Label
              htmlFor="price"
              className="block text-sm font-semibold mb-2 text-teal-700 dark:text-teal-300"
            >
              Price (USD)
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600 dark:text-teal-400 font-medium">
                $
              </span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("price")}
                className={`h-12 pl-8 border-2 ${errors.price ? "border-red-400" : "border-teal-200 dark:border-teal-700"
                  } focus:border-teal-500 dark:focus:border-teal-400 rounded-lg bg-white dark:bg-slate-800`}
              />
            </div>
            {errors.price && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.price.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending}
            onClick={handleSubmit(onSubmit)}
            className="w-full h-12 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 dark:from-teal-700 dark:to-cyan-700 dark:hover:from-teal-600 dark:hover:to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Lesson...
              </span>
            ) : (
              "Create Lesson"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LessonCreationForm;
