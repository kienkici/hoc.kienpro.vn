import { Users, Mail, Phone, Calendar, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_CURRENT_USER } from "@/lib/mock-data";

export function CourseStudentsList() {
  const students = [
    {
      id: "std-1",
      name: MOCK_CURRENT_USER.fullName,
      email: MOCK_CURRENT_USER.email,
      phone: MOCK_CURRENT_USER.phone,
      enrolledAt: "2026-08-02 20:45",
      progress: 35,
      status: "ACTIVE",
    },
    {
      id: "std-2",
      name: "Nguyễn Hoàng Nam",
      email: "hoangnam@gmail.com",
      phone: "0912.987.654",
      enrolledAt: "2026-08-01 14:20",
      progress: 100,
      status: "ACTIVE",
    },
    {
      id: "std-3",
      name: "Đặng Thị Phương",
      email: "phuongdang@outlook.com",
      phone: "0933.444.555",
      enrolledAt: "2026-07-29 09:15",
      progress: 60,
      status: "ACTIVE",
    },
  ];

  return (
    <div className="space-y-4 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white">4. Danh Sách Học Viên Khóa Học</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Tổng số 1.280 học viên đã thanh toán VietQR và cấp khóa học tự động.</p>
        </div>
        <Badge variant="gold">{students.length} hiển thị demo</Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950 text-zinc-400 font-semibold border-b border-zinc-800">
            <tr>
              <th className="p-3">Học Viên</th>
              <th className="p-3">Liên Hệ</th>
              <th className="p-3">Ngày Cấp Quyền</th>
              <th className="p-3">Tiến Độ</th>
              <th className="p-3">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-zinc-900/80">
                <td className="p-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={MOCK_CURRENT_USER.avatarUrl} />
                      <AvatarFallback>HV</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-white">{s.name}</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-zinc-300"><Mail className="w-3 h-3 text-gold-400" /> {s.email}</div>
                    <div className="flex items-center gap-1 text-zinc-500"><Phone className="w-3 h-3" /> {s.phone}</div>
                  </div>
                </td>
                <td className="p-3 text-zinc-400">{s.enrolledAt}</td>
                <td className="p-3 font-semibold text-gold-400">{s.progress}% hoàn thành</td>
                <td className="p-3">
                  <Badge variant="success" className="text-[10px]">ACTIVE</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
