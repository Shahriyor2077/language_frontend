import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { user, isAuthenticated } = useAuth();

  console.log(user)
  return (
    <div>
      <div>hello</div>
    </div>
  );
};

export default Header;
