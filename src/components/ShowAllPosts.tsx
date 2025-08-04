import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../config/axiosConfig";
import { motion } from "framer-motion";
import PostCard from "./PostCard";
import { useSelector } from "react-redux";
import CreatePostModal from "./CreatePostModal";

function ShowAllPosts({ post_user }: { post_user: any }) {
    const [isPostLoading, setIsPostLoading] = useState(false);
    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);
    const [sortBy, setSortBy] = useState("recent");
    const user = useSelector((state: any) => state.user);
    const [editPost, setEditPost] = useState(null);

    const handleSortChange = (value: string) => {
        setSortBy(value);
    };

    const fetchPosts = async () => {
        if (!hasMore) return;
        try {
            setIsPostLoading(true);
            let url = `/post/user/${post_user?._id}?page=${page}`;
            if (post_user._id == user._id) url = `/post/mine?page=${page}`;
            console.log(url);
            const response = await axiosInstance.get(url);
            const newPosts = response.data.data;
            setMyPosts(prev => [...prev, ...newPosts]);
            setHasMore(newPosts.length > 0);
        } catch (error: any) {
            console.log(error);
            toast.error("Failed to fetch posts.");
        } finally {
            setIsPostLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [page]);

    const handleDelete = (postId: string) => {
        setMyPosts(prev => prev.filter(post => post._id !== postId));
    };

    const lastPostRef = useCallback((node: HTMLDivElement | null) => {
        if (isPostLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [isPostLoading, hasMore]);

    const renderSkeletons = () => (
        Array.from({ length: 6 }).map((_, i) => (
            <motion.div
                key={i}
                className="w-full h-[20em] rounded-2xl bg-gray-300 dark:bg-gray-700 animate-pulse"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
            />
        ))
    );

    const sortedPosts = useMemo(() => {
        return [...myPosts].sort((a, b) => {
            switch (sortBy) {
                case "recent":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "likes":
                    return (b.like_count || 0) - (a.like_count || 0);
                case "comments":
                    return (b.comment_count || 0) - (a.comment_count || 0);
                default:
                    return 0;
            }
        });
    }, [myPosts, sortBy]);

    const titlePost = useMemo(() => {
        switch (sortBy) {
            case "recent":
                return "Most Recent";
            case "oldest":
                return "Oldest";
            case "likes":
                return "Most Liked";
            case "comments":
                return "Most Commented";
            default:
                return 0;
        }
    }, [sortBy]);


    return (
        <div className="w-full px-4">
            <div className="flex justify-end mb-4">
                <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-4 py-2 border rounded-md text-sm dark:bg-gray-800 dark:text-white"
                >
                    <option value="recent">Most Recent</option>
                    <option value="oldest">Oldest</option>
                    <option value="likes">Most Liked</option>
                    <option value="comments">Most Commented</option>
                </select>
            </div>
            <motion.h2
                className="text-4xl font-bold text-center mb-8 flex gap-2 items-center justify-center text-gray-800 dark:text-white"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {titlePost}  Posts
            </motion.h2>

            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {sortedPosts.map((post, index) => {
                    const isLastPost = index === myPosts.length - 1;
                    return (
                        <motion.div
                            key={post._id}
                            initial={{ opacity: 0.5, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <PostCard
                                post_user={post_user}
                                post={post}
                                index={index}
                                onDelete={handleDelete}
                                innerRef={isLastPost ? lastPostRef : undefined}
                                onEdit={() => setEditPost(post)}
                            />
                        </motion.div>
                    );
                })}

                {isPostLoading && renderSkeletons()}

                {!isPostLoading && myPosts.length === 0 && (
                    <motion.div
                        className="col-span-full text-center text-gray-600 dark:text-gray-300 text-lg font-medium py-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        Haven't posted anything yet. <br />
                    </motion.div>
                )}
            </motion.div>
            <CreatePostModal open_status={(editPost) ? true : false} onClose={() => setEditPost(null)} post={editPost} />
        </div>
    );
}

export default ShowAllPosts;
