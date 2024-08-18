"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { baseUrl } from "./constant";
import axios from "axios";
const RegisterSchema = z.object({
  name: z.string().min(1, "please fill the field"),
  email: z.string().email("enter valid email"),
  password: z.string().min(6, "password should be atleast 6 characters long"),
});
type register = z.infer<typeof RegisterSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<null | any>(null);
  const [preview, setPreview] = useState<null | any>(null);
  const dd = useRef(null);
  const [loading, setLoading] = useState(false);
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
  } = useForm<register>({ resolver: zodResolver(RegisterSchema) });
  useEffect(() => {
    createStars(1, 100);
    createStars(2, 50);
    createStars(3, 30);
  }, []);
  const onSubmit: SubmitHandler<register> = async (data) => {
    console.log(data);
    toast({ title: "Registering User initiated" });
    if (!file) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Please select a image as your profile image:(",
      });
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await axios.post(`${baseUrl}/upload`, formData);
      console.log("imageUrl", url.data);
      const body = {
        name: data.name,
        email: data.email,
        password: data.password,
        image: url.data,
      };
      const res = await axios.post(`${baseUrl}/register`, body);
      console.log(res.data);
      toast({ title: "User Registered:)" });
      navigate("/login");
    } catch (err) {
      console.log(err);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "can't register user please try again later:)",
      });
      setLoading(false);
    }
  };
  return (
    <div
      className="min:h-[80dvh] flex items-center justify-center my-10"
      ref={dd}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center border rounded-t-xl justify-center gap-3 lg:w-1/2 w-full  z-10 py-10 px-4 mx-10"
        style={{ backgroundColor: "#121212" }}
      >
        <p className="text-center text-gray-400 mb-5">
          <span className="text-semibold text-[25px] block">Register</span>
          <span>
            Already registered?{" "}
            <Link to="/login" className="underline">
              login
            </Link>
          </span>
        </p>
        <div className="flex flex-col gap-3 items-start md:w-1/2 w-full">
          <label className="text-gray-400">Name</label>
          <Input
            className="w-full bg-gray-800"
            placeholder="Arpit"
            {...register("name")}
          />
          {errors.name && (
            <span className="text-red-500">{errors.name.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-3 items-start md:w-1/2 w-full">
          <label className="text-gray-400">Email</label>
          <Input
            className="w-full bg-gray-800"
            placeholder="arpit@gmai.com"
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
            placeholder="12#@@Ab@!@#"
            {...register("password")}
            type="password"
          />
          {errors.password && (
            <span className="text-red-500">{errors.password.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-3 items-start md:w-1/2 w-full">
          <label className="text-gray-400">Profile Image*</label>
          <Input
            className="w-full bg-gray-800"
            type="file"
            placeholder="Select file"
            onChange={async (e: any) => {
              const ff = e.target.files[0];
              setFile(ff);
              const reader = new FileReader();
              reader.onloadend = () => {
                setPreview(reader.result);
              };
              reader.readAsDataURL(ff);
            }}
          />
          {preview && (
            <div className="flex items-center justify-center w-full">
              <img
                src={preview}
                alt="Preview"
                style={{ width: "200px", marginTop: "10px" }}
                className="rounded-md"
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 items-center mt-5 md:w-1/2 w-full">
          <Button className="w-full" type="submit" disabled={loading}>
            Register
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Register;
