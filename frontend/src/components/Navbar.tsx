import { context } from "@/Context";
import { ModeToggle } from "./mode-toggle";
import { useContext } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
const Navbar = () => {
  const value = useContext(context);
  return (
    <div
      className="flex items-center py-2 px-4 rounded-xl border text-white"
      style={{ backgroundColor: "#121212" }}
    >
      <h1 className="text-[30px] font-semibold section-heading">Connect</h1>
      <div className="flex-1 flex items-center justify-end gap-4">
        {value?.isLoggedIn ? (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger>Profile</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-5">
                  <img
                    src={value.user.image}
                    height={30}
                    width={30}
                    className="rounded-full"
                  />
                  {value.user.name}
                </DropdownMenuItem>
                <DropdownMenuItem>{value.user.email}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        )}
        <ModeToggle />
      </div>
    </div>
  );
};

export default Navbar;
