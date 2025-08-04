import { useEffect, useState } from "react";
import usePageSetup from "../hooks/usePageSetup";
import type { titleProp } from "../types";
import { motion } from "framer-motion";
import ShowAllPosts from "../components/ShowAllPosts";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import { FaClipboardCheck } from "react-icons/fa";
import { useSelector } from "react-redux";
import CountModal from "../components/CountModal";
import { toast } from "react-toastify";

export interface PostUser {
    _id: string;
    name: string;
    username: string;
    profile_pic?: string;
    cover_pic?: string;
    bio?: string;
    follower_count: number;
    following_count: number;
    following?: boolean;
    followers: any;
    followings: any;
}

export default function Profile({ title }: titleProp) {
    usePageSetup(title);
    const [loading, setLoading] = useState<boolean>(false);
    const { username } = useParams();
    const [postuser, setPostUser] = useState<PostUser | null>(null);
    const user = useSelector((state: any) => state.user);
    const [following, setFollowing] = useState(false);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<"followers" | "followings" | null>(null);

    const getPostUser = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/user/user/${username}`);
            setPostUser(response.data.data);
            setFollowing(response.data.data.following);
        } catch (error) {
            console.log(error);
            navigate("/404");
        } finally {
            setLoading(false);
        }
    }

    const followByUserName = async () => {
        try {
            const response = await axiosInstance.post(`/follow/${postuser?._id}`);
            console.log(response);
            setFollowing(response.data.data);
            if (response.data.data) toast.success("Followed User");
            else toast.success("Unfollowed User");
        } catch (error) {
            console.log(error);
            toast.error("Request Failed");
        }
    }

    useEffect(() => {
        getPostUser();
        setShowModal(false);
    }, [username]);


    return (
        <>
            <motion.div
                className="relative flex flex-col flex-1 rounded-4xl bg-white/70 dark:bg-gray-900/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Cover Image */}
                <div
                    style={{
                        backgroundImage: loading ? undefined : `url(${postuser?.cover_pic || '/cover-default.jpg'})`,
                    }}
                    className={`w-full h-44 md:h-60 ${loading ? 'bg-gray-300 dark:bg-gray-700 animate-pulse' : 'bg-repeat-round bg-contain'} rounded-b-4xl shadow-lg`}
                />

                {/* Profile Info Container */}
                <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-8 gap-6">
                    {loading ? (
                        <>
                            {/* Skeleton Profile Info */}
                            <div className="flex flex-col items-center text-center animate-pulse">
                                <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg -mt-30" />
                                <div className="mt-4 space-y-2">
                                    <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
                                    <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
                                </div>
                            </div>
                            <div className="flex-1 max-w-xl space-y-4 animate-pulse">
                                <div className="h-5 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
                                <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded" />
                                <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-700 rounded" />
                                <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded" />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Actual Profile Info */}
                            <motion.div
                                className="flex flex-col items-center text-center"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div
                                    style={{
                                        backgroundImage: `url(${postuser?.profile_pic || '/profile-default.webp'})`,
                                    }}
                                    className="w-32 h-32 rounded-full bg-cover bg-no-repeat bg-center border-4 border-white dark:border-gray-800 shadow-lg -mt-30"
                                />
                                <div className="mt-4">
                                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white font-[cursive]">
                                        {postuser?.name}
                                    </h2>
                                    <p className="text-sm md:text-md text-gray-600 dark:text-gray-400 font-[cursive]">@{postuser?.username}</p>
                                    {(postuser && (postuser?._id != user._id)) && <button onClick={followByUserName} className={`flex items-center h-min m-1 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer ${following ? "opacity-65" : ""}`}
                                    >{following ? "Following" : "Follow"}&nbsp;<FaClipboardCheck /></button>}
                                </div>
                            </motion.div>
                            <motion.div
                                className="flex md:flex-row flex-wrap text-center justify-center md:justify-between gap-4 font-semibold text-lg md:text-left max-w-xl"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <span
                                    onClick={() => { setModalType("followers"); setShowModal(true); }}
                                    className="h-min m-1 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                >
                                    Followers: {postuser?.follower_count}
                                </span>

                                <span
                                    onClick={() => { setModalType("followings"); setShowModal(true); }}
                                    className="m-1 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                >
                                    Following: {postuser?.following_count}
                                </span>
                            </motion.div>
                            <motion.div
                                className="flex flex-col md:flex-row text-center justify-between  md:text-left max-w-xl flex-1"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >

                                <div className="flex-1">
                                    <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-2">
                                        About Me:
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                                        {postuser?.bio}
                                    </p>
                                </div>
                            </motion.div>

                        </>
                    )}
                </div>
            </motion.div>

            {postuser && <ShowAllPosts post_user={postuser} />}
            {<CountModal onClose={() => { setShowModal(false) }} showModal={showModal} modalType={modalType} postuser={postuser} />}
        </>
    );
}
