import { useParams } from "react-router-dom";
import usePageSetup from "../hooks/usePageSetup";
import type { titleProp } from "../types";
import { motion } from "framer-motion";

export default function Profile({ title }: titleProp) {
    usePageSetup(title);
    const { username } = useParams<{ username: string }>();

    return (
        <motion.div
            className="relative flex flex-col rounded-4xl bg-white/70 dark:bg-gray-900/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {/* Cover Image */}
            <div className="w-full h-44 md:h-60 bg-[url('/cover-default.jpg')] bg-repeat-round bg-contain  rounded-b-4xl shadow-lg" />

            {/* Profile Info Container */}
            <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-8 gap-6">
                {/* Profile Picture and Name */}
                <motion.div
                    className="flex flex-col items-center text-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="w-32 h-32 rounded-full bg-[url('/profile-default.webp')] bg-contain bg-no-repeat bg-center border-4 border-white dark:border-gray-800 shadow-lg -mt-20" />
                    <div className="mt-4">
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white font-[cursive]">
                            Tirthesh Jain
                        </h2>
                        <p className="text-sm md:text-md text-gray-600 dark:text-gray-400 font-[cursive]">@{username}</p>
                    </div>
                </motion.div>

                {/* About Me */}
                <motion.div
                    className="text-center md:text-left max-w-xl"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-2">
                        About Me:
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                        I am TJ Social User. Welcome to my profile! I'm passionate about technology, community, and creativity.
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
}
