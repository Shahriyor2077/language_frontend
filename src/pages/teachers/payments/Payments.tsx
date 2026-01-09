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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Payments</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Earnings</p>
          <p className="text-2xl font-bold text-green-600">
            ${(totalEarnings / 100).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Lessons</p>
          <p className="text-2xl font-bold">{totalLessons}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Average per Lesson</p>
          <p className="text-2xl font-bold">
            ${(totalEarnings / totalLessons / 100).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Paid At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Paid By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Lesson Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Commission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Your Earnings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((payment: Payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(payment.paidAt).toLocaleDateString()}
                  <br />
                  <span className="text-gray-500 text-xs">
                    {new Date(payment.paidAt).toLocaleTimeString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {payment.paidBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  ${(payment.totalLessonAmount / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  ${(payment.platformComission / 100).toFixed(2)}
                  <span className="text-xs text-gray-500 ml-1">
                    (
                    {(
                      (payment.platformComission / payment.totalLessonAmount) *
                      100
                    ).toFixed(0)}
                    %)
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                  ${(payment.teacherAmount / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {payment.isCanceled ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      Canceled
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Completed
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm max-w-xs">
                  {payment.isCanceled && payment.canceledReason ? (
                    <div className="text-red-600">
                      <p className="font-semibold">
                        Canceled by: {payment.canceledBy}
                      </p>
                      <p className="text-xs">{payment.canceledReason}</p>
                    </div>
                  ) : (
                    <p className="text-gray-600 truncate" title={payment.notes}>
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
