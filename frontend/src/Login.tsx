import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import * as z from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { baseUrl } from "./constant";
import { useContext } from "react";
import { context } from "./Context";
const LoginSchema = z.object({
  email: z.string().email("enter valid email"),
  password: z.string().min(6, "password should be atleast 6 characters long"),
});
type login = z.infer<typeof LoginSchema>;
const Login = () => {
  const navigate = useNavigate();
  const value = useContext(context);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const dd = useRef(null);
  function createStars(type: any, quantity: any) {
    for (let i = 0; i < quantity; i++) {
      var star = document.createElement("div");
      star.classList.add("star", `type-${type}`);
      star.style.left = `${randomNumber(1, 99)}%`;
      star.style.bottom = `${randomNumber(1, 99)}%`;
      star.style.animationDuration = `${randomNumber(50, 200)}s`;
      //@ts-ignore
      dd?.current?.appendChild(star);
    }
  }
  function randomNumber(min: any, max: any) {
    return Math.floor(Math.random() * max) + min;
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<login>({ resolver: zodResolver(LoginSchema) });
  const onSubmit: SubmitHandler<login> = async (data) => {
    const body = { email: data.email, password: data.password };
    setLoading(true);
    toast({ title: "Login initiated" });
    try {
      const res = await axios.post(`${baseUrl}/login`, body, {
        withCredentials: true,
      });
      console.log(res.data);
      value?.setIsLoggedIn(true);
      value?.setUser({
        name: res.data.name,
        email: res.data.email,
        image: res.data.image,
        id: res.data.id,
      });

      navigate("/");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description:
          "please try again later or put correct email password conbination",
      });
      setLoading(false);
    }
  };
  useEffect(() => {
    createStars(1, 100);
    createStars(2, 50);
    createStars(3, 30);
  }, []);
  return (
    <div className="h-[80dvh] flex items-center justify-center my-10" ref={dd}>
      <form
        className="flex flex-col items-center border rounded-t-xl justify-center gap-3 md:w-1/2 w-full  z-10 py-10 px-4 mx-10"
        style={{ backgroundColor: "#121212" }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <p className="text-center text-gray-400 mb-5">
          <span className="text-semibold text-[25px] block">Login</span>
          <span>
            Don't have an Account?{" "}
            <Link to="/register" className="underline">
              Register
            </Link>
          </span>
        </p>
        <div className="flex flex-col gap-3 items-start md:w-1/2 w-full">
          <label className="text-gray-400">Email</label>
          <Input
            className="w-full bg-gray-800"
            placeholder="arpit@gmail.com"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-red-500">{errors.email.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-3 items-start md:w-1/2 w-full">
          <label className="text-gray-400">Password</label>
          <Input
            className="w-full bg-gray-800"
            placeholder="12345!@@"
            {...register("password")}
            type="password"
          />
          {errors.password && (
            <span className="text-red-500">{errors.password.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-3 items-center mt-5 md:w-1/2 w-full">
          <Button className="w-full" type="submit" disabled={loading}>
            Login
          </Button>
        </div>
      </form>
    </div>
  );
};
export default Login;
