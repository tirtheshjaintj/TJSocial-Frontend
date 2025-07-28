import { useEffect, useState } from "react"
import { isValidEmail } from "./Login";
import { toast } from "react-toastify";
import LoginImage from "/login.png";
import axiosInstance from "../config/axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import EyeToggleSVG from "../components/Eye";
import type { titleProp } from "../types";
import usePageSetup from "../hooks/usePageSetup";
import { useSelector } from "react-redux";

export default function ForgotPassword({ title }: titleProp) {
    usePageSetup(title);
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
        confirm_password: "",
        otp: ""
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [phase, setPhase] = useState<number>(1);
    const [timer, setTimer] = useState(60);
    const [resendDisabled, setResendDisabled] = useState(false);
    const navigate = useNavigate();
    const user = useSelector((state: any) => state.user);
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!isValidEmail(credentials.email)) toast.error("Wrong Credentials");
        try {
            setIsLoading(true);
            if (phase == 1) {
                const response = await axiosInstance.post("/user/forgot-password", credentials);
                const data = response.data;
                toast.success(data.message);
                setPhase((phase) => phase + 1);
                setResendDisabled(true); // Disable the button
            } else {
                if (credentials.password != credentials.confirm_password) {
                    toast.error("Password Confirming Failed");
                    return;
                }
                await axiosInstance.post("/user/change-password", credentials);
                toast.success("Password Changed Successfully");
                navigate("/login");
            }
        } catch (error) {
            console.log(error);
            toast.error("Wrong Credentials Provided");
        } finally {
            setIsLoading(false);
        }
    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name == "otp" && value.trim().length > 6) {
            setCredentials({ ...credentials, [name]: value.replaceAll(" ", "") });
            return;
        };
        setCredentials({ ...credentials, [name]: value.trim() });
    }

    const handleShowPasswordToggle = () => {
        setShowNewPassword((prev) => !prev);
    }
    const handleShowPasswordToggleConfirm = () => {
        setShowConfirmPassword((prev) => !prev);
    }

    useEffect(() => {
        let interval: any;
        if (resendDisabled) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev === 1) {
                        setResendDisabled(false); // Enable button
                        clearInterval(interval!);
                        return 60; // Reset timer for future use
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [resendDisabled]);

    const resendOTP = async () => {
        try {
            setIsLoading(true);
            await axiosInstance.post("/user/forgot-password", credentials);
            toast.success("OTP Resent Successfully");
            setTimer(60);
            setResendDisabled(true);
        } catch (error) {
            toast.error("Error in Resending OTP");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (user) setCredentials({ ...credentials, email: user.email });
    }, [user]);

    return (
        <>
            <div className="flex flex-col md:flex-row justify-center items-center md:items-start md:mt-16  min-h-screen m-2 gap-8">
                <div className="h-[60vh] hidden md:block">
                    <img src={LoginImage} className="h-full" alt="" />
                </div>
                <div className="flex flex-col sm:w-md px-10 py-5 rounded-3xl h-100 justify-start w-full">
                    <h1 className="text-3xl text-center">TJ Social Change Password</h1>

                    <form className="flex flex-col justify-start" method="get" onSubmit={handleSubmit}>

                        {phase == 1 && <>  <div>
                            <label htmlFor="email" className="block mb-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Your Email</label>
                            <input className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                type="email" name="email" id="email" placeholder="name@company.com" value={credentials.email}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                            />
                        </div>
                            <button
                                type="submit"
                                className="w-full mt-8 cursor-pointer dark:text-white bg-red-600 text-black focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                disabled={isLoading}  // Disable the button during loading
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="spinner"></div>
                                    </div>) : (
                                    `Get OTP`  // Default text when not loading
                                )}
                            </button></>}
                        {phase == 2 && <>
                            <div>
                                <label htmlFor="otp" className="block mb-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Your OTP sent  to <span className="opacity-50 font-semibold cursor-pointer hover:underline" onClick={() => setPhase(1)}
                                >{credentials.email}</span></label>
                                <input className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    type="number" name="otp" id="otp" placeholder="000000" min={100000} max={999999}
                                    value={credentials.otp}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    required
                                />

                                <label htmlFor="password" className="block my-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Your New Password</label>
                                <div className="relative">
                                    <input className="bg-gray-50 border border-gray-300 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        type={(showNewPassword) ? "text" : "password"} name="password" id="password"
                                        placeholder="••••••••"
                                        minLength={8}
                                        value={credentials.password}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 p-3 bg-gray-50 border-gray-300 dark:bg-gray-700  flex items-center justify-center text-sm leading-5 rounded-lg border-1 dark:border-gray-600"
                                        onClick={handleShowPasswordToggle}
                                    >
                                        <EyeToggleSVG showpassword={showNewPassword} />
                                    </button>
                                </div>
                                <label htmlFor="confirm_password" className="block my-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Confirm New Password</label>
                                <div className="relative">
                                    <input className="bg-gray-50 border border-gray-300 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        type={(showConfirmPassword) ? "text" : "password"} name="confirm_password" id="confirm_password"
                                        placeholder="••••••••"
                                        minLength={8}
                                        value={credentials.confirm_password}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 p-3 bg-gray-50 border-gray-300 dark:bg-gray-700  flex items-center justify-center text-sm leading-5 rounded-lg border-1 dark:border-gray-600"
                                        onClick={handleShowPasswordToggleConfirm}
                                    >
                                        <EyeToggleSVG showpassword={showConfirmPassword} />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full mt-8 cursor-pointer dark:text-white bg-red-600 text-black focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                    disabled={isLoading}  // Disable the button during loading
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="spinner"></div>
                                        </div>) : (
                                        `Change Password`  // Default text when not loading
                                    )}
                                </button>
                                <div className="flex justify-between mt-2">

                                    <button
                                        onClick={resendOTP}
                                        disabled={resendDisabled || isLoading} // Disable the button during loading
                                        className={`text-sm text-primary-600 ${(resendDisabled || isLoading) ? 'cursor-not-allowed' : 'cursor-pointer hover:underline'}`}>
                                        {(resendDisabled || isLoading) ? "Wait To" : "Now"} Resend OTP
                                    </button>
                                    {resendDisabled && (
                                        <span className="text-sm text-gray-500">Resend available in {timer}s</span>
                                    )}
                                </div>
                            </div>
                        </>}


                    </form>
                    <div className="flex items-center w-full my-4">
                        <hr className="flex-grow border-t border-gray-300" />
                        <span className="px-4 text-gray-500 text-sm">OR</span>
                        <hr className="flex-grow border-t border-gray-300" />
                    </div>
                    <p className="text-sm  ">
                        <span className="text-gray-500 dark:text-gray-400">Already have an account?{` `}</span>
                        <Link to={`/login`} className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                            Log in
                        </Link>
                    </p>

                </div>
            </div>
        </>
    )
}
