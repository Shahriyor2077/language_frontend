import { useAuth } from "@/hooks/useAuth";
import { useGetTeacherPayments } from "../service/query/useTeacherPayments";
import type { Payment } from "../TeacherTypes";

const Payments = () => {
  const { user, isAuthenticated } = useAuth();

  const { data, isLoading, error } = useGetTeacherPayments(user?.id || "");

  if (!isAuthenticated || !user) {
    return <div className="p-4">Please log in to view payments</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading your payments...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading payments: {error.message}
      </div>
    );
  }

  const payments = data?.payments || [];

  if (payments.length === 0) {
    return <div className="p-4">You haven't received any payments yet.</div>;
  }

  const totalEarnings = payments.reduce(
    (sum: number, p: Payment) => sum + p.teacherAmount,
    0
  );
  const totalLessons = payments.length;

  return (
    <div className="p-6 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-teal-950 dark:to-slate-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">My Payments</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 p-6 rounded-xl shadow-md border border-teal-200 dark:border-teal-700">
          <p className="text-sm text-teal-700 dark:text-teal-300 font-medium">Total Earnings</p>
          <p className="text-3xl font-bold text-teal-600 dark:text-teal-400 mt-2">
            ${(totalEarnings / 100).toFixed(2)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 p-6 rounded-xl shadow-md border border-cyan-200 dark:border-cyan-700">
          <p className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">Total Lessons</p>
          <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mt-2">{totalLessons}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 rounded-xl shadow-md border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Average per Lesson</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            ${(totalEarnings / totalLessons / 100).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-teal-200 dark:border-teal-800">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 border-b border-teal-200 dark:border-teal-800">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-teal-700 dark:text-teal-300 uppercase">
                Paid At
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-teal-700 dark:text-teal-300 uppercase">
                Paid By
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-teal-700 dark:text-teal-300 uppercase">
                Lesson Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-teal-700 dark:text-teal-300 uppercase">
                Commission
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-teal-700 dark:text-teal-300 uppercase">
                Your Earnings
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-teal-700 dark:text-teal-300 uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-teal-700 dark:text-teal-300 uppercase">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-100 dark:divide-teal-800">
            {payments.map((payment: Payment) => (
              <tr key={payment.id} className="hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                  {new Date(payment.paidAt).toLocaleDateString()}
                  <br />
                  <span className="text-teal-600 dark:text-teal-400 text-xs">
                    {new Date(payment.paidAt).toLocaleTimeString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                  {payment.paidBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                  ${(payment.totalLessonAmount / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                  ${(payment.platformComission / 100).toFixed(2)}
                  <span className="text-xs text-slate-500 dark:text-slate-500 ml-1">
                    (
                    {(
                      (payment.platformComission / payment.totalLessonAmount) *
                      100
                    ).toFixed(0)}
                    %)
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-teal-600 dark:text-teal-400">
                  ${(payment.teacherAmount / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {payment.isCanceled ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      Canceled
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                      Completed
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm max-w-xs text-slate-600 dark:text-slate-400">
                  {payment.isCanceled && payment.canceledReason ? (
                    <div className="text-red-600 dark:text-red-400">
                      <p className="font-semibold">
                        Canceled by: {payment.canceledBy}
                      </p>
                      <p className="text-xs">{payment.canceledReason}</p>
                    </div>
                  ) : (
                    <p className="truncate" title={payment.notes}>
                      {payment.notes}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
