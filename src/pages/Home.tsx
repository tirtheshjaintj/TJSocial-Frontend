import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import axiosInstance from "../config/axiosConfig";
import PostCard from "../components/PostCard";
import usePageSetup from "../hooks/usePageSetup";
import type { titleProp } from "../types";
import { useSelector } from "react-redux";

function Home({ title }: titleProp) {
    usePageSetup(title);

    const [posts, setPosts] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);
    const user=useSelector((state:any)=>state.user);
    const fetchPosts = async () => {
        if (!hasMore) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/post?page=${page}`);
            console.log(response.data.data);
            const newPosts = response.data.data;
            setPosts(prev => [...prev, ...newPosts]);
            const { has_next } = response.data.pagination;
            setHasMore(has_next);
        } catch (err) {
            console.error("Failed to load posts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [page]);

    const lastPostRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const renderSkeletons = () => (
        Array.from({ length: 4 }).map((_, i) => (
            <motion.div
                key={i}
                className="w-full h-[22em] my-5 rounded-2xl bg-gray-300 dark:bg-gray-700 animate-pulse"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
            />
        ))
    );

    useEffect(()=>{
      console.log(posts);
    },[posts]);

    return (
        <div className="w-full max-w-3xl mx-auto px-4 pt-4">
            {user && posts.map((post, index) => {
                const isLast = index === posts.length - 1;
                return (
                    <motion.div
                        key={post._id}
                        ref={isLast ? lastPostRef : null}
                        initial={{ opacity: 0.5, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-6"
                    >
                         <PostCard index={index} post={post} />
                    </motion.div>
                );
            })}

            {(!user || loading) && renderSkeletons()}

            {!loading && posts.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-300 text-lg mt-10">
                    No posts to show.
                </p>
            )}
        </div>
    );
}

export default Home;
