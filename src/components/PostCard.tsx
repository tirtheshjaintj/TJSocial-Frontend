import { Card, Carousel, Dropdown, DropdownItem } from "flowbite-react";
import {
    FaAngleLeft,
    FaAngleRight,
    FaTrash,
    FaPencilAlt,
    FaRegHeart,
    FaRegComment,
    FaRegShareSquare,
    FaHeart,
    FaBookmark,
    FaRegBookmark,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import axiosInstance from "../config/axiosConfig";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

interface PostCardProps {
    post: any;
    onDelete?: (postId: string) => void;
    innerRef?: (node: HTMLDivElement | null) => void;
    index: number;
    onEdit?: () => void;
}

function stripHtml(html: string): string {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}

function PostCard({ post, onDelete, innerRef, index, onEdit }: PostCardProps) {
    const [liked, setLiked] = useState(post.liked);
    const [bookmarked, setBookmarked] = useState(post.bookmarked || false);
    const [likeCount, setLikeCount] = useState(post.like_count);
    const user = useSelector((state: any) => state.user);
    

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to undo this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                await axiosInstance.delete(`/post/${post._id}`);
                if(onDelete){
                onDelete(post._id);
                }
                toast.success("Post Deleted Successfully");
                Swal.fire("Deleted!", "Your post has been deleted.", "success");
            } catch (error) {
                console.error(error);
                toast.error("Post cannot be Deleted");
                Swal.fire("Error", "Failed to delete the post.", "error");
            }
        }
    };

    const handleLike = async () => {
        try {
            const response = await axiosInstance.post(`/like/${post._id}`);
            setLiked(response.data.data);
            if (response.data.data) setLikeCount((prev: number) => prev + 1);
            else setLikeCount((prev: number) => prev - 1);
            toast.success(response.data.message);
        } catch (error: any) {
            toast.error(error.response.data.message);
            console.log(error);
        }
    };

    const handleBookmark = async () => {
        try {
            const response = await axiosInstance.post(`/bookmark/${post._id}`);
            setBookmarked(response.data.data);
            toast.success(response.data.message);
        } catch (error: any) {
            toast.error(error.response.data.message);
            console.log(error);
        }
    };
    const handleShare = async () => {
        const shareData = {
            title: `${post.user_id.name}'s Post`,
            text: stripHtml(post.description || "Check out this post!"),
            url: `${window.location.origin}/post/${post._id}`,  // Customize as needed
        };
    
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                toast.success("Shared successfully!");
            } else {
                await navigator.clipboard.writeText(shareData.url);
                toast.info("Share not supported. Link copied to clipboard.");
            }
        } catch (err) {
            console.error("Sharing failed", err);
            toast.error("Failed to share");
        }
    };
    
 


    return (
        <div ref={innerRef} className="bg-transparent">
            <Card
                className=" bg-transparent relative rounded-3xl shadow-lg  dark:bg-transparent  hover:shadow-2xl transition-all duration-300 p-0 overflow-hidden"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-1 border-b border-gray-700/80">
                    <div className="flex items-center gap-2">
                        <Link to={`/user/${user._id === post.user_id._id ? user.username : post.user_id.username}`} className="flex items-center gap-1">
                            <img
                                src={user._id === post.user_id._id ? user.profile_pic : post.user_id.profile_pic}
                                className="w-9 h-9 rounded-full border dark:border-gray-600"
                                alt="User"
                            />
                            <h3 className="text-base font-medium dark:text-white">
                                {user._id === post.user_id._id ? user.name : post.user_id.name}
                            </h3>

                        </Link>
                        <span className="rounded-lg bg-blue-600 text-white p-1 text-xs">{post.post_type.toUpperCase()}</span>
                        <span className="rounded-lg bg-blue-600 text-white p-1 text-xs">{post.type.toUpperCase()}</span>
                       
                    </div>
                    <Dropdown
                        label={
                            <svg
                                className="w-5 h-5 text-gray-500 dark:text-white cursor-pointer"
                                fill="currentColor"
                                viewBox="0 0 16 3"
                            >
                                <path d="M2 0a1.5 1.5 0 1 1 0 3A1.5 1.5 0 0 1 2 0Zm6 0a1.5 1.5 0 1 1 0 3A1.5 1.5 0 0 1 8 0Zm6 0a1.5 1.5 0 1 1 0 3A1.5 1.5 0 0 1 14 0Z" />
                            </svg>
                        }
                        inline
                        arrowIcon={false}
                    >
                        {
                            post.user_id._id === user._id && (
                                <>
                                    <DropdownItem icon={FaPencilAlt} onClick={onEdit}>Edit</DropdownItem>
                                    <DropdownItem icon={FaTrash} onClick={handleDelete}>Delete</DropdownItem>
                                </>
                            )
                        }
                        <DropdownItem icon={(bookmarked) ? FaBookmark : FaRegBookmark} onClick={handleBookmark}>{(bookmarked) ? "Bookmarked" : "Bookmark"}</DropdownItem>
                    </Dropdown>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis">
                    {stripHtml(post.description || "")}
                </p>
                {/* Carousel */}
                <Carousel
                    slide={false}
                    className="hide-scrollbar overflow-hidden hide-scrollbar flowbite-carousel"
                    leftControl={
                        <span className="text-xl cursor-pointer inline-flex items-center justify-center h-8 w-8 bg-white/70 dark:bg-gray-800/70 text-black/70 dark:text-white/70 rounded-full shadow">
                            <FaAngleLeft />
                        </span>
                    }
                    rightControl={
                        <span className="text-xl cursor-pointer inline-flex items-center justify-center h-8 w-8 bg-white/70 dark:bg-gray-800/70 text-black/70 dark:text-white/70 rounded-full shadow">
                            <FaAngleRight />
                        </span>
                    }
                >
                    {post.images.map((image: any, idx: number) => (
                        <div key={idx} className="relative w-full h-full overflow-hidden p-2">
                            <img
                                src={image.image_url}
                                alt={`Post ${index} - Image ${idx + 1}`}
                                className="object-contain w-full h-80 rounded-xl"
                            />
                        </div>
                    ))}
                </Carousel>

                {/* Footer with actions */}
                <div className="  bottom-0 left-0 right-0  flex items-center justify-around py-3 px-4  dark:border-gray-700 ">
                    <div className="flex items-center justify-center gap-1 h-8 text-red-500 dark:text-red-400 cursor-pointer hover:scale-110 border-2 border-r-0 rounded-l-lg flex-1 px-2"
                        onClick={handleLike}>
                        {liked ? <FaHeart /> : <FaRegHeart />}
                        <span className="text-xl">{likeCount || 0}</span>
                    </div>

                    <div className="flex items-center justify-center gap-1 h-8 text-blue-500 dark:text-blue-400 cursor-pointer hover:scale-110 border-y-2 border-r-0 border-l-0 flex-1 px-2">
                        <FaRegComment />
                        <span className="text-xl">{post.comment_count || 0}</span>
                    </div>

                    <div onClick={handleShare} className="flex items-center justify-center gap-1 h-8 text-green-600 dark:text-green-400 cursor-pointer hover:scale-110 border-2 border-l-0 rounded-r-lg flex-1 px-2 min-w-[64px]">
                        <FaRegShareSquare />
                        <span className="text-xl"></span>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default PostCard;
