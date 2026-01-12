import { useAuthStorage } from "@/hooks/useAuthStorage";

const Header = () => {
  const { getTeacherName, logout } = useAuthStorage();
  return (
    <div>
      <div>hello: {getTeacherName()}</div>
      <div className="bg-indigo-400">
        <button onClick={() => logout()} className="bg-red-300 cursor-pointer">
          Logout teacher
        </button>
      </div>
    </div>
  );
};

export default Header;
